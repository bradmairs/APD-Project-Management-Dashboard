import { Link } from "react-router-dom";
import { TASK_STATUS_COLORS, CHART_TEXT_SECONDARY } from "./palette";

export interface ProgressDatum {
  id: string;
  label: string;
  todo: number;
  inProgress: number;
  done: number;
}

const SEGMENTS: { key: keyof typeof TASK_STATUS_COLORS; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

function Legend() {
  return (
    <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: CHART_TEXT_SECONDARY }}>
      {SEGMENTS.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-1.5 rounded-sm"
            style={{ backgroundColor: TASK_STATUS_COLORS[s.key] }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export default function StackedProgressChart({ data }: { data: ProgressDatum[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        No projects with tasks yet.
      </p>
    );
  }

  return (
    <div>
      <Legend />
      <div className="space-y-3">
        {data.map((d) => {
          const total = d.todo + d.inProgress + d.done;
          const pctDone = total > 0 ? Math.round((d.done / total) * 100) : 0;
          const segments = SEGMENTS.map((s) => ({
            ...s,
            value: d[
              s.key === "TODO" ? "todo" : s.key === "IN_PROGRESS" ? "inProgress" : "done"
            ],
          })).filter((s) => s.value > 0);

          return (
            <div key={d.id} className="group" tabIndex={0}>
              <div className="flex items-center justify-between text-xs mb-1">
                <Link
                  to={`/projects/${d.id}`}
                  className="text-slate-700 hover:text-blue-600 hover:underline"
                >
                  {d.label}
                </Link>
                <span
                  className="font-medium tabular-nums"
                  style={{ color: CHART_TEXT_SECONDARY }}
                >
                  {d.done}/{total} done ({pctDone}%)
                </span>
              </div>
              <div className="flex h-4 rounded-r overflow-hidden bg-slate-100">
                {segments.map((s, i) => (
                  <div
                    key={s.key}
                    className="h-4 transition-opacity group-hover:opacity-85"
                    style={{
                      width: `${(s.value / total) * 100}%`,
                      backgroundColor: TASK_STATUS_COLORS[s.key],
                      borderRight:
                        i < segments.length - 1 ? "2px solid white" : "none",
                    }}
                    title={`${s.label}: ${s.value}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
