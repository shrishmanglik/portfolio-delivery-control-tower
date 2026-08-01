import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Supabase persistence adapter contract", () => {
  const sql = readFileSync(resolve("supabase/migrations/001_control_tower.sql"), "utf8").toLowerCase();
  const tables = [...sql.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);

  it("enables RLS and declares at least one policy for every table", () => {
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toMatch(new RegExp(`create policy [a-z_]+ on public\\.${table} `));
    }
  });

  it("makes receipts and audit history append-only for authenticated users", () => {
    expect(sql).toContain("revoke update, delete on public.review_receipts from authenticated");
    expect(sql).toContain("revoke update, delete on public.audit_events from authenticated");
  });
});
