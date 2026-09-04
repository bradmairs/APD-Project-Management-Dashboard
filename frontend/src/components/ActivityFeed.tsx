import { Link } from "react-router-dom";
import { ActivityLogEntry } from "../types";
import { formatRelativeTime } from "../format";

interface Props {
  entries: ActivityLogEntry[];
  showProjectLink?: boolean;
  emptyMessage?: string;
}

export default function ActivityFeed({
  entries,
  showProjectLink = false,
  emptyMessage = "No activity yet.",
}: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500 py-2">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {entries.map((entry) => (
        <li key={entry.id} className="py-2 text-sm">
          <div className="text-slate-700">
            <span className="font-medium text-slate-900">{entry.userName}</span>{" "}
            {entry.action}
            {showProjectLink &&
              (entry.projectId ? (
                <>
                  {" "}
                  on{" "}
                  <Link
                    to={`/projects/${entry.projectId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entry.projectName}
                  </Link>
                </>
              ) : (
                <span className="text-slate-500"> on {entry.projectName}</span>
              ))}
          </div>
          <div className="text-xs text-slate-400">
            {formatRelativeTime(entry.createdAt)}
          </div>
        </li>
      ))}
    </ul>
  );
}
