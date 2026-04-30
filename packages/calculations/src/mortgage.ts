import type { MortgageInputs, MortgageResult } from '@cathedral/shared-types';

/**
 * Compute the monthly P&I payment using the standard amortization formula.
 * Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calcMonthlyPayment(inputs: MortgageInputs): number {
  const { principal, annualRatePct, termYears } = inputs;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

/**
 * Full mortgage summary: payment, total interest, total paid.
 */
export function calcMortgage(inputs: MortgageInputs): MortgageResult {
  const monthlyPayment = calcMonthlyPayment(inputs);
  const n = inputs.termYears * 12;
  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - inputs.principal;
  return {
    monthlyPayment: round2(monthlyPayment),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
  };
}

/**
 * Generate a full amortization schedule (array of monthly rows).
 */
export function amortizationSchedule(
  inputs: MortgageInputs
): { month: number; payment: number; principal: number; interest: number; balance: number }[] {
  const { principal, annualRatePct, termYears } = inputs;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  const payment = calcMonthlyPayment(inputs);
  const schedule = [];
  let balance = principal;
  for (let month = 1; month <= n; month++) {
    const interestPmt = balance * r;
    const principalPmt = payment - interestPmt;
    balance -= principalPmt;
    schedule.push({
      month,
      payment: round2(payment),
      principal: round2(principalPmt),
      interest: round2(interestPmt),
      balance: round2(Math.max(0, balance)),
    });
  }
  return schedule;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
