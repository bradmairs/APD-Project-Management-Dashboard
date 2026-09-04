import { Project, ProjectInput, Task, TaskInput } from "./types";

const API_BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getProjects(): Promise<Project[]> {
  return fetch(`${API_BASE}/projects`).then((res) => handle(res));
}

export function getProject(id: string): Promise<Project> {
  return fetch(`${API_BASE}/projects/${id}`).then((res) => handle(res));
}

export function createProject(data: Partial<ProjectInput>): Promise<Project> {
  return fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateProject(
  id: string,
  data: Partial<ProjectInput>
): Promise<Project> {
  return fetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteProject(id: string): Promise<void> {
  return fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" }).then(
    (res) => handle(res)
  );
}

export function getUpcomingTasks(): Promise<Task[]> {
  return fetch(`${API_BASE}/tasks/upcoming`).then((res) => handle(res));
}

export function createTask(
  projectId: string,
  data: Partial<TaskInput>
): Promise<Task> {
  return fetch(`${API_BASE}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateTask(
  id: string,
  data: Partial<TaskInput>
): Promise<Task> {
  return fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteTask(id: string): Promise<void> {
  return fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}
