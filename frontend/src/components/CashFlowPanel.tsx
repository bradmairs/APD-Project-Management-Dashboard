import { useState } from "react";
import { CashFlowEntry, CashFlowEntryInput, Project } from "../types";
import { formatCurrency, formatReportMonth } from "../format";
import CashFlowChart from "../charts/CashFlowChart";
import CumulativeSpendChart from "../charts/CumulativeSpendChart";
import CashFlowEntryFormModal from "./CashFlowEntryFormModal";

interface Props {
  project: Project;
  entries: CashFlowEntry[];
  onUpsert: (data: Partial<CashFlowEntryInput>) => Promise<void>;
  onDelete: (entry: CashFlowEntry) => Promise<void>;
}

export default function CashFlowPanel({ project, entries, onUpsert, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CashFlowEntry | null>(null);

  const expenditureToDate = entries
    .filter((e) => e.type === "ACTUAL")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const forecastRemaining = entries
    .filter((e) => e.type === "FORECAST")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const forecastTotal = expenditureToDate + forecastRemaining;
  const variance = project.budget === null ? null : Number(project.budget) - forecastTotal;

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(entry: CashFlowEntry) {
    setEditing(entry);
    setShowModal(true);
  }

  async function handleSave(data: Partial<CashFlowEntryInput>) {
    await onUpsert(data);
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(entry: CashFlowEntry) {
    if (
      !confirm(
        `Delete the ${formatReportMonth(entry.month)} ${entry.type.toLowerCase()} entry? This cannot be undone.`
      )
    )
      return;
    await onDelete(entry);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Cash Flow</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Entry
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <Stat label="Approved Budget" value={formatCurrency(project.budget)} />
        <Stat label="Contingency" value={formatCurrency(project.contingency)} />
        <Stat label="Expenditure to Date" value={formatCurrency(expenditureToDate)} />
        <Stat label="Forecast Total" value={formatCurrency(forecastTotal)} />
        <Stat
          label="Variance"
          value={variance === null ? "—" : formatCurrency(variance)}
          negative={variance !== null && variance < 0}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-medium text-slate-500 mb-2">
          Spend vs Budget Over Time
        </h3>
        <CumulativeSpendChart project={project} entries={entries} />
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No cash flow entries yet.</p>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-xs font-medium text-slate-500 mb-2">
              Monthly Spend
            </h3>
            <CashFlowChart entries={entries} />
          </div>
          <ul className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="py-2 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-900">
                    {formatReportMonth(entry.month)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.type === "ACTUAL"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {entry.type === "ACTUAL" ? "Actual" : "Forecast"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-900">
                    {formatCurrency(entry.amount)}
                  </span>
                  <button
                    onClick={() => openEdit(entry)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showModal && (
        <CashFlowEntryFormModal
          entry={editing}
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

function Stat({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`text-sm font-medium mt-0.5 ${
          negative ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
