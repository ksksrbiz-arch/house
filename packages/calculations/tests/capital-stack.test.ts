import { describe, it, expect } from 'vitest';
import { calcCapitalStack, cashToCloseFeasible } from '../src/capital-stack.js';

describe('calcCapitalStack', () => {
  const base = {
    purchasePrice: 200_000,
    rehabCost: 10_000,
    closingCostsPct: 3,
    downPaymentPct: 3.5,
  };

  it('loan amount = purchase - down payment', () => {
    const result = calcCapitalStack(base);
    expect(result.loanAmount).toBeCloseTo(200_000 * 0.965, 0);
  });

  it('total uses = purchase + rehab + closing costs', () => {
    const result = calcCapitalStack(base);
    const expectedUses = 200_000 + 10_000 + 200_000 * 0.03;
    expect(result.totalUses).toBeCloseTo(expectedUses, 0);
  });

  it('cash to close reduces with gift funds', () => {
    const withGift = calcCapitalStack({ ...base, giftFundsAmt: 5_000 });
    const noGift = calcCapitalStack(base);
    expect(withGift.cashToClose).toBeCloseTo(noGift.cashToClose - 5_000, 0);
  });

  it('cash to close reduces with seller concession', () => {
    const withConcession = calcCapitalStack({ ...base, sellerConcessionAmt: 3_000 });
    const noConcession = calcCapitalStack(base);
    expect(withConcession.cashToClose).toBeCloseTo(noConcession.cashToClose - 3_000, 0);
  });

  it('equity at purchase = purchase price - loan', () => {
    const result = calcCapitalStack(base);
    expect(result.equityAtPurchase).toBeCloseTo(result.downPayment, 0);
  });
});

describe('cashToCloseFeasible', () => {
  it('returns true when liquid assets exceed cash to close', () => {
    expect(cashToCloseFeasible(15_000, 20_000)).toBe(true);
  });

  it('returns false when liquid assets < cash to close', () => {
    expect(cashToCloseFeasible(20_000, 15_000)).toBe(false);
  });

  it('returns true when exactly equal', () => {
    expect(cashToCloseFeasible(15_000, 15_000)).toBe(true);
  });
});
