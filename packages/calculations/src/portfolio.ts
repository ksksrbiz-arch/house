import type { PortfolioMetrics } from '@cathedral/shared-types';

/**
 * Per-deal slice used for portfolio aggregation. Fields mirror the columns we
 * actually have in `deals` + `deal_financials` joined together.
 */
export interface PortfolioDeal {
  stage: string;
  units?: number;
  asking_price?: number;
  purchase_price?: number;
  down_payment_amt?: number;
  monthly_gross_rent?: number;
  monthly_noi?: number;
  monthly_debt_service?: number;
  monthly_cashflow?: number;
  cap_rate?: number;        // %
  coc_return?: number;      // %
  dscr?: number;
}

const ACTIVE_STAGES = new Set([
  'prospecting',
  'under_contract',
  'due_diligence',
  'financing',
  'closing',
]);

export function aggregatePortfolio(deals: PortfolioDeal[]): PortfolioMetrics {
  const totalDeals = deals.length;
  const activeDeals = deals.filter((d) => ACTIVE_STAGES.has(d.stage)).length;
  const closedDeals = deals.filter((d) => d.stage === 'closed').length;

  const totalUnits = sum(deals.map((d) => d.units ?? 0));
  const totalAskingValue = sum(deals.map((d) => d.asking_price ?? 0));
  const totalMonthlyGrossRent = sum(deals.map((d) => d.monthly_gross_rent ?? 0));
  const totalAnnualNOI = sum(deals.map((d) => (d.monthly_noi ?? 0) * 12));

  const closed = deals.filter((d) => d.stage === 'closed');
  const totalPurchase = sum(closed.map((d) => d.purchase_price ?? d.asking_price ?? 0));
  const totalDownPayment = sum(closed.map((d) => d.down_payment_amt ?? 0));
  const closedAnnualNOI = sum(closed.map((d) => (d.monthly_noi ?? 0) * 12));
  const closedAnnualCashflow = sum(
    closed.map((d) => ((d.monthly_noi ?? 0) - (d.monthly_debt_service ?? 0)) * 12),
  );
  const closedDebtService = sum(closed.map((d) => (d.monthly_debt_service ?? 0) * 12));

  const weightedCapRate = totalPurchase > 0
    ? round2((closedAnnualNOI / totalPurchase) * 100)
    : 0;
  const weightedCoCReturn = totalDownPayment > 0
    ? round2((closedAnnualCashflow / totalDownPayment) * 100)
    : 0;
  const weightedDSCR = closedDebtService > 0
    ? round2(closedAnnualNOI / closedDebtService)
    : 0;

  const pipelineValue = sum(
    deals.filter((d) => ACTIVE_STAGES.has(d.stage)).map((d) => d.asking_price ?? 0),
  );

  const stageBreakdown: Record<string, number> = {};
  for (const d of deals) {
    stageBreakdown[d.stage] = (stageBreakdown[d.stage] ?? 0) + 1;
  }

  return {
    totalDeals,
    activeDeals,
    closedDeals,
    totalUnits,
    totalAskingValue: round2(totalAskingValue),
    totalMonthlyGrossRent: round2(totalMonthlyGrossRent),
    totalAnnualNOI: round2(totalAnnualNOI),
    weightedCapRate,
    weightedCoCReturn,
    weightedDSCR,
    pipelineValue: round2(pipelineValue),
    stageBreakdown,
  };
}

/**
 * Conversion rate: deals reaching `closed` / deals that ever entered the funnel.
 * Excludes `dead` deals from the denominator only when `excludeDead` is true.
 */
export function conversionRate(deals: PortfolioDeal[], excludeDead = false): number {
  const denom = excludeDead
    ? deals.filter((d) => d.stage !== 'dead').length
    : deals.length;
  if (denom === 0) return 0;
  const closed = deals.filter((d) => d.stage === 'closed').length;
  return round2((closed / denom) * 100);
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
