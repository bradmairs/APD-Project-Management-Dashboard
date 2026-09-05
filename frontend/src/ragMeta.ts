import { RagStatus } from "./types";

export const RAG_LABELS: Record<RagStatus, string> = {
  GREEN: "Green",
  AMBER: "Amber",
  RED: "Red",
};

export const RAG_COLORS: Record<RagStatus, string> = {
  GREEN: "bg-green-100 text-green-800",
  AMBER: "bg-amber-100 text-amber-800",
  RED: "bg-red-100 text-red-800",
};

export const ALL_RAG_STATUSES: RagStatus[] = ["GREEN", "AMBER", "RED"];
