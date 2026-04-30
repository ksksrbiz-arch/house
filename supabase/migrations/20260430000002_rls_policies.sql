-- RLS Policies: Single-tenant permissive (replace with per-user checks at scale)

alter table public.deals                enable row level security;
alter table public.deal_financials      enable row level security;
alter table public.deal_documents       enable row level security;
alter table public.inspections          enable row level security;
alter table public.tenants              enable row level security;
alter table public.hap_contracts        enable row level security;
alter table public.compliance_deadlines enable row level security;
alter table public.rfta_submissions     enable row level security;
alter table public.market_listings      enable row level security;
alter table public.financial_snapshots  enable row level security;
alter table public.audit_log            enable row level security;
alter table public.phas                 enable row level security;
alter table public.lenders              enable row level security;
alter table public.states               enable row level security;

-- ─── Permissive single-tenant policies ───────────────────────────────────
-- TODO: Replace with (auth.uid() in (select user_id from members where deal_id = ...)) at scale

create policy "Authenticated users: full access to deals"
  on public.deals to authenticated using (true) with check (true);

create policy "Authenticated users: full access to deal_financials"
  on public.deal_financials to authenticated using (true) with check (true);

create policy "Authenticated users: full access to deal_documents"
  on public.deal_documents to authenticated using (true) with check (true);

create policy "Authenticated users: full access to inspections"
  on public.inspections to authenticated using (true) with check (true);

create policy "Authenticated users: full access to tenants"
  on public.tenants to authenticated using (true) with check (true);

create policy "Authenticated users: full access to hap_contracts"
  on public.hap_contracts to authenticated using (true) with check (true);

create policy "Authenticated users: full access to compliance_deadlines"
  on public.compliance_deadlines to authenticated using (true) with check (true);

create policy "Authenticated users: full access to rfta_submissions"
  on public.rfta_submissions to authenticated using (true) with check (true);

create policy "Authenticated users: full access to market_listings"
  on public.market_listings to authenticated using (true) with check (true);

create policy "Authenticated users: full access to financial_snapshots"
  on public.financial_snapshots to authenticated using (true) with check (true);

create policy "Authenticated users: full access to audit_log"
  on public.audit_log to authenticated using (true) with check (true);

create policy "Public read: phas"
  on public.phas for select using (true);

create policy "Authenticated write: phas"
  on public.phas for all to authenticated using (true) with check (true);

create policy "Public read: lenders"
  on public.lenders for select using (true);

create policy "Authenticated write: lenders"
  on public.lenders for all to authenticated using (true) with check (true);

create policy "Public read: states"
  on public.states for select using (true);

-- Service role bypass (used by edge functions)
-- Supabase service role automatically bypasses RLS — no policy needed.
