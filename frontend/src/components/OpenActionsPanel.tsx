import { Link } from "react-router-dom";
import { ActionItem } from "../types";
import { formatDate } from "../format";
import { ACTION_TYPE_COLORS, ACTION_TYPE_LABELS } from "../actionItemMeta";

interface Props {
  actionItems: ActionItem[];
  limit?: number;
}

function isOverdue(actionItem: ActionItem): boolean {
  if (!actionItem.dueDate) return false;
  return new Date(actionItem.dueDate) < new Date();
}

export default function OpenActionsPanel({ actionItems, limit = 8 }: Props) {
  const openItems = actionItems.filter((a) => a.status !== "DONE");
  const sorted = [...openItems].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.dateRaised).getTime() - new Date(a.dateRaised).getTime();
  });
  const topItems = sorted.slice(0, limit);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Open Actions
        </h2>
        {openItems.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {openItems.length} open portfolio-wide
          </span>
        )}
      </div>

      {topItems.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No open actions or decisions across the portfolio.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {topItems.map((actionItem) => (
            <li key={actionItem.id} className="py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${ACTION_TYPE_COLORS[actionItem.type]}`}
                    >
                      {ACTION_TYPE_LABELS[actionItem.type]}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {actionItem.title}
                    </span>
                  </div>
                  {actionItem.project && (
                    <Link
                      to={`/projects/${actionItem.project.id}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5 inline-block"
                    >
                      {actionItem.project.name}
                    </Link>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {actionItem.dueDate && (
                    <div
                      className={
                        isOverdue(actionItem)
                          ? "text-red-600 dark:text-red-400 font-medium text-xs"
                          : "text-slate-500 dark:text-slate-400 text-xs"
                      }
                    >
                      {formatDate(actionItem.dueDate)}
                    </div>
                  )}
                  {actionItem.ownerName && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {actionItem.ownerName}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
