import { cmpPrisma } from "./cmpPrisma";

interface LogParams {
  projectId: string | null;
  projectName: string;
  userId: string | null;
  userName: string;
  action: string;
}

// CMP's own activity log, in CMP's own database — mirrors backend/src/
// activityLog.ts's logActivity, kept as a separate function (rather than a
// shared one parameterized by client) since the two write to entirely
// different Prisma clients/databases.
export function logCmpActivity(params: LogParams) {
  return cmpPrisma.cmpActivityLog.create({ data: params });
}
