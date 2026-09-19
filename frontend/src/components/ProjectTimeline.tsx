import { Milestone, Project, Task } from "../types";
import { formatDate } from "../format";
import { useTheme } from "../theme/ThemeContext";
import { CHART_BASELINE, SEQUENTIAL_BLUE, TASK_STATUS_COLORS, chartColor } from "../charts/palette";

interface Props {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
}

function toTime(value: string | null | undefined): number | null {
  return value ? new Date(value).getTime() : null;
}

// Milestone doesn't store its own start date (only completion dates — see
// the schema comment on the Milestone model), so a bar's start is inferred
// as the previous milestone's own end, chaining from the project's start
// date for the first one — a reasonable approximation of sequential WBS
// scheduling without inventing a field the underlying data doesn't have.
// A milestone with no completion date at all (original/forecast/actual)
// simply can't be placed and is listed without a bar.
function milestoneBars(project: Project, milestones: Milestone[]) {
  let cursor = toTime(project.startDate);
  return milestones.map((milestone) => {
    const endTime =
      toTime(milestone.actualCompletion) ??
      toTime(milestone.forecastedCompletion) ??
      toTime(milestone.originalCompletion);
    const startTime = cursor;
    if (endTime !== null) cursor = endTime;
    return { milestone, startTime, endTime };
  });
}

export default function ProjectTimeline({ project, milestones, tasks }: Props) {
  const { theme } = useTheme();
  const bars = milestoneBars(project, milestones);
  const tasksWithDueDate = tasks.filter((t) => t.dueDate);

  const candidateTimes = [
    toTime(project.startDate),
    toTime(project.targetCompletionDate),
    toTime(project.actualCompletionDate),
    ...bars.flatMap((b) => [b.startTime, b.endTime]),
    ...tasksWithDueDate.map((t) => toTime(t.dueDate)),
  ].filter((t): t is number => t !== null);

  if (candidateTimes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Timeline
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add a project start date, milestone completion dates, or task due dates to see a timeline.
        </p>
      </div>
    );
  }

  const rawMin = Math.min(...candidateTimes);
  const rawMax = Math.max(...candidateTimes);
  const span = Math.max(rawMax - rawMin, 24 * 60 * 60 * 1000);
  const pad = span * 0.05;
  const min = rawMin - pad;
  const max = rawMax + pad;

  function percentFor(time: number): number {
    return Math.min(100, Math.max(0, ((time - min) / (max - min)) * 100));
  }

  const today = Date.now();
  const showToday = today >= min && today <= max;
  const milestoneColor = chartColor(SEQUENTIAL_BLUE, theme);
  const baselineColor = chartColor(CHART_BASELINE, theme);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Timeline</h2>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(new Date(rawMin).toISOString())} – {formatDate(new Date(rawMax).toISOString())}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px] space-y-2">
          {bars.map(({ milestone, startTime, endTime }) => (
            <div key={milestone.id} className="flex items-center gap-3">
              <div className="w-40 shrink-0 truncate text-xs text-slate-600 dark:text-slate-300" title={milestone.taskActivity}>
                {milestone.taskActivity}
              </div>
              <div className="relative flex-1 h-4 rounded bg-slate-100 dark:bg-slate-700">
                {showToday && (
                  <div
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: `${percentFor(today)}%`, backgroundColor: baselineColor }}
                  />
                )}
                {startTime !== null && endTime !== null ? (
                  <div
                    className="absolute top-0 bottom-0 rounded overflow-hidden"
                    style={{
                      left: `${percentFor(startTime)}%`,
                      width: `${Math.max(percentFor(endTime) - percentFor(startTime), 1.5)}%`,
                      backgroundColor: `${milestoneColor}33`,
                    }}
                    title={`${milestone.taskActivity}: ${
                      milestone.originalCompletion ? formatDate(milestone.originalCompletion) : "no start"
                    } → ${endTime ? formatDate(new Date(endTime).toISOString()) : "no end"} (${milestone.percentComplete}% complete)`}
                  >
                    <div
                      className="h-full"
                      style={{ width: `${milestone.percentComplete}%`, backgroundColor: milestoneColor }}
                    />
                  </div>
                ) : (
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] text-slate-400 dark:text-slate-500">
                    No dates set
                  </span>
                )}
              </div>
            </div>
          ))}

          {tasksWithDueDate.length > 0 && (
            <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-700">
              <div className="w-40 shrink-0 text-xs text-slate-600 dark:text-slate-300">
                Tasks ({tasksWithDueDate.length})
              </div>
              <div className="relative flex-1 h-4">
                {showToday && (
                  <div
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: `${percentFor(today)}%`, backgroundColor: baselineColor }}
                  />
                )}
                {tasksWithDueDate.map((task) => {
                  const time = toTime(task.dueDate)!;
                  return (
                    <div
                      key={task.id}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45"
                      style={{
                        left: `${percentFor(time)}%`,
                        backgroundColor: chartColor(TASK_STATUS_COLORS[task.status], theme),
                      }}
                      title={`${task.title} — due ${formatDate(task.dueDate)} (${task.status.replace("_", " ")})`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
