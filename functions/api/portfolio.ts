import type { Env } from './_helpers';
import { json, handleCors } from './_helpers';

/**
 * GET /api/portfolio — deals joined with financials for portfolio aggregation.
 */

export const onRequestOptions: PagesFunction<Env> = async () => handleCors();

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results: deals } = await env.DB.prepare('SELECT * FROM deals').all();
  if (!deals || deals.length === 0) return json([]);

  const ids = (deals as Array<{ id: string }>).map((d) => d.id);
  // D1 doesn't support array binding, build IN clause manually
  const placeholders = ids.map(() => '?').join(',');
  const { results: fins } = await env.DB.prepare(
    `SELECT * FROM deal_financials WHERE deal_id IN (${placeholders})`
  ).bind(...ids).all();

  const finByDeal = new Map<string, Record<string, unknown>>();
  for (const f of (fins ?? []) as Array<Record<string, unknown>>) {
    finByDeal.set(f.deal_id as string, f);
  }

  const portfolio = (deals as Array<Record<string, unknown>>).map((d) => {
    const f = finByDeal.get(d.id as string) ?? {};
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
    };
  });

  return json(portfolio);
};
