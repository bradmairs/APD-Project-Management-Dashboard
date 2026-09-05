import { CashFlowEntry, Project } from "../types";
import { formatCurrency } from "../format";
import CumulativeSpendChartView from "./CumulativeSpendChartView";
import {
  buildCumulativeSeries,
  buildMonthRange,
  lastActualMonth,
  monthLabel,
  monthlyContributions,
  toMonthKey,
} from "./cumulativeSpend";

interface Props {
  project: Project;
  entries: CashFlowEntry[];
}

// A budget "S-curve": cumulative spend (Actual, then continuing as
// Forecast) plotted against the Approved Budget as a flat reference line,
// over the project's own start-to-target-completion timeframe.
export default function CumulativeSpendChart({ project, entries }: Props) {
  const entryMonths = entries.map((e) => e.month).sort();
  const starts = [project.startDate, entryMonths[0]]
    .filter((v): v is string => !!v)
    .map(toMonthKey)
    .sort();
  const ends = [project.targetCompletionDate, entryMonths[entryMonths.length - 1]]
    .filter((v): v is string => !!v)
    .map(toMonthKey)
    .sort();

  if (starts.length === 0 || ends.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
        Add a start/target completion date or a cash flow entry to see spend
        over time.
      </p>
    );
  }

  const rangeStart = starts[0];
  const rangeEnd = ends[ends.length - 1];
  const months = buildMonthRange(rangeStart, rangeEnd);
  const { cumulative, lastActualIndex } = buildCumulativeSeries(
    months,
    monthlyContributions(entries),
    lastActualMonth(entries)
  );

  const budget = project.budget === null ? null : Number(project.budget);

  return (
    <CumulativeSpendChartView
      months={months}
      cumulative={cumulative}
      lastActualIndex={lastActualIndex}
      budget={budget}
      footerNote={`Cumulative spend from ${monthLabel(rangeStart)} to ${monthLabel(
        rangeEnd
      )}${budget !== null ? `, against an approved budget of ${formatCurrency(budget)}` : ""}.`}
    />
  );
}
