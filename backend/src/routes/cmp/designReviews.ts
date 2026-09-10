import { Request, Response, Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";
import { logCmpActivity } from "../../cmpActivityLog";

const STAGES = [
  "CONCEPT_DESIGN",
  "PRELIMINARY_DESIGN",
  "DETAILED_DESIGN",
  "TENDER_DOCUMENTATION",
  "CONSTRUCTION_ISSUE",
  "AS_BUILT",
];

const OUTCOMES = ["APPROVED", "APPROVED_WITH_COMMENTS", "REJECTED"];

function parseDate(value: unknown): Date {
  return value ? new Date(value as string) : new Date();
}

const projectDesignReviewsRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectDesignReviewsRouter.get("/", async (req: Request<ProjectParams>, res: Response) => {
  const reviews = await cmpPrisma.designReview.findMany({
    where: { projectId: req.params.id },
    orderBy: { reviewDate: "desc" },
  });
  res.json(reviews);
});

projectDesignReviewsRouter.post("/", async (req: Request<ProjectParams>, res: Response) => {
  const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { stage, reviewDate, reviewerName, outcome, comments } = req.body as Record<
    string,
    unknown
  >;

  if (stage !== undefined && stage !== null && !STAGES.includes(stage as string)) {
    return res.status(400).json({ error: "Invalid stage" });
  }
  if (typeof reviewerName !== "string" || !reviewerName.trim()) {
    return res.status(400).json({ error: "Reviewer name is required" });
  }
  if (typeof outcome !== "string" || !OUTCOMES.includes(outcome)) {
    return res.status(400).json({ error: "A valid outcome is required" });
  }

  const review = await cmpPrisma.designReview.create({
    data: {
      projectId: req.params.id,
      stage: (stage as any) || null,
      reviewDate: parseDate(reviewDate),
      reviewerName: reviewerName.trim(),
      outcome: outcome as any,
      comments: (comments as string) || null,
      createdById: req.user!.sub,
      createdByName: req.user!.name,
    },
  });

  await logCmpActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `logged a design review by ${review.reviewerName}`,
  });

  res.status(201).json(review);
});

export const designReviewsRouter = Router();

designReviewsRouter.put("/:id", async (req, res) => {
  const before = await cmpPrisma.designReview.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Design review not found" });

  const { stage, reviewDate, reviewerName, outcome, comments } = req.body as Record<
    string,
    unknown
  >;
  const data: Record<string, unknown> = {};

  if (stage !== undefined) {
    if (stage !== null && !STAGES.includes(stage as string)) {
      return res.status(400).json({ error: "Invalid stage" });
    }
    data.stage = stage || null;
  }
  if (reviewDate !== undefined) data.reviewDate = parseDate(reviewDate);
  if (reviewerName !== undefined) {
    if (typeof reviewerName !== "string" || !reviewerName.trim()) {
      return res.status(400).json({ error: "Reviewer name is required" });
    }
    data.reviewerName = reviewerName.trim();
  }
  if (outcome !== undefined) {
    if (!OUTCOMES.includes(outcome as string)) {
      return res.status(400).json({ error: "A valid outcome is required" });
    }
    data.outcome = outcome;
  }
  if (comments !== undefined) data.comments = comments || null;

  try {
    const review = await cmpPrisma.designReview.update({ where: { id: req.params.id }, data });
    await logCmpActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action: `updated the design review by ${before.reviewerName}`,
    });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: "Unable to update design review" });
  }
});

designReviewsRouter.delete("/:id", async (req, res) => {
  const review = await cmpPrisma.designReview.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!review) return res.status(404).json({ error: "Design review not found" });

  await logCmpActivity({
    projectId: review.project.id,
    projectName: review.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted the design review by ${review.reviewerName}`,
  });
  await cmpPrisma.designReview.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default projectDesignReviewsRouter;
