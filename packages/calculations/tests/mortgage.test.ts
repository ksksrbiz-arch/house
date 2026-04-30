import { describe, it, expect } from 'vitest';
import { calcMortgage, calcMonthlyPayment, amortizationSchedule } from '../src/mortgage.js';

describe('calcMonthlyPayment', () => {
  it('computes standard 30yr 7% $300k payment', () => {
    const result = calcMonthlyPayment({ principal: 300_000, annualRatePct: 7, termYears: 30 });
    expect(result).toBeCloseTo(1995.91, 1);
  });

  it('handles 0% interest rate (edge case)', () => {
    const result = calcMonthlyPayment({ principal: 120_000, annualRatePct: 0, termYears: 10 });
    expect(result).toBeCloseTo(1000, 1);
  });

  it('15-year loan has higher payment than 30-year', () => {
    const p30 = calcMonthlyPayment({ principal: 200_000, annualRatePct: 6.5, termYears: 30 });
    const p15 = calcMonthlyPayment({ principal: 200_000, annualRatePct: 6.5, termYears: 15 });
    expect(p15).toBeGreaterThan(p30);
  });
});

describe('calcMortgage', () => {
  it('returns monthly payment, total interest, total paid', () => {
    const result = calcMortgage({ principal: 200_000, annualRatePct: 6, termYears: 30 });
    expect(result.monthlyPayment).toBeCloseTo(1199.1, 0);
    expect(result.totalPaid).toBeGreaterThan(200_000);
    expect(result.totalInterest).toBeCloseTo(result.totalPaid - 200_000, 0);
  });

  it('total paid is approximately monthly * n months', () => {
    const inputs = { principal: 150_000, annualRatePct: 7.5, termYears: 30 };
    const result = calcMortgage(inputs);
    // totalPaid is computed from exact payment; monthlyPayment is rounded to 2dp so small diff expected
    expect(Math.abs(result.totalPaid - result.monthlyPayment * 360)).toBeLessThan(5);
  });
});

describe('amortizationSchedule', () => {
  it('generates correct number of rows', () => {
    const schedule = amortizationSchedule({ principal: 100_000, annualRatePct: 5, termYears: 10 });
    expect(schedule).toHaveLength(120);
  });

  it('first row has mostly interest', () => {
    const schedule = amortizationSchedule({ principal: 300_000, annualRatePct: 7, termYears: 30 });
    expect(schedule[0].interest).toBeGreaterThan(schedule[0].principal);
  });

  it('last row balance is ~0', () => {
    const schedule = amortizationSchedule({ principal: 200_000, annualRatePct: 6, termYears: 30 });
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
  });

  it('running balance decreases over time', () => {
    const schedule = amortizationSchedule({ principal: 250_000, annualRatePct: 6.5, termYears: 15 });
    expect(schedule[0].balance).toBeGreaterThan(schedule[100].balance);
  });
});
