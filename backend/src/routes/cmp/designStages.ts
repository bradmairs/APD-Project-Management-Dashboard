import { Request, Response, Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";
import { logCmpActivity } from "../../cmpActivityLog";

const STAGES = [
  "CONCEPT_DESIGN",
  "PRELIMINARY_DESIGN",
  "DETAILED_DESIGN",
  "TENDER_DOCUMENTATION",
  "CONSTRUCTION_ISSUE",
  "AS_BUILT",
];

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ISSUED_FOR_REVIEW", "APPROVED", "COMPLETE"];

const STAGE_LABELS: Record<string, string> = {
  CONCEPT_DESIGN: "Concept Design",
  PRELIMINARY_DESIGN: "Preliminary Design",
  DETAILED_DESIGN: "Detailed Design",
  TENDER_DOCUMENTATION: "Tender Documentation",
  CONSTRUCTION_ISSUE: "Construction Issue",
  AS_BUILT: "As-Built",
};

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value as string) : null;
}

function parsePercent(value: unknown): number | null {
  const pct = Number(value);
  if (Number.isNaN(pct) || pct < 0 || pct > 100) return null;
  return pct;
}

const projectDesignStagesRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectDesignStagesRouter.get(
  "/",
  async (req: Request<ProjectParams>, res: Response) => {
    const stages = await cmpPrisma.designStage.findMany({
      where: { projectId: req.params.id },
      orderBy: { sortOrder: "asc" },
    });
    res.json(stages);
  }
);

projectDesignStagesRouter.post(
  "/",
  async (req: Request<ProjectParams>, res: Response) => {
    const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const {
      stage,
      status,
      percentComplete,
      targetDate,
      actualDate,
      feeAllocated,
      hoursAllocated,
      hoursSpent,
      notes,
    } = req.body as Record<string, unknown>;

    if (typeof stage !== "string" || !STAGES.includes(stage)) {
      return res.status(400).json({ error: "A valid design stage is required" });
    }
    if (status !== undefined && !STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    let pct = 0;
    if (percentComplete !== undefined) {
      const parsed = parsePercent(percentComplete);
      if (parsed === null) {
        return res.status(400).json({ error: "Percent complete must be between 0 and 100" });
      }
      pct = parsed;
    }

    const count = await cmpPrisma.designStage.count({ where: { projectId: req.params.id } });

    try {
      const designStage = await cmpPrisma.designStage.create({
        data: {
          projectId: req.params.id,
          stage: stage as any,
          status: (status as any) ?? "NOT_STARTED",
          percentComplete: pct,
          targetDate: parseDate(targetDate) ?? null,
          actualDate: parseDate(actualDate) ?? null,
          feeAllocated: feeAllocated === "" || feeAllocated == null ? null : Number(feeAllocated),
          hoursAllocated: hoursAllocated === "" || hoursAllocated == null ? null : Number(hoursAllocated),
          hoursSpent: hoursSpent === "" || hoursSpent == null ? null : Number(hoursSpent),
          notes: (notes as string) || null,
          sortOrder: count,
        },
      });
      await logCmpActivity({
        projectId: project.id,
        projectName: project.name,
        userId: req.user!.sub,
        userName: req.user!.name,
        action: `added the ${STAGE_LABELS[stage] ?? stage} stage`,
      });
      res.status(201).json(designStage);
    } catch (err) {
      res.status(400).json({ error: "Unable to create design stage" });
    }
  }
);

export const designStagesRouter = Router();

designStagesRouter.put("/:id", async (req, res) => {
  const before = await cmpPrisma.designStage.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Design stage not found" });

  const {
    status,
    percentComplete,
    targetDate,
    actualDate,
    feeAllocated,
    hoursAllocated,
    hoursSpent,
    notes,
  } = req.body as Record<string, unknown>;

  const data: Record<string, unknown> = {};

  if (status !== undefined) {
    if (!STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    data.status = status;
  }
  if (percentComplete !== undefined) {
    const pct = parsePercent(percentComplete);
    if (pct === null) {
      return res.status(400).json({ error: "Percent complete must be between 0 and 100" });
    }
    data.percentComplete = pct;
  }
  const target = parseDate(targetDate);
  if (target !== undefined) data.targetDate = target;
  const actual = parseDate(actualDate);
  if (actual !== undefined) data.actualDate = actual;
  if (feeAllocated !== undefined) data.feeAllocated = feeAllocated === "" || feeAllocated == null ? null : Number(feeAllocated);
  if (hoursAllocated !== undefined) data.hoursAllocated = hoursAllocated === "" || hoursAllocated == null ? null : Number(hoursAllocated);
  if (hoursSpent !== undefined) data.hoursSpent = hoursSpent === "" || hoursSpent == null ? null : Number(hoursSpent);
  if (notes !== undefined) data.notes = notes || null;

  try {
    const designStage = await cmpPrisma.designStage.update({
      where: { id: req.params.id },
      data,
    });
    const label = STAGE_LABELS[before.stage] ?? before.stage;
    const action =
      status !== undefined && status !== before.status
        ? `marked the ${label} stage as ${status}`
        : `updated the ${label} stage`;
    await logCmpActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action,
    });
    res.json(designStage);
  } catch (err) {
    res.status(400).json({ error: "Unable to update design stage" });
  }
});

designStagesRouter.delete("/:id", async (req, res) => {
  const stage = await cmpPrisma.designStage.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!stage) return res.status(404).json({ error: "Design stage not found" });

  await logCmpActivity({
    projectId: stage.project.id,
    projectName: stage.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted the ${STAGE_LABELS[stage.stage] ?? stage.stage} stage`,
  });
  await cmpPrisma.designStage.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Swaps sortOrder with the adjacent stage, the same race-safe pattern
// GVW's Milestone reorder uses — the UI only offers "move up"/"move down".
designStagesRouter.post("/:id/reorder", async (req, res) => {
  const { direction } = req.body as { direction?: "up" | "down" };
  if (direction !== "up" && direction !== "down") {
    return res.status(400).json({ error: "direction must be 'up' or 'down'" });
  }

  const stage = await cmpPrisma.designStage.findUnique({ where: { id: req.params.id } });
  if (!stage) return res.status(404).json({ error: "Design stage not found" });

  const neighbor = await cmpPrisma.designStage.findFirst({
    where: {
      projectId: stage.projectId,
      sortOrder: direction === "up" ? { lt: stage.sortOrder } : { gt: stage.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  if (neighbor) {
    await cmpPrisma.$transaction([
      cmpPrisma.designStage.update({ where: { id: stage.id }, data: { sortOrder: neighbor.sortOrder } }),
      cmpPrisma.designStage.update({ where: { id: neighbor.id }, data: { sortOrder: stage.sortOrder } }),
    ]);
  }

  const stages = await cmpPrisma.designStage.findMany({
    where: { projectId: stage.projectId },
    orderBy: { sortOrder: "asc" },
  });
  res.json(stages);
});

export default projectDesignStagesRouter;
