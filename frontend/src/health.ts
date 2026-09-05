import { CashFlowEntry, EotClaim, Project, RagStatus, Risk, Variation } from "./types";
import { STATUSES_EXEMPT_FROM_OVERDUE } from "./statusMeta";
import { revisedBudget } from "./variations";
import { revisedCompletionDate } from "./eot";
import { riskBand, riskScore } from "./riskScoring";

// A computed, always-up-to-date view of a project's health — distinct from
// the budgetHealth/scheduleHealth on a MonthlyReport, which are a PM's own
// manually-entered judgement call as of that reporting month. This rolls up
// live schedule, budget and risk data so a project needing attention shows
// up immediately rather than waiting for the next report.
export interface ProjectHealth {
  schedule: RagStatus;
  budget: RagStatus;
  risk: RagStatus;
  overall: RagStatus;
}

const RAG_SEVERITY: Record<RagStatus, number> = { GREEN: 0, AMBER: 1, RED: 2 };

function worstOf(statuses: RagStatus[]): RagStatus {
  return statuses.reduce((worst, s) =>
    RAG_SEVERITY[s] > RAG_SEVERITY[worst] ? s : worst
  );
}

const DUE_SOON_DAYS = 30;

// Uses the project's completion date as revised by any approved EOT
// claims, not the raw contractual date — the same reasoning budgetHealth
// uses revisedBudget instead of the raw budget. This is deliberately
// different from statusMeta's isProjectOverdue (used by the dashboard's
// "Overdue" stat and the project table), which always reflects the
// original contractual date; Health is the exception-surfacing signal
// that should account for a schedule already agreed to be revised, while
// "Overdue" stays a literal reading of the contract.
function scheduleHealth(project: Project, eotClaims: EotClaim[]): RagStatus {
  const effectiveTarget = revisedCompletionDate(project, eotClaims);
  if (!effectiveTarget) return "GREEN";
  if (STATUSES_EXEMPT_FROM_OVERDUE.includes(project.status)) return "GREEN";

  const daysUntilTarget =
    (new Date(effectiveTarget).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilTarget < 0) return "RED";
  if (daysUntilTarget <= DUE_SOON_DAYS) return "AMBER";
  return "GREEN";
}

function budgetHealth(
  project: Project,
  entries: CashFlowEntry[],
  variations: Variation[]
): RagStatus {
  const budget = revisedBudget(project, variations);
  if (budget === null || entries.length === 0) return "GREEN";

  const expenditureToDate = entries
    .filter((e) => e.type === "ACTUAL")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const forecastRemaining = entries
    .filter((e) => e.type === "FORECAST")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const forecastTotal = expenditureToDate + forecastRemaining;

  if (forecastTotal > budget) return "RED";
  if (forecastTotal > budget * 0.9) return "AMBER";
  return "GREEN";
}

function riskHealth(risks: Risk[]): RagStatus {
  let worst: RagStatus = "GREEN";
  for (const risk of risks) {
    if (risk.type !== "RISK" || risk.status === "CLOSED") continue;
    const band = riskBand(riskScore(risk.inherentLikelihood, risk.inherentConsequence));
    if (band === "Critical") return "RED";
    if (band === "High") worst = "AMBER";
  }
  return worst;
}

export function computeProjectHealth(
  project: Project,
  entries: CashFlowEntry[],
  variations: Variation[],
  risks: Risk[],
  eotClaims: EotClaim[] = []
): ProjectHealth {
  const schedule = scheduleHealth(project, eotClaims);
  const budget = budgetHealth(project, entries, variations);
  const risk = riskHealth(risks);
  return { schedule, budget, risk, overall: worstOf([schedule, budget, risk]) };
}
