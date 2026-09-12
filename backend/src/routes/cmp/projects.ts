import { Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";
import { logCmpActivity } from "../../cmpActivityLog";
import projectDesignStagesRouter from "./designStages";
import projectDrawingsRouter from "./drawings";
import projectDesignReviewsRouter from "./designReviews";
import projectFeeClaimsRouter from "./feeClaims";
import projectMeetingMinutesRouter from "./meetingMinutes";
import cmpProjectAiRouter from "./ai";

const router = Router();

router.use("/:id/design-stages", projectDesignStagesRouter);
router.use("/:id/drawings", projectDrawingsRouter);
router.use("/:id/design-reviews", projectDesignReviewsRouter);
router.use("/:id/fee-claims", projectFeeClaimsRouter);
router.use("/:id/meeting-minutes", projectMeetingMinutesRouter);
router.use("/:id/ai", cmpProjectAiRouter);

router.get("/", async (_req, res) => {
  const projects = await cmpPrisma.cmpProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      designStages: { select: { id: true, status: true } },
      feeClaims: { select: { id: true, claimedAmount: true, approvedAmount: true, status: true } },
    },
  });
  res.json(projects);
});

router.get("/:id", async (req, res) => {
  const project = await cmpPrisma.cmpProject.findUnique({
    where: { id: req.params.id },
    include: {
      designStages: { orderBy: { sortOrder: "asc" } },
      drawings: { orderBy: { drawingNumber: "asc" }, include: { revisions: { orderBy: { issuedDate: "desc" } } } },
      designReviews: { orderBy: { reviewDate: "desc" } },
      feeClaims: { orderBy: { createdAt: "desc" } },
      meetingMinutes: { orderBy: { meetingDate: "desc" } },
    },
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

router.get("/:id/activity", async (req, res) => {
  const entries = await cmpPrisma.cmpActivityLog.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(entries);
});

router.post("/", async (req, res) => {
  try {
    const { createdById, ...data } = req.body;
    const project = await cmpPrisma.cmpProject.create({
      data: { ...data, createdByName: req.user!.name },
    });
    await logCmpActivity({
      projectId: project.id,
      projectName: project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: "created the project",
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: "Invalid project data" });
  }
});

router.put("/:id", async (req, res) => {
  const before = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Project not found" });

  try {
    const { createdById, createdByName, ...data } = req.body;
    const project = await cmpPrisma.cmpProject.update({
      where: { id: req.params.id },
      data,
    });
    await logCmpActivity({
      projectId: project.id,
      projectName: project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: "updated the project",
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Unable to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  await logCmpActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: "deleted the project",
  });
  await cmpPrisma.cmpProject.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
