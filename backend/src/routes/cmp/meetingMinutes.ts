import { Request, Response, Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";
import { logCmpActivity } from "../../cmpActivityLog";

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value as string) : null;
}

function parseTitle(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function describeMinutes(
  verb: string,
  minutes: { title: string | null; meetingType: string | null }
): string {
  if (minutes.title) return `${verb} meeting minutes "${minutes.title}"`;
  return minutes.meetingType
    ? `${verb} meeting minutes for a ${minutes.meetingType}`
    : `${verb} meeting minutes`;
}

const projectMeetingMinutesRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectMeetingMinutesRouter.get("/", async (req: Request<ProjectParams>, res: Response) => {
  const minutes = await cmpPrisma.cmpMeetingMinutes.findMany({
    where: { projectId: req.params.id },
    orderBy: { meetingDate: "desc" },
  });
  res.json(minutes);
});

projectMeetingMinutesRouter.post("/", async (req: Request<ProjectParams>, res: Response) => {
  const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { title, meetingDate, meetingType, location, attendees, summary, nextMeetingDate, notes } =
    req.body as Record<string, unknown>;

  if (!meetingDate) {
    return res.status(400).json({ error: "Meeting date is required" });
  }

  const minutes = await cmpPrisma.cmpMeetingMinutes.create({
    data: {
      projectId: req.params.id,
      title: parseTitle(title),
      meetingDate: new Date(meetingDate as string),
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

  await logCmpActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: describeMinutes("recorded", minutes),
  });

  res.status(201).json(minutes);
});

export const meetingMinutesRouter = Router();

meetingMinutesRouter.put("/:id", async (req, res) => {
  const before = await cmpPrisma.cmpMeetingMinutes.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Meeting minutes not found" });

  const { title, meetingDate, meetingType, location, attendees, summary, nextMeetingDate, notes } =
    req.body as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = parseTitle(title);
  if (meetingDate !== undefined) data.meetingDate = new Date(meetingDate as string);
  if (meetingType !== undefined) data.meetingType = meetingType || null;
  if (location !== undefined) data.location = location || null;
  if (attendees !== undefined) data.attendees = attendees || null;
  if (summary !== undefined) data.summary = summary || null;
  const next = parseDate(nextMeetingDate);
  if (next !== undefined) data.nextMeetingDate = next;
  if (notes !== undefined) data.notes = notes || null;

  try {
    const minutes = await cmpPrisma.cmpMeetingMinutes.update({
      where: { id: req.params.id },
      data,
    });
    await logCmpActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: describeMinutes("updated", before),
    });
    res.json(minutes);
  } catch (err) {
    res.status(400).json({ error: "Unable to update meeting minutes" });
  }
});

meetingMinutesRouter.delete("/:id", async (req, res) => {
  const minutes = await cmpPrisma.cmpMeetingMinutes.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!minutes) return res.status(404).json({ error: "Meeting minutes not found" });

  await logCmpActivity({
    projectId: minutes.project.id,
    projectName: minutes.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: describeMinutes("deleted", minutes),
  });
  await cmpPrisma.cmpMeetingMinutes.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default projectMeetingMinutesRouter;
