import { Request, Response, Router } from "express";
import { prisma } from "../prisma";
import { describeMeetingMinutesUpdate, logActivity } from "../activityLog";
import { askOllama, OllamaError } from "../ollama";

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
