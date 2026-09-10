// API calls for CMP's design-consultancy dashboard — kept in its own
// module (rather than folded into api.ts) the same way cmpTypes.ts is kept
// separate from types.ts, since these hit an entirely different set of
// backend routes (/api/cmp/...) backed by CMP's own database.
import {
  CmpActivityLogEntry,
  CmpMeetingMinutes,
  CmpMeetingMinutesInput,
  CmpProject,
  CmpProjectInput,
  DesignReview,
  DesignReviewInput,
  DesignStage,
  DesignStageInput,
  Drawing,
  DrawingInput,
  DrawingRevision,
  DrawingRevisionInput,
  FeeClaim,
  FeeClaimInput,
} from "./cmpTypes";

const API_BASE = "/api/cmp";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function getCmpProjects(): Promise<CmpProject[]> {
  return fetch(`${API_BASE}/projects`).then((res) => handle(res));
}

export function getCmpProject(id: string): Promise<CmpProject> {
  return fetch(`${API_BASE}/projects/${id}`).then((res) => handle(res));
}

export function createCmpProject(data: Partial<CmpProjectInput>): Promise<CmpProject> {
  return fetch(`${API_BASE}/projects`, jsonRequest("POST", data)).then((res) => handle(res));
}

export function updateCmpProject(
  id: string,
  data: Partial<CmpProjectInput>
): Promise<CmpProject> {
  return fetch(`${API_BASE}/projects/${id}`, jsonRequest("PUT", data)).then((res) => handle(res));
}

export function deleteCmpProject(id: string): Promise<void> {
  return fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function getCmpProjectActivity(projectId: string): Promise<CmpActivityLogEntry[]> {
  return fetch(`${API_BASE}/projects/${projectId}/activity`).then((res) => handle(res));
}

export function createDesignStage(
  projectId: string,
  data: Partial<DesignStageInput>
): Promise<DesignStage> {
  return fetch(`${API_BASE}/projects/${projectId}/design-stages`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function updateDesignStage(
  id: string,
  data: Partial<DesignStageInput>
): Promise<DesignStage> {
  return fetch(`${API_BASE}/design-stages/${id}`, jsonRequest("PUT", data)).then((res) =>
    handle(res)
  );
}

export function deleteDesignStage(id: string): Promise<void> {
  return fetch(`${API_BASE}/design-stages/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function reorderDesignStage(
  id: string,
  direction: "up" | "down"
): Promise<DesignStage[]> {
  return fetch(`${API_BASE}/design-stages/${id}/reorder`, jsonRequest("POST", { direction })).then(
    (res) => handle(res)
  );
}

export function createDrawing(projectId: string, data: Partial<DrawingInput>): Promise<Drawing> {
  return fetch(`${API_BASE}/projects/${projectId}/drawings`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function updateDrawing(id: string, data: Partial<DrawingInput>): Promise<Drawing> {
  return fetch(`${API_BASE}/drawings/${id}`, jsonRequest("PUT", data)).then((res) => handle(res));
}

export function deleteDrawing(id: string): Promise<void> {
  return fetch(`${API_BASE}/drawings/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function issueDrawingRevision(
  drawingId: string,
  data: Partial<DrawingRevisionInput>
): Promise<DrawingRevision> {
  return fetch(`${API_BASE}/drawings/${drawingId}/revisions`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function createDesignReview(
  projectId: string,
  data: Partial<DesignReviewInput>
): Promise<DesignReview> {
  return fetch(`${API_BASE}/projects/${projectId}/design-reviews`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function updateDesignReview(
  id: string,
  data: Partial<DesignReviewInput>
): Promise<DesignReview> {
  return fetch(`${API_BASE}/design-reviews/${id}`, jsonRequest("PUT", data)).then((res) =>
    handle(res)
  );
}

export function deleteDesignReview(id: string): Promise<void> {
  return fetch(`${API_BASE}/design-reviews/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function createFeeClaim(
  projectId: string,
  data: Partial<FeeClaimInput>
): Promise<FeeClaim> {
  return fetch(`${API_BASE}/projects/${projectId}/fee-claims`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function updateFeeClaim(id: string, data: Partial<FeeClaimInput>): Promise<FeeClaim> {
  return fetch(`${API_BASE}/fee-claims/${id}`, jsonRequest("PUT", data)).then((res) => handle(res));
}

export function deleteFeeClaim(id: string): Promise<void> {
  return fetch(`${API_BASE}/fee-claims/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function createCmpMeetingMinutes(
  projectId: string,
  data: Partial<CmpMeetingMinutesInput>
): Promise<CmpMeetingMinutes> {
  return fetch(`${API_BASE}/projects/${projectId}/meeting-minutes`, jsonRequest("POST", data)).then(
    (res) => handle(res)
  );
}

export function updateCmpMeetingMinutes(
  id: string,
  data: Partial<CmpMeetingMinutesInput>
): Promise<CmpMeetingMinutes> {
  return fetch(`${API_BASE}/meeting-minutes/${id}`, jsonRequest("PUT", data)).then((res) =>
    handle(res)
  );
}

export function deleteCmpMeetingMinutes(id: string): Promise<void> {
  return fetch(`${API_BASE}/meeting-minutes/${id}`, { method: "DELETE" }).then((res) => handle(res));
}

export function getCmpRecentActivity(): Promise<CmpActivityLogEntry[]> {
  return fetch(`${API_BASE}/activity/recent`).then((res) => handle(res));
}
