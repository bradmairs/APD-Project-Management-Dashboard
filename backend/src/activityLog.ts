import { Milestone, Project, SiteVisit, Task } from "@prisma/client";
import { prisma } from "./prisma";

interface LogParams {
  projectId: string | null;
  projectName: string;
  userId: string | null;
  userName: string;
  action: string;
}

export function logActivity(params: LogParams) {
  return prisma.activityLog.create({ data: params });
}

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  DESIGN: "Design",
  TENDER: "Tender",
  CONSTRUCTION: "Construction",
  DEFECTS_LIABILITY: "Defects Liability",
  COMPLETE: "Complete",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PROJECT_FIELD_LABELS: Record<string, string> = {
  name: "name",
  description: "description",
  assetType: "asset type",
  projectManager: "project manager",
  location: "location",
  contractor: "contractor",
  budget: "budget",
  contractValue: "contract value",
  startDate: "start date",
  targetCompletionDate: "target completion date",
  actualCompletionDate: "actual completion date",
};

const NUMERIC_FIELDS = new Set(["budget", "contractValue"]);
const DATE_FIELDS = new Set([
  "startDate",
  "targetCompletionDate",
  "actualCompletionDate",
  "dueDate",
]);

function valuesEqual(field: string, before: unknown, submitted: unknown): boolean {
  if (NUMERIC_FIELDS.has(field)) {
    const b = before === null || before === undefined ? null : Number(before);
    const a =
      submitted === null || submitted === undefined || submitted === ""
        ? null
        : Number(submitted);
    return b === a;
  }
  if (DATE_FIELDS.has(field)) {
    const b = before ? new Date(before as string).getTime() : null;
    const a = submitted ? new Date(submitted as string).getTime() : null;
    return b === a;
  }
  const b = before ?? null;
  const a = submitted === "" ? null : submitted ?? null;
  return b === a;
}

// Compares the pre-update record against the raw request body (not the
// post-update record) so we only need one query, and describes what
// actually changed in one human-readable line.
export function describeProjectChanges(
  before: Project,
  body: Record<string, unknown>
): string {
  const changedLabels: string[] = [];
  let statusChange: string | null = null;

  for (const [field, label] of Object.entries(PROJECT_FIELD_LABELS)) {
    if (!(field in body)) continue;
    if (!valuesEqual(field, (before as Record<string, unknown>)[field], body[field])) {
      changedLabels.push(label);
    }
  }

  if ("status" in body && body.status !== before.status) {
    const from = STATUS_LABELS[before.status] ?? before.status;
    const to = STATUS_LABELS[body.status as string] ?? String(body.status);
    statusChange = `changed status from ${from} to ${to}`;
  }

  const parts: string[] = [];
  if (statusChange) parts.push(statusChange);
  if (changedLabels.length > 0) parts.push(`updated ${changedLabels.join(", ")}`);

  return parts.length > 0 ? parts.join("; ") : "updated project details";
}

export function describeTaskUpdate(before: Task, body: Record<string, unknown>): string {
  if ("status" in body && body.status !== before.status) {
    const label = TASK_STATUS_LABELS[body.status as string] ?? String(body.status);
    return `marked task "${before.title}" as ${label}`;
  }
  if ("dueDate" in body && !valuesEqual("dueDate", before.dueDate, body.dueDate)) {
    return `updated the due date for task "${before.title}"`;
  }
  return `updated task "${before.title}"`;
}

export function describeMilestoneUpdate(
  before: Milestone,
  body: Record<string, unknown>
): string {
  if ("percentComplete" in body && body.percentComplete !== before.percentComplete) {
    return `updated milestone "${before.taskActivity}" to ${body.percentComplete}% complete`;
  }
  return `updated milestone "${before.taskActivity}"`;
}

export function describeSiteVisitUpdate(
  before: SiteVisit,
  body: Record<string, unknown>
): string {
  if ("location" in body && body.location !== before.location) {
    return `updated the site visit location to "${body.location}"`;
  }
  return `updated the site visit at ${before.location}`;
}
