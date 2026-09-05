import {
  ActivityLogEntry,
  Attachment,
  CashFlowEntry,
  CashFlowEntryInput,
  Milestone,
  MilestoneInput,
  MonthlyReport,
  MonthlyReportInput,
  Project,
  ProjectInput,
  Role,
  Task,
  TaskInput,
  User,
} from "./types";

const API_BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function login(email: string, password: string): Promise<User> {
  return fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((res) => handle(res));
}

export function logout(): Promise<void> {
  return fetch(`${API_BASE}/auth/logout`, { method: "POST" }).then((res) =>
    handle(res)
  );
}

export function getMe(): Promise<User> {
  return fetch(`${API_BASE}/auth/me`).then((res) => handle(res));
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then((res) => handle(res));
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

export function getRecentActivity(): Promise<ActivityLogEntry[]> {
  return fetch(`${API_BASE}/activity/recent`).then((res) => handle(res));
}

export function getProjectActivity(projectId: string): Promise<ActivityLogEntry[]> {
  return fetch(`${API_BASE}/projects/${projectId}/activity`).then((res) =>
    handle(res)
  );
}

export function getAttachments(projectId: string): Promise<Attachment[]> {
  return fetch(`${API_BASE}/projects/${projectId}/attachments`).then((res) =>
    handle(res)
  );
}

export function uploadAttachment(
  projectId: string,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API_BASE}/projects/${projectId}/attachments`, {
    method: "POST",
    body: formData,
  }).then((res) => handle(res));
}

export function deleteAttachment(id: string): Promise<void> {
  return fetch(`${API_BASE}/attachments/${id}`, { method: "DELETE" }).then(
    (res) => handle(res)
  );
}

export function attachmentDownloadUrl(id: string): string {
  return `${API_BASE}/attachments/${id}/download`;
}

export function getUsers(): Promise<User[]> {
  return fetch(`${API_BASE}/users`).then((res) => handle(res));
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<User> {
  return fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateUserRole(id: string, role: Role): Promise<User> {
  return fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  }).then((res) => handle(res));
}

export function setUserActive(id: string, active: boolean): Promise<User> {
  return fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  }).then((res) => handle(res));
}

export function getMonthlyReports(projectId: string): Promise<MonthlyReport[]> {
  return fetch(`${API_BASE}/projects/${projectId}/reports`).then((res) =>
    handle(res)
  );
}

export function createMonthlyReport(
  projectId: string,
  data: Partial<MonthlyReportInput>
): Promise<MonthlyReport> {
  return fetch(`${API_BASE}/projects/${projectId}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateMonthlyReport(
  id: string,
  data: Partial<MonthlyReportInput>
): Promise<MonthlyReport> {
  return fetch(`${API_BASE}/reports/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteMonthlyReport(id: string): Promise<void> {
  return fetch(`${API_BASE}/reports/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getMilestones(projectId: string): Promise<Milestone[]> {
  return fetch(`${API_BASE}/projects/${projectId}/milestones`).then((res) =>
    handle(res)
  );
}

export function createMilestone(
  projectId: string,
  data: Partial<MilestoneInput>
): Promise<Milestone> {
  return fetch(`${API_BASE}/projects/${projectId}/milestones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateMilestone(
  id: string,
  data: Partial<MilestoneInput>
): Promise<Milestone> {
  return fetch(`${API_BASE}/milestones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteMilestone(id: string): Promise<void> {
  return fetch(`${API_BASE}/milestones/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function reorderMilestone(
  id: string,
  direction: "up" | "down"
): Promise<Milestone[]> {
  return fetch(`${API_BASE}/milestones/${id}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction }),
  }).then((res) => handle(res));
}

export function getCashFlowEntries(projectId: string): Promise<CashFlowEntry[]> {
  return fetch(`${API_BASE}/projects/${projectId}/cashflow`).then((res) =>
    handle(res)
  );
}

export function upsertCashFlowEntry(
  projectId: string,
  data: Partial<CashFlowEntryInput>
): Promise<CashFlowEntry> {
  return fetch(`${API_BASE}/projects/${projectId}/cashflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteCashFlowEntry(id: string): Promise<void> {
  return fetch(`${API_BASE}/cashflow/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}
