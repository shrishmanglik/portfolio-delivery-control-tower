import type { Engagement, HealthInput, HealthThresholds, SourceEvidence } from "./types";

export const SYNTHETIC_NOTICE = "Synthetic demonstration data. No employer, client, or production system data is included.";

export const defaultThresholds: HealthThresholds = {
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
};

export const sources: SourceEvidence[] = [
  { id: "source-project-2026-08-01", label: "Project snapshot", system: "Mock project adapter", version: "project-v14", capturedAt: "2026-08-01T08:30:00-04:00", validatedAt: "2026-08-01T08:34:00-04:00", state: "verified", synthetic: true },
  { id: "source-resource-2026-08-01", label: "Capacity snapshot", system: "Mock resource adapter", version: "resource-v8", capturedAt: "2026-08-01T08:28:00-04:00", validatedAt: "2026-08-01T08:34:00-04:00", state: "verified", synthetic: true },
  { id: "source-finance-2026-07-23", label: "Financial snapshot", system: "Mock finance adapter", version: "finance-v6", capturedAt: "2026-07-23T17:00:00-04:00", validatedAt: null, state: "gap", synthetic: true },
];

export const engagements: Engagement[] = [
  {
    id: "eng-hcp-education",
    account: "Northstar Therapeutics (synthetic)",
    name: "HCP education launch",
    objective: "Prepare a compliant professional-education launch across web and field channels.",
    owner: "Jordan Lee",
    scopeVersion: "scope-v3",
    targetEnd: "2026-08-21T17:00:00-04:00",
    nextCommitment: "Medical review approval",
    commitments: [
      { id: "commit-1", promisedOutcome: "Approved HCP launch materials", owner: "Jordan Lee", dueAt: "2026-08-12T17:00:00-04:00", supportedPlan: true, sourceId: "source-project-2026-08-01" },
      { id: "commit-2", promisedOutcome: "Field enablement package", owner: "Avery Patel", dueAt: "2026-08-19T17:00:00-04:00", supportedPlan: true, sourceId: "source-project-2026-08-01" },
    ],
    workItems: [
      { id: "work-1", title: "Medical review round two", owner: "Taylor Nguyen", functionalTeam: "Medical", state: "blocked", blockedReason: "Reference confirmation is pending", dependencyOwner: "Medical lead", nextAction: "Confirm evidence source", reviewAt: "2026-08-04T10:00:00-04:00", dueAt: "2026-08-03T17:00:00-04:00" },
      { id: "work-2", title: "Field deck production", owner: "Avery Patel", functionalTeam: "Creative", state: "waiting", dependencyOwner: "Medical lead", nextAction: "Begin after medical approval", reviewAt: "2026-08-04T10:00:00-04:00", dueAt: "2026-08-13T17:00:00-04:00" },
    ],
    staffing: [{ id: "staff-1", role: "Medical editor", skill: "Regulated claims review", requiredHours: 80, approvedHours: 72, owner: "Resource manager" }],
    financial: { id: "fin-1", period: "2026-08", currency: "CAD", approvedEstimate: 184000, approvedChanges: 12000, actual: 103000, billed: 86000, forecast: 205000, varianceReason: "timing", sourceId: "source-finance-2026-07-23", formulaVersion: "forecast-v1", owner: "Finance partner", validatedAt: null },
    risks: [{ id: "risk-1", statement: "Medical review delay compresses production approval.", category: "schedule", probability: 3, impact: 4, owner: "Jordan Lee", trigger: "Approval not received by August 4", mitigation: "Daily review checkpoint", contingency: "Move launch milestone", dueAt: "2026-08-04T10:00:00-04:00", state: "escalated" }],
    sourceAgeDays: 9,
    hasContradictoryScope: false,
    hasUnvalidatedFinancials: true,
  },
  {
    id: "eng-payer-update",
    account: "Meridian Health Group (synthetic)",
    name: "Payer communication update",
    objective: "Revise payer communications after a controlled scope change.",
    owner: "Morgan Chen",
    scopeVersion: "scope-v5-pending",
    targetEnd: "2026-09-04T17:00:00-04:00",
    nextCommitment: "Approve change impact",
    commitments: [{ id: "commit-3", promisedOutcome: "Updated payer value narrative", owner: "Morgan Chen", dueAt: "2026-08-18T17:00:00-04:00", supportedPlan: false, sourceId: "source-project-2026-08-01" }],
    workItems: [{ id: "work-3", title: "Assess expanded evidence scope", owner: "Sam Rivera", functionalTeam: "Strategy", state: "active", dueAt: "2026-08-06T17:00:00-04:00" }],
    staffing: [{ id: "staff-2", role: "Payer strategist", skill: "Market access", requiredHours: 120, approvedHours: 72, owner: "Resource manager" }],
    financial: { id: "fin-2", period: "2026-08", currency: "CAD", approvedEstimate: 132000, approvedChanges: 0, actual: 74000, billed: 55000, forecast: 160000, varianceReason: "scope", sourceId: "source-finance-2026-07-23", formulaVersion: "forecast-v1", owner: "Finance partner", validatedAt: null },
    risks: [{ id: "risk-2", statement: "Unapproved scope invalidates the estimate and staffing plan.", category: "scope", probability: 4, impact: 4, owner: "Morgan Chen", trigger: "Client requests additional evidence set", mitigation: "Complete impact assessment", contingency: "Hold added work", dueAt: "2026-08-05T15:00:00-04:00", state: "assessed" }],
    sourceAgeDays: 9,
    hasContradictoryScope: true,
    hasUnvalidatedFinancials: true,
  },
  {
    id: "eng-patient-support",
    account: "Harbour Patient Services (synthetic)",
    name: "Patient-support campaign",
    objective: "Deliver an accessible support campaign within approved claims and capacity.",
    owner: "Casey Brown",
    scopeVersion: "scope-v2",
    targetEnd: "2026-08-28T17:00:00-04:00",
    nextCommitment: "Resolve creative allocation",
    commitments: [{ id: "commit-4", promisedOutcome: "Accessible support campaign", owner: "Casey Brown", dueAt: "2026-08-20T17:00:00-04:00", supportedPlan: true, sourceId: "source-project-2026-08-01" }],
    workItems: [{ id: "work-4", title: "Accessible concept production", owner: "Riley Shah", functionalTeam: "Creative", state: "blocked", blockedReason: "Lead designer is allocated to two commitments", dependencyOwner: "Resource manager", nextAction: "Approve allocation tradeoff", reviewAt: "2026-08-03T11:00:00-04:00", dueAt: "2026-08-08T17:00:00-04:00" }],
    staffing: [{ id: "staff-3", role: "Lead designer", skill: "Accessible campaign design", requiredHours: 96, approvedHours: 48, owner: "Resource manager", conflictWith: "eng-hcp-education" }],
    financial: { id: "fin-3", period: "2026-08", currency: "CAD", approvedEstimate: 98000, approvedChanges: 8000, actual: 48000, billed: 36000, forecast: 104000, varianceReason: "resource-mix", sourceId: "source-finance-2026-07-23", formulaVersion: "forecast-v1", owner: "Finance partner", validatedAt: null },
    risks: [{ id: "risk-3", statement: "Critical creative skill is double-booked.", category: "staffing", probability: 4, impact: 3, owner: "Casey Brown", trigger: "Allocation remains below 75%", mitigation: "Approve a portfolio-level tradeoff", contingency: "Sequence concept production", dueAt: "2026-08-03T11:00:00-04:00", state: "escalated" }],
    sourceAgeDays: 9,
    hasContradictoryScope: false,
    hasUnvalidatedFinancials: true,
  },
];

export function toHealthInput(engagement: Engagement): HealthInput {
  const activeCommitments = engagement.commitments.length;
  const supportedCommitments = engagement.commitments.filter((item) => item.owner && item.dueAt && item.supportedPlan).length;
  const requiredCapacityHours = engagement.staffing.reduce((sum, item) => sum + item.requiredHours, 0);
  const approvedCapacityHours = engagement.staffing.reduce((sum, item) => sum + item.approvedHours, 0);
  const overdueWorkWeight = engagement.workItems.filter((item) => item.state === "blocked").length * 2;
  const blockedWorkWeight = engagement.workItems.filter((item) => item.state === "blocked" || item.state === "waiting").length * 2;
  const highRiskExposure = engagement.risks.filter((risk) => risk.state !== "closed").reduce((sum, risk) => sum + risk.probability * risk.impact, 0);
  return { activeCommitments, supportedCommitments, requiredCapacityHours, approvedCapacityHours, overdueWorkWeight, blockedWorkWeight, milestoneSlipExposure: engagement.risks.some((risk) => risk.category === "schedule" && risk.state === "escalated") ? 4 : 0, approvedEstimate: engagement.financial.approvedEstimate, approvedChanges: engagement.financial.approvedChanges, currentForecast: engagement.financial.forecast, highRiskExposure, overdueDecisions: engagement.risks.filter((risk) => risk.state === "escalated").length, financialSourceAgeDays: engagement.sourceAgeDays, criticalSourceMaxAgeDays: 7, hasContradictoryScope: engagement.hasContradictoryScope, hasUnvalidatedFinancials: engagement.hasUnvalidatedFinancials, thresholds: defaultThresholds };
}
