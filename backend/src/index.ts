import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);

app.listen(port, () => {
  console.log(`APD dashboard API listening on port ${port}`);
});
