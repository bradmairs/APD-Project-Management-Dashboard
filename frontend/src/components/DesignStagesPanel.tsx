import { useState } from "react";
import { DesignStage, DesignStageInput } from "../cmpTypes";
import { DESIGN_STAGE_LABELS, DESIGN_STAGE_STATUS_LABELS } from "../cmpStatusMeta";
import { formatCurrency, formatDate } from "../format";
import DesignStageFormModal from "./DesignStageFormModal";

interface Props {
  stages: DesignStage[];
  onCreate: (data: Partial<DesignStageInput>) => Promise<void>;
  onUpdate: (stage: DesignStage, data: Partial<DesignStageInput>) => Promise<void>;
  onDelete: (stage: DesignStage) => Promise<void>;
  onReorder: (stage: DesignStage, direction: "up" | "down") => Promise<void>;
}

export default function DesignStagesPanel({
  stages,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DesignStage | null>(null);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(stage: DesignStage) {
    setEditing(stage);
    setShowModal(true);
  }

  async function handleSave(data: Partial<DesignStageInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(stage: DesignStage) {
    if (!confirm(`Delete the ${DESIGN_STAGE_LABELS[stage.stage]} stage? This cannot be undone.`))
      return;
    await onDelete(stage);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Design Stages
        </h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + Add Stage
        </button>
      </div>

      {stages.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No design stages yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 min-w-[640px]">
            {stages.map((stage, index) => (
              <li key={stage.id} className="py-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col shrink-0 pt-0.5">
                    <button
                      onClick={() => onReorder(stage, "up")}
                      disabled={index === 0}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none text-xs"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onReorder(stage, "down")}
                      disabled={index === stages.length - 1}
                      className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none text-xs"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {DESIGN_STAGE_LABELS[stage.stage]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                        {DESIGN_STAGE_STATUS_LABELS[stage.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-32 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-500"
                          style={{ width: `${stage.percentComplete}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {stage.percentComplete}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div>Target: {formatDate(stage.targetDate)}</div>
                      <div>Actual: {formatDate(stage.actualDate)}</div>
                      <div>Fee: {formatCurrency(stage.feeAllocated)}</div>
                      <div>
                        Hours: {stage.hoursSpent ?? 0} / {stage.hoursAllocated ?? "—"}
                      </div>
                    </div>

                    {stage.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        {stage.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-0.5">
                    <button
                      onClick={() => openEdit(stage)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stage)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <DesignStageFormModal
          stage={editing}
          existingStages={stages.map((s) => s.stage)}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
