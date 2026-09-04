import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project, ProjectInput, ProjectStatus, Task } from "../types";
import {
  createProject,
  deleteProject,
  getProjects,
  getUpcomingTasks,
  updateProject,
} from "../api";
import StatCards from "../components/StatCards";
import ProjectTable from "../components/ProjectTable";
import ProjectFormModal from "../components/ProjectFormModal";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import { ALL_STATUSES, STATUS_LABELS } from "../statusMeta";
import gvwLogo from "../assets/gvw-logo.png";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [projectData, taskData] = await Promise.all([
        getProjects(),
        getUpcomingTasks(),
      ]);
      setProjects(projectData);
      setUpcomingTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${p.name} ${p.location ?? ""} ${
          p.projectManager ?? ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  function openNewProject() {
    setModalProject(null);
    setShowModal(true);
  }

  function openEditProject(project: Project) {
    setModalProject(project);
    setShowModal(true);
  }

  async function handleSave(data: Partial<ProjectInput>) {
    if (modalProject) {
      await updateProject(modalProject.id, data);
    } else {
      await createProject(data);
    }
    setShowModal(false);
    await loadData();
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject(project.id);
    await loadData();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={gvwLogo} alt="Goulburn Valley Water" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                APD Project Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Asset &amp; Project Delivery
              </p>
            </div>
          </div>
          <button
            onClick={openNewProject}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + New Project
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded p-3">
            {error}
          </div>
        )}

        <StatCards projects={projects} />

        <UpcomingDeadlines tasks={upcomingTasks} />

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-sm rounded-full border ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              All
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-full border ${
                  statusFilter === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, manager…"
            className="w-full sm:w-72 rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading…</div>
        ) : (
          <ProjectTable
            projects={filteredProjects}
            onOpen={(project) => navigate(`/projects/${project.id}`)}
            onEdit={openEditProject}
            onDelete={handleDelete}
          />
        )}
      </main>

      {showModal && (
        <ProjectFormModal
          project={modalProject}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
