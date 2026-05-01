import { apiFetch } from './client';
import type { Deal, Tenant, Inspection, ComplianceDeadline, MarketListing, Lender, PHA, DealDocument } from '@cathedral/shared-types';
import type { PortfolioDeal } from '@cathedral/calculations';

// ─── Deals ──────────────────────────────────────────────────────────────────

export async function fetchDeals(): Promise<Deal[]> {
  return apiFetch<Deal[]>('/api/deals');
}

export async function fetchDeal(id: string): Promise<Deal | null> {
  return apiFetch<Deal | null>(`/api/deals?id=${encodeURIComponent(id)}`);
}

export async function upsertDeal(deal: Partial<Deal>): Promise<Deal> {
  return apiFetch<Deal>('/api/deals', {
    method: 'POST',
    body: JSON.stringify(deal),
  });
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

export async function fetchTenants(dealId?: string): Promise<Tenant[]> {
  const qs = dealId ? `?deal_id=${encodeURIComponent(dealId)}` : '';
  return apiFetch<Tenant[]>(`/api/tenants${qs}`);
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function fetchInspections(dealId?: string): Promise<Inspection[]> {
  const qs = dealId ? `?deal_id=${encodeURIComponent(dealId)}` : '';
  return apiFetch<Inspection[]>(`/api/inspections${qs}`);
}

// ─── Compliance ───────────────────────────────────────────────────────────────

export async function fetchDeadlines(dealId?: string): Promise<ComplianceDeadline[]> {
  const qs = dealId ? `?deal_id=${encodeURIComponent(dealId)}` : '';
  return apiFetch<ComplianceDeadline[]>(`/api/deadlines${qs}`);
}

// ─── Market ───────────────────────────────────────────────────────────────────

export async function fetchListings(): Promise<MarketListing[]> {
  return apiFetch<MarketListing[]>('/api/listings');
}

// ─── Lenders ──────────────────────────────────────────────────────────────────

export async function fetchLenders(): Promise<Lender[]> {
  return apiFetch<Lender[]>('/api/lenders');
}

// ─── PHAs ─────────────────────────────────────────────────────────────────────

export async function fetchPHAs(): Promise<PHA[]> {
  return apiFetch<PHA[]>('/api/phas');
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function fetchDocuments(dealId?: string): Promise<DealDocument[]> {
  const qs = dealId ? `?deal_id=${encodeURIComponent(dealId)}` : '';
  return apiFetch<DealDocument[]>(`/api/documents${qs}`);
}

export async function createDocument(doc: Partial<DealDocument>): Promise<DealDocument> {
  return apiFetch<DealDocument>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(doc),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await apiFetch<{ deleted: boolean }>(`/api/documents?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export async function fetchPortfolioDeals(): Promise<PortfolioDeal[]> {
  return apiFetch<PortfolioDeal[]>('/api/portfolio');
}
