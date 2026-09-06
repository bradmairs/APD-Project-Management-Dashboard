import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ActionItem,
  ActivityLogEntry,
  CashFlowEntry,
  CommunityEnquiry,
  Correspondence,
  Subcontractor,
  DefectItem,
  EotClaim,
  InsuranceWarranty,
  PaymentClaim,
  Permit,
  Project,
  ProjectInput,
  ProjectStatus,
  Rfi,
  Risk,
  SqeRecord,
  Task,
  TrainingRecord,
  Variation,
} from "../types";
import {
  createProject,
  deleteProject,
  getAllActionItems,
  getAllCashFlowEntries,
  getAllCommunityEnquiries,
  getAllCorrespondence,
  getAllSubcontractors,
  getAllDefects,
  getAllEotClaims,
  getAllInsuranceWarranties,
  getAllPaymentClaims,
  getAllPermits,
  getAllRfis,
  getAllRisks,
  getAllSqeRecords,
  getAllTrainingRecords,
  getAllVariations,
  getProjects,
  getRecentActivity,
  getUpcomingTasks,
  updateProject,
} from "../api";
import StatCards from "../components/StatCards";
import ProjectTable from "../components/ProjectTable";
import ProjectFormModal from "../components/ProjectFormModal";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import ActivityFeed from "../components/ActivityFeed";
import TopRisksPanel from "../components/TopRisksPanel";
import OpenActionsPanel from "../components/OpenActionsPanel";
import ExpiringPermitsPanel from "../components/ExpiringPermitsPanel";
import ExpiringInsuranceWarrantiesPanel from "../components/ExpiringInsuranceWarrantiesPanel";
import OpenSqePanel from "../components/OpenSqePanel";
import OpenDefectsPanel from "../components/OpenDefectsPanel";
import OpenPaymentClaimsPanel from "../components/OpenPaymentClaimsPanel";
import OpenRfisPanel from "../components/OpenRfisPanel";
import OpenEnquiriesPanel from "../components/OpenEnquiriesPanel";
import OpenCorrespondencePanel from "../components/OpenCorrespondencePanel";
import ExpiringSubcontractorInsurancePanel from "../components/ExpiringSubcontractorInsurancePanel";
import ExpiringTrainingPanel from "../components/ExpiringTrainingPanel";
import ChartCard from "../components/ChartCard";
import HorizontalBarChart, { BarDatum } from "../charts/HorizontalBarChart";
import PortfolioCumulativeSpendChart from "../charts/PortfolioCumulativeSpendChart";
import { SEQUENTIAL_BLUE, chartColor } from "../charts/palette";
import { useTheme } from "../theme/ThemeContext";
import { ALL_STATUSES, STATUS_LABELS } from "../statusMeta";
import { computeProjectHealth, ProjectHealth } from "../health";
import NeedsAttentionPanel from "../components/NeedsAttentionPanel";
import UserMenu from "../components/UserMenu";
import Tabs from "../components/Tabs";
import { useAuth } from "../auth/AuthContext";
import gvwLogo from "../assets/gvw-logo.png";

type DashboardTabId = "projects" | "alerts" | "charts" | "activity";

const DASHBOARD_TABS: { id: DashboardTabId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "alerts", label: "Alerts" },
  { id: "charts", label: "Charts" },
  { id: "activity", label: "Activity" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [sqeRecords, setSqeRecords] = useState<SqeRecord[]>([]);
  const [eotClaims, setEotClaims] = useState<EotClaim[]>([]);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [paymentClaims, setPaymentClaims] = useState<PaymentClaim[]>([]);
  const [insuranceWarranties, setInsuranceWarranties] = useState<InsuranceWarranty[]>([]);
  const [rfis, setRfis] = useState<Rfi[]>([]);
  const [communityEnquiries, setCommunityEnquiries] = useState<CommunityEnquiry[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTabId>("projects");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [
        projectData,
        taskData,
        activityData,
        cashFlowData,
        variationData,
        riskData,
        actionItemData,
        permitData,
        sqeData,
        eotData,
        defectData,
        paymentClaimData,
        insuranceWarrantyData,
        rfiData,
        communityEnquiryData,
        subcontractorData,
        correspondenceData,
        trainingRecordData,
      ] = await Promise.all([
        getProjects(),
        getUpcomingTasks(),
        getRecentActivity(),
        getAllCashFlowEntries(),
        getAllVariations(),
        getAllRisks(),
        getAllActionItems(),
        getAllPermits(),
        getAllSqeRecords(),
        getAllEotClaims(),
        getAllDefects(),
        getAllPaymentClaims(),
        getAllInsuranceWarranties(),
        getAllRfis(),
        getAllCommunityEnquiries(),
        getAllSubcontractors(),
        getAllCorrespondence(),
        getAllTrainingRecords(),
      ]);
      setProjects(projectData);
      setUpcomingTasks(taskData);
      setRecentActivity(activityData);
      setCashFlowEntries(cashFlowData);
      setVariations(variationData);
      setRisks(riskData);
      setActionItems(actionItemData);
      setPermits(permitData);
      setSqeRecords(sqeData);
      setDefects(defectData);
      setPaymentClaims(paymentClaimData);
      setInsuranceWarranties(insuranceWarrantyData);
      setRfis(rfiData);
      setEotClaims(eotData);
      setCommunityEnquiries(communityEnquiryData);
      setSubcontractors(subcontractorData);
      setCorrespondence(correspondenceData);
      setTrainingRecords(trainingRecordData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statusData: BarDatum[] = useMemo(
    () =>
      ALL_STATUSES.map((status) => ({
        label: STATUS_LABELS[status],
        value: projects.filter((p) => p.status === status).length,
      })),
    [projects]
  );

  const healthByProjectId: Record<string, ProjectHealth> = useMemo(() => {
    const result: Record<string, ProjectHealth> = {};
    for (const project of projects) {
      const projectEntries = cashFlowEntries.filter((e) => e.projectId === project.id);
      const projectVariations = variations.filter((v) => v.projectId === project.id);
      const projectRisks = risks.filter((r) => r.projectId === project.id);
      const projectEotClaims = eotClaims.filter((c) => c.projectId === project.id);
      result[project.id] = computeProjectHealth(
        project,
        projectEntries,
        projectVariations,
        projectRisks,
        projectEotClaims
      );
    }
    return result;
  }, [projects, cashFlowEntries, variations, risks, eotClaims]);

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
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-4">
            <img src={gvwLogo} alt="Goulburn Valley Water" className="h-16 w-auto" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                APD Project Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Asset &amp; Project Delivery
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/lessons-learned"
              className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Lessons Learned
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Reports
            </Link>
            <button
              onClick={openNewProject}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
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

        <StatCards projects={projects} />

        <Tabs tabs={DASHBOARD_TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-sm rounded-full border ${
                      statusFilter === s
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
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
                className="w-full sm:w-72 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-sm"
              />
            </div>

            {loading ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                Loading…
              </div>
            ) : (
              <ProjectTable
                projects={filteredProjects}
                currentUser={user}
                healthByProjectId={healthByProjectId}
                onOpen={(project) => navigate(`/projects/${project.id}`)}
                onEdit={openEditProject}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {activeTab === "alerts" && !loading && projects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <NeedsAttentionPanel projects={projects} healthByProjectId={healthByProjectId} />
            <OpenActionsPanel actionItems={actionItems} />
            <ExpiringPermitsPanel permits={permits} />
            <OpenSqePanel records={sqeRecords} />
            <OpenDefectsPanel defects={defects} />
            <OpenPaymentClaimsPanel claims={paymentClaims} />
            <ExpiringInsuranceWarrantiesPanel items={insuranceWarranties} />
            <OpenRfisPanel rfis={rfis} />
            <OpenEnquiriesPanel enquiries={communityEnquiries} />
            <ExpiringSubcontractorInsurancePanel subcontractors={subcontractors} />
            <OpenCorrespondencePanel items={correspondence} />
            <ExpiringTrainingPanel records={trainingRecords} />
          </div>
        )}

        {activeTab === "charts" && !loading && projects.length > 0 && (
          <div className="space-y-6">
            <ChartCard title="Spend vs Budget Over Time — All Projects">
              <PortfolioCumulativeSpendChart
                projects={projects}
                entries={cashFlowEntries}
                variations={variations}
              />
            </ChartCard>

            <ChartCard title="Projects by Status">
              <HorizontalBarChart
                data={statusData}
                color={chartColor(SEQUENTIAL_BLUE, theme)}
                formatValue={(v) => String(v)}
              />
            </ChartCard>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <UpcomingDeadlines tasks={upcomingTasks} />
            <TopRisksPanel risks={risks} />
            {recentActivity.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Recent Activity
                </h2>
                <ActivityFeed entries={recentActivity} showProjectLink />
              </div>
            )}
          </div>
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
