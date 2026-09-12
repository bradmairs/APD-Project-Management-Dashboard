import { CashFlowEntry, EotClaim, Project, RagStatus, Risk, Variation } from "./types";
import { STATUS_LABELS, STATUSES_EXEMPT_FROM_OVERDUE } from "./statusMeta";
import { formatCurrency, formatDate } from "./format";
import { forecastAtCompletion } from "./cashflow";
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
  // Plain-English basis for each rating, shown as a tooltip on the detailed
  // badge — the status alone doesn't say whether "Amber" means 3 days out
  // or 30, and a user shouldn't need to know the thresholds by heart.
  reasons: {
    schedule: string;
    budget: string;
    risk: string;
  };
}

const RAG_SEVERITY: Record<RagStatus, number> = { GREEN: 0, AMBER: 1, RED: 2 };

function worstOf(statuses: RagStatus[]): RagStatus {
  return statuses.reduce((worst, s) =>
    RAG_SEVERITY[s] > RAG_SEVERITY[worst] ? s : worst
  );
}

const DUE_SOON_DAYS = 30;

interface RagResult {
  status: RagStatus;
  reason: string;
}

// Uses the project's completion date as revised by any approved EOT
// claims, not the raw contractual date — the same reasoning budgetHealth
// uses revisedBudget instead of the raw budget. This is deliberately
// different from statusMeta's isProjectOverdue (used by the dashboard's
// "Overdue" stat and the project table), which always reflects the
// original contractual date; Health is the exception-surfacing signal
// that should account for a schedule already agreed to be revised, while
// "Overdue" stays a literal reading of the contract.
function scheduleHealth(project: Project, eotClaims: EotClaim[]): RagResult {
  const effectiveTarget = revisedCompletionDate(project, eotClaims);
  if (!effectiveTarget) return { status: "GREEN", reason: "No target completion date set." };
  if (STATUSES_EXEMPT_FROM_OVERDUE.includes(project.status)) {
    return {
      status: "GREEN",
      reason: `Status is ${STATUS_LABELS[project.status]}, which isn't tracked against the target date.`,
    };
  }

  const daysUntilTarget = Math.round(
    (new Date(effectiveTarget).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const dateLabel = formatDate(effectiveTarget);
  if (daysUntilTarget < 0) {
    const daysPast = Math.abs(daysUntilTarget);
    return {
      status: "RED",
      reason: `${daysPast} day${daysPast === 1 ? "" : "s"} past target completion (${dateLabel}).`,
    };
  }
  if (daysUntilTarget <= DUE_SOON_DAYS) {
    return {
      status: "AMBER",
      reason: `${daysUntilTarget} day${daysUntilTarget === 1 ? "" : "s"} until target completion (${dateLabel}).`,
    };
  }
  return {
    status: "GREEN",
    reason: `${daysUntilTarget} days until target completion (${dateLabel}).`,
  };
}

function budgetHealth(
  project: Project,
  entries: CashFlowEntry[],
  variations: Variation[]
): RagResult {
  const budget = revisedBudget(project, variations);
  if (budget === null) return { status: "GREEN", reason: "No approved budget set." };
  if (entries.length === 0) {
    return { status: "GREEN", reason: "No cash flow entries recorded yet." };
  }

  const forecastTotal = forecastAtCompletion(entries);
  const pctOfBudget = Math.round((forecastTotal / budget) * 100);
  const reason = `Forecast total ${formatCurrency(forecastTotal)} is ${pctOfBudget}% of the approved budget (${formatCurrency(budget)}).`;

  if (forecastTotal > budget) return { status: "RED", reason };
  if (forecastTotal > budget * 0.9) return { status: "AMBER", reason };
  return { status: "GREEN", reason };
}

function riskHealth(risks: Risk[]): RagResult {
  let worst: RagStatus = "GREEN";
  let critical = 0;
  let high = 0;
  let openCount = 0;
  for (const risk of risks) {
    if (risk.type !== "RISK" || risk.status === "CLOSED") continue;
    openCount += 1;
    const band = riskBand(riskScore(risk.inherentLikelihood, risk.inherentConsequence));
    if (band === "Critical") {
      critical += 1;
      worst = "RED";
    } else if (band === "High" && worst !== "RED") {
      high += 1;
      worst = "AMBER";
    }
  }

  if (critical > 0) {
    return {
      status: "RED",
      reason: `${critical} Critical-band risk${critical === 1 ? "" : "s"} open.`,
    };
  }
  if (high > 0) {
    return {
      status: "AMBER",
      reason: `${high} High-band risk${high === 1 ? "" : "s"} open.`,
    };
  }
  return {
    status: worst,
    reason:
      openCount === 0
        ? "No open risks logged."
        : `${openCount} open risk${openCount === 1 ? "" : "s"}, none rated High or Critical.`,
  };
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
  return {
    schedule: schedule.status,
    budget: budget.status,
    risk: risk.status,
    overall: worstOf([schedule.status, budget.status, risk.status]),
    reasons: { schedule: schedule.reason, budget: budget.reason, risk: risk.reason },
  };
}
