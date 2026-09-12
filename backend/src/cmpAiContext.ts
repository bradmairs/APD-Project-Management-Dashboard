import { cmpPrisma } from "./cmpPrisma";

// CMP's counterpart to aiContext.ts — same "concise, bounded-size text
// summary for an LLM prompt" framing, but built on CMP's own database and
// shaped around a design consultancy's actual registers (design stages,
// drawings, design reviews, fee claims) rather than GVW's construction
// registers. See aiContext.ts for the fuller rationale this mirrors.

// Mirrors aiContext.ts's fmtDate exactly (including the day-count
// annotation that exists specifically because a small local Ollama model
// is unreliable at date arithmetic) — duplicated rather than imported
// since aiContext.ts's copy is private to that module and the two are
// small enough that sharing isn't worth a cross-module dependency.
function fmtDate(d: Date | null | undefined, now: Date = new Date()): string {
  if (!d) return "—";
  const date = new Date(d);
  const iso = date.toISOString().substring(0, 10);
  const days = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return `${iso} (today)`;
  if (days > 0) return `${iso} (in ${days} day${days === 1 ? "" : "s"})`;
  const past = Math.abs(days);
  return `${iso} (${past} day${past === 1 ? "" : "s"} ago)`;
}

const CMP_STATUSES_EXEMPT_FROM_OVERDUE = ["COMPLETE", "CANCELLED"];

function fmtTargetIssue(
  project: { targetIssueDate: Date | null; status: string },
  now: Date = new Date()
): string {
  const base = fmtDate(project.targetIssueDate, now);
  if (
    !project.targetIssueDate ||
    CMP_STATUSES_EXEMPT_FROM_OVERDUE.includes(project.status) ||
    new Date(project.targetIssueDate) >= now
  ) {
    return base;
  }
  return `${base} — OVERDUE`;
}

function fmtMoney(d: number | null | undefined): string {
  if (d === null || d === undefined) return "—";
  return `$${Number(d).toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
}

export async function buildCmpProjectContext(projectId: string): Promise<string | null> {
  const project = await cmpPrisma.cmpProject.findUnique({
    where: { id: projectId },
    include: {
      designStages: { orderBy: { sortOrder: "asc" } },
      drawings: true,
      designReviews: { orderBy: { reviewDate: "desc" }, take: 5 },
      feeClaims: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) return null;

  const now = new Date();
  const claimedToDate = project.feeClaims
    .filter((c) => c.status !== "DRAFT")
    .reduce((sum, c) => sum + Number(c.claimedAmount), 0);
  const approvedToDate = project.feeClaims
    .filter((c) => c.approvedAmount !== null)
    .reduce((sum, c) => sum + Number(c.approvedAmount), 0);

  const lines: string[] = [];
  lines.push(`Today's date: ${now.toISOString().substring(0, 10)}`);
  lines.push(`Project: ${project.name} (${project.projectNumber ?? "no ref"})`);
  lines.push(`Client: ${project.clientName}`);
  lines.push(`Status: ${project.status}`);
  if (project.discipline) lines.push(`Discipline: ${project.discipline}`);
  if (project.description) lines.push(`Description: ${project.description}`);
  lines.push(`Start date: ${fmtDate(project.startDate, now)}`);
  lines.push(`Target issue date: ${fmtTargetIssue(project, now)}`);
  lines.push(`Fee budget: ${fmtMoney(project.feeBudget ? Number(project.feeBudget) : null)}`);
  lines.push(`Hours budget: ${project.hoursBudget ?? "—"}`);
  lines.push(`Fee claimed to date: ${fmtMoney(claimedToDate)}`);
  lines.push(`Fee approved to date: ${fmtMoney(approvedToDate)}`);
  lines.push("");

  function section(title: string, items: string[]) {
    lines.push(`${title} (${items.length}):`);
    if (items.length === 0) {
      lines.push("  none");
    } else {
      items.forEach((i) => lines.push(`  - ${i}`));
    }
    lines.push("");
  }

  section(
    "Design stages",
    project.designStages.map((s) => {
      const overdue =
        s.targetDate && s.status !== "COMPLETE" && new Date(s.targetDate) < now
          ? " — OVERDUE"
          : "";
      return `${s.stage} [${s.status}, ${s.percentComplete}% complete], target ${fmtDate(s.targetDate, now)}${overdue}`;
    })
  );
  section(
    "Drawing register",
    (() => {
      const byStatus = new Map<string, number>();
      project.drawings.forEach((d) => byStatus.set(d.status, (byStatus.get(d.status) ?? 0) + 1));
      return Array.from(byStatus.entries()).map(([status, count]) => `${count} drawing(s) — ${status}`);
    })()
  );
  section(
    "Recent design reviews",
    project.designReviews.map(
      (r) => `${fmtDate(r.reviewDate, now)}: ${r.outcome} (reviewer: ${r.reviewerName})`
    )
  );
  section(
    "Fee claims awaiting approval",
    project.feeClaims
      .filter((c) => c.status === "SUBMITTED")
      .map((c) => `${c.claimNumber}: ${fmtMoney(Number(c.claimedAmount))} submitted ${fmtDate(c.dateSubmitted, now)}`)
  );

  return lines.join("\n");
}

export async function buildCmpPortfolioContext(): Promise<string> {
  const projects = await cmpPrisma.cmpProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      designStages: { select: { status: true, targetDate: true } },
      feeClaims: { select: { claimedAmount: true, approvedAmount: true, status: true } },
      designReviews: { select: { outcome: true }, orderBy: { reviewDate: "desc" }, take: 5 },
    },
  });

  const now = new Date();
  const statusCounts = new Map<string, number>();
  projects.forEach((p) => statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1));

  const totalFeeBudget = projects.reduce((sum, p) => sum + (p.feeBudget ? Number(p.feeBudget) : 0), 0);
  const totalClaimed = projects.reduce(
    (sum, p) =>
      sum + p.feeClaims.filter((c) => c.status !== "DRAFT").reduce((s, c) => s + Number(c.claimedAmount), 0),
    0
  );

  const lines: string[] = [];
  lines.push(`Today's date: ${now.toISOString().substring(0, 10)}`);
  lines.push(`Portfolio: ${projects.length} CMP design commissions`);
  lines.push(
    "By status: " + Array.from(statusCounts.entries()).map(([s, c]) => `${s}=${c}`).join(", ")
  );
  lines.push(`Total fee budget across portfolio: ${fmtMoney(totalFeeBudget)}`);
  lines.push(`Total fee claimed to date across portfolio: ${fmtMoney(totalClaimed)}`);
  lines.push("");
  lines.push("Per-project summary:");
  projects.forEach((p) => {
    const flags: string[] = [];
    const overdueStages = p.designStages.filter(
      (s) => s.status !== "COMPLETE" && s.targetDate && new Date(s.targetDate) < now
    ).length;
    const submittedClaims = p.feeClaims.filter((c) => c.status === "SUBMITTED").length;
    const rejectedReviews = p.designReviews.filter((r) => r.outcome === "REJECTED").length;
    if (overdueStages) flags.push(`${overdueStages} overdue design stage(s)`);
    if (submittedClaims) flags.push(`${submittedClaims} fee claim(s) awaiting approval`);
    if (rejectedReviews) flags.push(`${rejectedReviews} recent rejected design review(s)`);
    const claimed = p.feeClaims
      .filter((c) => c.status !== "DRAFT")
      .reduce((s, c) => s + Number(c.claimedAmount), 0);
    lines.push(
      `- ${p.name} [${p.status}]: fee budget ${fmtMoney(p.feeBudget ? Number(p.feeBudget) : null)}, claimed ${fmtMoney(claimed)}, target issue ${fmtTargetIssue(p, now)}${flags.length ? ` — ${flags.join(", ")}` : ""}`
    );
  });

  return lines.join("\n");
}
