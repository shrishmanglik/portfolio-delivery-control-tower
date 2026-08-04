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

create or replace function app_private.has_tenant_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

revoke all on function app_private.has_tenant_role(uuid, text[]) from public;
grant execute on function app_private.has_tenant_role(uuid, text[]) to authenticated;

create or replace function app_private.user_has_tenant_role(target_organization_id uuid, target_user_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_organization_id
      and user_id = target_user_id
      and role = any(allowed_roles)
  );
$$;

revoke all on function app_private.user_has_tenant_role(uuid, uuid, text[]) from public;
grant execute on function app_private.user_has_tenant_role(uuid, uuid, text[]) to authenticated;

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  currency text not null check (currency in ('CAD','USD','EUR','GBP')),
  period text not null,
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_id uuid not null,
  account_name text not null,
  name text not null,
  scope_version text not null,
  status text not null,
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (portfolio_id, organization_id) references public.portfolios(id, organization_id) on delete cascade
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null,
  source_system text not null,
  source_version text not null,
  captured_at timestamptz not null,
  validated_at timestamptz,
  payload jsonb not null,
  unique (engagement_id, source_system, source_version),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete cascade
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null,
  title text not null,
  state text not null,
  owner_user_id uuid references auth.users(id),
  blocked_reason text,
  dependency_owner text,
  next_action text,
  review_at timestamptz,
  due_at timestamptz not null,
  constraint blocked_contract check (state <> 'blocked' or (blocked_reason is not null and dependency_owner is not null and next_action is not null and review_at is not null)),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete cascade
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null,
  statement text not null,
  probability smallint not null check (probability between 1 and 5),
  impact smallint not null check (impact between 1 and 5),
  trigger text not null,
  mitigation text not null,
  contingency text not null,
  owner_user_id uuid not null references auth.users(id),
  state text not null,
  revision integer not null default 1,
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete cascade
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null,
  question text not null,
  recommendation text not null,
  risk_level text not null check (risk_level in ('standard','high')),
  submitted_by uuid not null references auth.users(id),
  approved_by uuid not null references auth.users(id),
  source_versions jsonb not null,
  created_at timestamptz not null default now(),
  constraint high_risk_separation check (risk_level <> 'high' or submitted_by <> approved_by),
  unique (id, organization_id),
  unique (id, engagement_id, organization_id),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete cascade
);

create table public.review_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null,
  decision_id uuid not null,
  canonical_payload jsonb not null,
  digest text not null,
  correction_of uuid,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (engagement_id, organization_id) references public.engagements(id, organization_id) on delete cascade,
  foreign key (decision_id, engagement_id, organization_id) references public.decisions(id, engagement_id, organization_id),
  foreign key (correction_of, organization_id) references public.review_receipts(id, organization_id)
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
create policy memberships_member_select on public.memberships for select to authenticated using (user_id = auth.uid() or app_private.has_tenant_role(organization_id, array['portfolio_director']));

create policy portfolios_member_select on public.portfolios for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy portfolios_director_insert on public.portfolios for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director']) and owner_user_id = auth.uid());
create policy portfolios_director_update on public.portfolios for update to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director'])) with check (app_private.has_tenant_role(organization_id, array['portfolio_director']));
create policy portfolios_director_delete on public.portfolios for delete to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director']));

create policy engagements_member_select on public.engagements for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy engagements_delivery_insert on public.engagements for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','account_lead']));
create policy engagements_delivery_update on public.engagements for update to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','account_lead'])) with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','account_lead']));
create policy engagements_director_delete on public.engagements for delete to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director']));

create policy source_snapshots_member_select on public.source_snapshots for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy source_snapshots_steward_insert on public.source_snapshots for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','resource_manager','finance_partner']));
create policy source_snapshots_steward_update on public.source_snapshots for update to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','resource_manager','finance_partner'])) with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','resource_manager','finance_partner']));

create policy work_items_member_select on public.work_items for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy work_items_delivery_insert on public.work_items for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead']));
create policy work_items_delivery_update on public.work_items for update to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead'])) with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead']));
create policy work_items_director_delete on public.work_items for delete to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director']));

create policy risks_member_select on public.risks for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy risks_delivery_insert on public.risks for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead']));
create policy risks_delivery_update on public.risks for update to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead'])) with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','functional_lead']));
create policy risks_director_delete on public.risks for delete to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director']));

create policy decisions_member_select on public.decisions for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy decisions_authority_insert on public.decisions for insert to authenticated with check (submitted_by = auth.uid() and app_private.has_tenant_role(organization_id, array['portfolio_director','account_lead','finance_partner','executive_reviewer']) and app_private.user_has_tenant_role(organization_id, approved_by, array['portfolio_director','account_lead','finance_partner','executive_reviewer']));
create policy review_receipts_member_select on public.review_receipts for select to authenticated using (app_private.is_tenant_member(organization_id));
create policy review_receipts_authority_insert on public.review_receipts for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','executive_reviewer']));
create policy audit_events_authority_select on public.audit_events for select to authenticated using (app_private.has_tenant_role(organization_id, array['portfolio_director','executive_reviewer']));
create policy audit_events_member_insert on public.audit_events for insert to authenticated with check (app_private.has_tenant_role(organization_id, array['portfolio_director','project_manager','account_lead','resource_manager','functional_lead','finance_partner','executive_reviewer']) and actor_user_id = auth.uid());

revoke update, delete on public.decisions from authenticated;
revoke update, delete on public.review_receipts from authenticated;
revoke update, delete on public.audit_events from authenticated;
