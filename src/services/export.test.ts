import { describe, expect, it } from "vitest";
import { engagements } from "@/src/domain/fixtures";
import { buildSyntheticExport } from "./export";

describe("synthetic export", () => {
  it("is labelled synthetic and preserves the provider truth ceiling", () => {
    const result = buildSyntheticExport(engagements);
    expect(result.synthetic).toBe(true);
    expect(result.providerState).toBe("UNKNOWN");
    expect(result.digest).toMatch(/^ct-/);
  });
});
