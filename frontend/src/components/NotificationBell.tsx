import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUpcomingTasks } from "../api";
import { Task } from "../types";
import { formatDate } from "../format";
import { isTaskDueSoon, isTaskOverdue } from "../taskMeta";

export default function NotificationBell() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getUpcomingTasks()
      .then(setTasks)
      .catch(() => setTasks([]));
  }, []);

  const overdue = tasks.filter(isTaskOverdue);
  const dueSoon = tasks.filter((t) => isTaskDueSoon(t));
  const notifyCount = overdue.length + dueSoon.length;

  const badgeColor =
    overdue.length > 0
      ? "bg-red-600"
      : dueSoon.length > 0
      ? "bg-amber-500"
      : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        aria-label="Deadline notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M12 2a6 6 0 0 0-6 6v3.09c0 .59-.24 1.16-.67 1.58L4 14v1h16v-1l-1.33-1.33a2.25 2.25 0 0 1-.67-1.58V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" />
        </svg>
        {badgeColor && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] leading-4 text-center font-medium ${badgeColor}`}
          >
            {notifyCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-lg z-20">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Deadlines
              </h3>
            </div>
            {tasks.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                No upcoming task deadlines.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {tasks.map((task) => (
                  <li key={task.id} className="px-4 py-2.5 text-sm">
                    <div className="text-slate-900 dark:text-slate-100">{task.title}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      {task.project && (
                        <Link
                          to={`/projects/${task.project.id}`}
                          onClick={() => setOpen(false)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {task.project.name}
                        </Link>
                      )}
                      <span
                        className={`text-xs ${
                          isTaskOverdue(task)
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
