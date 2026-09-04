import { FormEvent, useState } from "react";
import { Task, TaskStatus } from "../types";
import { isTaskOverdue } from "../taskMeta";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  return value.substring(0, 10);
}

interface Props {
  tasks: Task[];
  onAdd: (title: string, dueDate: string | null) => Promise<void>;
  onUpdate: (
    task: Task,
    changes: { status?: TaskStatus; dueDate?: string | null }
  ) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

export default function TaskList({ tasks, onAdd, onUpdate, onDelete }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await onAdd(
        newTitle.trim(),
        newDueDate ? new Date(newDueDate).toISOString() : null
      );
      setNewTitle("");
      setNewDueDate("");
    } finally {
      setAdding(false);
    }
  }

  const done = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-slate-500">
            {done}/{tasks.length} complete
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500 mb-3">No tasks yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 mb-3">
          {tasks.map((task) => (
            <li key={task.id} className="py-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.status === "DONE"}
                onChange={(e) =>
                  onUpdate(task, {
                    status: e.target.checked ? "DONE" : "TODO",
                  })
                }
                className="h-4 w-4"
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm ${
                    task.status === "DONE"
                      ? "line-through text-slate-400"
                      : "text-slate-900"
                  }`}
                >
                  {task.title}
                </div>
              </div>
              <select
                value={task.status}
                onChange={(e) =>
                  onUpdate(task, { status: e.target.value as TaskStatus })
                }
                className="text-xs rounded border border-slate-300 px-2 py-1"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formatDate(task.dueDate)}
                onChange={(e) =>
                  onUpdate(task, {
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className={`text-xs rounded border px-2 py-1 ${
                  isTaskOverdue(task)
                    ? "border-red-300 text-red-600"
                    : "border-slate-300 text-slate-700"
                }`}
              />
              <button
                onClick={() => onDelete(task)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 text-sm rounded border border-slate-300 px-3 py-1.5"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="text-sm rounded border border-slate-300 px-2 py-1.5"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
