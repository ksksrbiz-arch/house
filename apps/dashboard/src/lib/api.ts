import { supabase } from './supabase';
import type { Deal, Tenant, Inspection, ComplianceDeadline, MarketListing, Lender, PHA } from '@cathedral/shared-types';

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
