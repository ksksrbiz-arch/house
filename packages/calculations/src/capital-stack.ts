import type { CapitalStackInputs, CapitalStackResult } from '@cathedral/shared-types';

/**
 * Compute sources & uses for a deal's capital stack.
 */
export function calcCapitalStack(inputs: CapitalStackInputs): CapitalStackResult {
  const {
    purchasePrice,
    rehabCost,
    closingCostsPct,
    downPaymentPct,
    sellerConcessionAmt = 0,
    giftFundsAmt = 0,
  } = inputs;

  const downPayment = round2(purchasePrice * (downPaymentPct / 100));
  const loanAmount = round2(purchasePrice - downPayment);
  const closingCosts = round2(purchasePrice * (closingCostsPct / 100));
  const totalUses = round2(purchasePrice + rehabCost + closingCosts);
  const cashToClose = round2(
    downPayment + closingCosts + rehabCost - sellerConcessionAmt - giftFundsAmt
  );
  const equityAtPurchase = round2(purchasePrice - loanAmount);

  return {
    totalUses,
    loanAmount,
    downPayment,
    closingCosts,
    cashToClose,
    equityAtPurchase,
  };
}

/**
 * Check whether cash-to-close can be covered by available liquid assets.
 */
export function cashToCloseFeasible(cashToClose: number, liquidAssets: number): boolean {
  return liquidAssets >= cashToClose;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
