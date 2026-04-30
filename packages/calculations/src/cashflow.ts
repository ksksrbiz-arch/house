import type { CashflowInputs, CashflowResult } from '@cathedral/shared-types';

/**
 * Calculate proforma cashflow, NOI, cash-on-cash return, and cap rate.
 */
export function calcCashflow(inputs: CashflowInputs): CashflowResult {
  const {
    grossRent,
    vacancyRatePct,
    operatingExpensePct,
    monthlyDebtService,
    purchasePrice,
    downPaymentAmt,
  } = inputs;

  const vacancyLoss = round2(grossRent * (vacancyRatePct / 100));
  const effectiveGrossIncome = round2(grossRent - vacancyLoss);
  const operatingExpenses = round2(effectiveGrossIncome * (operatingExpensePct / 100));
  const noi = round2(effectiveGrossIncome - operatingExpenses);
  const cashflow = round2(noi - monthlyDebtService);
  const annualCashflow = round2(cashflow * 12);
  const cocReturn = downPaymentAmt > 0 ? round2((annualCashflow / downPaymentAmt) * 100) : 0;
  const capRate = purchasePrice > 0 ? round2(((noi * 12) / purchasePrice) * 100) : 0;

  return {
    effectiveGrossIncome,
    noi,
    cashflow,
    annualCashflow,
    cocReturn,
    capRate,
  };
}

/**
 * Gross Rent Multiplier: purchase price / annual gross rent.
 */
export function calcGRM(purchasePrice: number, monthlyGrossRent: number): number {
  if (monthlyGrossRent === 0) throw new Error('Monthly gross rent cannot be zero');
  return round2(purchasePrice / (monthlyGrossRent * 12));
}

/**
 * 50% rule quick estimate: monthly cashflow ≈ grossRent/2 - debtService.
 */
export function fiftyPercentRule(monthlyGrossRent: number, monthlyDebtService: number): number {
  return round2(monthlyGrossRent * 0.5 - monthlyDebtService);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
