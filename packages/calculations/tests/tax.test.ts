import { describe, it, expect } from 'vitest';
import { calcTax, repsQualifies, isShortTermRental } from '../src/tax.js';

describe('calcTax', () => {
  const base = {
    purchasePrice: 200_000,
    landValuePct: 20,
    bonusDepreciationPct: 60,
    shortLifePct: 30,
    annualGrossIncome: 24_000,
    marginalTaxRatePct: 32,
  };

  it('depreciable base = purchase - land value', () => {
    const result = calcTax(base);
    expect(result.depreciableBase).toBeCloseTo(200_000 * 0.8, 0);
  });

  it('straight-line depr = depreciable base / 27.5', () => {
    const result = calcTax(base);
    expect(result.annualStraightLineDepr).toBeCloseTo(result.depreciableBase / 27.5, 0);
  });

  it('bonus depr = short-life value * bonus pct', () => {
    const result = calcTax(base);
    const shortLife = result.depreciableBase * 0.3;
    expect(result.bonusDepreciationFirstYear).toBeCloseTo(shortLife * 0.6, 0);
  });

  it('uses improvementsValue override when provided', () => {
    const result = calcTax({ ...base, improvementsValue: 150_000 });
    expect(result.depreciableBase).toBe(150_000);
  });

  it('estimated tax savings = year1 depr * marginal rate', () => {
    const result = calcTax(base);
    expect(result.estimatedTaxSavingsFirstYear).toBeGreaterThan(0);
  });
});

describe('repsQualifies', () => {
  it('qualifies with 800 hrs RE out of 1400 total', () => {
    expect(repsQualifies(800, 1400)).toBe(true);
  });

  it('fails if RE hours < 750', () => {
    expect(repsQualifies(700, 1200)).toBe(false);
  });

  it('fails if RE hours <= 50% of total', () => {
    expect(repsQualifies(800, 1800)).toBe(false);
  });
});

describe('isShortTermRental', () => {
  it('avg stay <= 7 days is STR', () => {
    expect(isShortTermRental(7)).toBe(true);
    expect(isShortTermRental(3)).toBe(true);
  });

  it('avg stay > 7 days is not STR', () => {
    expect(isShortTermRental(8)).toBe(false);
    expect(isShortTermRental(30)).toBe(false);
  });
});
