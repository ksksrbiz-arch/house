import { describe, it, expect } from 'vitest';
import { aggregatePortfolio, conversionRate, type PortfolioDeal } from '../src/portfolio.js';

const makeDeal = (overrides: Partial<PortfolioDeal>): PortfolioDeal => ({
  stage: 'prospecting',
  units: 1,
  asking_price: 0,
  ...overrides,
});

describe('aggregatePortfolio', () => {
  it('returns zeros for an empty portfolio', () => {
    const m = aggregatePortfolio([]);
    expect(m.totalDeals).toBe(0);
    expect(m.totalUnits).toBe(0);
    expect(m.totalAskingValue).toBe(0);
    expect(m.weightedCapRate).toBe(0);
    expect(m.weightedDSCR).toBe(0);
    expect(m.stageBreakdown).toEqual({});
  });

  it('counts deals by lifecycle bucket', () => {
    const deals = [
      makeDeal({ stage: 'prospecting' }),
      makeDeal({ stage: 'under_contract' }),
      makeDeal({ stage: 'closed' }),
      makeDeal({ stage: 'closed' }),
      makeDeal({ stage: 'dead' }),
    ];
    const m = aggregatePortfolio(deals);
    expect(m.totalDeals).toBe(5);
    expect(m.activeDeals).toBe(2);
    expect(m.closedDeals).toBe(2);
  });

  it('sums units, asking value, and gross rent across all deals', () => {
    const deals = [
      makeDeal({ units: 2, asking_price: 200_000, monthly_gross_rent: 2_000 }),
      makeDeal({ units: 4, asking_price: 350_000, monthly_gross_rent: 3_800 }),
    ];
    const m = aggregatePortfolio(deals);
    expect(m.totalUnits).toBe(6);
    expect(m.totalAskingValue).toBe(550_000);
    expect(m.totalMonthlyGrossRent).toBe(5_800);
  });

  it('weighted cap rate uses closed-deal NOI / closed-deal purchase price', () => {
    const deals = [
      makeDeal({ stage: 'closed', purchase_price: 200_000, monthly_noi: 1_000 }),
      makeDeal({ stage: 'closed', purchase_price: 300_000, monthly_noi: 1_500 }),
      makeDeal({ stage: 'prospecting', asking_price: 999_999, monthly_noi: 99_999 }),
    ];
    const m = aggregatePortfolio(deals);
    // (1000+1500)*12 / 500_000 = 6%
    expect(m.weightedCapRate).toBeCloseTo(6, 1);
  });

  it('weighted CoC return uses closed annual cashflow / closed down payments', () => {
    const deals = [
      makeDeal({
        stage: 'closed',
        down_payment_amt: 50_000,
        monthly_noi: 1_000,
        monthly_debt_service: 600,
      }),
    ];
    const m = aggregatePortfolio(deals);
    // (1000-600)*12 / 50000 = 9.6%
    expect(m.weightedCoCReturn).toBeCloseTo(9.6, 1);
  });

  it('weighted DSCR = closed annual NOI / closed annual debt service', () => {
    const deals = [
      makeDeal({ stage: 'closed', monthly_noi: 2_000, monthly_debt_service: 1_500 }),
      makeDeal({ stage: 'closed', monthly_noi: 3_000, monthly_debt_service: 2_000 }),
    ];
    const m = aggregatePortfolio(deals);
    // (2000+3000) / (1500+2000) = 1.4286
    expect(m.weightedDSCR).toBeCloseTo(1.43, 2);
  });

  it('pipeline value excludes closed and dead deals', () => {
    const deals = [
      makeDeal({ stage: 'prospecting', asking_price: 100_000 }),
      makeDeal({ stage: 'closing', asking_price: 200_000 }),
      makeDeal({ stage: 'closed', asking_price: 999_999 }),
      makeDeal({ stage: 'dead', asking_price: 999_999 }),
    ];
    expect(aggregatePortfolio(deals).pipelineValue).toBe(300_000);
  });

  it('stage breakdown counts each stage', () => {
    const deals = [
      makeDeal({ stage: 'prospecting' }),
      makeDeal({ stage: 'prospecting' }),
      makeDeal({ stage: 'closed' }),
    ];
    expect(aggregatePortfolio(deals).stageBreakdown).toEqual({
      prospecting: 2,
      closed: 1,
    });
  });
});

describe('conversionRate', () => {
  it('returns 0 for empty input', () => {
    expect(conversionRate([])).toBe(0);
  });

  it('returns closed / total as a percentage', () => {
    const deals = [
      makeDeal({ stage: 'prospecting' }),
      makeDeal({ stage: 'closed' }),
      makeDeal({ stage: 'closed' }),
      makeDeal({ stage: 'dead' }),
    ];
    expect(conversionRate(deals)).toBe(50);
  });

  it('excluding dead raises the rate', () => {
    const deals = [
      makeDeal({ stage: 'prospecting' }),
      makeDeal({ stage: 'closed' }),
      makeDeal({ stage: 'dead' }),
    ];
    expect(conversionRate(deals, true)).toBeCloseTo(50, 1);
    expect(conversionRate(deals, false)).toBeCloseTo(33.33, 1);
  });
});
