import type { DecisionInput, ReviewReceipt } from "./types";

export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function stableReceiptDigest(value: unknown): string {
  const input = canonicalize(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `ct-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createReviewReceipt(decision: DecisionInput, createdAt: string, heldItems: string[] = []): ReviewReceipt {
  const payload = { decision, createdAt, heldItems, correctionOf: null };
  return { id: `review-${decision.engagementId}-${createdAt.slice(0, 10)}`, engagementId: decision.engagementId, createdAt, decision, heldItems, correctionOf: null, digest: stableReceiptDigest(payload), digestAlgorithm: "fnv1a-32-canonical-v1", synthetic: true };
}
