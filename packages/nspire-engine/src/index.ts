import type { NSPIREItem, NSPIREChecklistItem, NSPIRESeverity } from '@cathedral/shared-types';
import items from '../data/nspire-items.json' assert { type: 'json' };

const NSPIRE_ITEMS = items as NSPIREItem[];

/**
 * Generate a full NSPIRE inspection checklist for a property.
 * All items start with status 'pending'.
 */
export function generateChecklist(units: number = 1): NSPIREChecklistItem[] {
  return NSPIRE_ITEMS.map((item) => ({
    ...item,
    status: 'pending' as const,
  }));
}

/**
 * Run a pre-failure audit against a checklist.
 * Returns items that are failing or at risk of failing.
 */
export function preFailAudit(checklist: NSPIREChecklistItem[]): {
  critical: NSPIREChecklistItem[];
  remediate: NSPIREChecklistItem[];
  totalEstimatedCostLow: number;
  totalEstimatedCostHigh: number;
  passLikely: boolean;
} {
  const failed = checklist.filter((i) => i.status === 'fail');
  const critical = failed.filter(
    (i) => i.severity === 'life_threatening' || i.severity === 'severe'
  );
  const remediate = failed.filter(
    (i) => i.severity === 'moderate' || i.severity === 'low'
  );

  const totalEstimatedCostLow = failed.reduce((sum, i) => sum + i.typical_cost_low, 0);
  const totalEstimatedCostHigh = failed.reduce((sum, i) => sum + i.typical_cost_high, 0);

  // Pass is likely only if no critical failures
  const passLikely = critical.length === 0;

  return {
    critical,
    remediate,
    totalEstimatedCostLow,
    totalEstimatedCostHigh,
    passLikely,
  };
}

/**
 * Score an inspection checklist (0-100).
 * Each failed item deducts points based on severity.
 */
export function scoreChecklist(checklist: NSPIREChecklistItem[]): number {
  const SEVERITY_DEDUCTIONS: Record<NSPIRESeverity, number> = {
    life_threatening: 15,
    severe: 8,
    moderate: 4,
    low: 1,
  };

  const evaluated = checklist.filter((i) => i.status !== 'pending' && i.status !== 'n/a');
  if (evaluated.length === 0) return 100;

  const deductions = checklist
    .filter((i) => i.status === 'fail')
    .reduce((sum, i) => sum + SEVERITY_DEDUCTIONS[i.severity], 0);

  return Math.max(0, 100 - deductions);
}

/**
 * Filter checklist items by system.
 */
export function checklistBySystem(
  checklist: NSPIREChecklistItem[],
  system: NSPIREItem['system']
): NSPIREChecklistItem[] {
  return checklist.filter((i) => i.system === system);
}

export { NSPIRE_ITEMS };
export type { NSPIREItem, NSPIREChecklistItem };
