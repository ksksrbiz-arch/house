-- Views and Functions

-- ─── Views ────────────────────────────────────────────────────────────────

-- Pipeline summary: stage counts and totals
create view public.pipeline_summary as
select
  stage,
  count(*)                       as deal_count,
  sum(asking_price)              as total_value,
  sum(units)                     as total_units
from public.deals
group by stage
order by
  case stage
    when 'prospecting'    then 1
    when 'under_contract' then 2
    when 'due_diligence'  then 3
    when 'financing'      then 4
    when 'closing'        then 5
    when 'closed'         then 6
    when 'dead'           then 7
  end;

-- Overdue compliance deadlines
create view public.overdue_deadlines as
select
  cd.id,
  cd.deal_id,
  d.address,
  d.city,
  d.state,
  cd.deadline_type,
  cd.due_date,
  current_date - cd.due_date as days_overdue,
  cd.notes
from public.compliance_deadlines cd
join public.deals d on d.id = cd.deal_id
where cd.completed_at is null
  and cd.due_date < current_date
order by cd.due_date;

-- Active voucher pipeline
create view public.voucher_pipeline as
select
  t.id,
  t.full_name,
  t.voucher_number,
  t.voucher_status,
  t.bedroom_size,
  p.name as pha_name,
  d.address as deal_address,
  d.city,
  d.state
from public.tenants t
left join public.phas p  on p.id = t.pha_id
left join public.deals d on d.id = t.deal_id
where t.voucher_status not in ('housed', 'rejected')
order by t.created_at;

-- Deal with latest financial snapshot
create view public.deal_snapshot as
select
  d.id,
  d.address,
  d.city,
  d.state,
  d.asking_price,
  d.units,
  d.stage,
  fs.noi,
  fs.dscr,
  fs.cashflow,
  fs.cap_rate,
  fs.coc_return
from public.deals d
left join lateral (
  select *
  from public.financial_snapshots
  where deal_id = d.id
  order by snapshot_date desc
  limit 1
) fs on true;

-- ─── Functions ────────────────────────────────────────────────────────────

-- Mark a compliance deadline complete
create or replace function public.complete_deadline(deadline_id uuid)
returns void
language sql
security definer
as $$
  update public.compliance_deadlines
  set completed_at = now()
  where id = deadline_id;
$$;

-- Compute a quick NOI for a deal (for edge function use)
create or replace function public.calc_noi(deal_id uuid)
returns numeric
language plpgsql
security definer
as $$
declare
  v_rent      numeric;
  v_vacancy   numeric;
  v_expense   numeric;
  v_noi       numeric;
begin
  select
    df.gross_monthly_rent,
    df.vacancy_pct / 100.0,
    df.expense_pct / 100.0
  into v_rent, v_vacancy, v_expense
  from public.deal_financials df
  where df.deal_id = calc_noi.deal_id
  order by df.created_at desc
  limit 1;

  if v_rent is null then return 0; end if;

  v_noi := v_rent * (1 - v_vacancy) * (1 - v_expense) * 12;
  return round(v_noi, 2);
end;
$$;
