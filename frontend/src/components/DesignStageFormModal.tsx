import { FormEvent, useState } from "react";
import { DesignStage, DesignStageInput, DesignStageName, DesignStageStatus } from "../cmpTypes";
import {
  DESIGN_STAGES,
  DESIGN_STAGE_LABELS,
  DESIGN_STAGE_STATUSES,
  DESIGN_STAGE_STATUS_LABELS,
} from "../cmpStatusMeta";

interface Props {
  stage: DesignStage | null;
  existingStages: DesignStageName[];
  onClose: () => void;
  onSave: (data: Partial<DesignStageInput>) => Promise<void>;
}

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.substring(0, 10);
}

export default function DesignStageFormModal({
  stage,
  existingStages,
  onClose,
  onSave,
}: Props) {
  const availableStages = stage
    ? DESIGN_STAGES
    : DESIGN_STAGES.filter((s) => !existingStages.includes(s));
  const [stageName, setStageName] = useState<DesignStageName>(
    stage?.stage ?? availableStages[0] ?? "CONCEPT_DESIGN"
  );
  const [status, setStatus] = useState<DesignStageStatus>(stage?.status ?? "NOT_STARTED");
  const [percentComplete, setPercentComplete] = useState(stage?.percentComplete ?? 0);
  const [targetDate, setTargetDate] = useState(toDateInputValue(stage?.targetDate ?? null));
  const [actualDate, setActualDate] = useState(toDateInputValue(stage?.actualDate ?? null));
  const [feeAllocated, setFeeAllocated] = useState(stage?.feeAllocated ?? "");
  const [hoursAllocated, setHoursAllocated] = useState(stage?.hoursAllocated ?? "");
  const [hoursSpent, setHoursSpent] = useState(stage?.hoursSpent ?? "");
  const [notes, setNotes] = useState(stage?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        stage: stageName,
        status,
        percentComplete: Number(percentComplete),
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        actualDate: actualDate ? new Date(actualDate).toISOString() : null,
        feeAllocated: feeAllocated === "" ? null : Number(feeAllocated),
        hoursAllocated: hoursAllocated === "" ? null : Number(hoursAllocated),
        hoursSpent: hoursSpent === "" ? null : Number(hoursSpent),
        notes: notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save design stage");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {stage ? "Edit Design Stage" : "Add Design Stage"}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stage
              </label>
              <select
                disabled={!!stage}
                value={stageName}
                onChange={(e) => setStageName(e.target.value as DesignStageName)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm disabled:opacity-60"
              >
                {availableStages.map((s) => (
                  <option key={s} value={s}>
                    {DESIGN_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DesignStageStatus)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              >
                {DESIGN_STAGE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DESIGN_STAGE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Percentage Complete
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={percentComplete}
                onChange={(e) => setPercentComplete(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300 w-12 text-right">
                {percentComplete}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Actual Date
              </label>
              <input
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fee Allocated ($)
              </label>
              <input
                type="number"
                value={feeAllocated}
                onChange={(e) => setFeeAllocated(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hours Allocated
              </label>
              <input
                type="number"
                value={hoursAllocated}
                onChange={(e) => setHoursAllocated(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hours Spent
              </label>
              <input
                type="number"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
            />
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
              {saving ? "Saving…" : "Save Stage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
