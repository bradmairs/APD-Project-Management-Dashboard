import { Request, Response, Router } from "express";
import { prisma } from "../prisma";
import { describeMeetingMinutesUpdate, logActivity } from "../activityLog";
import { askOllama, askOllamaVision, OllamaError } from "../ollama";
import { extractTextFromDocument, isImageUpload } from "../transcriptExtraction";
import { transcriptUpload } from "../upload";

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value as string) : null;
}

function parseRequiredDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

interface SuggestedAction {
  title: string;
  ownerName: string | null;
  dueDateHint: string | null;
}

const MAX_SUGGESTED_ACTIONS = 15;
const MAX_TITLE_LENGTH = 200;

function coerceSuggestedAction(value: unknown): SuggestedAction | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  if (!title) return null;
  const ownerName = typeof raw.ownerName === "string" && raw.ownerName.trim() ? raw.ownerName.trim() : null;
  const dueDateHint =
    typeof raw.dueDateHint === "string" && raw.dueDateHint.trim() ? raw.dueDateHint.trim() : null;
  return { title, ownerName, dueDateHint };
}

// Ollama is asked for strict JSON but, being a free-text model, sometimes
// wraps it in a markdown code fence or adds a leading sentence — this
// tries the whole response first, then just the bracketed substring, and
// only falls back to treating bullet/numbered lines as title-only
// suggestions if neither parses. Never throws: a response this can't make
// sense of just yields no suggestions.
function parseSuggestedActions(raw: string): SuggestedAction[] {
  const attempts: string[] = [raw];
  const bracketMatch = raw.match(/\[[\s\S]*\]/);
  if (bracketMatch) attempts.push(bracketMatch[0]);

  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);
      if (Array.isArray(parsed)) {
        const actions = parsed
          .map(coerceSuggestedAction)
          .filter((a): a is SuggestedAction => a !== null);
        if (actions.length > 0) return actions.slice(0, MAX_SUGGESTED_ACTIONS);
      }
    } catch {
      // try the next attempt
    }
  }

  const lines = raw
    .split("\n")
    .map((line) => line.replace(/^[\s*\-\d.)]+/, "").trim())
    .filter((line) => line.length > 3 && line.length <= MAX_TITLE_LENGTH);
  return lines.slice(0, MAX_SUGGESTED_ACTIONS).map((title) => ({
    title,
    ownerName: null,
    dueDateHint: null,
  }));
}

const EXTRACT_ACTIONS_SYSTEM_PROMPT =
  "You are an assistant embedded in a project management dashboard for Goulburn Valley Water, " +
  "a water utility. You extract clear, actionable follow-up items from meeting notes for a " +
  "construction or infrastructure project delivered by consultants and contractors. " +
  "Respond with ONLY a JSON array, no other text and no markdown code fences. Each element must " +
  'have the shape {"title": string, "ownerName": string or null, "dueDateHint": string or null} ' +
  "— title is a short, clear description of the follow-up task; ownerName is who is responsible " +
  "if the notes say so, otherwise null; dueDateHint is any date or timeframe mentioned, as free " +
  "text, otherwise null. If the notes contain no follow-up items, respond with an empty array [].";

// A raw transcript (auto-generated captions, a typed record, or OCR output
// from a photo of notes) is messier than the summary/notes a PM would type
// by hand — filler speech, no clear structure. This asks the chat model to
// do in one pass what a PM would otherwise do by hand after the meeting:
// write the minutes and pull out the actions.
const GENERATE_MINUTES_SYSTEM_PROMPT =
  "You are an assistant embedded in a project management dashboard for Goulburn Valley Water, " +
  "a water utility. You turn a raw meeting transcript — which may be messy, auto-generated, or " +
  "include filler speech — into structured meeting minutes for a construction or infrastructure " +
  "project delivered by consultants and contractors. Respond with ONLY a JSON object, no other " +
  'text and no markdown code fences, of the shape {"meetingType": string or null, "summary": ' +
  'string or null, "attendees": string or null, "notes": string or null, "actions": [{"title": ' +
  'string, "ownerName": string or null, "dueDateHint": string or null}]}. meetingType is a short ' +
  'label like "Progress Meeting" or "Design Review" if inferable, otherwise null. summary is a ' +
  "2-4 sentence overview of what was discussed. attendees is a comma-separated list of names " +
  "mentioned as present, otherwise null. notes is a more detailed account of discussion points, " +
  "decisions, and context, using short paragraphs or bullet-style lines. actions is every " +
  "follow-up or action item mentioned, each with its owner and any due date mentioned, in the " +
  "same format meeting-notes action extraction already uses elsewhere in this app. If the " +
  "transcript contains no useful content, return null for the text fields and an empty array " +
  "for actions rather than inventing information.";

const OCR_TRANSCRIPT_SYSTEM_PROMPT =
  "You transcribe text from a photo of handwritten or printed meeting notes for a construction " +
  "project management dashboard. Respond with ONLY the transcribed text, verbatim, in reading " +
  "order, with no commentary, no markdown formatting, and no preamble such as 'Here is the " +
  "transcription'. If the image contains no legible text, respond with an empty string.";

interface MeetingMinutesDraft {
  meetingType: string | null;
  summary: string | null;
  attendees: string | null;
  notes: string | null;
  actions: SuggestedAction[];
}

const MAX_FREE_TEXT_LENGTH = 5000;

function coerceDraftText(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, MAX_FREE_TEXT_LENGTH)
    : null;
}

// Same defensive strategy as parseSuggestedActions above (whole response,
// then the bracketed/braced substring, code-fence stripping implicit in
// both) — a local model asked for JSON doesn't always give only JSON.
function parseMinutesDraft(raw: string): MeetingMinutesDraft {
  const attempts: string[] = [raw];
  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) attempts.push(braceMatch[0]);

  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const rawActions = (parsed as Record<string, unknown>).actions;
        const actions = Array.isArray(rawActions)
          ? rawActions
              .map(coerceSuggestedAction)
              .filter((a): a is SuggestedAction => a !== null)
              .slice(0, MAX_SUGGESTED_ACTIONS)
          : [];
        return {
          meetingType: coerceDraftText((parsed as Record<string, unknown>).meetingType)?.slice(
            0,
            MAX_TITLE_LENGTH
          ) ?? null,
          summary: coerceDraftText((parsed as Record<string, unknown>).summary),
          attendees: coerceDraftText((parsed as Record<string, unknown>).attendees),
          notes: coerceDraftText((parsed as Record<string, unknown>).notes),
          actions,
        };
      }
    } catch {
      // try the next attempt
    }
  }

  // Couldn't parse structured JSON at all — fall back to treating the
  // whole response as notes rather than discarding it silently.
  return {
    meetingType: null,
    summary: null,
    attendees: null,
    notes: coerceDraftText(raw),
    actions: [],
  };
}

const projectMeetingMinutesRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectMeetingMinutesRouter.get("/", async (req: Request<ProjectParams>, res: Response) => {
  const meetings = await prisma.meetingMinutes.findMany({
    where: { projectId: req.params.id },
    orderBy: { meetingDate: "desc" },
  });
  res.json(meetings);
});

projectMeetingMinutesRouter.post("/", async (req: Request<ProjectParams>, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { meetingDate, meetingType, location, attendees, summary, nextMeetingDate, notes } =
    req.body as Record<string, unknown>;

  const parsedMeetingDate = parseRequiredDate(meetingDate);
  if (!parsedMeetingDate) {
    return res.status(400).json({ error: "A valid meeting date is required" });
  }

  const meeting = await prisma.meetingMinutes.create({
    data: {
      projectId: req.params.id,
      meetingDate: parsedMeetingDate,
      meetingType: (meetingType as string) || null,
      location: (location as string) || null,
      attendees: (attendees as string) || null,
      summary: (summary as string) || null,
      nextMeetingDate: parseDate(nextMeetingDate) ?? null,
      notes: (notes as string) || null,
      recordedById: req.user!.sub,
      recordedByName: req.user!.name,
    },
  });

  await logActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `recorded meeting minutes${meeting.meetingType ? ` for a ${meeting.meetingType}` : ""}`,
  });

  res.status(201).json(meeting);
});

const MAX_TRANSCRIPT_CHARS = 12000;

// Generates a draft — meetingType/summary/attendees/notes plus suggested
// actions — from a transcript, without saving anything. The caller (the
// "New Meeting" form) reviews and edits the draft before it ever becomes a
// real MeetingMinutes row, the same way AI-suggested actions are reviewed
// before being added. Lives on the project-scoped router, not the
// per-meeting one below, since there's no meeting yet at this point.
projectMeetingMinutesRouter.post(
  "/ai/generate-draft",
  transcriptUpload.single("file"),
  async (req: Request<ProjectParams>, res: Response) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const pastedText = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const file = req.file;

    let fileText = "";
    try {
      if (file && isImageUpload(file)) {
        fileText = await askOllamaVision(
          OCR_TRANSCRIPT_SYSTEM_PROMPT,
          "Transcribe all text visible in this image of meeting notes.",
          file.buffer.toString("base64")
        );
      } else if (file) {
        fileText = await extractTextFromDocument(file);
      }
    } catch (err) {
      if (err instanceof OllamaError) return res.status(502).json({ error: err.message });
      return res
        .status(400)
        .json({ error: err instanceof Error ? err.message : "Could not read the uploaded file" });
    }

    const transcript = [fileText.trim(), pastedText].filter(Boolean).join("\n\n");
    if (!transcript) {
      return res.status(400).json({
        error: "Provide a transcript — paste text, or upload a file or a photo of notes",
      });
    }

    try {
      const raw = await askOllama(
        GENERATE_MINUTES_SYSTEM_PROMPT,
        transcript.slice(0, MAX_TRANSCRIPT_CHARS)
      );
      res.json(parseMinutesDraft(raw));
    } catch (err) {
      if (err instanceof OllamaError) return res.status(502).json({ error: err.message });
      res.status(500).json({ error: "Failed to generate meeting minutes from the transcript" });
    }
  }
);

export const meetingMinutesRouter = Router();

meetingMinutesRouter.post("/:id/ai/extract-actions", async (req, res) => {
  const meeting = await prisma.meetingMinutes.findUnique({ where: { id: req.params.id } });
  if (!meeting) return res.status(404).json({ error: "Meeting minutes not found" });

  const notesText = [meeting.summary, meeting.notes].filter(Boolean).join("\n\n");
  if (!notesText.trim()) {
    return res
      .status(400)
      .json({ error: "Add a summary or notes to this meeting before extracting actions" });
  }

  const userPrompt = [
    `Meeting: ${meeting.meetingType || "Meeting"} on ${meeting.meetingDate.toISOString().slice(0, 10)}`,
    meeting.attendees ? `Attendees: ${meeting.attendees}` : null,
    meeting.summary ? `Summary:\n${meeting.summary}` : null,
    meeting.notes ? `Notes:\n${meeting.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const raw = await askOllama(EXTRACT_ACTIONS_SYSTEM_PROMPT, userPrompt);
    const actions = parseSuggestedActions(raw);
    res.json({ actions });
  } catch (err) {
    if (err instanceof OllamaError) {
      return res.status(502).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to extract actions from the AI assistant" });
  }
});

meetingMinutesRouter.put("/:id", async (req, res) => {
  const before = await prisma.meetingMinutes.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Meeting minutes not found" });

  const { meetingDate, meetingType, location, attendees, summary, nextMeetingDate, notes } =
    req.body as Record<string, unknown>;

  const data: Record<string, unknown> = {};

  const date = parseDate(meetingDate);
  if (date !== undefined) data.meetingDate = date ?? before.meetingDate;
  if (meetingType !== undefined) data.meetingType = meetingType || null;
  if (location !== undefined) data.location = location || null;
  if (attendees !== undefined) data.attendees = attendees || null;
  if (summary !== undefined) data.summary = summary || null;
  const nextDate = parseDate(nextMeetingDate);
  if (nextDate !== undefined) data.nextMeetingDate = nextDate;
  if (notes !== undefined) data.notes = notes || null;

  try {
    const meeting = await prisma.meetingMinutes.update({
      where: { id: req.params.id },
      data,
    });
    await logActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: describeMeetingMinutesUpdate(before),
    });
    res.json(meeting);
  } catch (err) {
    res.status(400).json({ error: "Unable to update meeting minutes" });
  }
});

meetingMinutesRouter.delete("/:id", async (req, res) => {
  const meeting = await prisma.meetingMinutes.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!meeting) return res.status(404).json({ error: "Meeting minutes not found" });

  await logActivity({
    projectId: meeting.project.id,
    projectName: meeting.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted meeting minutes${meeting.meetingType ? ` for a ${meeting.meetingType}` : ""}`,
  });
  await prisma.meetingMinutes.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default projectMeetingMinutesRouter;
