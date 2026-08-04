import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function validateRlsContract(sql: string) {
  const normalized = sql.toLowerCase();
  const tables = [...normalized.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
  const errors: string[] = [];
  for (const table of tables) {
    if (!normalized.includes(`alter table public.${table} enable row level security`)) errors.push(`${table}: RLS is not enabled`);
    if (!new RegExp(`create policy [a-z_]+ on public\\.${table} `).test(normalized)) errors.push(`${table}: policy is missing`);
  }
  if (/create policy[^;]+ for all /.test(normalized)) errors.push("broad FOR ALL policy is forbidden");
  if (!normalized.includes("app_private.has_tenant_role")) errors.push("role-aware authorization helper is missing");
  const tenantChildren = ["engagements", "source_snapshots", "work_items", "risks", "decisions", "review_receipts"];
  for (const table of tenantChildren) {
    const tableStart = normalized.indexOf(`create table public.${table}`);
    const tableEnd = normalized.indexOf(";", tableStart);
    const definition = normalized.slice(tableStart, tableEnd);
    const expectedConstraint = table === "engagements"
      ? "foreign key (portfolio_id, organization_id) references public.portfolios(id, organization_id)"
      : table === "review_receipts"
        ? "foreign key (decision_id, engagement_id, organization_id) references public.decisions(id, engagement_id, organization_id)"
        : "foreign key (engagement_id, organization_id) references public.engagements(id, organization_id)";
    if (!definition.includes(expectedConstraint)) errors.push(`${table}: tenant-bound parent key is missing`);
  }
  for (const requiredParentKey of ["unique (id, organization_id)", "unique (id, engagement_id, organization_id)"]) {
    if (!normalized.includes(requiredParentKey)) errors.push(`referenced parent key is missing: ${requiredParentKey}`);
  }
  const mutatingTables = ["portfolios", "engagements", "source_snapshots", "work_items", "risks", "decisions", "review_receipts"];
  for (const table of mutatingTables) {
    const policies = [...normalized.matchAll(new RegExp(`create policy [^;]+ on public\\.${table} [^;]+;`, "g"))].map((match) => match[0]);
    const mutations = policies.filter((policy) => / for (insert|update|delete) /.test(policy));
    if (mutations.length === 0 || mutations.some((policy) => !policy.includes("app_private.has_tenant_role"))) errors.push(`${table}: mutating policy is not role-aware`);
  }
  return errors;
}

describe("Supabase persistence adapter contract", () => {
  const sql = readFileSync(resolve("supabase/migrations/001_control_tower.sql"), "utf8");
  const normalized = sql.toLowerCase();
  const tables = [...normalized.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);

  it("enables RLS and declares at least one policy for every table", () => {
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(normalized).toContain(`alter table public.${table} enable row level security`);
      expect(normalized).toMatch(new RegExp(`create policy [a-z_]+ on public\\.${table} `));
    }
    expect(validateRlsContract(sql)).toEqual([]);
  });

  it("makes decisions, receipts, and audit history append-only for authenticated users", () => {
    expect(normalized).toContain("revoke update, delete on public.decisions from authenticated");
    expect(normalized).toContain("revoke update, delete on public.review_receipts from authenticated");
    expect(normalized).toContain("revoke update, delete on public.audit_events from authenticated");
  });

  it("kills tenant and role mutations in the contract checker", () => {
    const withoutRoleAuthorization = sql.replaceAll("app_private.has_tenant_role", "app_private.is_tenant_member");
    expect(validateRlsContract(withoutRoleAuthorization)).toContain("role-aware authorization helper is missing");

    const withoutTenantBoundKey = sql.replace(
      "foreign key (portfolio_id, organization_id) references public.portfolios(id, organization_id)",
      "foreign key (portfolio_id) references public.portfolios(id)",
    );
    expect(validateRlsContract(withoutTenantBoundKey)).toContain("engagements: tenant-bound parent key is missing");
  });
});
