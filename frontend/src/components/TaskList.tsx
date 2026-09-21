import { FormEvent, useState } from "react";
import { Task, TaskInput, TaskStatus } from "../types";
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
  onUpdate: (task: Task, changes: Partial<TaskInput>) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

export default function TaskList({ tasks, onAdd, onUpdate, onDelete }: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(task: Task) {
    if (!editTitle.trim()) return;
    setSavingEdit(true);
    try {
      await onUpdate(task, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  }

  const done = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Tasks
        </h2>
        {tasks.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {done}/{tasks.length} complete
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          No tasks yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700 mb-3">
          {tasks.map((task) => {
            const isEditing = editingId === task.id;
            return (
              <li key={task.id} className="py-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title"
                      autoFocus
                      className="w-full text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 py-1"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 py-1"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(task)}
                        disabled={savingEdit || !editTitle.trim()}
                        className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
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
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {task.description}
                        </div>
                      )}
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onUpdate(task, { status: e.target.value as TaskStatus })
                      }
                      className="text-xs rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 py-1"
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
                      className={`text-xs rounded border px-2 py-1 dark:bg-slate-700 ${
                        isTaskOverdue(task)
                          ? "border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
                          : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      }`}
                    />
                    <button
                      onClick={() => startEdit(task)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 min-w-[10rem] text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-1.5"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-2 py-1.5"
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
