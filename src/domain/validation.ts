import { z } from "zod";
import type { DecisionInput, Engagement, WorkItem } from "./types";

const isoDateTime = z.string().datetime({ offset: true });

export const workItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  owner: z.string().min(1).nullable(),
  functionalTeam: z.string().min(1),
  state: z.enum(["planned", "ready", "active", "internal-review", "client-review", "approved", "complete", "waiting", "blocked", "rework", "cancelled"]),
  blockedReason: z.string().min(1).optional(),
  dependencyOwner: z.string().min(1).optional(),
  dependencyIds: z.array(z.string().min(1)).optional(),
  nextAction: z.string().min(1).optional(),
  reviewAt: isoDateTime.optional(),
  dueAt: isoDateTime,
}).superRefine((item, context) => {
  if (item.state !== "blocked") return;
  const required = ["blockedReason", "dependencyOwner", "nextAction", "reviewAt"] as const;
  for (const field of required) {
    if (!item[field]) context.addIssue({ code: "custom", path: [field], message: `Blocked work requires ${field}.` });
  }
});

const commitmentSchema = z.object({
  id: z.string().min(1),
  promisedOutcome: z.string().min(1),
  owner: z.string().min(1).nullable(),
  dueAt: isoDateTime.nullable(),
  supportedPlan: z.boolean(),
  sourceId: z.string().min(1),
});

const staffingDemandSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  skill: z.string().min(1),
  requiredHours: z.number().finite().nonnegative(),
  approvedHours: z.number().finite().nonnegative(),
  owner: z.string().min(1).nullable(),
  conflictWith: z.string().min(1).optional(),
});

const financialSnapshotSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  currency: z.enum(["CAD", "USD", "EUR", "GBP"]),
  approvedEstimate: z.number().finite().nonnegative(),
  approvedChanges: z.number().finite(),
  actual: z.number().finite().nonnegative(),
  billed: z.number().finite().nonnegative(),
  forecast: z.number().finite().nonnegative(),
  varianceReason: z.enum(["timing", "scope", "rate", "resource-mix", "vendor", "unresolved"]),
  sourceId: z.string().min(1),
  formulaVersion: z.string().min(1),
  owner: z.string().min(1),
  validatedAt: isoDateTime.nullable(),
});

const riskSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  category: z.string().min(1),
  probability: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  owner: z.string().min(1),
  trigger: z.string().min(1),
  mitigation: z.string().min(1),
  contingency: z.string().min(1),
  dueAt: isoDateTime,
  state: z.enum(["identified", "assessed", "mitigation-active", "monitoring", "escalated", "closed"]),
});

export const engagementSchema = z.object({
  id: z.string().min(1),
  account: z.string().min(1),
  name: z.string().min(1),
  objective: z.string().min(1),
  owner: z.string().min(1),
  scopeVersion: z.string().min(1),
  targetEnd: isoDateTime,
  nextCommitment: z.string().min(1),
  commitments: z.array(commitmentSchema).min(1),
  workItems: z.array(workItemSchema).min(1),
  staffing: z.array(staffingDemandSchema).min(1),
  financial: financialSnapshotSchema,
  risks: z.array(riskSchema).min(1),
  sourceAgeDays: z.number().int().nonnegative(),
  hasContradictoryScope: z.boolean(),
  hasUnvalidatedFinancials: z.boolean(),
});

const portfolioImportSchema = z.array(engagementSchema).min(1);

export const decisionInputSchema = z.object({
  engagementId: z.string().min(1),
  question: z.string().min(12),
  recommendation: z.string().min(12),
  authority: z.enum(["portfolio-director", "account-lead", "finance-partner", "executive-reviewer"]),
  submittedBy: z.string().min(1),
  approvedBy: z.string().min(1),
  riskLevel: z.enum(["standard", "high"]),
  sourceVersions: z.array(z.string().min(1)).min(1),
  nextAction: z.string().min(5),
  dueAt: isoDateTime,
}).superRefine((decision, context) => {
  if (decision.riskLevel === "high" && decision.submittedBy === decision.approvedBy) {
    context.addIssue({ code: "custom", path: ["approvedBy"], message: "High-risk decisions require an approver other than the submitter." });
  }
});

export function validateWorkItem(item: WorkItem) {
  return workItemSchema.safeParse(item);
}

export function validateDecision(input: DecisionInput) {
  return decisionInputSchema.safeParse(input);
}

export interface ImportValidationResult {
  accepted: boolean;
  errors: Array<{ path: string; message: string }>;
  data?: Engagement[];
}

function formatIssuePath(path: PropertyKey[]) {
  if (path.length === 0) return "root";
  return path.reduce<string>((formatted, segment) => typeof segment === "number" ? `${formatted}[${segment}]` : `${formatted}${formatted ? "." : ""}${String(segment)}`, "");
}

export function validatePortfolioImport(candidate: unknown): ImportValidationResult {
  const parsed = portfolioImportSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      accepted: false,
      errors: parsed.error.issues.map((issue) => ({
        path: formatIssuePath(issue.path),
        message: issue.message,
      })),
    };
  }

  const errors: ImportValidationResult["errors"] = [];
  const engagementIds = new Set<string>();
  const workIds = new Set<string>();
  const financeIds = new Set<string>();

  for (const [index, engagement] of parsed.data.entries()) {
    if (engagementIds.has(engagement.id)) errors.push({ path: `[${index}].id`, message: "Duplicate engagement ID." });
    engagementIds.add(engagement.id);
    if (financeIds.has(engagement.financial.id)) errors.push({ path: `[${index}].financial.id`, message: "Duplicate financial snapshot version." });
    financeIds.add(engagement.financial.id);
    for (const [workIndex, work] of engagement.workItems.entries()) {
      if (workIds.has(work.id)) errors.push({ path: `[${index}].workItems[${workIndex}].id`, message: "Duplicate work item ID." });
      workIds.add(work.id);
    }
  }

  for (const [index, engagement] of parsed.data.entries()) {
    for (const [workIndex, work] of engagement.workItems.entries()) {
      for (const dependencyId of work.dependencyIds ?? []) {
        if (!workIds.has(dependencyId)) errors.push({ path: `[${index}].workItems[${workIndex}].dependencyIds`, message: `Orphan dependency: ${dependencyId}` });
      }
    }
  }
  return errors.length === 0 ? { accepted: true, errors: [], data: parsed.data } : { accepted: false, errors };
}
