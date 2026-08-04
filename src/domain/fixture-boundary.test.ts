import { describe, expect, it } from "vitest";
import { engagements, sources, SYNTHETIC_NOTICE } from "./fixtures";

describe("public fixture boundary", () => {
  it("marks every account and source synthetic", () => {
    expect(SYNTHETIC_NOTICE.toLowerCase()).toContain("synthetic");
    expect(engagements.every((item) => item.account.includes("(synthetic)"))).toBe(true);
    expect(sources.every((source) => source.synthetic)).toBe(true);
  });

  it("contains no target-company or real client identity", () => {
    const fixtureText = JSON.stringify({ engagements, sources }).toLowerCase();
    expect(fixtureText).not.toContain("bgbx");
    expect(fixtureText).not.toContain("telus");
  });
});
