import { Project } from "../types";
import { isProjectOverdue } from "../statusMeta";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StatCards({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const inConstruction = projects.filter(
    (p) => p.status === "CONSTRUCTION"
  ).length;

  const overdue = projects.filter(isProjectOverdue).length;

  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.budget ? Number(p.budget) : 0),
    0
  );

  const cards = [
    { label: "Total Projects", value: total },
    { label: "In Construction", value: inConstruction },
    { label: "Overdue", value: overdue, alert: overdue > 0 },
    { label: "Total Budget", value: formatCurrency(totalBudget) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
        >
          <div className="text-sm text-slate-500">{c.label}</div>
          <div
            className={`text-2xl font-semibold mt-1 ${
              "alert" in c && c.alert ? "text-red-600" : "text-slate-900"
            }`}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
