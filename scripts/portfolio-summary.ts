#!/usr/bin/env tsx
/**
 * portfolio-summary.ts
 * Generates a weekly portfolio digest by calling the Cloudflare Workers API.
 * Invoked by the weekly-recalc.yml workflow (or manually).
 */

const WORKER_URL = process.env.WORKER_URL!;
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

if (!WORKER_URL) {
  console.error('Missing WORKER_URL (e.g. https://cathedral-acquisitions.pages.dev)');
  process.exit(1);
}

async function apiFetch<T>(path: string): Promise<T> {
  const resp = await fetch(`${WORKER_URL}${path}`);
  if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`);
  return resp.json() as Promise<T>;
}

async function main() {
  const [deals, deadlines] = await Promise.all([
    apiFetch<Array<Record<string, unknown>>>('/api/portfolio'),
    apiFetch<Array<Record<string, unknown>>>('/api/deadlines'),
  ]);

  const totalValue = deals.reduce((s, d) => s + Number(d.asking_price ?? 0), 0);
  const totalCashflow = deals.reduce((s, d) => s + Number(d.monthly_noi ?? 0), 0);

  const lines = [
    `# 📊 Cathedral Acquisitions — Weekly Portfolio Digest`,
    `**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    ``,
    `## Portfolio`,
    `- Total Value: **$${(totalValue / 1000).toFixed(0)}k**`,
    `- Monthly NOI: **$${totalCashflow.toFixed(0)}**`,
    `- Deals: **${deals.length}**`,
    ``,
    `## Overdue Compliance`,
    deadlines.length === 0
      ? `✅ No overdue items`
      : deadlines
          .filter((d) => !d.completed_at && new Date(d.due_date as string) < new Date())
          .slice(0, 10)
          .map((d) =>
            `- ⚠️ ${(d.deadline_type as string).replace(/_/g, ' ')} — deal ${d.deal_id}`
          )
          .join('\n'),
    ``,
    `---`,
    `*Cathedral Acquisitions — portfolio-summary.ts*`,
  ].join('\n');

  console.log(lines);

  if (MAILERLITE_API_KEY && NOTIFY_EMAIL) {
    console.log(`[EMAIL] Would send digest to ${NOTIFY_EMAIL}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
