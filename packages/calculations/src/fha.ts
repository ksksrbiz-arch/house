import type { FHAInputs, FHAResult } from '@cathedral/shared-types';
import { calcMonthlyPayment } from './mortgage.js';

// FHA UFMIP rate (upfront mortgage insurance premium) — 1.75% of base loan
const UFMIP_RATE = 0.0175;

// Annual MIP rates (simplified; varies by term/LTV — using standard >15yr table)
function annualMIPRate(ltv: number, termYears: number): number {
  if (termYears <= 15) {
    if (ltv <= 0.9) return 0.0015;
    return 0.004;
  }
  // > 15 years
  if (ltv <= 0.9) return 0.005;
  if (ltv <= 0.95) return 0.008;
  return 0.0085;
}

/**
 * Calculate FHA loan metrics including UFMIP, MIP, and monthly payment.
 */
export function calcFHA(inputs: FHAInputs): FHAResult {
  const { purchasePrice, downPaymentPct, annualRatePct, termYears } = inputs;
  const downPaymentAmt = purchasePrice * (downPaymentPct / 100);
  const base = inputs.baseLoanAmount ?? purchasePrice - downPaymentAmt;
  const ltv = base / purchasePrice;
  const ufmip = round2(base * UFMIP_RATE);
  const totalLoan = round2(base + ufmip);
  const monthlyMIP = round2((base * annualMIPRate(ltv, termYears)) / 12);
  const pi = calcMonthlyPayment({ principal: totalLoan, annualRatePct, termYears });
  return {
    baseLoanAmount: round2(base),
    ufmip,
    totalLoanAmount: totalLoan,
    monthlyMIP,
    monthlyPayment: round2(pi + monthlyMIP),
    ltv: round2(ltv * 100),
  };
}

/**
 * Validate FHA eligibility: minimum 3.5% down for FICO >= 580.
 * Returns true if down payment is sufficient.
 */
export function fhaDownPaymentOk(purchasePrice: number, downPaymentAmt: number, fico: number): boolean {
  const minPct = fico >= 580 ? 0.035 : 0.1;
  return downPaymentAmt / purchasePrice >= minPct;
}

/**
 * FHA owner-occupant house hack: max 4 units, buyer must occupy one unit.
 * Returns whether unit count qualifies.
 */
export function fhaHouseHackEligible(units: number): boolean {
  return units >= 1 && units <= 4;
}

/**
 * Self-Sufficiency Test (SST) for 3-4 unit FHA loans.
 * Net rental income (75% of market rent) must >= PITI.
 */
export function sstPasses(
  grossMarketRent: number, // total monthly rent from non-owner units
  piti: number             // principal + interest + taxes + insurance (monthly)
): boolean {
  return grossMarketRent * 0.75 >= piti;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
