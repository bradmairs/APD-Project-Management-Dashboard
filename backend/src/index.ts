import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import { tasksRouter } from "./routes/tasks";
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
