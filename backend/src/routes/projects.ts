import fs from "fs";
import { Router } from "express";
import { prisma } from "../prisma";
import projectTasksRouter from "./tasks";
import projectReportsRouter from "./monthlyReports";
import projectMilestonesRouter from "./milestones";
import projectCashFlowRouter from "./cashFlow";
import projectSiteVisitsRouter from "./siteVisits";
import { projectSitePhotosRouter } from "./siteVisitPhotos";
import projectVariationsRouter from "./variations";
import { describeProjectChanges, logActivity } from "../activityLog";
import { projectUploadDir, upload } from "../upload";
import { canModifyProject } from "../permissions";

const router = Router();

router.use("/:projectId/tasks", projectTasksRouter);
router.use("/:id/reports", projectReportsRouter);
router.use("/:id/milestones", projectMilestonesRouter);
router.use("/:id/cashflow", projectCashFlowRouter);
router.use("/:id/site-visits", projectSiteVisitsRouter);
router.use("/:id/site-visit-photos", projectSitePhotosRouter);
router.use("/:id/variations", projectVariationsRouter);

router.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: { select: { id: true, status: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  res.json(projects);
});

router.get("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

router.get("/:id/activity", async (req, res) => {
  const entries = await prisma.activityLog.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(entries);
});

router.get("/:id/attachments", async (req, res) => {
  const attachments = await prisma.attachment.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(attachments);
});

router.post(
  "/:id/attachments",
  async (req, res, next) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.locals.projectName = project.name;
    next();
  },
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        projectId: req.params.id,
        storedFilename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedById: req.user!.sub,
        uploadedByName: req.user!.name,
      },
    });

    await logActivity({
      projectId: req.params.id,
      projectName: res.locals.projectName,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: `uploaded file "${attachment.originalName}"`,
    });

    res.status(201).json(attachment);
  }
);

router.post("/", async (req, res) => {
  try {
    // createdById is server-assigned, never taken from the request body —
    // otherwise a client could claim a project was created by someone else.
    const { createdById, ...data } = req.body;
    const project = await prisma.project.create({
      data: { ...data, createdById: req.user!.sub },
    });
    await logActivity({
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
  const before = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!before) return res.status(404).json({ error: "Project not found" });
  if (!canModifyProject(before, req.user!)) {
    return res
      .status(403)
      .json({ error: "Only the project's creator or an admin can edit it" });
  }

  try {
    // createdById can't be reassigned through an edit.
    const { createdById, ...data } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });
    await logActivity({
      projectId: project.id,
      projectName: project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: describeProjectChanges(before, data),
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Unable to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (!canModifyProject(project, req.user!)) {
    return res
      .status(403)
      .json({ error: "Only the project's creator or an admin can delete it" });
  }

  await logActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: "deleted the project",
  });
  await prisma.project.delete({ where: { id: req.params.id } });

  // Attachment rows cascade-deleted above; the files on disk don't, so
  // remove the whole per-project upload directory now.
  fs.rm(projectUploadDir(req.params.id), { recursive: true, force: true }, () => {});

  res.status(204).send();
});

export default router;
