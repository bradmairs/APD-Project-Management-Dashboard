export type Role = "ADMIN" | "MEMBER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export type ProjectStatus =
  | "PLANNING"
  | "DESIGN"
  | "TENDER"
  | "CONSTRUCTION"
  | "DEFECTS_LIABILITY"
  | "COMPLETE"
  | "ON_HOLD"
  | "CANCELLED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

export type TaskInput = Omit<
  Task,
  "id" | "projectId" | "createdAt" | "updatedAt" | "project"
>;

export interface Project {
  id: string;
  name: string;
  description: string | null;
  assetType: string | null;
  status: ProjectStatus;
  bpRefNo: string | null;
  projectManager: string | null;
  projectDirector: string | null;
  projectSponsor: string | null;
  location: string | null;
  contractor: string | null;
  budget: string | null;
  contingency: string | null;
  contractValue: string | null;
  startDate: string | null;
  targetCompletionDate: string | null;
  actualCompletionDate: string | null;
  createdById: string | null;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdById" | "createdBy" | "createdAt" | "updatedAt" | "tasks"
>;

export interface ActivityLogEntry {
  id: string;
  projectId: string | null;
  projectName: string;
  userId: string | null;
  userName: string;
  action: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  projectId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: string | null;
  uploadedByName: string;
  createdAt: string;
}

export type RagStatus = "GREEN" | "AMBER" | "RED";

export interface MonthlyReport {
  id: string;
  projectId: string;
  reportingMonth: string;
  projectPhase: string;
  currentStatus: string;
  recentlyCompleted: string | null;
  monthlyLookahead: string | null;
  budgetHealth: RagStatus;
  budgetComments: string | null;
  scheduleHealth: RagStatus;
  scheduleComments: string | null;
  createdById: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export type MonthlyReportInput = Omit<
  MonthlyReport,
  "id" | "projectId" | "createdById" | "authorName" | "createdAt" | "updatedAt"
>;

export interface Milestone {
  id: string;
  projectId: string;
  wbsItem: string | null;
  taskActivity: string;
  percentComplete: number;
  originalCompletion: string | null;
  forecastedCompletion: string | null;
  actualCompletion: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneInput = Omit<
  Milestone,
  "id" | "projectId" | "sortOrder" | "createdAt" | "updatedAt"
>;

export type CashFlowType = "ACTUAL" | "FORECAST";

export interface CashFlowEntry {
  id: string;
  projectId: string;
  month: string;
  type: CashFlowType;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export type CashFlowEntryInput = Omit<
  CashFlowEntry,
  "id" | "projectId" | "createdAt" | "updatedAt"
>;

export interface SiteVisit {
  id: string;
  projectId: string;
  visitDate: string;
  location: string;
  notes: string | null;
  discussionNotes: string | null;
  visitedById: string | null;
  visitedByName: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteVisitInput = Omit<
  SiteVisit,
  "id" | "projectId" | "visitedById" | "visitedByName" | "createdAt" | "updatedAt"
>;

export interface SiteVisitPhoto {
  id: string;
  siteVisitId: string;
  originalName: string;
  mimeType: string;
  size: number;
  latitude: number | null;
  longitude: number | null;
  takenAt: string | null;
  uploadedById: string | null;
  uploadedByName: string;
  createdAt: string;
  siteVisit?: { id: string; location: string; visitDate: string };
}

export type VariationStatus = "PROPOSED" | "APPROVED" | "REJECTED";

export interface Variation {
  id: string;
  projectId: string;
  reference: string | null;
  title: string;
  description: string | null;
  category: string | null;
  costImpact: string;
  timeImpactDays: number | null;
  status: VariationStatus;
  dateRaised: string;
  dateDecided: string | null;
  raisedById: string | null;
  raisedByName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VariationInput = Omit<
  Variation,
  | "id"
  | "projectId"
  | "dateDecided"
  | "raisedById"
  | "raisedByName"
  | "createdAt"
  | "updatedAt"
>;

export type RiskType = "RISK" | "OPPORTUNITY";

export type RiskLikelihood =
  | "RARE"
  | "UNLIKELY"
  | "POSSIBLE"
  | "LIKELY"
  | "ALMOST_CERTAIN";

export type RiskConsequence =
  | "INSIGNIFICANT"
  | "MINOR"
  | "MODERATE"
  | "MAJOR"
  | "SEVERE";

export type RiskStatus = "OPEN" | "MITIGATING" | "CLOSED";

export interface Risk {
  id: string;
  projectId: string;
  type: RiskType;
  title: string;
  description: string | null;
  category: string | null;
  inherentLikelihood: RiskLikelihood;
  inherentConsequence: RiskConsequence;
  residualLikelihood: RiskLikelihood | null;
  residualConsequence: RiskConsequence | null;
  mitigation: string | null;
  ownerName: string | null;
  dueDate: string | null;
  status: RiskStatus;
  createdById: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

export type RiskInput = Omit<
  Risk,
  "id" | "projectId" | "createdById" | "createdByName" | "createdAt" | "updatedAt" | "project"
>;

export type ActionType = "ACTION" | "DECISION";

export type ActionItemStatus = "OPEN" | "IN_PROGRESS" | "DONE";

export interface ActionItem {
  id: string;
  projectId: string;
  type: ActionType;
  title: string;
  description: string | null;
  category: string | null;
  ownerName: string | null;
  dueDate: string | null;
  status: ActionItemStatus;
  dateRaised: string;
  dateClosed: string | null;
  raisedById: string | null;
  raisedByName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

export type ActionItemInput = Omit<
  ActionItem,
  | "id"
  | "projectId"
  | "dateClosed"
  | "raisedById"
  | "raisedByName"
  | "createdAt"
  | "updatedAt"
  | "project"
>;
