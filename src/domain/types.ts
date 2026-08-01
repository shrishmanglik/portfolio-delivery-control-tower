export type HealthState = "green" | "watch" | "at-risk" | "unknown";

export type EvidenceState = "verified" | "unverified" | "gap" | "blocked" | "done";
export type WorkState = "planned" | "ready" | "active" | "internal-review" | "client-review" | "approved" | "complete" | "waiting" | "blocked" | "rework" | "cancelled";
export type RiskState = "identified" | "assessed" | "mitigation-active" | "monitoring" | "escalated" | "closed";

export interface HealthThresholds {
  staffingWarning: number;
  staffingCritical: number;
  varianceWarningRatio: number;
  varianceCriticalRatio: number;
  scheduleWarning: number;
  scheduleCritical: number;
  riskWarning: number;
  riskCritical: number;
  overdueDecisionWarning: number;
  overdueDecisionCritical: number;
}

export interface HealthInput {
  activeCommitments: number;
  supportedCommitments: number;
  requiredCapacityHours: number;
  approvedCapacityHours: number;
  overdueWorkWeight: number;
  blockedWorkWeight: number;
  milestoneSlipExposure: number;
  approvedEstimate: number;
  approvedChanges: number;
  currentForecast: number;
  highRiskExposure: number;
  overdueDecisions: number;
  financialSourceAgeDays: number;
  criticalSourceMaxAgeDays: number;
  hasContradictoryScope: boolean;
  hasUnvalidatedFinancials: boolean;
  thresholds: HealthThresholds;
}

export interface SourceEvidence {
  id: string;
  label: string;
  system: string;
  version: string;
  capturedAt: string;
  validatedAt: string | null;
  state: EvidenceState;
  synthetic: true;
}

export interface Commitment {
  id: string;
  promisedOutcome: string;
  owner: string | null;
  dueAt: string | null;
  supportedPlan: boolean;
  sourceId: string;
}

export interface WorkItem {
  id: string;
  title: string;
  owner: string | null;
  functionalTeam: string;
  state: WorkState;
  blockedReason?: string;
  dependencyOwner?: string;
  dependencyIds?: string[];
  nextAction?: string;
  reviewAt?: string;
  dueAt: string;
}

export interface StaffingDemand {
  id: string;
  role: string;
  skill: string;
  requiredHours: number;
  approvedHours: number;
  owner: string | null;
  conflictWith?: string;
}

export interface FinancialSnapshot {
  id: string;
  period: string;
  currency: "CAD" | "USD" | "EUR" | "GBP";
  approvedEstimate: number;
  approvedChanges: number;
  actual: number;
  billed: number;
  forecast: number;
  varianceReason: "timing" | "scope" | "rate" | "resource-mix" | "vendor" | "unresolved";
  sourceId: string;
  formulaVersion: string;
  owner: string;
  validatedAt: string | null;
}

export interface PortfolioRisk {
  id: string;
  statement: string;
  category: string;
  probability: number;
  impact: number;
  owner: string;
  trigger: string;
  mitigation: string;
  contingency: string;
  dueAt: string;
  state: RiskState;
}

export interface Engagement {
  id: string;
  account: string;
  name: string;
  objective: string;
  owner: string;
  scopeVersion: string;
  targetEnd: string;
  nextCommitment: string;
  commitments: Commitment[];
  workItems: WorkItem[];
  staffing: StaffingDemand[];
  financial: FinancialSnapshot;
  risks: PortfolioRisk[];
  sourceAgeDays: number;
  hasContradictoryScope: boolean;
  hasUnvalidatedFinancials: boolean;
}

export interface DecisionInput {
  engagementId: string;
  question: string;
  recommendation: string;
  authority: "portfolio-director" | "account-lead" | "finance-partner" | "executive-reviewer";
  submittedBy: string;
  approvedBy: string;
  riskLevel: "standard" | "high";
  sourceVersions: string[];
  nextAction: string;
  dueAt: string;
}

export interface ReviewReceipt {
  id: string;
  engagementId: string;
  createdAt: string;
  decision: DecisionInput;
  heldItems: string[];
  correctionOf: string | null;
  digest: string;
  digestAlgorithm: "fnv1a-32-canonical-v1";
  synthetic: true;
}

export interface ScopeInvalidationReceipt {
  engagementId: string;
  previousScopeVersion: string;
  nextScopeVersion: string;
  invalidated: Array<"estimate" | "staffing" | "schedule" | "forecast">;
  requiresHumanApproval: true;
}

export interface HealthReason {
  code: string;
  state: HealthState;
  message: string;
  evidence: string;
}

export interface HealthResult {
  state: HealthState;
  commitmentCoverage: number | null;
  staffingConfidence: number | null;
  schedulePressure: number;
  forecastVariance: number;
  riskExposure: number;
  reasons: HealthReason[];
}
