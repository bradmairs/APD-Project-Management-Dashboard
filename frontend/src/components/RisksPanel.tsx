import { useState } from "react";
import { Risk, RiskInput, RiskStatus } from "../types";
import { formatDate } from "../format";
import { riskBand, riskScore, RISK_BAND_COLORS } from "../riskScoring";
import {
  ALL_RISK_STATUSES,
  RISK_STATUS_COLORS,
  RISK_STATUS_LABELS,
  RISK_TYPE_COLORS,
  RISK_TYPE_LABELS,
} from "../riskMeta";
import RiskFormModal from "./RiskFormModal";

interface Props {
  risks: Risk[];
  onCreate: (data: Partial<RiskInput>) => Promise<void>;
  onUpdate: (risk: Risk, data: Partial<RiskInput>) => Promise<void>;
  onDelete: (risk: Risk) => Promise<void>;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const band = riskBand(score);
  return (
    <span
      title={`${label}: ${score}`}
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BAND_COLORS[band]}`}
    >
      {label} {score}
    </span>
  );
}

export default function RisksPanel({ risks, onCreate, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openCount = risks.filter((r) => r.status !== "CLOSED").length;

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(risk: Risk) {
    setEditing(risk);
    setShowModal(true);
  }

  async function handleSave(data: Partial<RiskInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(risk: Risk) {
    if (!confirm(`Delete "${risk.title}"? This cannot be undone.`)) return;
    await onDelete(risk);
  }

  async function handleStatusChange(risk: Risk, status: RiskStatus) {
    await onUpdate(risk, { status });
  }

  const sorted = [...risks].sort((a, b) => {
    const scoreA = riskScore(a.inherentLikelihood, a.inherentConsequence);
    const scoreB = riskScore(b.inherentLikelihood, b.inherentConsequence);
    return scoreB - scoreA;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Risks &amp; Opportunities
          </h2>
          {risks.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {openCount} open of {risks.length}
            </span>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Risk
        </button>
      </div>

      {risks.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No risks or opportunities logged yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {sorted.map((risk) => {
            const isExpanded = expandedId === risk.id;
            const inherentScore = riskScore(risk.inherentLikelihood, risk.inherentConsequence);
            const residualScore =
              risk.residualLikelihood && risk.residualConsequence
                ? riskScore(risk.residualLikelihood, risk.residualConsequence)
                : null;
            return (
              <li key={risk.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${RISK_TYPE_COLORS[risk.type]}`}
                      >
                        {RISK_TYPE_LABELS[risk.type]}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {risk.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${RISK_STATUS_COLORS[risk.status]}`}
                      >
                        {RISK_STATUS_LABELS[risk.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <ScoreBadge score={inherentScore} label="Inherent" />
                      {residualScore !== null && (
                        <ScoreBadge score={residualScore} label="Residual" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      {risk.category && <span>{risk.category}</span>}
                      {risk.ownerName && <span>Owner: {risk.ownerName}</span>}
                      {risk.dueDate && <span>Due {formatDate(risk.dueDate)}</span>}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <select
                      value={risk.status}
                      onChange={(e) =>
                        handleStatusChange(risk, e.target.value as RiskStatus)
                      }
                      className="text-xs rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-1.5 py-1"
                    >
                      {ALL_RISK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {RISK_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => openEdit(risk)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(risk)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (risk.description || risk.mitigation) && (
                  <div className="mt-3 space-y-3 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                    {risk.description && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Description
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {risk.description}
                        </p>
                      </div>
                    )}
                    {risk.mitigation && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Mitigation / Response
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {risk.mitigation}
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Raised by {risk.createdByName}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showModal && (
        <RiskFormModal
          risk={editing}
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
