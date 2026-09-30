import { useState } from "react";
import { Drawing, DrawingInput, DrawingRevisionInput } from "../cmpTypes";
import { DRAWING_STATUS_LABELS } from "../cmpStatusMeta";
import { formatDate } from "../format";
import DrawingFormModal from "./DrawingFormModal";
import DrawingRevisionFormModal from "./DrawingRevisionFormModal";
import { useConfirm } from "../confirm/ConfirmContext";

interface Props {
  drawings: Drawing[];
  onCreate: (data: Partial<DrawingInput>) => Promise<void>;
  onUpdate: (drawing: Drawing, data: Partial<DrawingInput>) => Promise<void>;
  onDelete: (drawing: Drawing) => Promise<void>;
  onIssueRevision: (drawing: Drawing, data: Partial<DrawingRevisionInput>) => Promise<void>;
}

export default function DrawingRegisterPanel({
  drawings,
  onCreate,
  onUpdate,
  onDelete,
  onIssueRevision,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Drawing | null>(null);
  const [revisionFor, setRevisionFor] = useState<Drawing | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(drawing: Drawing) {
    setEditing(drawing);
    setShowModal(true);
  }

  async function handleSave(data: Partial<DrawingInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  const confirm = useConfirm();

  async function handleDelete(drawing: Drawing) {
    if (
      !await confirm(`Delete drawing "${drawing.drawingNumber}: ${drawing.title}"? This cannot be undone.`)
    )
      return;
    await onDelete(drawing);
  }

  async function handleIssueRevision(data: Partial<DrawingRevisionInput>) {
    if (!revisionFor) return;
    await onIssueRevision(revisionFor, data);
    setRevisionFor(null);
    setExpandedId(revisionFor.id);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Drawing Register
        </h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
        >
          + New Drawing
        </button>
      </div>

      {drawings.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No drawings yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {drawings.map((drawing) => {
            const expanded = expandedId === drawing.id;
            return (
              <li key={drawing.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(expanded ? null : drawing.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {drawing.drawingNumber}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {drawing.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        {DRAWING_STATUS_LABELS[drawing.status]}
                      </span>
                      {drawing.currentRevision && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Rev {drawing.currentRevision}
                        </span>
                      )}
                    </div>
                    {drawing.discipline && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {drawing.discipline}
                      </div>
                    )}
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setRevisionFor(drawing)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Issue Revision
                    </button>
                    <button
                      onClick={() => openEdit(drawing)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(drawing)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-2 ml-2 pl-3 border-l-2 border-slate-100 dark:border-slate-700">
                    {!drawing.revisions || drawing.revisions.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No revisions issued yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {drawing.revisions.map((rev) => (
                          <li key={rev.id} className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Rev {rev.revision}
                            </span>{" "}
                            — {formatDate(rev.issuedDate)}
                            {rev.issuedFor && ` for ${rev.issuedFor}`} by {rev.issuedByName}
                            {rev.description && (
                              <div className="text-slate-500 dark:text-slate-400">
                                {rev.description}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <DrawingFormModal
          drawing={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {revisionFor && (
        <DrawingRevisionFormModal
          drawing={revisionFor}
          onClose={() => setRevisionFor(null)}
          onSave={handleIssueRevision}
        />
      )}
    </div>
  );
}
