import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({})) as { deal_id?: string };
    const { deal_id } = body;

    // Fetch deals to recalculate
    let query = supabase.from('deal_financials').select('*');
    if (deal_id) query = query.eq('deal_id', deal_id);
    const { data: financials, error } = await query;
    if (error) throw error;

    const results: { deal_id: string; noi: number; dscr: number; cashflow: number }[] = [];

    for (const df of financials ?? []) {
      const r = df.interest_rate / 100 / 12;
      const n = (df.term_years ?? 30) * 12;
      const principal = (df.purchase_price ?? 0) * (1 - (df.down_payment_pct ?? 3.5) / 100);

      let monthlyPayment = 0;
      if (r > 0 && principal > 0) {
        monthlyPayment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      }

      const egi = (df.gross_monthly_rent ?? 0) * (1 - (df.vacancy_pct ?? 5) / 100);
      const opex = egi * ((df.expense_pct ?? 40) / 100);
      const noi = egi - opex;
      const cashflow = noi - monthlyPayment;
      const annualDebtService = monthlyPayment * 12;
      const dscr = annualDebtService > 0 ? (noi * 12) / annualDebtService : 0;
      const capRate = (df.purchase_price ?? 0) > 0 ? ((noi * 12) / df.purchase_price) * 100 : 0;
      const cocReturn = (df.down_payment_pct ?? 0) > 0
        ? ((cashflow * 12) / ((df.purchase_price ?? 0) * ((df.down_payment_pct ?? 3.5) / 100))) * 100
        : 0;

      // Upsert financial snapshot
      await supabase.from('financial_snapshots').upsert({
        deal_id: df.deal_id,
        snapshot_date: new Date().toISOString().split('T')[0],
        noi: Math.round(noi * 100) / 100,
        dscr: Math.round(dscr * 1000) / 1000,
        cashflow: Math.round(cashflow * 100) / 100,
        cap_rate: Math.round(capRate * 100) / 100,
        coc_return: Math.round(cocReturn * 100) / 100,
      });

      results.push({ deal_id: df.deal_id, noi, dscr, cashflow });
    }

    return new Response(
      JSON.stringify({ recalculated: results.length, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
