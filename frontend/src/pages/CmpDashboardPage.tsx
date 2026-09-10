import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CmpProject, CmpProjectInput } from "../cmpTypes";
import { createCmpProject, getCmpProjects } from "../cmpApi";
import { CMP_PROJECT_STATUS_COLORS, CMP_PROJECT_STATUS_LABELS } from "../cmpStatusMeta";
import { formatCurrency, formatDate } from "../format";
import CmpLogo from "../components/CmpLogo";
import CmpProjectFormModal from "../components/CmpProjectFormModal";
import UserMenu from "../components/UserMenu";

export default function CmpDashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CmpProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function loadProjects() {
    try {
      setProjects(await getCmpProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(data: Partial<CmpProjectInput>) {
    const project = await createCmpProject(data);
    setShowModal(false);
    navigate(`/cmp/projects/${project.id}`);
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-4">
            <CmpLogo />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                CMP Design Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Design Consultancy
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + New Project
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded p-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-12">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            No projects yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Lead
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                    Fee Budget
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Target Issue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/cmp/projects/${project.id}`)}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {project.name}
                      </div>
                      {project.projectNumber && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {project.projectNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {project.clientName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${CMP_PROJECT_STATUS_COLORS[project.status]}`}
                      >
                        {CMP_PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {project.projectLead || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(project.feeBudget)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {formatDate(project.targetIssueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <CmpProjectFormModal
          project={null}
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
