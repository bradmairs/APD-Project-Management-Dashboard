import { ContractPartyType, ContractStatus } from "./types";

export const ALL_CONTRACT_PARTY_TYPES: ContractPartyType[] = ["CONSULTANT", "CONTRACTOR"];

export const CONTRACT_PARTY_TYPE_LABELS: Record<ContractPartyType, string> = {
  CONSULTANT: "Consultant",
  CONTRACTOR: "Contractor",
};

export const CONTRACT_PARTY_TYPE_COLORS: Record<ContractPartyType, string> = {
  CONSULTANT: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  CONTRACTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export const ALL_CONTRACT_STATUSES: ContractStatus[] = ["ACTIVE", "COMPLETE", "TERMINATED"];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  ACTIVE: "Active",
  COMPLETE: "Complete",
  TERMINATED: "Terminated",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  COMPLETE: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  TERMINATED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export const CONTRACT_FORM_SUGGESTIONS = [
  "AS4000-1997",
  "AS4300",
  "AS2124",
  "NEC3",
  "NEC4",
  "Standard Consultancy Agreement",
];

const STATUS_RANK: Record<ContractStatus, number> = {
  ACTIVE: 0,
  COMPLETE: 1,
  TERMINATED: 2,
};

// Sorts currently-live contracts first, mirroring
// subcontractorMeta.ts's subcontractorStatusRank.
export function contractStatusRank(status: ContractStatus): number {
  return STATUS_RANK[status];
}
