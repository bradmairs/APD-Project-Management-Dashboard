import { CashFlowEntry, Project } from "../types";
import { formatCurrency } from "../format";
import CumulativeSpendChartView from "./CumulativeSpendChartView";
import {
  buildCumulativeSeries,
  buildMonthRange,
  monthLabel,
  monthlyContributions,
  sumContributions,
  toMonthKey,
} from "./cumulativeSpend";

interface Props {
  projects: Project[];
  entries: CashFlowEntry[];
}

// The portfolio-wide version of each project's own Spend vs Budget Over Time
// chart: one project's contribution for a month is its own actual amount
// once recorded, falling back to its own forecast — never another project's
// — so each project's series is built independently first and only then
// summed, rather than pooling every project's raw entries into one bucket
// (which would let one project's actual silently swallow another's still-
// forecast month).
export default function PortfolioCumulativeSpendChart({ projects, entries }: Props) {
  const entriesByProject = new Map<string, CashFlowEntry[]>();
  for (const entry of entries) {
    const list = entriesByProject.get(entry.projectId) ?? [];
    list.push(entry);
    entriesByProject.set(entry.projectId, list);
  }

  const allMonths = entries.map((e) => e.month);
  const starts = [...projects.map((p) => p.startDate), ...allMonths]
    .filter((v): v is string => !!v)
    .map(toMonthKey)
    .sort();
  const ends = [...projects.map((p) => p.targetCompletionDate), ...allMonths]
    .filter((v): v is string => !!v)
    .map(toMonthKey)
    .sort();

  if (starts.length === 0 || ends.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
        Add project start/target completion dates or cash flow entries to see
        portfolio spend over time.
      </p>
    );
  }

  const rangeStart = starts[0];
  const rangeEnd = ends[ends.length - 1];
  const months = buildMonthRange(rangeStart, rangeEnd);

  const perProjectContributions = projects.map((project) =>
    monthlyContributions(entriesByProject.get(project.id) ?? [])
  );
  const combinedContributions = sumContributions(perProjectContributions);

  // The portfolio's Actual/Forecast split: the latest month in which *any*
  // project recorded an actual, since a single combined line can't show
  // each project's own frontier separately.
  const lastActual = entries
    .filter((e) => e.type === "ACTUAL")
    .map((e) => e.month)
    .sort()
    .slice(-1)[0] as string | undefined;

  const { cumulative, lastActualIndex } = buildCumulativeSeries(
    months,
    combinedContributions,
    lastActual ?? null
  );

  const budgets = projects
    .map((p) => p.budget)
    .filter((b): b is string => b !== null)
    .map(Number);
  const totalBudget = budgets.length === 0 ? null : budgets.reduce((sum, b) => sum + b, 0);

  return (
    <CumulativeSpendChartView
      months={months}
      cumulative={cumulative}
      lastActualIndex={lastActualIndex}
      budget={totalBudget}
      budgetLabel="Total Approved Budget"
      footerNote={`Cumulative spend across ${projects.length} project${
        projects.length === 1 ? "" : "s"
      } from ${monthLabel(rangeStart)} to ${monthLabel(rangeEnd)}${
        totalBudget !== null
          ? `, against a total approved budget of ${formatCurrency(totalBudget)}`
          : ""
      }.`}
    />
  );
}
