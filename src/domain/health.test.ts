import { describe, expect, it } from "vitest";
import { calculatePortfolioHealth } from "./health";
import type { HealthInput } from "./types";

const validInput: HealthInput = {
  activeCommitments: 4,
  supportedCommitments: 4,
  requiredCapacityHours: 100,
  approvedCapacityHours: 100,
  overdueWorkWeight: 0,
  blockedWorkWeight: 0,
  milestoneSlipExposure: 0,
  approvedEstimate: 100_000,
  approvedChanges: 0,
  currentForecast: 100_000,
  highRiskExposure: 0,
  overdueDecisions: 0,
  financialSourceAgeDays: 1,
  criticalSourceMaxAgeDays: 7,
  hasContradictoryScope: false,
  hasUnvalidatedFinancials: false,
  thresholds: {
    staffingWarning: 0.9,
    staffingCritical: 0.75,
    varianceWarningRatio: 0.05,
    varianceCriticalRatio: 0.15,
    scheduleWarning: 4,
    scheduleCritical: 8,
    riskWarning: 6,
    riskCritical: 12,
    overdueDecisionWarning: 1,
    overdueDecisionCritical: 2,
  },
};

describe("calculatePortfolioHealth critical detector", () => {
  it("returns unknown, never green, when the critical financial source is stale", () => {
    const result = calculatePortfolioHealth({ ...validInput, financialSourceAgeDays: 9 });
    expect(result.state).toBe("unknown");
    expect(result.reasons.map((reason) => reason.code)).toContain("STALE_FINANCIAL_SOURCE");
  });

  it("returns at-risk when capacity or unresolved financial variance crosses a critical threshold", () => {
    const result = calculatePortfolioHealth({
      ...validInput,
      approvedCapacityHours: 60,
      currentForecast: 128_000,
    });
    expect(result.state).toBe("at-risk");
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns green only when every deterministic control passes", () => {
    const result = calculatePortfolioHealth(validInput);
    expect(result.state).toBe("green");
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]?.code).toBe("ALL_CONTROLS_PASS");
  });
});
