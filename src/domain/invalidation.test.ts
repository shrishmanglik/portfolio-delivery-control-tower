import { describe, expect, it } from "vitest";
import { invalidateForScopeChange } from "./invalidation";

describe("scope-change invalidation", () => {
  it("invalidates every dependent version and preserves human approval", () => {
    expect(invalidateForScopeChange("eng-2", "scope-v2", "scope-v3")).toEqual(expect.objectContaining({ invalidated: ["estimate", "staffing", "schedule", "forecast"], requiresHumanApproval: true }));
  });
  it("rejects a no-op version change", () => expect(() => invalidateForScopeChange("eng-2", "scope-v2", "scope-v2")).toThrow());
});
