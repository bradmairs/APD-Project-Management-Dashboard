import { Project } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../statusMeta";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: string | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function isOverdue(project: Project): boolean {
  if (!project.targetCompletionDate) return false;
  if (project.status === "COMPLETE" || project.status === "CANCELLED")
    return false;
  return new Date(project.targetCompletionDate) < new Date();
}

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectTable({ projects, onEdit, onDelete }: Props) {
  if (projects.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12 bg-white rounded-lg border border-slate-200">
        No projects match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Project
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Manager
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Location
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600">
              Budget
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Target Completion
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {project.name}
                </div>
                {project.assetType && (
                  <div className="text-xs text-slate-500">
                    {project.assetType}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[project.status]
                  }`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {project.projectManager || "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {project.location || "—"}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">
                {formatCurrency(project.budget)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    isOverdue(project) ? "text-red-600 font-medium" : "text-slate-700"
                  }
                >
                  {formatDate(project.targetCompletionDate)}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(project)}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
