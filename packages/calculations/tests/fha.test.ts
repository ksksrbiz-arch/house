import { describe, it, expect } from 'vitest';
import { calcFHA, fhaDownPaymentOk, fhaHouseHackEligible, sstPasses } from '../src/fha.js';

describe('calcFHA', () => {
  it('computes UFMIP as 1.75% of base loan', () => {
    const result = calcFHA({
      purchasePrice: 200_000,
      downPaymentPct: 3.5,
      annualRatePct: 7,
      termYears: 30,
    });
    expect(result.ufmip).toBeCloseTo(200_000 * 0.965 * 0.0175, 0);
  });

  it('total loan = base + UFMIP', () => {
    const result = calcFHA({
      purchasePrice: 250_000,
      downPaymentPct: 3.5,
      annualRatePct: 6.5,
      termYears: 30,
    });
    expect(result.totalLoanAmount).toBeCloseTo(result.baseLoanAmount + result.ufmip, 1);
  });

  it('monthly payment includes MIP', () => {
    const result = calcFHA({
      purchasePrice: 300_000,
      downPaymentPct: 3.5,
      annualRatePct: 7,
      termYears: 30,
    });
    expect(result.monthlyPayment).toBeGreaterThan(result.monthlyMIP);
    expect(result.monthlyMIP).toBeGreaterThan(0);
  });

  it('LTV is computed correctly', () => {
    const result = calcFHA({
      purchasePrice: 200_000,
      downPaymentPct: 10,
      annualRatePct: 6,
      termYears: 30,
    });
    expect(result.ltv).toBeCloseTo(90, 1);
  });
});

describe('fhaDownPaymentOk', () => {
  it('3.5% down is ok for FICO >= 580', () => {
    expect(fhaDownPaymentOk(200_000, 7_000, 620)).toBe(true);
  });

  it('3% down is NOT ok for FICO >= 580', () => {
    expect(fhaDownPaymentOk(200_000, 6_000, 620)).toBe(false);
  });

  it('10% down is ok for FICO < 580', () => {
    expect(fhaDownPaymentOk(200_000, 20_000, 560)).toBe(true);
  });

  it('5% down is NOT ok for FICO < 580', () => {
    expect(fhaDownPaymentOk(200_000, 10_000, 560)).toBe(false);
  });
});

describe('fhaHouseHackEligible', () => {
  it('1-4 units qualify', () => {
    [1, 2, 3, 4].forEach(u => expect(fhaHouseHackEligible(u)).toBe(true));
  });

  it('5+ units do not qualify', () => {
    expect(fhaHouseHackEligible(5)).toBe(false);
    expect(fhaHouseHackEligible(10)).toBe(false);
  });
});

describe('sstPasses', () => {
  it('passes when 75% of rent covers PITI', () => {
    // 3 units at $1200/mo → $3600 gross; 75% = $2700 > $2500 PITI
    expect(sstPasses(3_600, 2_500)).toBe(true);
  });

  it('fails when 75% of rent < PITI', () => {
    expect(sstPasses(2_000, 2_500)).toBe(false);
  });
});
