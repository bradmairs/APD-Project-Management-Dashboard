export interface User {
  id: string;
  name: string;
  email: string;
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
  projectManager: string | null;
  location: string | null;
  contractor: string | null;
  budget: string | null;
  contractValue: string | null;
  startDate: string | null;
  targetCompletionDate: string | null;
  actualCompletionDate: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt" | "tasks"
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
