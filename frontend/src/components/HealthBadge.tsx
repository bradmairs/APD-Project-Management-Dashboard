import { ProjectHealth } from "../health";
import { RagStatus } from "../types";
import { RAG_COLORS, RAG_LABELS } from "../ragMeta";

interface Props {
  health: ProjectHealth;
  detailed?: boolean;
}

export default function HealthBadge({ health, detailed }: Props) {
  if (!detailed) {
    return (
      <span
        title={`Schedule: ${RAG_LABELS[health.schedule]} · Budget: ${RAG_LABELS[health.budget]} · Risk: ${RAG_LABELS[health.risk]}`}
        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${RAG_COLORS[health.overall]}`}
      >
        {RAG_LABELS[health.overall]}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Dot label="Schedule" status={health.schedule} />
      <Dot label="Budget" status={health.budget} />
      <Dot label="Risk" status={health.risk} />
    </div>
  );
}

function Dot({ label, status }: { label: string; status: RagStatus }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${RAG_COLORS[status]}`}
    >
      {label}: {RAG_LABELS[status]}
    </span>
  );
}
