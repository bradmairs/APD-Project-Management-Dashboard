import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import { tasksRouter } from "./routes/tasks";
import { reportsRouter } from "./routes/monthlyReports";
import { milestonesRouter } from "./routes/milestones";
import { cashFlowRouter } from "./routes/cashFlow";
import { siteVisitsRouter } from "./routes/siteVisits";
import { siteVisitPhotosRouter } from "./routes/siteVisitPhotos";
import { variationsRouter } from "./routes/variations";
import { risksRouter } from "./routes/risks";
import { actionItemsRouter } from "./routes/actionItems";
import { stakeholdersRouter } from "./routes/stakeholders";
import { permitsRouter } from "./routes/permits";
import { lessonsLearnedRouter } from "./routes/lessonsLearned";
import { sqeRouter } from "./routes/sqe";
import { eotClaimsRouter } from "./routes/eotClaims";
import { checklistItemsRouter } from "./routes/checklistItems";
import { defectsRouter } from "./routes/defects";
import { paymentClaimsRouter } from "./routes/paymentClaims";
import { insuranceWarrantiesRouter } from "./routes/insuranceWarranties";
import { rfisRouter } from "./routes/rfis";
import { documentsRouter } from "./routes/documents";
import { communityEnquiriesRouter } from "./routes/communityEnquiries";
import { subcontractorsRouter } from "./routes/subcontractors";
import { meetingMinutesRouter } from "./routes/meetingMinutes";
import { correspondenceRouter } from "./routes/correspondence";
import { trainingRecordsRouter } from "./routes/trainingRecords";
import { performanceReviewsRouter } from "./routes/performanceReviews";
import { toolboxTalksRouter } from "./routes/toolboxTalks";
import { environmentalMonitoringRouter } from "./routes/environmentalMonitoring";
import activityRouter from "./routes/activity";
import attachmentsRouter from "./routes/attachments";
import usersRouter from "./routes/users";
import { requireAuth } from "./middleware/requireAuth";
import { requireAdmin } from "./middleware/requireAdmin";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", requireAuth, projectsRouter);
app.use("/api/tasks", requireAuth, tasksRouter);
app.use("/api/reports", requireAuth, reportsRouter);
app.use("/api/milestones", requireAuth, milestonesRouter);
app.use("/api/cashflow", requireAuth, cashFlowRouter);
app.use("/api/site-visits", requireAuth, siteVisitsRouter);
app.use("/api/site-visit-photos", requireAuth, siteVisitPhotosRouter);
app.use("/api/variations", requireAuth, variationsRouter);
app.use("/api/risks", requireAuth, risksRouter);
app.use("/api/action-items", requireAuth, actionItemsRouter);
app.use("/api/stakeholders", requireAuth, stakeholdersRouter);
app.use("/api/permits", requireAuth, permitsRouter);
app.use("/api/lessons-learned", requireAuth, lessonsLearnedRouter);
app.use("/api/sqe", requireAuth, sqeRouter);
app.use("/api/eot-claims", requireAuth, eotClaimsRouter);
app.use("/api/checklist-items", requireAuth, checklistItemsRouter);
app.use("/api/defects", requireAuth, defectsRouter);
app.use("/api/payment-claims", requireAuth, paymentClaimsRouter);
app.use("/api/insurance-warranties", requireAuth, insuranceWarrantiesRouter);
app.use("/api/rfis", requireAuth, rfisRouter);
app.use("/api/documents", requireAuth, documentsRouter);
app.use("/api/community-enquiries", requireAuth, communityEnquiriesRouter);
app.use("/api/subcontractors", requireAuth, subcontractorsRouter);
app.use("/api/meeting-minutes", requireAuth, meetingMinutesRouter);
app.use("/api/correspondence", requireAuth, correspondenceRouter);
app.use("/api/training-records", requireAuth, trainingRecordsRouter);
app.use("/api/performance-reviews", requireAuth, performanceReviewsRouter);
app.use("/api/toolbox-talks", requireAuth, toolboxTalksRouter);
app.use("/api/environmental-monitoring", requireAuth, environmentalMonitoringRouter);
app.use("/api/activity", requireAuth, activityRouter);
app.use("/api/attachments", requireAuth, attachmentsRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);

// Catches multer's file-size/file-type rejections (thrown before any route
// handler runs) and reports them as clean JSON instead of Express's default
// HTML error page.
const handleUploadErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};
app.use(handleUploadErrors);

app.listen(port, () => {
  console.log(`APD dashboard API listening on port ${port}`);
});
