import type { ScopeInvalidationReceipt } from "./types";

export function invalidateForScopeChange(engagementId: string, previousScopeVersion: string, nextScopeVersion: string): ScopeInvalidationReceipt {
  if (previousScopeVersion === nextScopeVersion) throw new Error("A scope change requires a new version.");
  return { engagementId, previousScopeVersion, nextScopeVersion, invalidated: ["estimate", "staffing", "schedule", "forecast"], requiresHumanApproval: true };
}
