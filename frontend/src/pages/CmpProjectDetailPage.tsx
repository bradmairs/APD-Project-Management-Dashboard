import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CmpProject,
  CmpProjectInput,
  DesignReview,
  DesignReviewInput,
  DesignStage,
  DesignStageInput,
  Drawing,
  DrawingInput,
  DrawingRevisionInput,
} from "../cmpTypes";
import {
  createDesignReview,
  createDesignStage,
  createDrawing,
  deleteCmpProject,
  deleteDesignReview,
  deleteDesignStage,
  deleteDrawing,
  getCmpProject,
  issueDrawingRevision,
  reorderDesignStage,
  updateCmpProject,
  updateDesignReview,
  updateDesignStage,
  updateDrawing,
} from "../cmpApi";
import { CMP_PROJECT_STATUS_COLORS, CMP_PROJECT_STATUS_LABELS } from "../cmpStatusMeta";
import { formatCurrency, formatDate } from "../format";
import CmpProjectFormModal from "../components/CmpProjectFormModal";
import DesignStagesPanel from "../components/DesignStagesPanel";
import DrawingRegisterPanel from "../components/DrawingRegisterPanel";
import DesignReviewsPanel from "../components/DesignReviewsPanel";
import UserMenu from "../components/UserMenu";

export default function CmpProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<CmpProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      setProject(await getCmpProject(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="text-center text-slate-500 dark:text-slate-400 py-12">Loading…</div>;
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-3">
          {error || "Project not found"}
        </div>
        <Link to="/cmp" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm mt-4 inline-block">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  async function handleUpdateProject(data: Partial<CmpProjectInput>) {
    await updateCmpProject(project!.id, data);
    setShowEditModal(false);
    await load();
  }

  async function handleDeleteProject() {
    if (!confirm(`Delete "${project!.name}"? This cannot be undone.`)) return;
    await deleteCmpProject(project!.id);
    navigate("/cmp");
  }

  async function handleCreateStage(data: Partial<DesignStageInput>) {
    await createDesignStage(project!.id, data);
    await load();
  }

  async function handleUpdateStage(stage: DesignStage, data: Partial<DesignStageInput>) {
    await updateDesignStage(stage.id, data);
    await load();
  }

  async function handleDeleteStage(stage: DesignStage) {
    await deleteDesignStage(stage.id);
    await load();
  }

  async function handleReorderStage(stage: DesignStage, direction: "up" | "down") {
    await reorderDesignStage(stage.id, direction);
    await load();
  }

  async function handleCreateDrawing(data: Partial<DrawingInput>) {
    await createDrawing(project!.id, data);
    await load();
  }

  async function handleUpdateDrawing(drawing: Drawing, data: Partial<DrawingInput>) {
    await updateDrawing(drawing.id, data);
    await load();
  }

  async function handleDeleteDrawing(drawing: Drawing) {
    await deleteDrawing(drawing.id);
    await load();
  }

  async function handleIssueRevision(drawing: Drawing, data: Partial<DrawingRevisionInput>) {
    await issueDrawingRevision(drawing.id, data);
    await load();
  }

  async function handleCreateReview(data: Partial<DesignReviewInput>) {
    await createDesignReview(project!.id, data);
    await load();
  }

  async function handleUpdateReview(review: DesignReview, data: Partial<DesignReviewInput>) {
    await updateDesignReview(review.id, data);
    await load();
  }

  async function handleDeleteReview(review: DesignReview) {
    await deleteDesignReview(review.id);
    await load();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link to="/cmp" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
              ← Back to dashboard
            </Link>
            <UserMenu />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {project.name}
                </h1>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${CMP_PROJECT_STATUS_COLORS[project.status]}`}
                >
                  {CMP_PROJECT_STATUS_LABELS[project.status]}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {project.clientName}
                {project.projectNumber && ` · ${project.projectNumber}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 text-sm rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {project.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">Project Lead</div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
              {project.projectLead || "—"}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">Discipline</div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
              {project.discipline || "—"}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">Fee Budget</div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(project.feeBudget)}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">Target Issue</div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
              {formatDate(project.targetIssueDate)}
            </div>
          </div>
        </div>

        <DesignStagesPanel
          stages={project.designStages ?? []}
          onCreate={handleCreateStage}
          onUpdate={handleUpdateStage}
          onDelete={handleDeleteStage}
          onReorder={handleReorderStage}
        />

        <DrawingRegisterPanel
          drawings={project.drawings ?? []}
          onCreate={handleCreateDrawing}
          onUpdate={handleUpdateDrawing}
          onDelete={handleDeleteDrawing}
          onIssueRevision={handleIssueRevision}
        />

        <DesignReviewsPanel
          reviews={project.designReviews ?? []}
          onCreate={handleCreateReview}
          onUpdate={handleUpdateReview}
          onDelete={handleDeleteReview}
        />
      </main>

      {showEditModal && (
        <CmpProjectFormModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
}
