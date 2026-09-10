import { Request, Response, Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";
import { logCmpActivity } from "../../cmpActivityLog";

const STATUSES = ["DRAFT", "ISSUED_FOR_REVIEW", "ISSUED_FOR_CONSTRUCTION", "SUPERSEDED"];

function parseDate(value: unknown): Date {
  return value ? new Date(value as string) : new Date();
}

const projectDrawingsRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectDrawingsRouter.get("/", async (req: Request<ProjectParams>, res: Response) => {
  const drawings = await cmpPrisma.drawing.findMany({
    where: { projectId: req.params.id },
    orderBy: { drawingNumber: "asc" },
    include: { revisions: { orderBy: { issuedDate: "desc" } } },
  });
  res.json(drawings);
});

projectDrawingsRouter.post("/", async (req: Request<ProjectParams>, res: Response) => {
  const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { drawingNumber, title, discipline, status } = req.body as Record<string, unknown>;

  if (typeof drawingNumber !== "string" || !drawingNumber.trim()) {
    return res.status(400).json({ error: "Drawing number is required" });
  }
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (status !== undefined && !STATUSES.includes(status as string)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const drawing = await cmpPrisma.drawing.create({
    data: {
      projectId: req.params.id,
      drawingNumber: drawingNumber.trim(),
      title: title.trim(),
      discipline: (discipline as string) || null,
      status: (status as any) ?? "DRAFT",
    },
  });

  await logCmpActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `added drawing "${drawing.drawingNumber}: ${drawing.title}"`,
  });

  res.status(201).json(drawing);
});

export const drawingsRouter = Router();

drawingsRouter.put("/:id", async (req, res) => {
  const before = await cmpPrisma.drawing.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Drawing not found" });

  const { drawingNumber, title, discipline, status } = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (drawingNumber !== undefined) {
    if (typeof drawingNumber !== "string" || !drawingNumber.trim()) {
      return res.status(400).json({ error: "Drawing number is required" });
    }
    data.drawingNumber = drawingNumber.trim();
  }
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    data.title = title.trim();
  }
  if (discipline !== undefined) data.discipline = discipline || null;
  if (status !== undefined) {
    if (!STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    data.status = status;
  }

  try {
    const drawing = await cmpPrisma.drawing.update({ where: { id: req.params.id }, data });
    const action =
      status !== undefined && status !== before.status
        ? `marked drawing "${before.drawingNumber}: ${before.title}" as ${status}`
        : `updated drawing "${before.drawingNumber}: ${before.title}"`;
    await logCmpActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action,
    });
    res.json(drawing);
  } catch (err) {
    res.status(400).json({ error: "Unable to update drawing" });
  }
});

drawingsRouter.delete("/:id", async (req, res) => {
  const drawing = await cmpPrisma.drawing.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!drawing) return res.status(404).json({ error: "Drawing not found" });

  await logCmpActivity({
    projectId: drawing.project.id,
    projectName: drawing.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted drawing "${drawing.drawingNumber}: ${drawing.title}"`,
  });
  await cmpPrisma.drawing.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Issues a new revision — append-only (see the schema comment on
// DrawingRevision) and keeps the parent Drawing's currentRevision in sync
// in the same transaction, since that field is a denormalized convenience
// for list views rather than a second source of truth.
drawingsRouter.post("/:id/revisions", async (req, res) => {
  const drawing = await cmpPrisma.drawing.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!drawing) return res.status(404).json({ error: "Drawing not found" });

  const { revision, description, issuedFor, issuedDate } = req.body as Record<string, unknown>;
  if (typeof revision !== "string" || !revision.trim()) {
    return res.status(400).json({ error: "Revision is required" });
  }

  const [drawingRevision] = await cmpPrisma.$transaction([
    cmpPrisma.drawingRevision.create({
      data: {
        drawingId: drawing.id,
        revision: revision.trim(),
        description: (description as string) || null,
        issuedFor: (issuedFor as string) || null,
        issuedById: req.user!.sub,
        issuedByName: req.user!.name,
        issuedDate: parseDate(issuedDate),
      },
    }),
    cmpPrisma.drawing.update({
      where: { id: drawing.id },
      data: { currentRevision: revision.trim() },
    }),
  ]);

  await logCmpActivity({
    projectId: drawing.project.id,
    projectName: drawing.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `issued revision ${drawingRevision.revision} of drawing "${drawing.drawingNumber}: ${drawing.title}"`,
  });

  res.status(201).json(drawingRevision);
});

export default projectDrawingsRouter;
