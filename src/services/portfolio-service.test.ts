import { describe, expect, it } from "vitest";
import { engagements } from "@/src/domain/fixtures";
import { applyPortfolioImport, buildPortfolioRows, buildSyntheticFinancialCandidate, recordDecision, validateSyntheticFinancialSnapshot } from "./portfolio-service";

describe("portfolio service journey", () => {
  it("moves stale financial evidence from unknown into deterministic non-green states", () => {
    expect(buildPortfolioRows(engagements).every((row) => row.health.state === "unknown")).toBe(true);
    const accepted = validateSyntheticFinancialSnapshot(engagements, "2026-08-01T13:00:00.000Z");
    expect(accepted.accepted).toBe(true);
    const rows = buildPortfolioRows(accepted.data);
    expect(rows.find((row) => row.engagement.id === "eng-hcp-education")?.health.state).toBe("at-risk");
    expect(rows.find((row) => row.engagement.id === "eng-patient-support")?.health.state).toBe("at-risk");
    expect(rows.find((row) => row.engagement.id === "eng-payer-update")?.health.state).toBe("unknown");
    expect(rows.find((row) => row.engagement.id === "eng-payer-update")?.health.reasons.map((reason) => reason.code)).toContain("CONTRADICTORY_SCOPE");
  });

  it("rejects self-approval before producing a receipt", () => {
    const result = recordDecision({ engagementId: "eng-hcp-education", question: "Should the launch milestone move?", recommendation: "Move it until medical review completes.", authority: "portfolio-director", submittedBy: "Jordan Lee", approvedBy: "Jordan Lee", riskLevel: "high", sourceVersions: ["scope-v3"], nextAction: "Confirm revised milestone", dueAt: "2026-08-04T15:00:00-04:00" }, "2026-08-01T13:00:00.000Z");
    expect(result.ok).toBe(false);
  });

  it("keeps the last accepted snapshot unchanged when an import is rejected", () => {
    const rejected = applyPortfolioImport(engagements, [{ id: "broken", targetEnd: "not-a-date", financial: { id: "fin-x", currency: "BTC" }, workItems: [] }]);
    expect(rejected.accepted).toBe(false);
    expect(rejected.data).toBe(engagements);
    expect(rejected.errors.map((error) => error.path)).toEqual(expect.arrayContaining(["[0].targetEnd", "[0].financial.currency"]));
  });

  it("routes the mocked adapter through the full import validator", () => {
    const candidate = buildSyntheticFinancialCandidate(engagements, "2026-08-01T13:00:00.000Z") as Array<Record<string, unknown>>;
    const invalidCandidate = candidate.map((engagement, index) => index === 0 ? { ...engagement, commitments: undefined } : engagement);
    const rejected = applyPortfolioImport(engagements, invalidCandidate);
    expect(rejected.accepted).toBe(false);
    expect(rejected.data).toBe(engagements);
    expect(rejected.errors.some((error) => error.path.includes("commitments"))).toBe(true);
  });
});
