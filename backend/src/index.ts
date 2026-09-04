import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import { tasksRouter } from "./routes/tasks";
import activityRouter from "./routes/activity";
import { requireAuth } from "./middleware/requireAuth";

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

app.listen(port, () => {
  console.log(`APD dashboard API listening on port ${port}`);
});
