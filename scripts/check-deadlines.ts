#!/usr/bin/env tsx
/**
 * check-deadlines.ts
 * Triggers the deadline-watcher Cloudflare Worker to check overdue deadlines
 * and post GitHub Issues.
 * Invoked by the daily-deadlines.yml workflow (or manually).
 */

const WORKER_URL = process.env.WORKER_URL!;

if (!WORKER_URL) {
  console.error('Missing WORKER_URL (e.g. https://cathedral-acquisitions.pages.dev)');
  process.exit(1);
}

async function main() {
  const resp = await fetch(`${WORKER_URL}/api/deadline-watcher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!resp.ok) {
    console.error(`Error: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }

  const result = await resp.json() as { message: string; issues?: string[] };
  console.log(`✅ ${result.message}`);
  if (result.issues?.length) {
    console.log('Issues created:');
    result.issues.forEach((url: string) => console.log(`  - ${url}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
