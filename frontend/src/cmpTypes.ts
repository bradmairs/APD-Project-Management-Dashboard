// Types for CMP's design-consultancy dashboard — kept separate from
// types.ts (GVW's) the same way the two organizations' data lives in
// separate databases: CMP's shapes are not a relabelling of GVW's.

export type CmpProjectStatus =
  | "ENQUIRY"
  | "PROPOSAL"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETE"
  | "CANCELLED";

export type DesignStageName =
  | "CONCEPT_DESIGN"
  | "PRELIMINARY_DESIGN"
  | "DETAILED_DESIGN"
  | "TENDER_DOCUMENTATION"
  | "CONSTRUCTION_ISSUE"
  | "AS_BUILT";

export type DesignStageStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "ISSUED_FOR_REVIEW"
  | "APPROVED"
  | "COMPLETE";

export type DrawingStatus =
  | "DRAFT"
  | "ISSUED_FOR_REVIEW"
  | "ISSUED_FOR_CONSTRUCTION"
  | "SUPERSEDED";

export type DesignReviewOutcome = "APPROVED" | "APPROVED_WITH_COMMENTS" | "REJECTED";

export interface CmpProject {
  id: string;
  name: string;
  clientName: string;
  projectNumber: string | null;
  description: string | null;
  discipline: string | null;
  status: CmpProjectStatus;
  projectLead: string | null;
  feeBudget: number | null;
  hoursBudget: number | null;
  startDate: string | null;
  targetIssueDate: string | null;
  createdById: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  designStages?: DesignStage[];
  drawings?: Drawing[];
  designReviews?: DesignReview[];
}

export type CmpProjectInput = Omit<
  CmpProject,
  | "id"
  | "createdById"
  | "createdByName"
  | "createdAt"
  | "updatedAt"
  | "designStages"
  | "drawings"
  | "designReviews"
>;

export interface DesignStage {
  id: string;
  projectId: string;
  stage: DesignStageName;
  status: DesignStageStatus;
  percentComplete: number;
  targetDate: string | null;
  actualDate: string | null;
  feeAllocated: number | null;
  hoursAllocated: number | null;
  hoursSpent: number | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type DesignStageInput = Omit<
  DesignStage,
  "id" | "projectId" | "sortOrder" | "createdAt" | "updatedAt"
>;

export interface DrawingRevision {
  id: string;
  drawingId: string;
  revision: string;
  description: string | null;
  issuedFor: string | null;
  issuedById: string | null;
  issuedByName: string;
  issuedDate: string;
  createdAt: string;
}

export type DrawingRevisionInput = Omit<
  DrawingRevision,
  "id" | "drawingId" | "issuedById" | "issuedByName" | "createdAt"
>;

export interface Drawing {
  id: string;
  projectId: string;
  drawingNumber: string;
  title: string;
  discipline: string | null;
  currentRevision: string | null;
  status: DrawingStatus;
  createdAt: string;
  updatedAt: string;
  revisions?: DrawingRevision[];
}

export type DrawingInput = Omit<
  Drawing,
  "id" | "projectId" | "currentRevision" | "createdAt" | "updatedAt" | "revisions"
>;

export interface DesignReview {
  id: string;
  projectId: string;
  stage: DesignStageName | null;
  reviewDate: string;
  reviewerName: string;
  outcome: DesignReviewOutcome;
  comments: string | null;
  createdById: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export type DesignReviewInput = Omit<
  DesignReview,
  "id" | "projectId" | "createdById" | "createdByName" | "createdAt" | "updatedAt"
>;

export interface CmpActivityLogEntry {
  id: string;
  projectId: string | null;
  projectName: string;
  userId: string | null;
  userName: string;
  action: string;
  createdAt: string;
}
