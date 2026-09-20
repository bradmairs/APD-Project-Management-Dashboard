import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ActionItem,
  ActionItemInput,
  ActivityLogEntry,
  ArchiveItemType,
  ArchiveLink,
  Attachment,
  CashFlowEntry,
  CashFlowEntryInput,
  ChecklistItem,
  ChecklistItemInput,
  CommunityEnquiry,
  CommunityEnquiryInput,
  Correspondence,
  CorrespondenceInput,
  PerformanceReview,
  PerformanceReviewInput,
  TrainingRecord,
  TrainingRecordInput,
  DefectItem,
  DefectItemInput,
  DocumentRecord,
  DocumentRecordInput,
  EnvironmentalMonitoringRecord,
  EnvironmentalMonitoringRecordInput,
  EotClaim,
  EotClaimInput,
  SafetyInspection,
  SafetyInspectionInput,
  InsuranceWarranty,
  InsuranceWarrantyInput,
  LessonLearned,
  LessonLearnedInput,
  MeetingMinutes,
  MeetingMinutesInput,
  PaymentClaim,
  PaymentClaimInput,
  Permit,
  PermitInput,
  Stakeholder,
  StakeholderInput,
  Milestone,
  MilestoneInput,
  MonthlyReport,
  MonthlyReportInput,
  Project,
  ProjectInput,
  Rfi,
  RfiInput,
  Risk,
  RiskInput,
  SiteVisit,
  SiteVisitInput,
  SiteVisitPhoto,
  SqeRecord,
  SqeRecordInput,
  Subcontractor,
  SubcontractorInput,
  ContractRecord,
  ContractRecordInput,
  SuggestedAction,
  Task,
  TaskStatus,
  TenderPackage,
  TenderPackageInput,
  ToolboxTalk,
  ToolboxTalkInput,
  Variation,
  VariationInput,
} from "../types";
import {
  createActionItem,
  createArchiveLink,
  createChecklistItem,
  createCommunityEnquiry,
  createCorrespondence,
  createDefect,
  createDocument,
  createEnvironmentalMonitoring,
  createEotClaim,
  createSafetyInspection,
  askProjectAi,
  createInsuranceWarranty,
  createLessonLearned,
  createMeetingMinutes,
  createMilestone,
  createMonthlyReport,
  createPaymentClaim,
  createPermit,
  createRfi,
  createRisk,
  createSiteVisit,
  createSqeRecord,
  createStakeholder,
  createSubcontractor,
  createContract,
  applyTaskTemplate,
  createTask,
  createTenderPackage,
  createPerformanceReview,
  createToolboxTalk,
  createTrainingRecord,
  createVariation,
  deleteActionItem,
  deleteArchiveLink,
  deleteAttachment,
  deleteCashFlowEntry,
  deleteChecklistItem,
  deleteCommunityEnquiry,
  deleteCorrespondence,
  deleteDefect,
  deleteDocument,
  deleteEnvironmentalMonitoring,
  deleteEotClaim,
  extractMeetingActions,
  deleteSafetyInspection,
  deleteInsuranceWarranty,
  deleteLessonLearned,
  deleteMeetingMinutes,
  deleteMilestone,
  deleteMonthlyReport,
  deletePaymentClaim,
  deletePermit,
  deleteProject,
  deleteRfi,
  deleteRisk,
  deleteSiteVisit,
  deleteSiteVisitPhoto,
  syncSiteVisitPhotoToArchive,
  deleteSqeRecord,
  deleteStakeholder,
  deleteSubcontractor,
  deleteContract,
  deleteTask,
  deleteTenderPackage,
  deletePerformanceReview,
  deleteToolboxTalk,
  deleteTrainingRecord,
  deleteVariation,
  getActionItems,
  getArchiveLinks,
  getAttachments,
  getCashFlowEntries,
  getChecklistItems,
  getCommunityEnquiries,
  getCorrespondence,
  getDefects,
  getDocuments,
  getEnvironmentalMonitoring,
  getEotClaims,
  getSafetyInspections,
  getInsuranceWarranties,
  getLessonsLearned,
  getMeetingMinutes,
  getMilestones,
  getMonthlyReports,
  getPaymentClaims,
  getPermits,
  getProject,
  getProjectActivity,
  getProjectSitePhotos,
  getRfis,
  getRisks,
  getSiteVisits,
  getSqeRecords,
  getStakeholders,
  getSubcontractors,
  getContracts,
  getTenderPackages,
  getPerformanceReviews,
  getToolboxTalks,
  getTrainingRecords,
  getVariations,
  reorderMilestone,
  updateActionItem,
  updateChecklistItem,
  updateCommunityEnquiry,
  updateCorrespondence,
  updateDefect,
  updateDocument,
  updateEnvironmentalMonitoring,
  updateEotClaim,
  updateSafetyInspection,
  updateInsuranceWarranty,
  updateLessonLearned,
  updateMeetingMinutes,
  updateMilestone,
  updateMonthlyReport,
  updatePaymentClaim,
  updatePermit,
  updateProject,
  updateRfi,
  updateRisk,
  updateSiteVisit,
  updateSqeRecord,
  updateStakeholder,
  updateSubcontractor,
  updateContract,
  updateTask,
  updateTenderPackage,
  updatePerformanceReview,
  updateToolboxTalk,
  updateTrainingRecord,
  updateVariation,
  uploadAttachment,
  uploadSiteVisitPhotos,
  upsertCashFlowEntry,
} from "../api";
import ProjectFormModal from "../components/ProjectFormModal";
import TaskList from "../components/TaskList";
import ActivityFeed from "../components/ActivityFeed";
import AttachmentsPanel from "../components/AttachmentsPanel";
import ArchiveLinksPanel from "../components/ArchiveLinksPanel";
import MonthlyReportsPanel from "../components/MonthlyReportsPanel";
import MilestonesPanel from "../components/MilestonesPanel";
import ProjectTimeline from "../components/ProjectTimeline";
import ApplyTaskTemplateControl from "../components/ApplyTaskTemplateControl";
import CashFlowPanel from "../components/CashFlowPanel";
import SiteVisitsPanel from "../components/SiteVisitsPanel";
import VariationsPanel from "../components/VariationsPanel";
import RisksPanel from "../components/RisksPanel";
import RfisPanel from "../components/RfisPanel";
import ActionsPanel from "../components/ActionsPanel";
import StakeholdersPanel from "../components/StakeholdersPanel";
import SubcontractorsPanel from "../components/SubcontractorsPanel";
import ContractsPanel from "../components/ContractsPanel";
import PermitsPanel from "../components/PermitsPanel";
import InsuranceWarrantiesPanel from "../components/InsuranceWarrantiesPanel";
import LessonsLearnedPanel from "../components/LessonsLearnedPanel";
import MeetingMinutesPanel from "../components/MeetingMinutesPanel";
import SqePanel from "../components/SqePanel";
import EnvironmentalMonitoringPanel from "../components/EnvironmentalMonitoringPanel";
import SafetyInspectionsPanel from "../components/SafetyInspectionsPanel";
import TenderPackagesPanel from "../components/TenderPackagesPanel";
import AiAssistantPanel from "../components/AiAssistantPanel";
import EotPanel from "../components/EotPanel";
import ChecklistPanel from "../components/ChecklistPanel";
import DefectsPanel from "../components/DefectsPanel";
import DocumentsPanel from "../components/DocumentsPanel";
import EnquiriesPanel from "../components/EnquiriesPanel";
import CorrespondencePanel from "../components/CorrespondencePanel";
import TrainingRecordsPanel from "../components/TrainingRecordsPanel";
import PerformanceReviewsPanel from "../components/PerformanceReviewsPanel";
import ToolboxTalksPanel from "../components/ToolboxTalksPanel";
import Tabs from "../components/Tabs";
import PaymentClaimsPanel from "../components/PaymentClaimsPanel";
import HealthBadge from "../components/HealthBadge";
import { computeProjectHealth } from "../health";
import { revisedCompletionDate } from "../eot";
import { STATUS_COLORS, STATUS_LABELS } from "../statusMeta";
import { formatCurrency, formatDate } from "../format";
import { canModifyProject } from "../permissions";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../auth/AuthContext";
import GvwLogo from "../components/GvwLogo";

type ProjectTabId = "overview" | "schedule" | "budget" | "quality" | "site" | "ai";

const PROJECT_TABS: { id: ProjectTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "budget", label: "Budget & Contract" },
  { id: "quality", label: "Quality & Risk" },
  { id: "site", label: "Site & Records" },
  { id: "ai", label: "AI Assistant" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [archiveLinks, setArchiveLinks] = useState<ArchiveLink[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [sitePhotos, setSitePhotos] = useState<SiteVisitPhoto[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [insuranceWarranties, setInsuranceWarranties] = useState<InsuranceWarranty[]>([]);
  const [rfis, setRfis] = useState<Rfi[]>([]);
  const [lessons, setLessons] = useState<LessonLearned[]>([]);
  const [sqeRecords, setSqeRecords] = useState<SqeRecord[]>([]);
  const [eotClaims, setEotClaims] = useState<EotClaim[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [paymentClaims, setPaymentClaims] = useState<PaymentClaim[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [communityEnquiries, setCommunityEnquiries] = useState<CommunityEnquiry[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes[]>([]);
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>([]);
  const [environmentalMonitoring, setEnvironmentalMonitoring] = useState<
    EnvironmentalMonitoringRecord[]
  >([]);
  const [safetyInspections, setSafetyInspections] = useState<SafetyInspection[]>([]);
  const [tenderPackages, setTenderPackages] = useState<TenderPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectTabId>("overview");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [
        data,
        activityData,
        attachmentData,
        archiveLinkData,
        reportData,
        milestoneData,
        cashFlowData,
        siteVisitData,
        sitePhotoData,
        variationData,
        riskData,
        actionItemData,
        stakeholderData,
        permitData,
        lessonData,
        sqeData,
        eotData,
        checklistData,
        defectData,
        paymentClaimData,
        insuranceWarrantyData,
        rfiData,
        documentData,
        communityEnquiryData,
        subcontractorData,
        contractData,
        meetingMinutesData,
        correspondenceData,
        trainingRecordData,
        performanceReviewData,
        toolboxTalkData,
        environmentalMonitoringData,
        safetyInspectionData,
        tenderPackageData,
      ] = await Promise.all([
        getProject(id),
        getProjectActivity(id),
        getAttachments(id),
        getArchiveLinks(id),
        getMonthlyReports(id),
        getMilestones(id),
        getCashFlowEntries(id),
        getSiteVisits(id),
        getProjectSitePhotos(id),
        getVariations(id),
        getRisks(id),
        getActionItems(id),
        getStakeholders(id),
        getPermits(id),
        getLessonsLearned(id),
        getSqeRecords(id),
        getEotClaims(id),
        getChecklistItems(id),
        getDefects(id),
        getPaymentClaims(id),
        getInsuranceWarranties(id),
        getRfis(id),
        getDocuments(id),
        getCommunityEnquiries(id),
        getSubcontractors(id),
        getContracts(id),
        getMeetingMinutes(id),
        getCorrespondence(id),
        getTrainingRecords(id),
        getPerformanceReviews(id),
        getToolboxTalks(id),
        getEnvironmentalMonitoring(id),
        getSafetyInspections(id),
        getTenderPackages(id),
      ]);
      setProject(data);
      setActivity(activityData);
      setAttachments(attachmentData);
      setArchiveLinks(archiveLinkData);
      setReports(reportData);
      setMilestones(milestoneData);
      setCashFlowEntries(cashFlowData);
      setSiteVisits(siteVisitData);
      setSitePhotos(sitePhotoData);
      setVariations(variationData);
      setRisks(riskData);
      setActionItems(actionItemData);
      setStakeholders(stakeholderData);
      setPermits(permitData);
      setLessons(lessonData);
      setSqeRecords(sqeData);
      setEotClaims(eotData);
      setChecklistItems(checklistData);
      setDefects(defectData);
      setPaymentClaims(paymentClaimData);
      setInsuranceWarranties(insuranceWarrantyData);
      setRfis(rfiData);
      setDocuments(documentData);
      setCommunityEnquiries(communityEnquiryData);
      setSubcontractors(subcontractorData);
      setContracts(contractData);
      setMeetingMinutes(meetingMinutesData);
      setCorrespondence(correspondenceData);
      setTrainingRecords(trainingRecordData);
      setPerformanceReviews(performanceReviewData);
      setToolboxTalks(toolboxTalkData);
      setEnvironmentalMonitoring(environmentalMonitoringData);
      setSafetyInspections(safetyInspectionData);
      setTenderPackages(tenderPackageData);
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

  async function handleApplyTaskTemplate(templateId: string) {
    if (!project) return;
    await applyTaskTemplate(templateId, project.id);
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

  async function handleCreateArchiveLink(data: {
    archiveType: ArchiveItemType;
    archiveId: string;
    label: string;
  }) {
    if (!project) return;
    await createArchiveLink(project.id, data);
    await load();
  }

  async function handleDeleteArchiveLink(link: ArchiveLink) {
    if (!confirm(`Remove the link to "${link.label}"? This only removes the link, not the item itself in the Archive.`)) return;
    await deleteArchiveLink(link.id);
    await load();
  }

  async function handleSyncPhotoToArchive(photoId: string) {
    await syncSiteVisitPhotoToArchive(photoId);
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

  async function handleCreateSiteVisit(data: Partial<SiteVisitInput>) {
    if (!project) return;
    await createSiteVisit(project.id, data);
    await load();
  }

  async function handleUpdateSiteVisit(
    siteVisit: SiteVisit,
    data: Partial<SiteVisitInput>
  ) {
    await updateSiteVisit(siteVisit.id, data);
    await load();
  }

  async function handleDeleteSiteVisit(siteVisit: SiteVisit) {
    await deleteSiteVisit(siteVisit.id);
    await load();
  }

  async function handleUploadSiteVisitPhotos(siteVisit: SiteVisit, files: File[]) {
    await uploadSiteVisitPhotos(siteVisit.id, files);
    await load();
  }

  async function handleDeleteSiteVisitPhoto(photo: SiteVisitPhoto) {
    await deleteSiteVisitPhoto(photo.id);
    await load();
  }

  async function handleCreateVariation(data: Partial<VariationInput>) {
    if (!project) return;
    await createVariation(project.id, data);
    await load();
  }

  async function handleUpdateVariation(
    variation: Variation,
    data: Partial<VariationInput>
  ) {
    await updateVariation(variation.id, data);
    await load();
  }

  async function handleDeleteVariation(variation: Variation) {
    await deleteVariation(variation.id);
    await load();
  }

  async function handleCreateRisk(data: Partial<RiskInput>) {
    if (!project) return;
    await createRisk(project.id, data);
    await load();
  }

  async function handleUpdateRisk(risk: Risk, data: Partial<RiskInput>) {
    await updateRisk(risk.id, data);
    await load();
  }

  async function handleDeleteRisk(risk: Risk) {
    await deleteRisk(risk.id);
    await load();
  }

  async function handleCreateActionItem(data: Partial<ActionItemInput>) {
    if (!project) return;
    await createActionItem(project.id, data);
    await load();
  }

  async function handleUpdateActionItem(
    actionItem: ActionItem,
    data: Partial<ActionItemInput>
  ) {
    await updateActionItem(actionItem.id, data);
    await load();
  }

  async function handleDeleteActionItem(actionItem: ActionItem) {
    await deleteActionItem(actionItem.id);
    await load();
  }

  async function handleCreateStakeholder(data: Partial<StakeholderInput>) {
    if (!project) return;
    await createStakeholder(project.id, data);
    await load();
  }

  async function handleUpdateStakeholder(
    stakeholder: Stakeholder,
    data: Partial<StakeholderInput>
  ) {
    await updateStakeholder(stakeholder.id, data);
    await load();
  }

  async function handleDeleteStakeholder(stakeholder: Stakeholder) {
    await deleteStakeholder(stakeholder.id);
    await load();
  }

  async function handleCreatePermit(data: Partial<PermitInput>) {
    if (!project) return;
    await createPermit(project.id, data);
    await load();
  }

  async function handleUpdatePermit(permit: Permit, data: Partial<PermitInput>) {
    await updatePermit(permit.id, data);
    await load();
  }

  async function handleDeletePermit(permit: Permit) {
    await deletePermit(permit.id);
    await load();
  }

  async function handleCreateLesson(data: Partial<LessonLearnedInput>) {
    if (!project) return;
    await createLessonLearned(project.id, data);
    await load();
  }

  async function handleUpdateLesson(
    lesson: LessonLearned,
    data: Partial<LessonLearnedInput>
  ) {
    await updateLessonLearned(lesson.id, data);
    await load();
  }

  async function handleDeleteLesson(lesson: LessonLearned) {
    await deleteLessonLearned(lesson.id);
    await load();
  }

  async function handleCreateSqeRecord(data: Partial<SqeRecordInput>) {
    if (!project) return;
    await createSqeRecord(project.id, data);
    await load();
  }

  async function handleUpdateSqeRecord(
    record: SqeRecord,
    data: Partial<SqeRecordInput>
  ) {
    await updateSqeRecord(record.id, data);
    await load();
  }

  async function handleDeleteSqeRecord(record: SqeRecord) {
    await deleteSqeRecord(record.id);
    await load();
  }

  async function handleCreateEnvironmentalMonitoring(
    data: Partial<EnvironmentalMonitoringRecordInput>
  ) {
    if (!project) return;
    await createEnvironmentalMonitoring(project.id, data);
    await load();
  }

  async function handleUpdateEnvironmentalMonitoring(
    record: EnvironmentalMonitoringRecord,
    data: Partial<EnvironmentalMonitoringRecordInput>
  ) {
    await updateEnvironmentalMonitoring(record.id, data);
    await load();
  }

  async function handleDeleteEnvironmentalMonitoring(record: EnvironmentalMonitoringRecord) {
    await deleteEnvironmentalMonitoring(record.id);
    await load();
  }

  async function handleCreateSafetyInspection(data: Partial<SafetyInspectionInput>) {
    if (!project) return;
    await createSafetyInspection(project.id, data);
    await load();
  }

  async function handleUpdateSafetyInspection(
    inspection: SafetyInspection,
    data: Partial<SafetyInspectionInput>
  ) {
    await updateSafetyInspection(inspection.id, data);
    await load();
  }

  async function handleDeleteSafetyInspection(inspection: SafetyInspection) {
    await deleteSafetyInspection(inspection.id);
    await load();
  }

  async function handleCreateTenderPackage(data: Partial<TenderPackageInput>) {
    if (!project) return;
    await createTenderPackage(project.id, data);
    await load();
  }

  async function handleUpdateTenderPackage(
    tenderPackage: TenderPackage,
    data: Partial<TenderPackageInput>
  ) {
    await updateTenderPackage(tenderPackage.id, data);
    await load();
  }

  async function handleDeleteTenderPackage(tenderPackage: TenderPackage) {
    await deleteTenderPackage(tenderPackage.id);
    await load();
  }

  async function handleCreateEotClaim(data: Partial<EotClaimInput>) {
    if (!project) return;
    await createEotClaim(project.id, data);
    await load();
  }

  async function handleUpdateEotClaim(claim: EotClaim, data: Partial<EotClaimInput>) {
    await updateEotClaim(claim.id, data);
    await load();
  }

  async function handleDeleteEotClaim(claim: EotClaim) {
    await deleteEotClaim(claim.id);
    await load();
  }

  async function handleCreateChecklistItem(data: Partial<ChecklistItemInput>) {
    if (!project) return;
    await createChecklistItem(project.id, data);
    await load();
  }

  async function handleUpdateChecklistItem(item: ChecklistItem, data: Partial<ChecklistItemInput>) {
    await updateChecklistItem(item.id, data);
    await load();
  }

  async function handleDeleteChecklistItem(item: ChecklistItem) {
    await deleteChecklistItem(item.id);
    await load();
  }

  async function handleCreateDefect(data: Partial<DefectItemInput>) {
    if (!project) return;
    await createDefect(project.id, data);
    await load();
  }

  async function handleUpdateDefect(defect: DefectItem, data: Partial<DefectItemInput>) {
    await updateDefect(defect.id, data);
    await load();
  }

  async function handleDeleteDefect(defect: DefectItem) {
    await deleteDefect(defect.id);
    await load();
  }

  async function handleCreatePaymentClaim(data: Partial<PaymentClaimInput>) {
    if (!project) return;
    await createPaymentClaim(project.id, data);
    await load();
  }

  async function handleUpdatePaymentClaim(
    claim: PaymentClaim,
    data: Partial<PaymentClaimInput>
  ) {
    await updatePaymentClaim(claim.id, data);
    await load();
  }

  async function handleDeletePaymentClaim(claim: PaymentClaim) {
    await deletePaymentClaim(claim.id);
    await load();
  }

  async function handleCreateInsuranceWarranty(data: Partial<InsuranceWarrantyInput>) {
    if (!project) return;
    await createInsuranceWarranty(project.id, data);
    await load();
  }

  async function handleUpdateInsuranceWarranty(
    item: InsuranceWarranty,
    data: Partial<InsuranceWarrantyInput>
  ) {
    await updateInsuranceWarranty(item.id, data);
    await load();
  }

  async function handleDeleteInsuranceWarranty(item: InsuranceWarranty) {
    await deleteInsuranceWarranty(item.id);
    await load();
  }

  async function handleCreateRfi(data: Partial<RfiInput>) {
    if (!project) return;
    await createRfi(project.id, data);
    await load();
  }

  async function handleUpdateRfi(rfi: Rfi, data: Partial<RfiInput>) {
    await updateRfi(rfi.id, data);
    await load();
  }

  async function handleDeleteRfi(rfi: Rfi) {
    await deleteRfi(rfi.id);
    await load();
  }

  async function handleCreateCorrespondence(data: Partial<CorrespondenceInput>) {
    if (!project) return;
    await createCorrespondence(project.id, data);
    await load();
  }

  async function handleUpdateCorrespondence(
    item: Correspondence,
    data: Partial<CorrespondenceInput>
  ) {
    await updateCorrespondence(item.id, data);
    await load();
  }

  async function handleDeleteCorrespondence(item: Correspondence) {
    await deleteCorrespondence(item.id);
    await load();
  }

  async function handleCreateTrainingRecord(data: Partial<TrainingRecordInput>) {
    if (!project) return;
    await createTrainingRecord(project.id, data);
    await load();
  }

  async function handleUpdateTrainingRecord(
    item: TrainingRecord,
    data: Partial<TrainingRecordInput>
  ) {
    await updateTrainingRecord(item.id, data);
    await load();
  }

  async function handleDeleteTrainingRecord(item: TrainingRecord) {
    await deleteTrainingRecord(item.id);
    await load();
  }

  async function handleCreatePerformanceReview(data: Partial<PerformanceReviewInput>) {
    if (!project) return;
    await createPerformanceReview(project.id, data);
    await load();
  }

  async function handleUpdatePerformanceReview(
    item: PerformanceReview,
    data: Partial<PerformanceReviewInput>
  ) {
    await updatePerformanceReview(item.id, data);
    await load();
  }

  async function handleDeletePerformanceReview(item: PerformanceReview) {
    await deletePerformanceReview(item.id);
    await load();
  }

  async function handleCreateToolboxTalk(data: Partial<ToolboxTalkInput>) {
    if (!project) return;
    await createToolboxTalk(project.id, data);
    await load();
  }

  async function handleUpdateToolboxTalk(item: ToolboxTalk, data: Partial<ToolboxTalkInput>) {
    await updateToolboxTalk(item.id, data);
    await load();
  }

  async function handleDeleteToolboxTalk(item: ToolboxTalk) {
    await deleteToolboxTalk(item.id);
    await load();
  }

  async function handleCreateDocument(data: Partial<DocumentRecordInput>) {
    if (!project) return;
    await createDocument(project.id, data);
    await load();
  }

  async function handleUpdateDocument(
    document: DocumentRecord,
    data: Partial<DocumentRecordInput>
  ) {
    await updateDocument(document.id, data);
    await load();
  }

  async function handleDeleteDocument(document: DocumentRecord) {
    await deleteDocument(document.id);
    await load();
  }

  async function handleCreateCommunityEnquiry(data: Partial<CommunityEnquiryInput>) {
    if (!project) return;
    await createCommunityEnquiry(project.id, data);
    await load();
  }

  async function handleUpdateCommunityEnquiry(
    enquiry: CommunityEnquiry,
    data: Partial<CommunityEnquiryInput>
  ) {
    await updateCommunityEnquiry(enquiry.id, data);
    await load();
  }

  async function handleDeleteCommunityEnquiry(enquiry: CommunityEnquiry) {
    await deleteCommunityEnquiry(enquiry.id);
    await load();
  }

  async function handleCreateSubcontractor(data: Partial<SubcontractorInput>) {
    if (!project) return;
    await createSubcontractor(project.id, data);
    await load();
  }

  async function handleUpdateSubcontractor(
    subcontractor: Subcontractor,
    data: Partial<SubcontractorInput>
  ) {
    await updateSubcontractor(subcontractor.id, data);
    await load();
  }

  async function handleDeleteSubcontractor(subcontractor: Subcontractor) {
    await deleteSubcontractor(subcontractor.id);
    await load();
  }

  async function handleCreateContract(data: Partial<ContractRecordInput>) {
    if (!project) return;
    await createContract(project.id, data);
    await load();
  }

  async function handleUpdateContract(
    contract: ContractRecord,
    data: Partial<ContractRecordInput>
  ) {
    await updateContract(contract.id, data);
    await load();
  }

  async function handleDeleteContract(contract: ContractRecord) {
    await deleteContract(contract.id);
    await load();
  }

  async function handleCreateMeetingMinutes(data: Partial<MeetingMinutesInput>) {
    if (!project) return;
    await createMeetingMinutes(project.id, data);
    await load();
  }

  async function handleUpdateMeetingMinutes(
    meeting: MeetingMinutes,
    data: Partial<MeetingMinutesInput>
  ) {
    await updateMeetingMinutes(meeting.id, data);
    await load();
  }

  async function handleDeleteMeetingMinutes(meeting: MeetingMinutes) {
    await deleteMeetingMinutes(meeting.id);
    await load();
  }

  async function handleUploadMeetingAttachment(meetingId: string, file: File) {
    if (!project) return;
    await uploadAttachment(project.id, file, meetingId);
    await load();
  }

  async function handleExtractMeetingActions(meetingId: string): Promise<SuggestedAction[]> {
    const { actions } = await extractMeetingActions(meetingId);
    return actions;
  }

  const revisedTargetCompletion = useMemo(
    () => (project ? revisedCompletionDate(project, eotClaims) : null),
    [project, eotClaims]
  );

  const health = useMemo(
    () =>
      project
        ? computeProjectHealth(project, cashFlowEntries, variations, risks, eotClaims)
        : null,
    [project, cashFlowEntries, variations, risks, eotClaims]
  );

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
          <div className="flex flex-wrap items-center justify-between gap-y-3 mt-2">
            <div className="flex items-center gap-4">
              <GvwLogo className="h-14" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[project.status]
                    }`}
                  >
                    {STATUS_LABELS[project.status]}
                  </span>
                  {health && <HealthBadge health={health} detailed />}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/projects/${project.id}/closeout-report`}
                className="px-4 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Closeout Report
              </Link>
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
          {revisedTargetCompletion &&
            revisedTargetCompletion !== project.targetCompletionDate && (
              <Field
                label="Revised Completion"
                value={formatDate(revisedTargetCompletion)}
              />
            )}
          <Field
            label="Actual Completion"
            value={formatDate(project.actualCompletionDate)}
          />
          <Field label="Created By" value={project.createdBy?.name || "—"} />
        </div>

        <Tabs tabs={PROJECT_TABS} active={activeTab} onChange={setActiveTab} />

        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              <StakeholdersPanel
                stakeholders={stakeholders}
                onCreate={handleCreateStakeholder}
                onUpdate={handleUpdateStakeholder}
                onDelete={handleDeleteStakeholder}
              />

              <ActionsPanel
                actionItems={actionItems}
                onCreate={handleCreateActionItem}
                onUpdate={handleUpdateActionItem}
                onDelete={handleDeleteActionItem}
              />

              <MeetingMinutesPanel
                meetings={meetingMinutes}
                attachments={attachments}
                actionItems={actionItems}
                onCreate={handleCreateMeetingMinutes}
                onUpdate={handleUpdateMeetingMinutes}
                onDelete={handleDeleteMeetingMinutes}
                onUploadAttachment={handleUploadMeetingAttachment}
                onDeleteAttachment={handleDeleteAttachment}
                onCreateAction={handleCreateActionItem}
                onExtractActions={handleExtractMeetingActions}
              />

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Activity
                </h2>
                <ActivityFeed entries={activity} emptyMessage="No activity recorded yet." />
              </div>
            </>
          )}

          {activeTab === "schedule" && (
            <>
              <ProjectTimeline
                project={project}
                milestones={milestones}
                tasks={project.tasks ?? []}
                onUpdateMilestone={handleUpdateMilestone}
              />

              <MilestonesPanel
                milestones={milestones}
                onCreate={handleCreateMilestone}
                onUpdate={handleUpdateMilestone}
                onDelete={handleDeleteMilestone}
                onReorder={handleReorderMilestone}
              />

              <ApplyTaskTemplateControl onApply={handleApplyTaskTemplate} />

              <TaskList
                tasks={project.tasks ?? []}
                onAdd={handleAddTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />

              <EotPanel
                claims={eotClaims}
                onCreate={handleCreateEotClaim}
                onUpdate={handleUpdateEotClaim}
                onDelete={handleDeleteEotClaim}
              />

              <ChecklistPanel
                items={checklistItems}
                onCreate={handleCreateChecklistItem}
                onUpdate={handleUpdateChecklistItem}
                onDelete={handleDeleteChecklistItem}
              />
            </>
          )}

          {activeTab === "budget" && (
            <>
              <ContractsPanel
                contracts={contracts}
                onCreate={handleCreateContract}
                onUpdate={handleUpdateContract}
                onDelete={handleDeleteContract}
              />

              <CashFlowPanel
                project={project}
                entries={cashFlowEntries}
                variations={variations}
                onUpsert={handleUpsertCashFlowEntry}
                onDelete={handleDeleteCashFlowEntry}
              />

              <VariationsPanel
                variations={variations}
                onCreate={handleCreateVariation}
                onUpdate={handleUpdateVariation}
                onDelete={handleDeleteVariation}
              />

              <PaymentClaimsPanel
                claims={paymentClaims}
                onCreate={handleCreatePaymentClaim}
                onUpdate={handleUpdatePaymentClaim}
                onDelete={handleDeletePaymentClaim}
              />

              <InsuranceWarrantiesPanel
                items={insuranceWarranties}
                onCreate={handleCreateInsuranceWarranty}
                onUpdate={handleUpdateInsuranceWarranty}
                onDelete={handleDeleteInsuranceWarranty}
              />

              <PermitsPanel
                permits={permits}
                onCreate={handleCreatePermit}
                onUpdate={handleUpdatePermit}
                onDelete={handleDeletePermit}
              />

              <TenderPackagesPanel
                tenderPackages={tenderPackages}
                onCreate={handleCreateTenderPackage}
                onUpdate={handleUpdateTenderPackage}
                onDelete={handleDeleteTenderPackage}
              />

              <SubcontractorsPanel
                subcontractors={subcontractors}
                onCreate={handleCreateSubcontractor}
                onUpdate={handleUpdateSubcontractor}
                onDelete={handleDeleteSubcontractor}
              />

              <PerformanceReviewsPanel
                items={performanceReviews}
                onCreate={handleCreatePerformanceReview}
                onUpdate={handleUpdatePerformanceReview}
                onDelete={handleDeletePerformanceReview}
              />
            </>
          )}

          {activeTab === "quality" && (
            <>
              <RisksPanel
                risks={risks}
                onCreate={handleCreateRisk}
                onUpdate={handleUpdateRisk}
                onDelete={handleDeleteRisk}
              />

              <SqePanel
                records={sqeRecords}
                onCreate={handleCreateSqeRecord}
                onUpdate={handleUpdateSqeRecord}
                onDelete={handleDeleteSqeRecord}
              />

              <EnvironmentalMonitoringPanel
                records={environmentalMonitoring}
                onCreate={handleCreateEnvironmentalMonitoring}
                onUpdate={handleUpdateEnvironmentalMonitoring}
                onDelete={handleDeleteEnvironmentalMonitoring}
              />

              <SafetyInspectionsPanel
                inspections={safetyInspections}
                onCreate={handleCreateSafetyInspection}
                onUpdate={handleUpdateSafetyInspection}
                onDelete={handleDeleteSafetyInspection}
              />

              <DefectsPanel
                defects={defects}
                onCreate={handleCreateDefect}
                onUpdate={handleUpdateDefect}
                onDelete={handleDeleteDefect}
              />

              <RfisPanel
                rfis={rfis}
                onCreate={handleCreateRfi}
                onUpdate={handleUpdateRfi}
                onDelete={handleDeleteRfi}
              />

              <DocumentsPanel
                documents={documents}
                onCreate={handleCreateDocument}
                onUpdate={handleUpdateDocument}
                onDelete={handleDeleteDocument}
              />

              <CorrespondencePanel
                items={correspondence}
                onCreate={handleCreateCorrespondence}
                onUpdate={handleUpdateCorrespondence}
                onDelete={handleDeleteCorrespondence}
              />
            </>
          )}

          {activeTab === "site" && (
            <>
              <SiteVisitsPanel
                siteVisits={siteVisits}
                photosByVisit={groupPhotosByVisit(sitePhotos)}
                allPhotos={sitePhotos}
                onCreate={handleCreateSiteVisit}
                onUpdate={handleUpdateSiteVisit}
                onDelete={handleDeleteSiteVisit}
                onUploadPhotos={handleUploadSiteVisitPhotos}
                onDeletePhoto={handleDeleteSiteVisitPhoto}
                onSyncPhotoToArchive={handleSyncPhotoToArchive}
              />

              <EnquiriesPanel
                enquiries={communityEnquiries}
                onCreate={handleCreateCommunityEnquiry}
                onUpdate={handleUpdateCommunityEnquiry}
                onDelete={handleDeleteCommunityEnquiry}
              />

              <AttachmentsPanel
                attachments={attachments}
                onUpload={handleUploadAttachment}
                onDelete={handleDeleteAttachment}
              />

              <ArchiveLinksPanel
                links={archiveLinks}
                onCreate={handleCreateArchiveLink}
                onDelete={handleDeleteArchiveLink}
              />

              <MonthlyReportsPanel
                reports={reports}
                currentUser={user}
                onCreate={handleCreateReport}
                onUpdate={handleUpdateReport}
                onDelete={handleDeleteReport}
              />

              <LessonsLearnedPanel
                lessons={lessons}
                onCreate={handleCreateLesson}
                onUpdate={handleUpdateLesson}
                onDelete={handleDeleteLesson}
              />

              <TrainingRecordsPanel
                items={trainingRecords}
                onCreate={handleCreateTrainingRecord}
                onUpdate={handleUpdateTrainingRecord}
                onDelete={handleDeleteTrainingRecord}
              />

              <ToolboxTalksPanel
                talks={toolboxTalks}
                onCreate={handleCreateToolboxTalk}
                onUpdate={handleUpdateToolboxTalk}
                onDelete={handleDeleteToolboxTalk}
              />
            </>
          )}

          {activeTab === "ai" && project && (
            <AiAssistantPanel
              title="AI Assistant"
              description="Ask questions about this project — its budget, schedule, risks, and open items across every register. Powered by a locally-hosted Ollama model."
              suggestedQuestion="Summarize this project's health and its most pressing open items"
              onAsk={(question) => askProjectAi(project.id, question)}
            />
          )}
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

function groupPhotosByVisit(
  photos: SiteVisitPhoto[]
): Record<string, SiteVisitPhoto[]> {
  const grouped: Record<string, SiteVisitPhoto[]> = {};
  for (const photo of photos) {
    (grouped[photo.siteVisitId] ??= []).push(photo);
  }
  return grouped;
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
