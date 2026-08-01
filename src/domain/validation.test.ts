import { describe, expect, it } from "vitest";
import { engagements } from "./fixtures";
import { validateDecision, validatePortfolioImport, validateWorkItem } from "./validation";
import type { DecisionInput, WorkItem } from "./types";

describe("high-risk authority and blocked work contracts", () => {
  it("rejects a blocked work item without ownership and recovery fields", () => {
    const item: WorkItem = { id: "w-1", title: "Medical review", owner: "Delivery lead", functionalTeam: "Medical", state: "blocked", dueAt: "2026-08-04T15:00:00-04:00" };
    const result = validateWorkItem(item);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["blockedReason", "dependencyOwner", "nextAction", "reviewAt"]));
  });

  it("rejects self-approval for a high-risk decision", () => {
    const input: DecisionInput = { engagementId: "eng-1", question: "Should the launch date move?", recommendation: "Move the date after medical review.", authority: "portfolio-director", submittedBy: "Jordan Lee", approvedBy: "Jordan Lee", riskLevel: "high", sourceVersions: ["scope-v3"], nextAction: "Confirm revised milestone", dueAt: "2026-08-04T15:00:00-04:00" };
    expect(validateDecision(input).success).toBe(false);
    expect(validateDecision({ ...input, approvedBy: "Morgan Chen" }).success).toBe(true);
  });
});

describe("portfolio import boundary", () => {
  it("rejects an engagement that only satisfies identifier and date checks", () => {
    const result = validatePortfolioImport([{ id: "partial", targetEnd: "2026-08-04T15:00:00-04:00", financial: { id: "fin-partial", currency: "CAD" }, workItems: [] }]);
    expect(result.accepted).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(expect.arrayContaining(["[0].commitments", "[0].staffing", "[0].risks"]));
  });

  it("returns typed parsed data only after validating the complete contract", () => {
    const result = validatePortfolioImport(structuredClone(engagements));
    expect(result.accepted).toBe(true);
    expect(result.data?.[0]?.commitments.length).toBeGreaterThan(0);
  });
});
