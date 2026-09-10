import { useState } from "react";
import { DesignReview, DesignReviewInput } from "../cmpTypes";
import { DESIGN_STAGE_LABELS } from "../cmpStatusMeta";
import { formatDate } from "../format";
import DesignReviewFormModal from "./DesignReviewFormModal";

interface Props {
  reviews: DesignReview[];
  onCreate: (data: Partial<DesignReviewInput>) => Promise<void>;
  onUpdate: (review: DesignReview, data: Partial<DesignReviewInput>) => Promise<void>;
  onDelete: (review: DesignReview) => Promise<void>;
}

const OUTCOME_COLORS: Record<string, string> = {
  APPROVED: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  APPROVED_WITH_COMMENTS: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  REJECTED: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

const OUTCOME_LABELS: Record<string, string> = {
  APPROVED: "Approved",
  APPROVED_WITH_COMMENTS: "Approved with Comments",
  REJECTED: "Rejected",
};

export default function DesignReviewsPanel({ reviews, onCreate, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DesignReview | null>(null);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(review: DesignReview) {
    setEditing(review);
    setShowModal(true);
  }

  async function handleSave(data: Partial<DesignReviewInput>) {
    if (editing) {
      await onUpdate(editing, data);
    } else {
      await onCreate(data);
    }
    setShowModal(false);
    setEditing(null);
  }

  async function handleDelete(review: DesignReview) {
    if (!confirm(`Delete the design review by ${review.reviewerName}? This cannot be undone.`))
      return;
    await onDelete(review);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Design Reviews
        </h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + Log Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No design reviews logged yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {reviews.map((review) => (
            <li key={review.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {review.reviewerName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${OUTCOME_COLORS[review.outcome]}`}
                    >
                      {OUTCOME_LABELS[review.outcome]}
                    </span>
                    {review.stage && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {DESIGN_STAGE_LABELS[review.stage]}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(review.reviewDate)}
                  </div>
                  {review.comments && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {review.comments}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => openEdit(review)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <DesignReviewFormModal
          review={editing}
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
