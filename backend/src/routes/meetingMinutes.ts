import { Request, Response, Router } from "express";
import { prisma } from "../prisma";
import { describeMeetingMinutesUpdate, logActivity } from "../activityLog";

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value as string) : null;
}

function parseRequiredDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

export const meetingMinutesRouter = Router();

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
