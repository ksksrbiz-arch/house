import type { Env } from './_helpers';
import { json } from './_helpers';

/**
 * POST /api/financial-recalc
 * Recalculates deal financials (NOI, DSCR, cashflow, cap rate, CoC return).
 * Replaces supabase/functions/financial-recalc.
 */
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await request.json().catch(() => ({})) as { deal_id?: string };

    let results;
    if (body.deal_id) {
      ({ results } = await env.DB.prepare(
        'SELECT * FROM deal_financials WHERE deal_id = ?'
      ).bind(body.deal_id).all());
    } else {
      ({ results } = await env.DB.prepare('SELECT * FROM deal_financials').all());
    }

    const financials = results as Array<Record<string, unknown>> ?? [];
    const output: { deal_id: string; noi: number; dscr: number; cashflow: number }[] = [];

    for (const df of financials) {
      const r = (df.interest_rate as number) / 100 / 12;
      const n = ((df.term_years as number) ?? 30) * 12;
      const principal = ((df.purchase_price as number) ?? 0) * (1 - ((df.down_payment_pct as number) ?? 3.5) / 100);

      let monthlyPayment = 0;
      if (r > 0 && principal > 0) {
        monthlyPayment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      }

      const egi = ((df.gross_monthly_rent as number) ?? 0) * (1 - ((df.vacancy_pct as number) ?? 5) / 100);
      const opex = egi * (((df.expense_pct as number) ?? 40) / 100);
      const noi = egi - opex;
      const cashflow = noi - monthlyPayment;
      const annualDebtService = monthlyPayment * 12;
      const dscr = annualDebtService > 0 ? (noi * 12) / annualDebtService : 0;
      const purchasePrice = (df.purchase_price as number) ?? 0;
      const capRate = purchasePrice > 0 ? ((noi * 12) / purchasePrice) * 100 : 0;
      const cocReturn = ((df.down_payment_pct as number) ?? 0) > 0
        ? ((cashflow * 12) / (purchasePrice * (((df.down_payment_pct as number) ?? 3.5) / 100))) * 100
        : 0;

      const today = new Date().toISOString().split('T')[0];
      await env.DB.prepare(`
        INSERT INTO financial_snapshots (id, deal_id, snapshot_date, noi, dscr, cashflow, cap_rate, coc_return)
        VALUES (lower(hex(randomblob(16))), ?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(deal_id, snapshot_date) DO UPDATE SET
          noi = excluded.noi,
          dscr = excluded.dscr,
          cashflow = excluded.cashflow,
          cap_rate = excluded.cap_rate,
          coc_return = excluded.coc_return
      `).bind(
        df.deal_id as string,
        today,
        Math.round(noi * 100) / 100,
        Math.round(dscr * 1000) / 1000,
        Math.round(cashflow * 100) / 100,
        Math.round(capRate * 100) / 100,
        Math.round(cocReturn * 100) / 100,
      ).run();

      output.push({ deal_id: df.deal_id as string, noi, dscr, cashflow });
    }

    return json({ recalculated: output.length, results: output });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
};
