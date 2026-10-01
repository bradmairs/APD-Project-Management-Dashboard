import { Project, Variation } from "../types";
import { isProjectOverdue } from "../statusMeta";
import { formatCurrency } from "../format";
import { effectiveBudget } from "../variations";

export default function StatCards({
  projects,
  variations,
}: {
  projects: Project[];
  variations: Variation[];
}) {
  const total = projects.length;
  const inConstruction = projects.filter(
    (p) => p.status === "CONSTRUCTION"
  ).length;

  const overdue = projects.filter(isProjectOverdue).length;

  const variationsByProject = new Map<string, Variation[]>();
  for (const v of variations) {
    const list = variationsByProject.get(v.projectId);
    if (list) list.push(v);
    else variationsByProject.set(v.projectId, [v]);
  }

  // The Latest Approved Budget when a project has one, since it already
  // reflects every negotiated change; otherwise the Original Budget as
  // revised by approved Variations — see variations.ts's effectiveBudget,
  // the same figure Project Health and the Cumulative Spend charts use.
  const totalApprovedBudget = projects.reduce(
    (sum, p) => sum + (effectiveBudget(p, variationsByProject.get(p.id) ?? []) ?? 0),
    0
  );

  const cards = [
    { label: "Total Projects", value: total },
    { label: "In Construction", value: inConstruction },
    { label: "Overdue", value: overdue, alert: overdue > 0 },
    { label: "Total Approved Budget", value: formatCurrency(totalApprovedBudget) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
        >
          <div className="text-sm text-slate-500 dark:text-slate-400">{c.label}</div>
          <div
            className={`text-2xl font-semibold mt-1 ${
              "alert" in c && c.alert
                ? "text-red-600 dark:text-red-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
