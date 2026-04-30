import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface AuditRequest {
  inspection_id: string;
}

Deno.serve(async (req) => {
  try {
    const { inspection_id } = (await req.json()) as AuditRequest;

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: 'inspection_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch inspection
    const { data: inspection, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspection_id)
      .single();

    if (error || !inspection) {
      return new Response(JSON.stringify({ error: 'Inspection not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const checklist: Array<{ id: string; status: string; severity: string }> =
      inspection.checklist ?? [];

    const failed = checklist.filter((i) => i.status === 'fail');
    const critical = failed.filter(
      (i) => i.severity === 'life_threatening' || i.severity === 'severe'
    );
    const passLikely = critical.length === 0;

    // Compute score (same logic as nspire-engine)
    const DEDUCTIONS: Record<string, number> = {
      life_threatening: 15,
      severe: 8,
      moderate: 4,
      low: 1,
    };
    const deductions = failed.reduce((sum, i) => sum + (DEDUCTIONS[i.severity] ?? 0), 0);
    const score = Math.max(0, 100 - deductions);

    // Update inspection with computed score and pass/fail
    await supabase
      .from('inspections')
      .update({ score, passed: passLikely })
      .eq('id', inspection_id);

    return new Response(
      JSON.stringify({ score, passLikely, critical: critical.length, failed: failed.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
