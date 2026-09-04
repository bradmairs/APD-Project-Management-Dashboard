import { Task } from "./types";

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
}

export function isTaskDueSoon(task: Task, withinDays = 7): boolean {
  if (!task.dueDate || task.status === "DONE" || isTaskOverdue(task)) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  return new Date(task.dueDate) <= cutoff;
}
