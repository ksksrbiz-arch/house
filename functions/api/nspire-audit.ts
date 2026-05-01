import type { Env } from './_helpers';
import { json } from './_helpers';

/**
 * POST /api/nspire-audit
 * Processes NSPIRE inspection checklists, computes pass/fail scores.
 * Replaces supabase/functions/nspire-audit.
 */
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { inspection_id } = await request.json() as { inspection_id?: string };

    if (!inspection_id) {
      return json({ error: 'inspection_id required' }, 400);
    }

    const inspection = await env.DB.prepare(
      'SELECT * FROM inspections WHERE id = ?'
    ).bind(inspection_id).first() as Record<string, unknown> | null;

    if (!inspection) {
      return json({ error: 'Inspection not found' }, 404);
    }

    const checklist: Array<{ id: string; status: string; severity: string }> =
      typeof inspection.checklist === 'string'
        ? JSON.parse(inspection.checklist as string)
        : inspection.checklist ?? [];

    const failed = checklist.filter((i) => i.status === 'fail');
    const critical = failed.filter(
      (i) => i.severity === 'life_threatening' || i.severity === 'severe'
    );
    const passLikely = critical.length === 0;

    const DEDUCTIONS: Record<string, number> = {
      life_threatening: 15,
      severe: 8,
      moderate: 4,
      low: 1,
    };
    const deductions = failed.reduce((sum, i) => sum + (DEDUCTIONS[i.severity] ?? 0), 0);
    const score = Math.max(0, 100 - deductions);

    await env.DB.prepare(
      'UPDATE inspections SET score = ?, passed = ? WHERE id = ?'
    ).bind(score, passLikely ? 1 : 0, inspection_id).run();

    return json({ score, passLikely, critical: critical.length, failed: failed.length });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
};
