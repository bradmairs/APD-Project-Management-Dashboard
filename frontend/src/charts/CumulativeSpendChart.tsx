import { CashFlowEntry, Project } from "../types";
import { formatCurrency } from "../format";
import { useTheme } from "../theme/ThemeContext";
import {
  CASH_FLOW_ACTUAL,
  CASH_FLOW_FORECAST,
  CHART_BASELINE,
  CHART_GRIDLINE,
  CHART_TEXT_MUTED,
  CHART_TEXT_SECONDARY,
  chartColor,
} from "./palette";

const WIDTH = 800;
const HEIGHT = 260;
const PAD_LEFT = 64;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 30;
const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_HEIGHT = HEIGHT - PAD_TOP - PAD_BOTTOM;

function toMonthKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function addMonths(monthKey: string, n: number): string {
  const d = new Date(monthKey);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)
  ).toISOString();
}

function monthLabel(monthKey: string): string {
  return new Date(monthKey).toLocaleDateString("en-AU", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

interface Props {
  project: Project;
  entries: CashFlowEntry[];
}

// A budget "S-curve": cumulative spend (Actual, then continuing as
// Forecast) plotted against the Approved Budget as a flat reference line,
// over the project's own start-to-target-completion timeframe. The
// dataviz skill treats a threshold like a budget line as a neutral
// reference rather than a data series, so it gets a muted gray rather
// than a categorical hue — it would otherwise compete with Actual/Forecast
// for attention it isn't supposed to have.
export default function CumulativeSpendChart({ project, entries }: Props) {
  const { theme } = useTheme();
  const BUDGET_COLOR = chartColor(CHART_TEXT_MUTED, theme);
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
  const rangeEnd = ends[ends.length - 1] < rangeStart ? rangeStart : ends[ends.length - 1];

  const months: string[] = [];
  let cursor = rangeStart;
  for (let i = 0; i < 600 && cursor <= rangeEnd; i++) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }

  const byMonth = new Map<string, { actual?: number; forecast?: number }>();
  for (const entry of entries) {
    const bucket = byMonth.get(entry.month) || {};
    if (entry.type === "ACTUAL") bucket.actual = Number(entry.amount);
    else bucket.forecast = Number(entry.amount);
    byMonth.set(entry.month, bucket);
  }

  let running = 0;
  let lastActualIndex = -1;
  const cumulative: number[] = months.map((month, i) => {
    const bucket = byMonth.get(month);
    const contribution = bucket?.actual ?? bucket?.forecast ?? 0;
    running += contribution;
    if (bucket?.actual !== undefined) lastActualIndex = i;
    return running;
  });

  const budget = project.budget === null ? null : Number(project.budget);
  const maxValue = Math.max(budget ?? 0, cumulative[cumulative.length - 1] ?? 0, 1) * 1.1;

  const x = (i: number) =>
    PAD_LEFT + (months.length > 1 ? (i / (months.length - 1)) * PLOT_WIDTH : 0);
  const y = (v: number) => PAD_TOP + (1 - v / maxValue) * PLOT_HEIGHT;

  const actualPath = cumulative
    .slice(0, Math.max(lastActualIndex, 0) + 1)
    .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
    .join(" ");
  const forecastPath =
    lastActualIndex < months.length - 1
      ? cumulative
          .slice(Math.max(lastActualIndex, 0))
          .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i + Math.max(lastActualIndex, 0))} ${y(v)}`)
          .join(" ")
      : null;

  const todayKey = toMonthKey(new Date());
  const todayIndex = months.indexOf(todayKey);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxValue);
  const labelEvery = Math.max(1, Math.ceil(months.length / 8));

  return (
    <div>
      <div
        className="flex items-center gap-4 mb-3 text-xs flex-wrap"
        style={{ color: chartColor(CHART_TEXT_SECONDARY, theme) }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-0.5"
            style={{ backgroundColor: chartColor(CASH_FLOW_ACTUAL, theme) }}
          />
          Actual (cumulative)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-0.5 border-t-2 border-dashed"
            style={{ borderColor: chartColor(CASH_FLOW_FORECAST, theme) }}
          />
          Forecast (cumulative)
        </span>
        {budget !== null && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 border-t-2 border-dashed"
              style={{ borderColor: BUDGET_COLOR }}
            />
            Approved Budget
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y(tick)}
              y2={y(tick)}
              stroke={chartColor(CHART_GRIDLINE, theme)}
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill={chartColor(CHART_TEXT_MUTED, theme)}
            >
              {formatCompact(tick)}
            </text>
          </g>
        ))}

        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={PAD_TOP + PLOT_HEIGHT}
          y2={PAD_TOP + PLOT_HEIGHT}
          stroke={chartColor(CHART_BASELINE, theme)}
          strokeWidth={1}
        />

        {months.map((month, i) =>
          i % labelEvery === 0 ? (
            <text
              key={month}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize={10}
              fill={chartColor(CHART_TEXT_MUTED, theme)}
            >
              {monthLabel(month)}
            </text>
          ) : null
        )}

        {budget !== null && (
          <line
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={y(budget)}
            y2={y(budget)}
            stroke={BUDGET_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}

        {todayIndex >= 0 && (
          <>
            <line
              x1={x(todayIndex)}
              x2={x(todayIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + PLOT_HEIGHT}
              stroke={chartColor(CHART_TEXT_SECONDARY, theme)}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={x(todayIndex)}
              y={PAD_TOP - 4}
              textAnchor="middle"
              fontSize={10}
              fill={chartColor(CHART_TEXT_SECONDARY, theme)}
            >
              Today
            </text>
          </>
        )}

        {forecastPath && (
          <path
            d={forecastPath}
            fill="none"
            stroke={chartColor(CASH_FLOW_FORECAST, theme)}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}
        {actualPath && (
          <path
            d={actualPath}
            fill="none"
            stroke={chartColor(CASH_FLOW_ACTUAL, theme)}
            strokeWidth={2}
          />
        )}

        {cumulative.map((v, i) => (
          <circle
            key={months[i]}
            cx={x(i)}
            cy={y(v)}
            r={2.5}
            fill={chartColor(
              i <= lastActualIndex ? CASH_FLOW_ACTUAL : CASH_FLOW_FORECAST,
              theme
            )}
          >
            <title>
              {monthLabel(months[i])}: {formatCurrency(v)} cumulative
              {i <= lastActualIndex ? " (actual)" : " (forecast)"}
            </title>
          </circle>
        ))}
      </svg>

      <p className="text-xs pt-1" style={{ color: chartColor(CHART_TEXT_MUTED, theme) }}>
        Cumulative spend from {monthLabel(rangeStart)} to {monthLabel(rangeEnd)}
        {budget !== null && `, against an approved budget of ${formatCurrency(budget)}`}.
      </p>
    </div>
  );
}
