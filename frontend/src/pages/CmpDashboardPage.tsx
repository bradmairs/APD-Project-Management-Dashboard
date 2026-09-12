import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CmpActivityLogEntry, CmpProject, CmpProjectInput, CmpProjectStatus } from "../cmpTypes";
import { askCmpPortfolioAi, createCmpProject, getCmpProjects, getCmpRecentActivity } from "../cmpApi";
import { CMP_PROJECT_STATUSES, CMP_PROJECT_STATUS_COLORS, CMP_PROJECT_STATUS_LABELS } from "../cmpStatusMeta";
import { formatCurrency, formatDate } from "../format";
import CmpLogo from "../components/CmpLogo";
import CmpProjectFormModal from "../components/CmpProjectFormModal";
import UserMenu from "../components/UserMenu";
import Tabs from "../components/Tabs";
import ActivityFeed from "../components/ActivityFeed";
import AiAssistantPanel from "../components/AiAssistantPanel";
import ChartCard from "../components/ChartCard";
import HorizontalBarChart, { BarDatum } from "../charts/HorizontalBarChart";
import { SEQUENTIAL_BLUE, chartColor } from "../charts/palette";
import { useTheme } from "../theme/ThemeContext";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{value}</div>
    </div>
  );
}

const cmpProjectHref = (id: string) => `/cmp/projects/${id}`;

type CmpDashboardTabId = "projects" | "charts" | "activity" | "ai";

const CMP_DASHBOARD_TABS: { id: CmpDashboardTabId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "charts", label: "Charts" },
  { id: "activity", label: "Activity" },
  { id: "ai", label: "AI Assistant" },
];

export default function CmpDashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<CmpProject[]>([]);
  const [activity, setActivity] = useState<CmpActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CmpProjectStatus | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<CmpDashboardTabId>("projects");

  async function loadAll() {
    try {
      const [projectsResult, activityResult] = await Promise.all([
        getCmpProjects(),
        getCmpRecentActivity(),
      ]);
      setProjects(projectsResult);
      setActivity(activityResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(data: Partial<CmpProjectInput>) {
    const project = await createCmpProject(data);
    setShowModal(false);
    navigate(`/cmp/projects/${project.id}`);
  }

  const stats = useMemo(() => {
    const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
    const totalFeeBudget = projects.reduce((sum, p) => sum + Number(p.feeBudget ?? 0), 0);
    const feeClaimed = projects.reduce(
      (sum, p) => sum + (p.feeClaims ?? []).reduce((s, c) => s + Number(c.claimedAmount), 0),
      0
    );
    const feeApproved = projects.reduce(
      (sum, p) =>
        sum + (p.feeClaims ?? []).reduce((s, c) => s + Number(c.approvedAmount ?? 0), 0),
      0
    );
    return { activeCount, totalFeeBudget, feeClaimed, feeApproved };
  }, [projects]);

  const statusData: BarDatum[] = useMemo(
    () =>
      CMP_PROJECT_STATUSES.map((status) => ({
        label: CMP_PROJECT_STATUS_LABELS[status],
        value: projects.filter((p) => p.status === status).length,
      })),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (statusFilter === "ALL") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

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
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={String(projects.length)} />
          <StatCard label="Active Projects" value={String(stats.activeCount)} />
          <StatCard label="Total Fee Budget" value={formatCurrency(stats.totalFeeBudget)} />
          <StatCard
            label="Fee Claimed / Approved"
            value={`${formatCurrency(stats.feeClaimed)} / ${formatCurrency(stats.feeApproved)}`}
          />
        </div>

        <Tabs tabs={CMP_DASHBOARD_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 text-sm rounded-full border ${
                  statusFilter === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                }`}
              >
                All
              </button>
              {CMP_PROJECT_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-sm rounded-full border ${
                    statusFilter === s
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {CMP_PROJECT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                Loading…
              </div>
            ) : filteredProjects.length === 0 ? (
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
                    {filteredProjects.map((project) => (
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
          </div>
        )}

        {activeTab === "charts" && !loading && projects.length > 0 && (
          <ChartCard title="Projects by Status">
            <HorizontalBarChart
              data={statusData}
              color={chartColor(SEQUENTIAL_BLUE, theme)}
              formatValue={(v) => String(v)}
            />
          </ChartCard>
        )}

        {activeTab === "activity" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Recent Activity
            </h2>
            <ActivityFeed entries={activity} showProjectLink projectHref={cmpProjectHref} />
          </div>
        )}

        {activeTab === "ai" && (
          <AiAssistantPanel
            title="AI Assistant"
            description="Ask questions across the whole CMP portfolio — fee budgets, design stages, drawings, and open items across every commission. Powered by a locally-hosted Ollama model."
            suggestedQuestion="Which commissions need attention right now, and why?"
            onAsk={askCmpPortfolioAi}
          />
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
