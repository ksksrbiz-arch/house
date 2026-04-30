import { describe, it, expect } from 'vitest';
import {
  generateChecklist,
  preFailAudit,
  scoreChecklist,
  checklistBySystem,
  NSPIRE_ITEMS,
} from '../src/index.js';

describe('NSPIRE_ITEMS', () => {
  it('has 49+ items', () => {
    expect(NSPIRE_ITEMS.length).toBeGreaterThanOrEqual(49);
  });

  it('all items have required fields', () => {
    NSPIRE_ITEMS.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.system).toBeTruthy();
      expect(item.deficiency).toBeTruthy();
      expect(item.severity).toBeTruthy();
      expect(item.hud_ref).toBeTruthy();
    });
  });
});

describe('generateChecklist', () => {
  it('returns a checklist with all items pending', () => {
    const checklist = generateChecklist();
    expect(checklist.length).toBeGreaterThanOrEqual(49);
    checklist.forEach((item) => {
      expect(item.status).toBe('pending');
    });
  });

  it('includes all five systems', () => {
    const checklist = generateChecklist();
    const systems = new Set(checklist.map((i) => i.system));
    expect(systems.has('site')).toBe(true);
    expect(systems.has('building_exterior')).toBe(true);
    expect(systems.has('building_systems')).toBe(true);
    expect(systems.has('common_areas')).toBe(true);
    expect(systems.has('unit')).toBe(true);
  });
});

describe('preFailAudit', () => {
  it('returns empty arrays when all pass', () => {
    const checklist = generateChecklist().map((i) => ({ ...i, status: 'pass' as const }));
    const audit = preFailAudit(checklist);
    expect(audit.critical).toHaveLength(0);
    expect(audit.remediate).toHaveLength(0);
    expect(audit.passLikely).toBe(true);
  });

  it('flags life_threatening items as critical', () => {
    const checklist = generateChecklist().map((i) => ({
      ...i,
      status: i.severity === 'life_threatening' ? ('fail' as const) : ('pass' as const),
    }));
    const audit = preFailAudit(checklist);
    expect(audit.critical.length).toBeGreaterThan(0);
    expect(audit.passLikely).toBe(false);
  });

  it('includes moderate items in remediate, not critical', () => {
    const checklist = generateChecklist().map((i) => ({
      ...i,
      status: i.severity === 'moderate' ? ('fail' as const) : ('pass' as const),
    }));
    const audit = preFailAudit(checklist);
    expect(audit.remediate.length).toBeGreaterThan(0);
    expect(audit.critical).toHaveLength(0);
    expect(audit.passLikely).toBe(true);
  });

  it('computes estimated cost range', () => {
    const checklist = generateChecklist().map((i) => ({
      ...i,
      status: i.id === 'unit-006' ? ('fail' as const) : ('pass' as const),
    }));
    const audit = preFailAudit(checklist);
    expect(audit.totalEstimatedCostLow).toBeGreaterThan(0);
    expect(audit.totalEstimatedCostHigh).toBeGreaterThanOrEqual(audit.totalEstimatedCostLow);
  });
});

describe('scoreChecklist', () => {
  it('returns 100 for all-pending checklist', () => {
    const checklist = generateChecklist();
    expect(scoreChecklist(checklist)).toBe(100);
  });

  it('returns 100 for all-pass checklist', () => {
    const checklist = generateChecklist().map((i) => ({ ...i, status: 'pass' as const }));
    expect(scoreChecklist(checklist)).toBe(100);
  });

  it('deducts more for life_threatening than low severity', () => {
    const base = generateChecklist().map((i) => ({ ...i, status: 'pass' as const }));
    const withLT = base.map((i) =>
      i.severity === 'life_threatening' && i.id === 'unit-006'
        ? { ...i, status: 'fail' as const }
        : i
    );
    const withLow = base.map((i) =>
      i.severity === 'low' && i.id === 'unit-002'
        ? { ...i, status: 'fail' as const }
        : i
    );
    expect(scoreChecklist(withLT)).toBeLessThan(scoreChecklist(withLow));
  });

  it('score is never negative', () => {
    const checklist = generateChecklist().map((i) => ({ ...i, status: 'fail' as const }));
    expect(scoreChecklist(checklist)).toBeGreaterThanOrEqual(0);
  });
});

describe('checklistBySystem', () => {
  it('filters correctly by system', () => {
    const checklist = generateChecklist();
    const siteItems = checklistBySystem(checklist, 'site');
    siteItems.forEach((i) => expect(i.system).toBe('site'));
    expect(siteItems.length).toBeGreaterThan(0);
  });
});
