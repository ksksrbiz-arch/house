#!/usr/bin/env tsx
/**
 * portfolio-summary.ts
 * Generates a weekly portfolio digest and optionally emails via MailerLite.
 * Invoked by the weekly-recalc.yml workflow (or manually).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const [{ data: pipeline }, { data: deadlines }, { data: snapshots }] = await Promise.all([
    supabase.from('pipeline_summary').select('*'),
    supabase.from('overdue_deadlines').select('*'),
    supabase.from('deal_snapshot').select('*'),
  ]);

  const totalValue = (snapshots ?? []).reduce((s: number, d: { asking_price?: number }) => s + (d.asking_price ?? 0), 0);
  const totalCashflow = (snapshots ?? []).reduce((s: number, d: { cashflow?: number }) => s + (d.cashflow ?? 0), 0);

  const lines = [
    `# 📊 Cathedral Acquisitions — Weekly Portfolio Digest`,
    `**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    ``,
    `## Pipeline`,
    ...(pipeline ?? []).map((row: { stage: string; deal_count: number; total_value: number }) =>
      `- **${row.stage.replace(/_/g, ' ')}**: ${row.deal_count} deal(s) · $${(row.total_value / 1000).toFixed(0)}k`
    ),
    ``,
    `## Portfolio`,
    `- Total Value: **$${(totalValue / 1000).toFixed(0)}k**`,
    `- Monthly Cashflow: **$${totalCashflow.toFixed(0)}**`,
    ``,
    `## Overdue Compliance`,
    (deadlines ?? []).length === 0
      ? `✅ No overdue items`
      : (deadlines ?? [])
          .slice(0, 10)
          .map((d: { deadline_type: string; address: string; days_overdue: number }) =>
            `- ⚠️ ${d.deadline_type.replace(/_/g, ' ')} — ${d.address} (${d.days_overdue}d overdue)`
          )
          .join('\n'),
    ``,
    `---`,
    `*Cathedral Acquisitions — portfolio-summary.ts*`,
  ].join('\n');

  console.log(lines);

  if (MAILERLITE_API_KEY && NOTIFY_EMAIL) {
    // TODO: Send via MailerLite transactional or Resend/Postmark for reliability
    console.log(`[EMAIL] Would send digest to ${NOTIFY_EMAIL}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
