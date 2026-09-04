import { Project, ProjectStatus } from "./types";

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  DESIGN: "Design",
  TENDER: "Tender",
  CONSTRUCTION: "Construction",
  DEFECTS_LIABILITY: "Defects Liability",
  COMPLETE: "Complete",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNING: "bg-slate-200 text-slate-800",
  DESIGN: "bg-sky-100 text-sky-800",
  TENDER: "bg-amber-100 text-amber-800",
  CONSTRUCTION: "bg-blue-100 text-blue-800",
  DEFECTS_LIABILITY: "bg-purple-100 text-purple-800",
  COMPLETE: "bg-green-100 text-green-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const ALL_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "DESIGN",
  "TENDER",
  "CONSTRUCTION",
  "DEFECTS_LIABILITY",
  "COMPLETE",
  "ON_HOLD",
  "CANCELLED",
];

// A project is only "overdue" while it's still working toward its target
// completion date. Once construction is done (Defects Liability, Complete)
// or the project is Cancelled, passing that original date is expected, not late.
const STATUSES_EXEMPT_FROM_OVERDUE: ProjectStatus[] = [
  "DEFECTS_LIABILITY",
  "COMPLETE",
  "CANCELLED",
];

export function isProjectOverdue(project: Project): boolean {
  if (!project.targetCompletionDate) return false;
  if (STATUSES_EXEMPT_FROM_OVERDUE.includes(project.status)) return false;
  return new Date(project.targetCompletionDate) < new Date();
}
