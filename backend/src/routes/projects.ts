import { Router } from "express";
import { prisma } from "../prisma";
import projectTasksRouter from "./tasks";

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

router.post("/", async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: "Invalid project data" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Unable to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Project not found" });
  }
});

export default router;
