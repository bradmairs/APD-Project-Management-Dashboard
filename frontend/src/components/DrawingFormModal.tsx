import { FormEvent, useState } from "react";
import { Drawing, DrawingInput, DrawingStatus } from "../cmpTypes";
import { DRAWING_STATUSES, DRAWING_STATUS_LABELS } from "../cmpStatusMeta";

interface Props {
  drawing: Drawing | null;
  onClose: () => void;
  onSave: (data: Partial<DrawingInput>) => Promise<void>;
}

export default function DrawingFormModal({ drawing, onClose, onSave }: Props) {
  const [drawingNumber, setDrawingNumber] = useState(drawing?.drawingNumber ?? "");
  const [title, setTitle] = useState(drawing?.title ?? "");
  const [discipline, setDiscipline] = useState(drawing?.discipline ?? "");
  const [status, setStatus] = useState<DrawingStatus>(drawing?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        drawingNumber,
        title,
        discipline: discipline || null,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save drawing");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {drawing ? "Edit Drawing" : "New Drawing"}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Drawing No.
              </label>
              <input
                required
                value={drawingNumber}
                onChange={(e) => setDrawingNumber(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discipline
              </label>
              <input
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DrawingStatus)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              >
                {DRAWING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DRAWING_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Drawing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
