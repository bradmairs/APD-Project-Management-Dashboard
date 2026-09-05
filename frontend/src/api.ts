import {
  ActionItem,
  ActionItemInput,
  ActivityLogEntry,
  Attachment,
  CashFlowEntry,
  CashFlowEntryInput,
  ChecklistItem,
  ChecklistItemInput,
  EotClaim,
  EotClaimInput,
  LessonLearned,
  LessonLearnedInput,
  Milestone,
  MilestoneInput,
  MonthlyReport,
  MonthlyReportInput,
  Permit,
  PermitInput,
  Project,
  ProjectInput,
  Risk,
  RiskInput,
  Role,
  SiteVisit,
  SiteVisitInput,
  SiteVisitPhoto,
  SqeRecord,
  SqeRecordInput,
  Stakeholder,
  StakeholderInput,
  Task,
  TaskInput,
  User,
  Variation,
  VariationInput,
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

export function getMonthlyReport(id: string): Promise<MonthlyReport> {
  return fetch(`${API_BASE}/reports/${id}`).then((res) => handle(res));
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

export function getAllCashFlowEntries(): Promise<CashFlowEntry[]> {
  return fetch(`${API_BASE}/cashflow`).then((res) => handle(res));
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

export function getSiteVisits(projectId: string): Promise<SiteVisit[]> {
  return fetch(`${API_BASE}/projects/${projectId}/site-visits`).then((res) =>
    handle(res)
  );
}

export function createSiteVisit(
  projectId: string,
  data: Partial<SiteVisitInput>
): Promise<SiteVisit> {
  return fetch(`${API_BASE}/projects/${projectId}/site-visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateSiteVisit(
  id: string,
  data: Partial<SiteVisitInput>
): Promise<SiteVisit> {
  return fetch(`${API_BASE}/site-visits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteSiteVisit(id: string): Promise<void> {
  return fetch(`${API_BASE}/site-visits/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getProjectSitePhotos(projectId: string): Promise<SiteVisitPhoto[]> {
  return fetch(`${API_BASE}/projects/${projectId}/site-visit-photos`).then((res) =>
    handle(res)
  );
}

export function getSiteVisitPhotos(siteVisitId: string): Promise<SiteVisitPhoto[]> {
  return fetch(`${API_BASE}/site-visits/${siteVisitId}/photos`).then((res) =>
    handle(res)
  );
}

export function uploadSiteVisitPhotos(
  siteVisitId: string,
  files: File[]
): Promise<SiteVisitPhoto[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));
  return fetch(`${API_BASE}/site-visits/${siteVisitId}/photos`, {
    method: "POST",
    body: formData,
  }).then((res) => handle(res));
}

export function deleteSiteVisitPhoto(id: string): Promise<void> {
  return fetch(`${API_BASE}/site-visit-photos/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function siteVisitPhotoFileUrl(id: string): string {
  return `${API_BASE}/site-visit-photos/${id}/file`;
}

export function getVariations(projectId: string): Promise<Variation[]> {
  return fetch(`${API_BASE}/projects/${projectId}/variations`).then((res) =>
    handle(res)
  );
}

export function getAllVariations(): Promise<Variation[]> {
  return fetch(`${API_BASE}/variations`).then((res) => handle(res));
}

export function createVariation(
  projectId: string,
  data: Partial<VariationInput>
): Promise<Variation> {
  return fetch(`${API_BASE}/projects/${projectId}/variations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateVariation(
  id: string,
  data: Partial<VariationInput>
): Promise<Variation> {
  return fetch(`${API_BASE}/variations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteVariation(id: string): Promise<void> {
  return fetch(`${API_BASE}/variations/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getRisks(projectId: string): Promise<Risk[]> {
  return fetch(`${API_BASE}/projects/${projectId}/risks`).then((res) => handle(res));
}

export function getAllRisks(): Promise<Risk[]> {
  return fetch(`${API_BASE}/risks`).then((res) => handle(res));
}

export function createRisk(
  projectId: string,
  data: Partial<RiskInput>
): Promise<Risk> {
  return fetch(`${API_BASE}/projects/${projectId}/risks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateRisk(id: string, data: Partial<RiskInput>): Promise<Risk> {
  return fetch(`${API_BASE}/risks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteRisk(id: string): Promise<void> {
  return fetch(`${API_BASE}/risks/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getActionItems(projectId: string): Promise<ActionItem[]> {
  return fetch(`${API_BASE}/projects/${projectId}/action-items`).then((res) =>
    handle(res)
  );
}

export function getAllActionItems(): Promise<ActionItem[]> {
  return fetch(`${API_BASE}/action-items`).then((res) => handle(res));
}

export function createActionItem(
  projectId: string,
  data: Partial<ActionItemInput>
): Promise<ActionItem> {
  return fetch(`${API_BASE}/projects/${projectId}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateActionItem(
  id: string,
  data: Partial<ActionItemInput>
): Promise<ActionItem> {
  return fetch(`${API_BASE}/action-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteActionItem(id: string): Promise<void> {
  return fetch(`${API_BASE}/action-items/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getStakeholders(projectId: string): Promise<Stakeholder[]> {
  return fetch(`${API_BASE}/projects/${projectId}/stakeholders`).then((res) =>
    handle(res)
  );
}

export function createStakeholder(
  projectId: string,
  data: Partial<StakeholderInput>
): Promise<Stakeholder> {
  return fetch(`${API_BASE}/projects/${projectId}/stakeholders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateStakeholder(
  id: string,
  data: Partial<StakeholderInput>
): Promise<Stakeholder> {
  return fetch(`${API_BASE}/stakeholders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteStakeholder(id: string): Promise<void> {
  return fetch(`${API_BASE}/stakeholders/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getPermits(projectId: string): Promise<Permit[]> {
  return fetch(`${API_BASE}/projects/${projectId}/permits`).then((res) => handle(res));
}

export function getAllPermits(): Promise<Permit[]> {
  return fetch(`${API_BASE}/permits`).then((res) => handle(res));
}

export function createPermit(
  projectId: string,
  data: Partial<PermitInput>
): Promise<Permit> {
  return fetch(`${API_BASE}/projects/${projectId}/permits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updatePermit(id: string, data: Partial<PermitInput>): Promise<Permit> {
  return fetch(`${API_BASE}/permits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deletePermit(id: string): Promise<void> {
  return fetch(`${API_BASE}/permits/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getLessonsLearned(projectId: string): Promise<LessonLearned[]> {
  return fetch(`${API_BASE}/projects/${projectId}/lessons-learned`).then((res) =>
    handle(res)
  );
}

export function getAllLessonsLearned(): Promise<LessonLearned[]> {
  return fetch(`${API_BASE}/lessons-learned`).then((res) => handle(res));
}

export function createLessonLearned(
  projectId: string,
  data: Partial<LessonLearnedInput>
): Promise<LessonLearned> {
  return fetch(`${API_BASE}/projects/${projectId}/lessons-learned`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateLessonLearned(
  id: string,
  data: Partial<LessonLearnedInput>
): Promise<LessonLearned> {
  return fetch(`${API_BASE}/lessons-learned/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteLessonLearned(id: string): Promise<void> {
  return fetch(`${API_BASE}/lessons-learned/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getSqeRecords(projectId: string): Promise<SqeRecord[]> {
  return fetch(`${API_BASE}/projects/${projectId}/sqe`).then((res) => handle(res));
}

export function getAllSqeRecords(): Promise<SqeRecord[]> {
  return fetch(`${API_BASE}/sqe`).then((res) => handle(res));
}

export function createSqeRecord(
  projectId: string,
  data: Partial<SqeRecordInput>
): Promise<SqeRecord> {
  return fetch(`${API_BASE}/projects/${projectId}/sqe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateSqeRecord(
  id: string,
  data: Partial<SqeRecordInput>
): Promise<SqeRecord> {
  return fetch(`${API_BASE}/sqe/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteSqeRecord(id: string): Promise<void> {
  return fetch(`${API_BASE}/sqe/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function getEotClaims(projectId: string): Promise<EotClaim[]> {
  return fetch(`${API_BASE}/projects/${projectId}/eot-claims`).then((res) => handle(res));
}

export function getAllEotClaims(): Promise<EotClaim[]> {
  return fetch(`${API_BASE}/eot-claims`).then((res) => handle(res));
}

export function createEotClaim(
  projectId: string,
  data: Partial<EotClaimInput>
): Promise<EotClaim> {
  return fetch(`${API_BASE}/projects/${projectId}/eot-claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateEotClaim(
  id: string,
  data: Partial<EotClaimInput>
): Promise<EotClaim> {
  return fetch(`${API_BASE}/eot-claims/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteEotClaim(id: string): Promise<void> {
  return fetch(`${API_BASE}/eot-claims/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}

export function getChecklistItems(projectId: string): Promise<ChecklistItem[]> {
  return fetch(`${API_BASE}/projects/${projectId}/checklist-items`).then((res) =>
    handle(res)
  );
}

export function createChecklistItem(
  projectId: string,
  data: Partial<ChecklistItemInput>
): Promise<ChecklistItem> {
  return fetch(`${API_BASE}/projects/${projectId}/checklist-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function updateChecklistItem(
  id: string,
  data: Partial<ChecklistItemInput>
): Promise<ChecklistItem> {
  return fetch(`${API_BASE}/checklist-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => handle(res));
}

export function deleteChecklistItem(id: string): Promise<void> {
  return fetch(`${API_BASE}/checklist-items/${id}`, { method: "DELETE" }).then((res) =>
    handle(res)
  );
}
