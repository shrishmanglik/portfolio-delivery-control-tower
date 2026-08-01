import type { HealthInput, HealthReason, HealthResult, HealthState } from "./types";

export const criticalSourceIntegrityDetector = (input: HealthInput): boolean =>
  input.financialSourceAgeDays > input.criticalSourceMaxAgeDays ||
  input.hasContradictoryScope ||
  input.hasUnvalidatedFinancials;

function ratio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.min(1, Math.max(0, numerator / denominator));
}

function varianceRatio(input: HealthInput, variance: number): number {
  const approved = input.approvedEstimate + input.approvedChanges;
  return approved === 0 ? (variance === 0 ? 0 : Number.POSITIVE_INFINITY) : Math.abs(variance) / Math.abs(approved);
}

export function calculatePortfolioHealth(input: HealthInput): HealthResult {
  const commitmentCoverage = ratio(input.supportedCommitments, input.activeCommitments);
  const staffingConfidence = ratio(input.approvedCapacityHours, input.requiredCapacityHours);
  const schedulePressure = input.overdueWorkWeight + input.blockedWorkWeight + input.milestoneSlipExposure;
  const forecastVariance = input.currentForecast - input.approvedEstimate - input.approvedChanges;
  const currentVarianceRatio = varianceRatio(input, forecastVariance);
  const reasons: HealthReason[] = [];

  if (input.financialSourceAgeDays > input.criticalSourceMaxAgeDays) {
    reasons.push({ code: "STALE_FINANCIAL_SOURCE", state: "unknown", message: "Financial evidence is outside the accepted freshness window.", evidence: `${input.financialSourceAgeDays}d old; maximum ${input.criticalSourceMaxAgeDays}d` });
  }
  if (input.hasContradictoryScope) {
    reasons.push({ code: "CONTRADICTORY_SCOPE", state: "unknown", message: "Competing scope versions require a human authority decision.", evidence: "Two current scope versions are present" });
  }
  if (input.hasUnvalidatedFinancials) {
    reasons.push({ code: "UNVALIDATED_FINANCIALS", state: "unknown", message: "Financial values have not been validated by the named owner.", evidence: "validatedAt is absent" });
  }

  if (criticalSourceIntegrityDetector(input)) {
    return { state: "unknown", commitmentCoverage, staffingConfidence, schedulePressure, forecastVariance, riskExposure: input.highRiskExposure, reasons };
  }

  const addThresholdReason = (condition: boolean, state: HealthState, code: string, message: string, evidence: string) => {
    if (condition) reasons.push({ code, state, message, evidence });
  };

  addThresholdReason(staffingConfidence !== null && staffingConfidence < input.thresholds.staffingCritical, "at-risk", "CRITICAL_STAFFING_GAP", "Approved capacity cannot support committed work.", `${Math.round((staffingConfidence ?? 0) * 100)}% staffed`);
  addThresholdReason(currentVarianceRatio >= input.thresholds.varianceCriticalRatio, "at-risk", "CRITICAL_FORECAST_VARIANCE", "Forecast variance exceeds the approved critical threshold.", `${Math.round(currentVarianceRatio * 100)}% variance`);
  addThresholdReason(schedulePressure >= input.thresholds.scheduleCritical, "at-risk", "CRITICAL_SCHEDULE_PRESSURE", "Weighted schedule pressure exceeds the critical threshold.", `${schedulePressure} pressure points`);
  addThresholdReason(input.highRiskExposure >= input.thresholds.riskCritical, "at-risk", "CRITICAL_RISK_EXPOSURE", "Open risk exposure requires escalation.", `${input.highRiskExposure} exposure points`);
  addThresholdReason(input.overdueDecisions >= input.thresholds.overdueDecisionCritical, "at-risk", "OVERDUE_DECISIONS", "Consequential decisions are overdue.", `${input.overdueDecisions} overdue`);

  if (reasons.some((reason) => reason.state === "at-risk")) {
    return { state: "at-risk", commitmentCoverage, staffingConfidence, schedulePressure, forecastVariance, riskExposure: input.highRiskExposure, reasons };
  }

  addThresholdReason(commitmentCoverage !== null && commitmentCoverage < 1, "watch", "UNSUPPORTED_COMMITMENT", "At least one active commitment lacks a supported plan.", `${Math.round((commitmentCoverage ?? 0) * 100)}% covered`);
  addThresholdReason(staffingConfidence !== null && staffingConfidence < input.thresholds.staffingWarning, "watch", "STAFFING_WARNING", "Staffing confidence is below the warning threshold.", `${Math.round((staffingConfidence ?? 0) * 100)}% staffed`);
  addThresholdReason(currentVarianceRatio >= input.thresholds.varianceWarningRatio, "watch", "FORECAST_VARIANCE_WARNING", "Forecast variance requires review.", `${Math.round(currentVarianceRatio * 100)}% variance`);
  addThresholdReason(schedulePressure >= input.thresholds.scheduleWarning, "watch", "SCHEDULE_PRESSURE_WARNING", "Work pressure is approaching a critical threshold.", `${schedulePressure} pressure points`);
  addThresholdReason(input.highRiskExposure >= input.thresholds.riskWarning, "watch", "RISK_EXPOSURE_WARNING", "Risk exposure requires monitoring.", `${input.highRiskExposure} exposure points`);
  addThresholdReason(input.overdueDecisions >= input.thresholds.overdueDecisionWarning, "watch", "DECISION_DUE", "A required decision is due or overdue.", `${input.overdueDecisions} decision(s)`);

  if (reasons.length > 0) {
    return { state: "watch", commitmentCoverage, staffingConfidence, schedulePressure, forecastVariance, riskExposure: input.highRiskExposure, reasons };
  }

  return {
    state: "green",
    commitmentCoverage,
    staffingConfidence,
    schedulePressure,
    forecastVariance,
    riskExposure: input.highRiskExposure,
    reasons: [{ code: "ALL_CONTROLS_PASS", state: "green", message: "Every configured deterministic control passes.", evidence: "No threshold breach and no stale critical source" }],
  };
}
