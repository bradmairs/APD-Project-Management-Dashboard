import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ActivityLogEntry,
  Attachment,
  CashFlowEntry,
  CashFlowEntryInput,
  Milestone,
  MilestoneInput,
  MonthlyReport,
  MonthlyReportInput,
  Project,
  ProjectInput,
  Task,
  TaskStatus,
} from "../types";
import {
  createMilestone,
  createMonthlyReport,
  createTask,
  deleteAttachment,
  deleteCashFlowEntry,
  deleteMilestone,
  deleteMonthlyReport,
  deleteProject,
  deleteTask,
  getAttachments,
  getCashFlowEntries,
  getMilestones,
  getMonthlyReports,
  getProject,
  getProjectActivity,
  reorderMilestone,
  updateMilestone,
  updateMonthlyReport,
  updateProject,
  updateTask,
  uploadAttachment,
  upsertCashFlowEntry,
} from "../api";
import ProjectFormModal from "../components/ProjectFormModal";
import TaskList from "../components/TaskList";
import ActivityFeed from "../components/ActivityFeed";
import AttachmentsPanel from "../components/AttachmentsPanel";
import MonthlyReportsPanel from "../components/MonthlyReportsPanel";
import MilestonesPanel from "../components/MilestonesPanel";
import CashFlowPanel from "../components/CashFlowPanel";
import { STATUS_COLORS, STATUS_LABELS } from "../statusMeta";
import { formatCurrency, formatDate } from "../format";
import { canModifyProject } from "../permissions";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../auth/AuthContext";
import gvwLogo from "../assets/gvw-logo.png";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, activityData, attachmentData, reportData, milestoneData, cashFlowData] =
        await Promise.all([
          getProject(id),
          getProjectActivity(id),
          getAttachments(id),
          getMonthlyReports(id),
          getMilestones(id),
          getCashFlowEntries(id),
        ]);
      setProject(data);
      setActivity(activityData);
      setAttachments(attachmentData);
      setReports(reportData);
      setMilestones(milestoneData);
      setCashFlowEntries(cashFlowData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave(data: Partial<ProjectInput>) {
    if (!project) return;
    await updateProject(project.id, data);
    setShowModal(false);
    await load();
  }

  async function handleDeleteProject() {
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject(project.id);
    navigate("/");
  }

  async function handleAddTask(title: string, dueDate: string | null) {
    if (!project) return;
    await createTask(project.id, { title, dueDate, status: "TODO" });
    await load();
  }

  async function handleUpdateTask(
    task: Task,
    changes: { status?: TaskStatus; dueDate?: string | null }
  ) {
    await updateTask(task.id, changes);
    await load();
  }

  async function handleDeleteTask(task: Task) {
    await deleteTask(task.id);
    await load();
  }

  async function handleUploadAttachment(file: File) {
    if (!project) return;
    await uploadAttachment(project.id, file);
    await load();
  }

  async function handleDeleteAttachment(attachment: Attachment) {
    if (!confirm(`Delete "${attachment.originalName}"? This cannot be undone.`)) return;
    await deleteAttachment(attachment.id);
    await load();
  }

  async function handleCreateReport(data: Partial<MonthlyReportInput>) {
    if (!project) return;
    await createMonthlyReport(project.id, data);
    await load();
  }

  async function handleUpdateReport(
    report: MonthlyReport,
    data: Partial<MonthlyReportInput>
  ) {
    await updateMonthlyReport(report.id, data);
    await load();
  }

  async function handleDeleteReport(report: MonthlyReport) {
    await deleteMonthlyReport(report.id);
    await load();
  }

  async function handleCreateMilestone(data: Partial<MilestoneInput>) {
    if (!project) return;
    await createMilestone(project.id, data);
    await load();
  }

  async function handleUpdateMilestone(
    milestone: Milestone,
    data: Partial<MilestoneInput>
  ) {
    await updateMilestone(milestone.id, data);
    await load();
  }

  async function handleDeleteMilestone(milestone: Milestone) {
    await deleteMilestone(milestone.id);
    await load();
  }

  async function handleReorderMilestone(
    milestone: Milestone,
    direction: "up" | "down"
  ) {
    await reorderMilestone(milestone.id, direction);
    await load();
  }

  async function handleUpsertCashFlowEntry(data: Partial<CashFlowEntryInput>) {
    if (!project) return;
    await upsertCashFlowEntry(project.id, data);
    await load();
  }

  async function handleDeleteCashFlowEntry(entry: CashFlowEntry) {
    await deleteCashFlowEntry(entry.id);
    await load();
  }

  if (loading) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-12">
        Loading…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-3">
          {error || "Project not found"}
        </div>
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-4 inline-block"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <img src={gvwLogo} alt="Goulburn Valley Water" className="h-14 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {project.name}
                </h1>
                <span
                  className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[project.status]
                  }`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {canModifyProject(project, user) ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="px-4 py-2 text-sm rounded border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </>
              ) : (
                project.createdBy && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Only {project.createdBy.name} or an admin can edit this project
                  </span>
                )
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {project.description && (
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="BP Ref. No." value={project.bpRefNo || "—"} />
          <Field label="Asset Type" value={project.assetType || "—"} />
          <Field label="Project Manager" value={project.projectManager || "—"} />
          <Field label="Project Director" value={project.projectDirector || "—"} />
          <Field label="Project Sponsor" value={project.projectSponsor || "—"} />
          <Field label="Location" value={project.location || "—"} />
          <Field label="Contractor" value={project.contractor || "—"} />
          <Field label="Budget" value={formatCurrency(project.budget)} />
          <Field
            label="Contract Value"
            value={formatCurrency(project.contractValue)}
          />
          <Field label="Start Date" value={formatDate(project.startDate)} />
          <Field
            label="Target Completion"
            value={formatDate(project.targetCompletionDate)}
          />
          <Field
            label="Actual Completion"
            value={formatDate(project.actualCompletionDate)}
          />
          <Field label="Created By" value={project.createdBy?.name || "—"} />
        </div>

        <CashFlowPanel
          project={project}
          entries={cashFlowEntries}
          onUpsert={handleUpsertCashFlowEntry}
          onDelete={handleDeleteCashFlowEntry}
        />

        <TaskList
          tasks={project.tasks ?? []}
          onAdd={handleAddTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />

        <MilestonesPanel
          milestones={milestones}
          onCreate={handleCreateMilestone}
          onUpdate={handleUpdateMilestone}
          onDelete={handleDeleteMilestone}
          onReorder={handleReorderMilestone}
        />

        <AttachmentsPanel
          attachments={attachments}
          onUpload={handleUploadAttachment}
          onDelete={handleDeleteAttachment}
        />

        <MonthlyReportsPanel
          reports={reports}
          currentUser={user}
          onCreate={handleCreateReport}
          onUpdate={handleUpdateReport}
          onDelete={handleDeleteReport}
        />

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Activity
          </h2>
          <ActivityFeed entries={activity} emptyMessage="No activity recorded yet." />
        </div>
      </main>

      {showModal && (
        <ProjectFormModal
          project={project}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
        {value}
      </div>
    </div>
  );
}
