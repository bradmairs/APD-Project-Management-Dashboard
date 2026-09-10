import { FormEvent, useState } from "react";
import { FeeClaim, FeeClaimInput, FeeClaimStatus, DesignStageName } from "../cmpTypes";
import { DESIGN_STAGES, DESIGN_STAGE_LABELS, FEE_CLAIM_STATUSES, FEE_CLAIM_STATUS_LABELS } from "../cmpStatusMeta";

interface Props {
  claim: FeeClaim | null;
  onClose: () => void;
  onSave: (data: Partial<FeeClaimInput>) => Promise<void>;
}

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.substring(0, 10);
}

export default function FeeClaimFormModal({ claim, onClose, onSave }: Props) {
  const [claimNumber, setClaimNumber] = useState(claim?.claimNumber ?? "");
  const [stage, setStage] = useState<DesignStageName | "">(claim?.stage ?? "");
  const [periodEnding, setPeriodEnding] = useState(toDateInputValue(claim?.periodEnding ?? null));
  const [claimedAmount, setClaimedAmount] = useState(claim?.claimedAmount ?? "");
  const [approvedAmount, setApprovedAmount] = useState(claim?.approvedAmount ?? "");
  const [status, setStatus] = useState<FeeClaimStatus>(claim?.status ?? "DRAFT");
  const [dateSubmitted, setDateSubmitted] = useState(
    toDateInputValue(claim?.dateSubmitted ?? null)
  );
  const [dateApproved, setDateApproved] = useState(toDateInputValue(claim?.dateApproved ?? null));
  const [datePaid, setDatePaid] = useState(toDateInputValue(claim?.datePaid ?? null));
  const [notes, setNotes] = useState(claim?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        claimNumber,
        stage: stage || null,
        periodEnding: periodEnding ? new Date(periodEnding).toISOString() : null,
        claimedAmount: Number(claimedAmount),
        approvedAmount: approvedAmount === "" ? null : Number(approvedAmount),
        status,
        dateSubmitted: dateSubmitted ? new Date(dateSubmitted).toISOString() : null,
        dateApproved: dateApproved ? new Date(dateApproved).toISOString() : null,
        datePaid: datePaid ? new Date(datePaid).toISOString() : null,
        notes: notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fee claim");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {claim ? "Edit Fee Claim" : "New Fee Claim"}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Claim No.
              </label>
              <input
                required
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                placeholder="e.g. FC-04"
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stage (optional)
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DesignStageName | "")}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {DESIGN_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {DESIGN_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Period Ending
              </label>
              <input
                type="date"
                value={periodEnding}
                onChange={(e) => setPeriodEnding(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Claimed Amount ($)
              </label>
              <input
                type="number"
                required
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Approved Amount ($)
              </label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FeeClaimStatus)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              >
                {FEE_CLAIM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FEE_CLAIM_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date Submitted
              </label>
              <input
                type="date"
                value={dateSubmitted}
                onChange={(e) => setDateSubmitted(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date Approved
              </label>
              <input
                type="date"
                value={dateApproved}
                onChange={(e) => setDateApproved(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date Paid
              </label>
              <input
                type="date"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
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
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
