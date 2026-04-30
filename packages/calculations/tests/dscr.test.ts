import { describe, it, expect } from 'vitest';
import { calcDSCR, dscrTier, dscrRateAdj } from '../src/dscr.js';

describe('calcDSCR', () => {
  it('computes correct DSCR', () => {
    const result = calcDSCR({ noi: 30_000, annualDebtService: 24_000 });
    expect(result.dscr).toBeCloseTo(1.25, 2);
  });

  it('tier is strong at 1.25', () => {
    const result = calcDSCR({ noi: 30_000, annualDebtService: 24_000 });
    expect(result.tier).toBe('strong');
  });

  it('tier is pass at 1.20', () => {
    const result = calcDSCR({ noi: 24_000, annualDebtService: 20_000 });
    expect(result.tier).toBe('pass');
  });

  it('tier is borderline at 1.05', () => {
    const result = calcDSCR({ noi: 21_000, annualDebtService: 20_000 });
    expect(result.tier).toBe('borderline');
  });

  it('tier is fail below 1.0', () => {
    const result = calcDSCR({ noi: 15_000, annualDebtService: 20_000 });
    expect(result.tier).toBe('fail');
  });

  it('throws on zero debt service', () => {
    expect(() => calcDSCR({ noi: 10_000, annualDebtService: 0 })).toThrow();
  });
});

describe('dscrTier', () => {
  it('returns strong for >= 1.25', () => {
    expect(dscrTier(1.25)).toBe('strong');
    expect(dscrTier(1.5)).toBe('strong');
  });

  it('returns pass for 1.15 - 1.24', () => {
    expect(dscrTier(1.15)).toBe('pass');
    expect(dscrTier(1.2)).toBe('pass');
  });

  it('returns borderline for 1.00 - 1.14', () => {
    expect(dscrTier(1.0)).toBe('borderline');
    expect(dscrTier(1.1)).toBe('borderline');
  });

  it('returns fail for < 1.0', () => {
    expect(dscrTier(0.99)).toBe('fail');
    expect(dscrTier(0.5)).toBe('fail');
  });
});

describe('dscrRateAdj', () => {
  it('no adjustment for strong', () => {
    expect(dscrRateAdj('strong')).toBe(0);
  });

  it('25bps for pass', () => {
    expect(dscrRateAdj('pass')).toBe(25);
  });

  it('75bps for borderline', () => {
    expect(dscrRateAdj('borderline')).toBe(75);
  });

  it('200bps for fail', () => {
    expect(dscrRateAdj('fail')).toBe(200);
  });
});
