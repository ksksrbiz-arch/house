-- Cathedral Acquisitions: Initial Schema
-- 17 tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Reference Tables ──────────────────────────────────────────────────────

create table public.states (
  code      char(2) primary key,
  name      text    not null
);

create table public.phas (
  id                     uuid primary key default gen_random_uuid(),
  name                   text    not null,
  state                  char(2) references states(code),
  contact_email          text,
  contact_phone          text,
  avg_days_rta_to_hap    int     default 45,
  payment_standard_2br   numeric(10,2) default 0,
  notes                  text,
  created_at             timestamptz default now()
);

create table public.lenders (
  id           uuid primary key default gen_random_uuid(),
  name         text    not null,
  loan_type    text    not null check (loan_type in ('FHA','DSCR','Conventional','Portfolio','Hard Money')),
  min_ltv      numeric(5,2) default 0,
  max_ltv      numeric(5,2) default 97,
  rate_floor   numeric(5,3) default 0,
  rate_ceiling numeric(5,3) default 20,
  min_dscr     numeric(4,2),
  min_fico     int     default 620,
  states       text[]  default '{}',
  notes        text,
  last_updated date    default current_date
);

-- ─── Core Deal Tables ──────────────────────────────────────────────────────

create table public.deals (
  id           uuid primary key default gen_random_uuid(),
  address      text    not null,
  city         text    not null,
  state        char(2) references states(code),
  zip          text,
  asking_price numeric(12,2) default 0,
  units        int     default 1,
  stage        text    not null default 'prospecting'
               check (stage in ('prospecting','under_contract','due_diligence','financing','closing','closed','dead')),
  pha_id       uuid    references phas(id),
  assigned_to  text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.deal_financials (
  id                  uuid primary key default gen_random_uuid(),
  deal_id             uuid not null references deals(id) on delete cascade,
  purchase_price      numeric(12,2),
  rehab_cost          numeric(12,2) default 0,
  down_payment_pct    numeric(5,2)  default 3.5,
  interest_rate       numeric(5,3)  default 7.25,
  term_years          int           default 30,
  gross_monthly_rent  numeric(10,2) default 0,
  vacancy_pct         numeric(5,2)  default 5,
  expense_pct         numeric(5,2)  default 40,
  loan_type           text          default 'FHA',
  lender_id           uuid references lenders(id),
  created_at          timestamptz   default now(),
  updated_at          timestamptz   default now()
);

create table public.deal_documents (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references deals(id) on delete cascade,
  name        text not null,
  doc_type    text,
  storage_key text not null,
  uploaded_by text,
  created_at  timestamptz default now()
);

-- ─── Inspections ──────────────────────────────────────────────────────────

create table public.inspections (
  id               uuid primary key default gen_random_uuid(),
  deal_id          uuid not null references deals(id) on delete cascade,
  inspection_date  date,
  inspector_name   text,
  score            int check (score between 0 and 100),
  passed           boolean default false,
  checklist        jsonb   default '[]',
  notes            text,
  created_at       timestamptz default now()
);

-- ─── Tenants / Vouchers ───────────────────────────────────────────────────

create table public.tenants (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references deals(id) on delete cascade,
  full_name       text not null,
  voucher_number  text,
  pha_id          uuid references phas(id),
  bedroom_size    int  default 2,
  voucher_status  text not null default 'referred'
                  check (voucher_status in ('referred','screening','approved','rta_submitted','hap_contract','housed','rejected')),
  move_in_date    date,
  notes           text,
  created_at      timestamptz default now()
);

create table public.hap_contracts (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references deals(id) on delete cascade,
  tenant_id       uuid references tenants(id),
  pha_id          uuid references phas(id),
  unit_number     text,
  bedroom_size    int,
  contract_rent   numeric(10,2),
  hap_payment     numeric(10,2),
  tenant_portion  numeric(10,2),
  effective_date  date,
  expiration_date date,
  created_at      timestamptz default now()
);

-- ─── Compliance ───────────────────────────────────────────────────────────

create table public.compliance_deadlines (
  id             uuid primary key default gen_random_uuid(),
  deal_id        uuid not null references deals(id) on delete cascade,
  deadline_type  text not null
                 check (deadline_type in ('inspection_schedule','rta_submission','hap_execution','lead_disclosure','closing','rent_increase','annual_recert','mip_cancellation')),
  due_date       date not null,
  completed_at   timestamptz,
  notes          text,
  created_at     timestamptz default now()
);

create table public.rfta_submissions (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references deals(id) on delete cascade,
  tenant_id       uuid references tenants(id),
  pha_id          uuid references phas(id),
  submitted_at    timestamptz,
  accepted_at     timestamptz,
  rejection_reason text,
  notes           text,
  created_at      timestamptz default now()
);

-- ─── Market ───────────────────────────────────────────────────────────────

create table public.market_listings (
  id           uuid primary key default gen_random_uuid(),
  address      text    not null,
  city         text    not null,
  state        char(2) references states(code),
  asking_price numeric(12,2) default 0,
  units        int     default 1,
  gross_rent   numeric(10,2) default 0,
  grm          numeric(6,2)  default 0,
  score        int     default 0 check (score between 0 and 100),
  flagged      boolean default false,
  source       text    default 'manual',
  raw_data     jsonb   default '{}',
  listed_at    date    default current_date,
  created_at   timestamptz default now()
);

-- ─── Finances ─────────────────────────────────────────────────────────────

create table public.financial_snapshots (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references deals(id) on delete cascade,
  snapshot_date   date not null default current_date,
  noi             numeric(12,2),
  dscr            numeric(5,3),
  cashflow        numeric(12,2),
  cap_rate        numeric(5,2),
  coc_return      numeric(5,2),
  total_debt      numeric(12,2),
  equity          numeric(12,2),
  created_at      timestamptz default now()
);

-- ─── Logs ─────────────────────────────────────────────────────────────────

create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  table_name  text    not null,
  row_id      uuid    not null,
  action      text    not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  performed_by text,
  created_at  timestamptz default now()
);

-- ─── Triggers for updated_at ──────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

create trigger deal_financials_updated_at
  before update on deal_financials
  for each row execute function update_updated_at();
