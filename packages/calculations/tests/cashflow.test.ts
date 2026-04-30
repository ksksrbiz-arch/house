import { describe, it, expect } from 'vitest';
import { calcCashflow, calcGRM, fiftyPercentRule } from '../src/cashflow.js';

describe('calcCashflow', () => {
  const base = {
    grossRent: 2_000,
    vacancyRatePct: 5,
    operatingExpensePct: 40,
    monthlyDebtService: 800,
    purchasePrice: 200_000,
    downPaymentAmt: 40_000,
  };

  it('EGI = grossRent * (1 - vacancy%)', () => {
    const result = calcCashflow(base);
    expect(result.effectiveGrossIncome).toBeCloseTo(2_000 * 0.95, 1);
  });

  it('NOI = EGI - opex', () => {
    const result = calcCashflow(base);
    const egi = 2_000 * 0.95;
    expect(result.noi).toBeCloseTo(egi * 0.6, 1);
  });

  it('cashflow = NOI - debt service', () => {
    const result = calcCashflow(base);
    expect(result.cashflow).toBeCloseTo(result.noi - 800, 1);
  });

  it('annual cashflow = monthly * 12', () => {
    const result = calcCashflow(base);
    expect(result.annualCashflow).toBeCloseTo(result.cashflow * 12, 1);
  });

  it('CoC return = annual CF / down payment', () => {
    const result = calcCashflow(base);
    expect(result.cocReturn).toBeCloseTo((result.annualCashflow / 40_000) * 100, 1);
  });

  it('cap rate = annual NOI / purchase price', () => {
    const result = calcCashflow(base);
    expect(result.capRate).toBeCloseTo((result.noi * 12 / 200_000) * 100, 1);
  });
});

describe('calcGRM', () => {
  it('computes gross rent multiplier', () => {
    expect(calcGRM(200_000, 2_000)).toBeCloseTo(200_000 / 24_000, 2);
  });

  it('throws on zero rent', () => {
    expect(() => calcGRM(200_000, 0)).toThrow();
  });
});

describe('fiftyPercentRule', () => {
  it('returns gross/2 - debt service', () => {
    expect(fiftyPercentRule(2_000, 600)).toBeCloseTo(400, 1);
  });

  it('returns negative when debt service exceeds 50% of rent', () => {
    expect(fiftyPercentRule(1_000, 700)).toBeLessThan(0);
  });
});
