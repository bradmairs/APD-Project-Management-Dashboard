import { useState } from "react";
import { FeeClaim, FeeClaimInput } from "../cmpTypes";
import { DESIGN_STAGE_LABELS, FEE_CLAIM_STATUS_COLORS, FEE_CLAIM_STATUS_LABELS } from "../cmpStatusMeta";
import { formatCurrency, formatDate } from "../format";
import FeeClaimFormModal from "./FeeClaimFormModal";

interface Props {
  claims: FeeClaim[];
  onCreate: (data: Partial<FeeClaimInput>) => Promise<void>;
  onUpdate: (claim: FeeClaim, data: Partial<FeeClaimInput>) => Promise<void>;
  onDelete: (claim: FeeClaim) => Promise<void>;
}

export default function FeeClaimsPanel({ claims, onCreate, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FeeClaim | null>(null);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(claim: FeeClaim) {
    setEditing(claim);
    setShowModal(true);
  }

  async function handleSave(data: Partial<FeeClaimInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(claim: FeeClaim) {
    if (!confirm(`Delete fee claim ${claim.claimNumber}? This cannot be undone.`)) return;
    await onDelete(claim);
  }

  const totalClaimed = claims.reduce((sum, c) => sum + Number(c.claimedAmount), 0);
  const totalApproved = claims.reduce((sum, c) => sum + Number(c.approvedAmount ?? 0), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fee Claims</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
        >
          + New Claim
        </button>
      </div>

      {claims.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <div>Total Claimed: {formatCurrency(totalClaimed)}</div>
          <div>Total Approved: {formatCurrency(totalApproved)}</div>
        </div>
      )}

      {claims.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No fee claims yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 min-w-[560px]">
            {claims.map((claim) => (
              <li key={claim.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {claim.claimNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${FEE_CLAIM_STATUS_COLORS[claim.status]}`}
                      >
                        {FEE_CLAIM_STATUS_LABELS[claim.status]}
                      </span>
                      {claim.stage && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {DESIGN_STAGE_LABELS[claim.stage]}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div>Claimed: {formatCurrency(claim.claimedAmount)}</div>
                      <div>Approved: {formatCurrency(claim.approvedAmount)}</div>
                      <div>Period Ending: {formatDate(claim.periodEnding)}</div>
                      <div>Paid: {formatDate(claim.datePaid)}</div>
                    </div>

                    {claim.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        {claim.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => openEdit(claim)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(claim)}
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
        <FeeClaimFormModal
          claim={editing}
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
