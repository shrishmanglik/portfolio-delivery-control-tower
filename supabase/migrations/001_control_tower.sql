-- Proposed persistence adapter. Not applied to any provider.
-- Every table enables RLS; local demo execution uses synthetic in-memory fixtures.

create schema if not exists app_private;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('portfolio_director','project_manager','account_lead','resource_manager','functional_lead','finance_partner','executive_reviewer')),
  primary key (organization_id, user_id)
);

create or replace function app_private.is_tenant_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_organization_id and user_id = auth.uid()
  );
$$;

revoke all on function app_private.is_tenant_member(uuid) from public;
grant execute on function app_private.is_tenant_member(uuid) to authenticated;

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  currency text not null check (currency in ('CAD','USD','EUR','GBP')),
  period text not null,
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  account_name text not null,
  name text not null,
  scope_version text not null,
  status text not null,
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  source_system text not null,
  source_version text not null,
  captured_at timestamptz not null,
  validated_at timestamptz,
  payload jsonb not null,
  unique (engagement_id, source_system, source_version)
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null,
  state text not null,
  owner_user_id uuid references auth.users(id),
  blocked_reason text,
  dependency_owner text,
  next_action text,
  review_at timestamptz,
  due_at timestamptz not null,
  constraint blocked_contract check (state <> 'blocked' or (blocked_reason is not null and dependency_owner is not null and next_action is not null and review_at is not null))
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  statement text not null,
  probability smallint not null check (probability between 1 and 5),
  impact smallint not null check (impact between 1 and 5),
  trigger text not null,
  mitigation text not null,
  contingency text not null,
  owner_user_id uuid not null references auth.users(id),
  state text not null,
  revision integer not null default 1
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  question text not null,
  recommendation text not null,
  risk_level text not null check (risk_level in ('standard','high')),
  submitted_by uuid not null references auth.users(id),
  approved_by uuid not null references auth.users(id),
  source_versions jsonb not null,
  created_at timestamptz not null default now(),
  constraint high_risk_separation check (risk_level <> 'high' or submitted_by <> approved_by)
);

create table public.review_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  decision_id uuid not null references public.decisions(id),
  canonical_payload jsonb not null,
  digest text not null,
  correction_of uuid references public.review_receipts(id),
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  before_value jsonb,
  after_value jsonb,
  source_version text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.portfolios enable row level security;
alter table public.engagements enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.work_items enable row level security;
alter table public.risks enable row level security;
alter table public.decisions enable row level security;
alter table public.review_receipts enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_member_select on public.organizations for select to authenticated using (app_private.is_tenant_member(id));
create policy memberships_self_select on public.memberships for select to authenticated using (user_id = auth.uid());
create policy portfolios_member_all on public.portfolios for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy engagements_member_all on public.engagements for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy source_snapshots_member_all on public.source_snapshots for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy work_items_member_all on public.work_items for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy risks_member_all on public.risks for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy decisions_member_all on public.decisions for all to authenticated using (app_private.is_tenant_member(organization_id)) with check (app_private.is_tenant_member(organization_id));
create policy review_receipts_member_select on public.review_receipts for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy review_receipts_member_insert on public.review_receipts for insert to authenticated with check (app_private.is_tenant_member(organization_id));
create policy audit_events_member_select on public.audit_events for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy audit_events_member_insert on public.audit_events for insert to authenticated with check (app_private.is_tenant_member(organization_id) and actor_user_id = auth.uid());

revoke update, delete on public.review_receipts from authenticated;
revoke update, delete on public.audit_events from authenticated;
