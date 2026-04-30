import { supabase } from './supabase';
import type { Deal, Tenant, Inspection, ComplianceDeadline, MarketListing, Lender, PHA, DealDocument } from '@cathedral/shared-types';
import type { PortfolioDeal } from '@cathedral/calculations';

// ─── Deals ──────────────────────────────────────────────────────────────────

export async function fetchDeals(): Promise<Deal[]> {
  const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchDeal(id: string): Promise<Deal | null> {
  const { data, error } = await supabase.from('deals').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function upsertDeal(deal: Partial<Deal>): Promise<Deal> {
  const { data, error } = await supabase.from('deals').upsert(deal).select().single();
  if (error) throw error;
  return data;
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

export async function fetchTenants(dealId?: string): Promise<Tenant[]> {
  let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });
  if (dealId) query = query.eq('deal_id', dealId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function fetchInspections(dealId?: string): Promise<Inspection[]> {
  let query = supabase.from('inspections').select('*').order('created_at', { ascending: false });
  if (dealId) query = query.eq('deal_id', dealId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export async function fetchDeadlines(dealId?: string): Promise<ComplianceDeadline[]> {
  let query = supabase.from('compliance_deadlines').select('*').order('due_date');
  if (dealId) query = query.eq('deal_id', dealId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Market ───────────────────────────────────────────────────────────────────

export async function fetchListings(): Promise<MarketListing[]> {
  const { data, error } = await supabase.from('market_listings').select('*').order('score', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Lenders ──────────────────────────────────────────────────────────────────

export async function fetchLenders(): Promise<Lender[]> {
  const { data, error } = await supabase.from('lenders').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

// ─── PHAs ─────────────────────────────────────────────────────────────────────

export async function fetchPHAs(): Promise<PHA[]> {
  const { data, error } = await supabase.from('phas').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function fetchDocuments(dealId?: string): Promise<DealDocument[]> {
  let query = supabase.from('deal_documents').select('*').order('created_at', { ascending: false });
  if (dealId) query = query.eq('deal_id', dealId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createDocument(doc: Partial<DealDocument>): Promise<DealDocument> {
  const { data, error } = await supabase.from('deal_documents').insert(doc).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('deal_documents').delete().eq('id', id);
  if (error) throw error;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

/**
 * Pulls deals joined with their financials in a shape the portfolio aggregation
 * helper can consume directly. Falls back gracefully when financials are absent.
 */
export async function fetchPortfolioDeals(): Promise<PortfolioDeal[]> {
  const { data: deals, error } = await supabase.from('deals').select('*');
  if (error) throw error;
  if (!deals?.length) return [];

  const ids = deals.map((d) => d.id);
  const { data: fins } = await supabase
    .from('deal_financials')
    .select('*')
    .in('deal_id', ids);

  const finByDeal = new Map<string, any>();
  for (const f of fins ?? []) finByDeal.set(f.deal_id, f);

  return deals.map((d) => {
    const f = finByDeal.get(d.id) ?? {};
    const grossRent = Number(f.gross_monthly_rent ?? 0);
    const vac = Number(f.vacancy_pct ?? 0) / 100;
    const exp = Number(f.expense_pct ?? 0) / 100;
    const egi = grossRent * (1 - vac);
    const monthlyNoi = egi * (1 - exp);
    const purchasePrice = Number(f.purchase_price ?? d.asking_price ?? 0);
    const downPaymentAmt = purchasePrice * (Number(f.down_payment_pct ?? 0) / 100);
    return {
      stage: d.stage,
      units: d.units ?? 0,
      asking_price: Number(d.asking_price ?? 0),
      purchase_price: purchasePrice,
      down_payment_amt: downPaymentAmt,
      monthly_gross_rent: grossRent,
      monthly_noi: monthlyNoi,
      // monthly_debt_service requires loan amortization — left undefined here so
      // weighted DSCR/CoC reflect only deals where it has been recorded upstream.
    } as PortfolioDeal;
  });
}
