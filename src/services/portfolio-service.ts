import { calculatePortfolioHealth } from "@/src/domain/health";
import { createReviewReceipt } from "@/src/domain/receipts";
import { validateDecision, validatePortfolioImport } from "@/src/domain/validation";
import type { DecisionInput, Engagement, ReviewReceipt } from "@/src/domain/types";
import { toHealthInput } from "@/src/domain/fixtures";

export function buildPortfolioRows(engagements: Engagement[]) {
  return engagements.map((engagement) => ({ engagement, health: calculatePortfolioHealth(toHealthInput(engagement)) }));
}

export function buildSyntheticFinancialCandidate(engagements: Engagement[], validatedAt: string): unknown {
  return engagements.map((engagement) => ({ ...engagement, sourceAgeDays: 0, hasUnvalidatedFinancials: false, financial: { ...engagement.financial, sourceId: "source-finance-2026-08-01", validatedAt } }));
}

export function applyPortfolioImport(current: Engagement[], candidate: unknown): { accepted: boolean; data: Engagement[]; errors: Array<{ path: string; message: string }> } {
  const validation = validatePortfolioImport(candidate);
  if (!validation.accepted || !validation.data) return { accepted: false, data: current, errors: validation.errors };
  return { accepted: true, data: validation.data, errors: [] };
}

export function validateSyntheticFinancialSnapshot(current: Engagement[], validatedAt: string) {
  return applyPortfolioImport(current, buildSyntheticFinancialCandidate(current, validatedAt));
}

export type RecordDecisionResult = { ok: true; receipt: ReviewReceipt } | { ok: false; errors: Record<string, string> };

export function recordDecision(input: DecisionInput, createdAt: string): RecordDecisionResult {
  const parsed = validateDecision(input);
  if (!parsed.success) {
    return { ok: false, errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])) };
  }
  return { ok: true, receipt: createReviewReceipt(parsed.data, createdAt) };
}
