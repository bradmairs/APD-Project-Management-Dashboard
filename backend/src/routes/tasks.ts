import { Request, Response, Router } from "express";
import { prisma } from "../prisma";

const projectTasksRouter = Router({ mergeParams: true });

type ProjectParams = { projectId: string };

projectTasksRouter.get(
  "/",
  async (req: Request<ProjectParams>, res: Response) => {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });
    res.json(tasks);
  }
);

projectTasksRouter.post(
  "/",
  async (req: Request<ProjectParams>, res: Response) => {
    try {
      const task = await prisma.task.create({
        data: { ...req.body, projectId: req.params.projectId },
      });
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: "Invalid task data" });
    }
  }
);

export const tasksRouter = Router();

tasksRouter.get("/upcoming", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    where: { status: { not: "DONE" }, dueDate: { not: null } },
    orderBy: { dueDate: "asc" },
    take: 10,
    include: { project: { select: { id: true, name: true } } },
  });
  res.json(tasks);
});

tasksRouter.put("/:id", async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: "Unable to update task" });
  }
});

tasksRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Task not found" });
  }
});

export default projectTasksRouter;
