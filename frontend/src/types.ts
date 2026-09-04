export type ProjectStatus =
  | "PLANNING"
  | "DESIGN"
  | "TENDER"
  | "CONSTRUCTION"
  | "DEFECTS_LIABILITY"
  | "COMPLETE"
  | "ON_HOLD"
  | "CANCELLED";

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
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
