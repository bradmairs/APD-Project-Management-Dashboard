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

const STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "PAID"];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  PAID: "Paid",
};

function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value as string) : null;
}

function parseAmount(value: unknown): number | null {
  return value === "" || value == null ? null : Number(value);
}

const projectFeeClaimsRouter = Router({ mergeParams: true });

type ProjectParams = { id: string };

projectFeeClaimsRouter.get("/", async (req: Request<ProjectParams>, res: Response) => {
  const claims = await cmpPrisma.feeClaim.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(claims);
});

projectFeeClaimsRouter.post("/", async (req: Request<ProjectParams>, res: Response) => {
  const project = await cmpPrisma.cmpProject.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: "Project not found" });

  const { claimNumber, stage, periodEnding, claimedAmount, status, notes } = req.body as Record<
    string,
    unknown
  >;

  if (typeof claimNumber !== "string" || !claimNumber.trim()) {
    return res.status(400).json({ error: "Claim number is required" });
  }
  if (stage !== undefined && stage !== null && !STAGES.includes(stage as string)) {
    return res.status(400).json({ error: "Invalid stage" });
  }
  const claimed = parseAmount(claimedAmount);
  if (claimed === null || Number.isNaN(claimed)) {
    return res.status(400).json({ error: "Claimed amount is required" });
  }
  if (status !== undefined && !STATUSES.includes(status as string)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const claim = await cmpPrisma.feeClaim.create({
    data: {
      projectId: req.params.id,
      claimNumber: claimNumber.trim(),
      stage: (stage as any) || null,
      periodEnding: parseDate(periodEnding) ?? null,
      claimedAmount: claimed,
      status: (status as any) ?? "DRAFT",
      notes: (notes as string) || null,
      createdById: req.user!.sub,
      createdByName: req.user!.name,
    },
  });

  await logCmpActivity({
    projectId: project.id,
    projectName: project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `raised fee claim "${claim.claimNumber}"`,
  });

  res.status(201).json(claim);
});

export const feeClaimsRouter = Router();

feeClaimsRouter.put("/:id", async (req, res) => {
  const before = await cmpPrisma.feeClaim.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!before) return res.status(404).json({ error: "Fee claim not found" });

  const {
    claimNumber,
    stage,
    periodEnding,
    claimedAmount,
    approvedAmount,
    status,
    dateSubmitted,
    dateApproved,
    datePaid,
    notes,
  } = req.body as Record<string, unknown>;

  const data: Record<string, unknown> = {};

  if (claimNumber !== undefined) {
    if (typeof claimNumber !== "string" || !claimNumber.trim()) {
      return res.status(400).json({ error: "Claim number is required" });
    }
    data.claimNumber = claimNumber.trim();
  }
  if (stage !== undefined) {
    if (stage !== null && !STAGES.includes(stage as string)) {
      return res.status(400).json({ error: "Invalid stage" });
    }
    data.stage = stage || null;
  }
  const period = parseDate(periodEnding);
  if (period !== undefined) data.periodEnding = period;
  if (claimedAmount !== undefined) {
    const claimed = parseAmount(claimedAmount);
    if (claimed === null || Number.isNaN(claimed)) {
      return res.status(400).json({ error: "Claimed amount is required" });
    }
    data.claimedAmount = claimed;
  }
  if (approvedAmount !== undefined) data.approvedAmount = parseAmount(approvedAmount);
  if (status !== undefined) {
    if (!STATUSES.includes(status as string)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    data.status = status;
  }
  const submitted = parseDate(dateSubmitted);
  if (submitted !== undefined) data.dateSubmitted = submitted;
  const approved = parseDate(dateApproved);
  if (approved !== undefined) data.dateApproved = approved;
  const paid = parseDate(datePaid);
  if (paid !== undefined) data.datePaid = paid;
  if (notes !== undefined) data.notes = notes || null;

  try {
    const claim = await cmpPrisma.feeClaim.update({ where: { id: req.params.id }, data });
    const action =
      status !== undefined && status !== before.status
        ? `marked fee claim "${before.claimNumber}" as ${STATUS_LABELS[status as string] ?? status}`
        : `updated fee claim "${before.claimNumber}"`;
    await logCmpActivity({
      projectId: before.project.id,
      projectName: before.project.name,
      userId: req.user!.sub,
      userName: req.user!.name,
      action,
    });
    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: "Unable to update fee claim" });
  }
});

feeClaimsRouter.delete("/:id", async (req, res) => {
  const claim = await cmpPrisma.feeClaim.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!claim) return res.status(404).json({ error: "Fee claim not found" });

  await logCmpActivity({
    projectId: claim.project.id,
    projectName: claim.project.name,
    userId: req.user!.sub,
    userName: req.user!.name,
    action: `deleted fee claim "${claim.claimNumber}"`,
  });
  await cmpPrisma.feeClaim.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default projectFeeClaimsRouter;
