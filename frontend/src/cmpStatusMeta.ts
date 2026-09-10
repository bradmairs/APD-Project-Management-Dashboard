import { CmpProjectStatus, DesignStageName, DesignStageStatus, DrawingStatus } from "./cmpTypes";

export const CMP_PROJECT_STATUSES: CmpProjectStatus[] = [
  "ENQUIRY",
  "PROPOSAL",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETE",
  "CANCELLED",
];

export const CMP_PROJECT_STATUS_LABELS: Record<CmpProjectStatus, string> = {
  ENQUIRY: "Enquiry",
  PROPOSAL: "Proposal",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETE: "Complete",
  CANCELLED: "Cancelled",
};

export const CMP_PROJECT_STATUS_COLORS: Record<CmpProjectStatus, string> = {
  ENQUIRY: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  PROPOSAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  ON_HOLD: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  COMPLETE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export const DESIGN_STAGES: DesignStageName[] = [
  "CONCEPT_DESIGN",
  "PRELIMINARY_DESIGN",
  "DETAILED_DESIGN",
  "TENDER_DOCUMENTATION",
  "CONSTRUCTION_ISSUE",
  "AS_BUILT",
];

export const DESIGN_STAGE_LABELS: Record<DesignStageName, string> = {
  CONCEPT_DESIGN: "Concept Design",
  PRELIMINARY_DESIGN: "Preliminary Design",
  DETAILED_DESIGN: "Detailed Design",
  TENDER_DOCUMENTATION: "Tender Documentation",
  CONSTRUCTION_ISSUE: "Construction Issue",
  AS_BUILT: "As-Built",
};

export const DESIGN_STAGE_STATUSES: DesignStageStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ISSUED_FOR_REVIEW",
  "APPROVED",
  "COMPLETE",
];

export const DESIGN_STAGE_STATUS_LABELS: Record<DesignStageStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  ISSUED_FOR_REVIEW: "Issued for Review",
  APPROVED: "Approved",
  COMPLETE: "Complete",
};

export const DRAWING_STATUSES: DrawingStatus[] = [
  "DRAFT",
  "ISSUED_FOR_REVIEW",
  "ISSUED_FOR_CONSTRUCTION",
  "SUPERSEDED",
];

export const DRAWING_STATUS_LABELS: Record<DrawingStatus, string> = {
  DRAFT: "Draft",
  ISSUED_FOR_REVIEW: "Issued for Review",
  ISSUED_FOR_CONSTRUCTION: "Issued for Construction",
  SUPERSEDED: "Superseded",
};
