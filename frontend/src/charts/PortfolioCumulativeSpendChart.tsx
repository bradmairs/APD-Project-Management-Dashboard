import { CashFlowEntry, Project, Variation } from "../types";
import { formatCurrency } from "../format";
import { approvedVariationsTotal, revisedBudget } from "../variations";
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
  variations?: Variation[];
}

// The portfolio-wide version of each project's own Spend vs Budget Over Time
// chart: one project's contribution for a month is its own actual amount
// once recorded, falling back to its own forecast — never another project's
// — so each project's series is built independently first and only then
// summed, rather than pooling every project's raw entries into one bucket
// (which would let one project's actual silently swallow another's still-
// forecast month).
export default function PortfolioCumulativeSpendChart({
  projects,
  entries,
  variations = [],
}: Props) {
  const entriesByProject = new Map<string, CashFlowEntry[]>();
  for (const entry of entries) {
    const list = entriesByProject.get(entry.projectId) ?? [];
    list.push(entry);
    entriesByProject.set(entry.projectId, list);
  }

  const variationsByProject = new Map<string, Variation[]>();
  for (const variation of variations) {
    const list = variationsByProject.get(variation.projectId) ?? [];
    list.push(variation);
    variationsByProject.set(variation.projectId, list);
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

  const revisedBudgets = projects
    .map((p) => revisedBudget(p, variationsByProject.get(p.id) ?? []))
    .filter((b): b is number => b !== null);
  const totalBudget =
    revisedBudgets.length === 0 ? null : revisedBudgets.reduce((sum, b) => sum + b, 0);
  const isRevised = approvedVariationsTotal(variations) !== 0;
  const budgetLabel = isRevised ? "Total Revised Budget" : "Total Approved Budget";

  return (
    <CumulativeSpendChartView
      months={months}
      cumulative={cumulative}
      lastActualIndex={lastActualIndex}
      budget={totalBudget}
      budgetLabel={budgetLabel}
      footerNote={`Cumulative spend across ${projects.length} project${
        projects.length === 1 ? "" : "s"
      } from ${monthLabel(rangeStart)} to ${monthLabel(rangeEnd)}${
        totalBudget !== null
          ? `, against a total ${isRevised ? "revised" : "approved"} budget of ${formatCurrency(totalBudget)}`
          : ""
      }.`}
    />
  );
}
