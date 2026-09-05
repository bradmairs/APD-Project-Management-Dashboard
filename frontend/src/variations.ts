import { Project, Variation } from "./types";

// Only an APPROVED variation counts toward the budget — a Proposed one
// hasn't been agreed yet, and a Rejected one never happened.
export function approvedVariationsTotal(variations: Variation[]): number {
  return variations
    .filter((v) => v.status === "APPROVED")
    .reduce((sum, v) => sum + Number(v.costImpact), 0);
}

// A project's budget as revised by its approved variations. Null when the
// project has no budget set at all — there's nothing to revise.
export function revisedBudget(
  project: Pick<Project, "budget">,
  variations: Variation[]
): number | null {
  if (project.budget === null) return null;
  return Number(project.budget) + approvedVariationsTotal(variations);
}
