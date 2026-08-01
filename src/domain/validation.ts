import { z } from "zod";
import type { DecisionInput, WorkItem } from "./types";

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
}

export function validatePortfolioImport(candidate: unknown): ImportValidationResult {
  if (!Array.isArray(candidate)) return { accepted: false, errors: [{ path: "root", message: "Import must be an engagement array." }] };
  const errors: ImportValidationResult["errors"] = [];
  const engagementIds = new Set<string>();
  const workIds = new Set<string>();
  const financeIds = new Set<string>();

  for (const [index, raw] of candidate.entries()) {
    if (!raw || typeof raw !== "object") { errors.push({ path: `[${index}]`, message: "Engagement must be an object." }); continue; }
    const item = raw as Record<string, unknown>;
    if (typeof item.id !== "string" || item.id.length === 0) errors.push({ path: `[${index}].id`, message: "Engagement ID is required." });
    else if (engagementIds.has(item.id)) errors.push({ path: `[${index}].id`, message: "Duplicate engagement ID." });
    else engagementIds.add(item.id);
    if (typeof item.targetEnd !== "string" || Number.isNaN(Date.parse(item.targetEnd))) errors.push({ path: `[${index}].targetEnd`, message: "A valid target date is required." });

    const finance = item.financial as Record<string, unknown> | undefined;
    if (!finance || typeof finance.id !== "string") errors.push({ path: `[${index}].financial.id`, message: "Financial snapshot ID is required." });
    else if (financeIds.has(finance.id)) errors.push({ path: `[${index}].financial.id`, message: "Duplicate financial snapshot version." });
    else financeIds.add(finance.id);
    if (!finance || !["CAD", "USD", "EUR", "GBP"].includes(String(finance.currency))) errors.push({ path: `[${index}].financial.currency`, message: "Unsupported currency." });

    const workItems = Array.isArray(item.workItems) ? item.workItems : [];
    for (const [workIndex, work] of workItems.entries()) {
      const parsed = workItemSchema.safeParse(work);
      if (!parsed.success) for (const issue of parsed.error.issues) errors.push({ path: `[${index}].workItems[${workIndex}].${issue.path.join(".")}`, message: issue.message });
      const workRecord = work as Record<string, unknown>;
      if (typeof workRecord.id === "string") {
        if (workIds.has(workRecord.id)) errors.push({ path: `[${index}].workItems[${workIndex}].id`, message: "Duplicate work item ID." });
        workIds.add(workRecord.id);
      }
    }
  }

  for (const [index, raw] of candidate.entries()) {
    if (!raw || typeof raw !== "object") continue;
    const workItems = Array.isArray((raw as Record<string, unknown>).workItems) ? (raw as { workItems: Array<Record<string, unknown>> }).workItems : [];
    for (const [workIndex, work] of workItems.entries()) for (const dependencyId of Array.isArray(work.dependencyIds) ? work.dependencyIds : []) if (!workIds.has(String(dependencyId))) errors.push({ path: `[${index}].workItems[${workIndex}].dependencyIds`, message: `Orphan dependency: ${dependencyId}` });
  }
  return { accepted: errors.length === 0, errors };
}
