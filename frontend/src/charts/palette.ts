// Chart tokens, from the validated reference palette (see dataviz skill).
export const CHART_TEXT_PRIMARY = "#0b0b0b";
export const CHART_TEXT_SECONDARY = "#52514e";
export const CHART_TEXT_MUTED = "#898781";
export const CHART_GRIDLINE = "#e1e0d9";
export const CHART_BASELINE = "#c3c2b7";

// Single-hue sequential blue (magnitude charts with one series).
export const SEQUENTIAL_BLUE = "#2a78d6";

// Task status progression — validated for CVD-safe adjacent separation
// (blue vs gray, blue vs green); gray intentionally reads as "neutral/not
// started" rather than as a categorical hue.
export const TASK_STATUS_COLORS: Record<"TODO" | "IN_PROGRESS" | "DONE", string> = {
  TODO: CHART_TEXT_MUTED,
  IN_PROGRESS: SEQUENTIAL_BLUE,
  DONE: "#008300",
};

// Actual vs. Forecast spend — categorical slots 1 (blue) and 2 (orange) from
// the reference palette, validated as a passing adjacent pair (CVD ΔE 24.7,
// normal-vision ΔE 33.6 — see dataviz skill).
export const CASH_FLOW_ACTUAL = SEQUENTIAL_BLUE;
export const CASH_FLOW_FORECAST = "#eb6834";
