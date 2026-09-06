import { useState } from "react";
import { Rfi, RfiInput, RfiStatus } from "../types";
import { formatDate } from "../format";
import {
  ALL_RFI_STATUSES,
  RFI_STATUS_COLORS,
  RFI_STATUS_LABELS,
  isRfiOverdue,
  rfiStatusRank,
} from "../rfiMeta";
import RfiFormModal from "./RfiFormModal";

interface Props {
  rfis: Rfi[];
  onCreate: (data: Partial<RfiInput>) => Promise<void>;
  onUpdate: (rfi: Rfi, data: Partial<RfiInput>) => Promise<void>;
  onDelete: (rfi: Rfi) => Promise<void>;
}

export default function RfisPanel({ rfis, onCreate, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Rfi | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openCount = rfis.filter((r) => r.status !== "CLOSED").length;

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(rfi: Rfi) {
    setEditing(rfi);
    setShowModal(true);
  }

  async function handleSave(data: Partial<RfiInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(rfi: Rfi) {
    if (!confirm(`Delete "${rfi.rfiNumber}"? This cannot be undone.`)) return;
    await onDelete(rfi);
  }

  async function handleStatusChange(rfi: Rfi, status: RfiStatus) {
    await onUpdate(rfi, { status });
  }

  const sorted = [...rfis].sort((a, b) => rfiStatusRank(a.status) - rfiStatusRank(b.status));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Requests for Information
          </h2>
          {rfis.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {openCount} open of {rfis.length}
            </span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New RFI
        </button>
      </div>

      {rfis.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No RFIs raised yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {sorted.map((rfi) => {
            const isExpanded = expandedId === rfi.id;
            const overdue = isRfiOverdue(rfi);
            return (
              <li key={rfi.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rfi.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {rfi.rfiNumber}: {rfi.subject}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${RFI_STATUS_COLORS[rfi.status]}`}
                      >
                        {RFI_STATUS_LABELS[rfi.status]}
                      </span>
                      {overdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      {rfi.raisedTo && <span>To {rfi.raisedTo}</span>}
                      <span>Raised {formatDate(rfi.dateRaised)}</span>
                      {rfi.dateRequired && (
                        <span className={overdue ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                          Due {formatDate(rfi.dateRequired)}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <select
                      value={rfi.status}
                      onChange={(e) => handleStatusChange(rfi, e.target.value as RfiStatus)}
                      className="text-xs rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-1.5 py-1"
                    >
                      {ALL_RFI_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {RFI_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => openEdit(rfi)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rfi)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Question
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {rfi.question}
                      </p>
                    </div>
                    {rfi.response && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Response
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {rfi.response}
                        </p>
                      </div>
                    )}
                    {rfi.notes && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Notes
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {rfi.notes}
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Raised by {rfi.raisedByName}
                      {rfi.dateAnswered && ` · Answered ${formatDate(rfi.dateAnswered)}`}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <RfiFormModal
          rfi={editing}
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
