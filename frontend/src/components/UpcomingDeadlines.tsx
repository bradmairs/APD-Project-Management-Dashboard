import { Link } from "react-router-dom";
import { Task } from "../types";
import { formatDate } from "../format";
import { isTaskOverdue } from "../taskMeta";

export default function UpcomingDeadlines({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">
        Upcoming Deadlines
      </h2>
      <ul className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="py-2 flex items-center justify-between text-sm"
          >
            <div>
              <div className="text-slate-900">{task.title}</div>
              {task.project && (
                <Link
                  to={`/projects/${task.project.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {task.project.name}
                </Link>
              )}
            </div>
            <span
              className={
                isTaskOverdue(task)
                  ? "text-red-600 font-medium"
                  : "text-slate-500"
              }
            >
              {formatDate(task.dueDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
