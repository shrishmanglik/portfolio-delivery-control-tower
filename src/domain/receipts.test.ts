import { describe, expect, it } from "vitest";
import { createReviewReceipt, stableReceiptDigest } from "./receipts";
import type { DecisionInput } from "./types";

const decision: DecisionInput = { engagementId: "eng-1", question: "Should the launch date move?", recommendation: "Move the launch until medical review completes.", authority: "portfolio-director", submittedBy: "Jordan Lee", approvedBy: "Morgan Chen", riskLevel: "high", sourceVersions: ["scope-v3", "finance-2026-08"], nextAction: "Confirm revised milestone", dueAt: "2026-08-04T15:00:00-04:00" };

describe("review receipts", () => {
  it("produces a stable digest independent of object key order", () => expect(stableReceiptDigest({ b: 2, a: 1 })).toBe(stableReceiptDigest({ a: 1, b: 2 })));
  it("links source versions and human authority", () => {
    const receipt = createReviewReceipt(decision, "2026-08-01T12:00:00.000Z");
    expect(receipt.digest).toMatch(/^ct-[a-f0-9]{8}$/);
    expect(receipt.decision.sourceVersions).toHaveLength(2);
    expect(receipt.decision.approvedBy).not.toBe(receipt.decision.submittedBy);
  });
});
