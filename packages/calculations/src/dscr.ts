import type { DSCRInputs, DSCRResult } from '@cathedral/shared-types';

/**
 * Debt Service Coverage Ratio = NOI / Annual Debt Service
 */
export function calcDSCR(inputs: DSCRInputs): DSCRResult {
  const { noi, annualDebtService } = inputs;
  if (annualDebtService === 0) throw new Error('Annual debt service cannot be zero');
  const dscr = round3(noi / annualDebtService);
  return { dscr, tier: dscrTier(dscr) };
}

/**
 * Map a DSCR value to a lender-pricing tier.
 * >= 1.25  → strong
 * >= 1.15  → pass
 * >= 1.00  → borderline
 * <  1.00  → fail
 */
export function dscrTier(dscr: number): DSCRResult['tier'] {
  if (dscr >= 1.25) return 'strong';
  if (dscr >= 1.15) return 'pass';
  if (dscr >= 1.0) return 'borderline';
  return 'fail';
}

/**
 * Minimum loan rate adjustment based on DSCR tier (basis points over index).
 */
export function dscrRateAdj(tier: DSCRResult['tier']): number {
  switch (tier) {
    case 'strong':     return 0;
    case 'pass':       return 25;
    case 'borderline': return 75;
    case 'fail':       return 200;
  }
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
