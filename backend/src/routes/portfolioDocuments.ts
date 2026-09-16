import fs from "fs";
import { Router } from "express";
import { prisma } from "../prisma";
import { logActivity } from "../activityLog";
import { portfolioDocumentFilePath, portfolioDocumentUpload } from "../upload";

// Files that aren't scoped to any one project — see PortfolioDocument in
// schema.prisma. A top-level router (unlike attachments.ts's project-nested
// upload route) since there's no project id in these URLs at all.
const router = Router();

router.get("/", async (_req, res) => {
  const documents = await prisma.portfolioDocument.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(documents);
});

router.post("/", portfolioDocumentUpload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "A title is required" });
  }

  const document = await prisma.portfolioDocument.create({
    data: {
      title,
      category: (req.body.category as string)?.trim() || null,
      description: (req.body.description as string)?.trim() || null,
      storedFilename: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedById: req.user!.sub,
      uploadedByName: req.user!.name,
    },
  });

  await logActivity({
    projectId: null,
    projectName: "Portfolio Documents",
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `uploaded the document "${document.title}"`,
  });

  res.status(201).json(document);
});

router.get("/:id/file", async (req, res) => {
  const document = await prisma.portfolioDocument.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: "Document not found" });

  const filePath = portfolioDocumentFilePath(document.storedFilename);
  res.download(filePath, document.originalFilename, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "File not found on disk" });
    }
  });
});

router.delete("/:id", async (req, res) => {
  const document = await prisma.portfolioDocument.findUnique({ where: { id: req.params.id } });
  if (!document) return res.status(404).json({ error: "Document not found" });

  await prisma.portfolioDocument.delete({ where: { id: req.params.id } });

  const filePath = portfolioDocumentFilePath(document.storedFilename);
  fs.unlink(filePath, () => {});

  await logActivity({
    projectId: null,
    projectName: "Portfolio Documents",
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted the document "${document.title}"`,
  });

  res.status(204).send();
});

export default router;
