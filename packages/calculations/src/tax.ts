import type { TaxInputs, TaxResult } from '@cathedral/shared-types';

/**
 * Residential rental depreciation: 27.5 year straight-line on improvements.
 * Bonus depreciation applies to short-life personal property (cost segregation).
 */
export function calcTax(inputs: TaxInputs): TaxResult {
  const {
    purchasePrice,
    landValuePct,
    bonusDepreciationPct,
    shortLifePct,
    annualGrossIncome,
    marginalTaxRatePct,
  } = inputs;

  const landValue = round2(purchasePrice * (landValuePct / 100));
  const depreciableBase = round2(
    inputs.improvementsValue ?? purchasePrice - landValue
  );

  // Straight-line depreciation over 27.5 years
  const annualStraightLineDepr = round2(depreciableBase / 27.5);

  // Cost segregation: shortLifePct of improvements → 5/7yr property eligible for bonus dep
  const shortLifeValue = round2(depreciableBase * (shortLifePct / 100));
  const longLifeValue = round2(depreciableBase - shortLifeValue);

  // Bonus depreciation on short-life assets
  const bonusDeprAmount = round2(shortLifeValue * (bonusDepreciationPct / 100));

  // Year-1 total depreciation
  const year1LongLifeDepr = round2(longLifeValue / 27.5);
  const totalYear1Depr = round2(bonusDeprAmount + year1LongLifeDepr);

  const estimatedTaxSavingsFirstYear = round2(totalYear1Depr * (marginalTaxRatePct / 100));

  return {
    depreciableBase,
    annualStraightLineDepr,
    bonusDepreciationFirstYear: bonusDeprAmount,
    estimatedTaxSavingsFirstYear,
  };
}

/**
 * Check REPS (Real Estate Professional Status) hour requirement.
 * Must spend > 750 hrs/yr AND more than 50% of working hours in real estate.
 */
export function repsQualifies(
  realEstateHours: number,
  totalWorkingHours: number
): boolean {
  return realEstateHours > 750 && realEstateHours > totalWorkingHours * 0.5;
}

/**
 * Short-term rental loophole: if avg stay <= 7 days, losses may be non-passive
 * without REPS. Returns true if STR classification likely applies.
 */
export function isShortTermRental(averageStayDays: number): boolean {
  return averageStayDays <= 7;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
