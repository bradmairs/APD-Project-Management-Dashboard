import { Router } from "express";
import { prisma } from "../prisma";
import projectTasksRouter from "./tasks";
import { describeProjectChanges, logActivity } from "../activityLog";

const router = Router();

router.use("/:projectId/tasks", projectTasksRouter);

router.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { tasks: { select: { id: true, status: true } } },
  });
  res.json(projects);
});

router.get("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] } },
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

router.post("/", async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
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

  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logActivity({
      projectId: project.id,
      projectName: project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: describeProjectChanges(before, req.body),
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Unable to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  await logActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: "deleted the project",
  });
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
