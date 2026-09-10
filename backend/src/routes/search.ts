import { Request, Response, Router } from "express";
import { prisma } from "../prisma";

export const searchRouter = Router();

const RESULTS_PER_TYPE = 5;

interface SearchResult {
  type: string;
  typeLabel: string;
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  subtitle: string | null;
  date: Date | null;
}

// Curated, cross-register keyword search — not a full-text index over every
// model, but the registers a user is most likely to hunt for something in
// by number, name, or title (RFI/document/claim numbers, a contractor's
// name, a correspondence subject). Each category is capped and run in
// parallel; results are grouped by type on the frontend rather than ranked
// against each other, so there's no need for a single relevance score here.
searchRouter.get("/", async (req: Request, res: Response) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2) {
    return res.json({ query: q, results: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };
  const projectSelect = { select: { id: true, name: true } } as const;

  const [
    projects,
    risks,
    actions,
    rfis,
    defects,
    variations,
    documents,
    correspondence,
    subcontractors,
    tenderPackages,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        OR: [
          { name: contains },
          { description: contains },
          { location: contains },
          { contractor: contains },
          { bpRefNo: contains },
        ],
      },
      take: RESULTS_PER_TYPE,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.risk.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.actionItem.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rfi.findMany({
      where: { OR: [{ rfiNumber: contains }, { subject: contains }, { question: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.defectItem.findMany({
      where: { OR: [{ title: contains }, { description: contains }, { location: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.variation.findMany({
      where: { OR: [{ title: contains }, { description: contains }, { reference: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.documentRecord.findMany({
      where: { OR: [{ documentNumber: contains }, { title: contains }, { description: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.correspondence.findMany({
      where: { OR: [{ subject: contains }, { summary: contains }, { correspondent: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.subcontractor.findMany({
      where: { OR: [{ companyName: contains }, { trade: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenderPackage.findMany({
      where: { OR: [{ title: contains }, { packageNumber: contains }, { description: contains }] },
      include: { project: projectSelect },
      take: RESULTS_PER_TYPE,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const results: SearchResult[] = [
    ...projects.map((p) => ({
      type: "project",
      typeLabel: "Project",
      id: p.id,
      projectId: p.id,
      projectName: p.name,
      title: p.name,
      subtitle: p.location,
      date: p.createdAt,
    })),
    ...risks.map((r) => ({
      type: "risk",
      typeLabel: r.type === "OPPORTUNITY" ? "Opportunity" : "Risk",
      id: r.id,
      projectId: r.project.id,
      projectName: r.project.name,
      title: r.title,
      subtitle: r.category,
      date: r.createdAt,
    })),
    ...actions.map((a) => ({
      type: "action",
      typeLabel: a.type === "DECISION" ? "Decision" : "Action",
      id: a.id,
      projectId: a.project.id,
      projectName: a.project.name,
      title: a.title,
      subtitle: a.ownerName,
      date: a.createdAt,
    })),
    ...rfis.map((r) => ({
      type: "rfi",
      typeLabel: "RFI",
      id: r.id,
      projectId: r.project.id,
      projectName: r.project.name,
      title: `${r.rfiNumber}: ${r.subject}`,
      subtitle: null,
      date: r.createdAt,
    })),
    ...defects.map((d) => ({
      type: "defect",
      typeLabel: "Defect",
      id: d.id,
      projectId: d.project.id,
      projectName: d.project.name,
      title: d.title,
      subtitle: d.location,
      date: d.createdAt,
    })),
    ...variations.map((v) => ({
      type: "variation",
      typeLabel: "Variation",
      id: v.id,
      projectId: v.project.id,
      projectName: v.project.name,
      title: v.title,
      subtitle: v.reference,
      date: v.createdAt,
    })),
    ...documents.map((d) => ({
      type: "document",
      typeLabel: "Document",
      id: d.id,
      projectId: d.project.id,
      projectName: d.project.name,
      title: `${d.documentNumber}: ${d.title}`,
      subtitle: null,
      date: d.createdAt,
    })),
    ...correspondence.map((c) => ({
      type: "correspondence",
      typeLabel: "Correspondence",
      id: c.id,
      projectId: c.project.id,
      projectName: c.project.name,
      title: c.subject,
      subtitle: c.correspondent,
      date: c.createdAt,
    })),
    ...subcontractors.map((s) => ({
      type: "subcontractor",
      typeLabel: "Subcontractor",
      id: s.id,
      projectId: s.project.id,
      projectName: s.project.name,
      title: s.companyName,
      subtitle: s.trade,
      date: s.createdAt,
    })),
    ...tenderPackages.map((t) => ({
      type: "tender",
      typeLabel: "Tender Package",
      id: t.id,
      projectId: t.project.id,
      projectName: t.project.name,
      title: t.title,
      subtitle: t.packageNumber,
      date: t.createdAt,
    })),
  ];

  res.json({ query: q, results });
});
