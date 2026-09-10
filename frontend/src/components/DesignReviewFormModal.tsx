import { FormEvent, useState } from "react";
import { DesignReview, DesignReviewInput, DesignReviewOutcome, DesignStageName } from "../cmpTypes";
import { DESIGN_STAGES, DESIGN_STAGE_LABELS } from "../cmpStatusMeta";

interface Props {
  review: DesignReview | null;
  onClose: () => void;
  onSave: (data: Partial<DesignReviewInput>) => Promise<void>;
}

const OUTCOMES: DesignReviewOutcome[] = ["APPROVED", "APPROVED_WITH_COMMENTS", "REJECTED"];
const OUTCOME_LABELS: Record<DesignReviewOutcome, string> = {
  APPROVED: "Approved",
  APPROVED_WITH_COMMENTS: "Approved with Comments",
  REJECTED: "Rejected",
};

export default function DesignReviewFormModal({ review, onClose, onSave }: Props) {
  const [stage, setStage] = useState<DesignStageName | "">(review?.stage ?? "");
  const [reviewDate, setReviewDate] = useState(
    review?.reviewDate ? review.reviewDate.substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [reviewerName, setReviewerName] = useState(review?.reviewerName ?? "");
  const [outcome, setOutcome] = useState<DesignReviewOutcome>(review?.outcome ?? "APPROVED");
  const [comments, setComments] = useState(review?.comments ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        stage: stage || null,
        reviewDate: new Date(reviewDate).toISOString(),
        reviewerName,
        outcome,
        comments: comments || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save design review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {review ? "Edit Design Review" : "Log Design Review"}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                Review Date
              </label>
              <input
                type="date"
                required
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reviewer
              </label>
              <input
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as DesignReviewOutcome)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 text-sm"
              >
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {OUTCOME_LABELS[o]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
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
              {saving ? "Saving…" : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
