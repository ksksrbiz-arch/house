#!/usr/bin/env tsx
/**
 * market-scan.ts
 * Fetches listings, scores them, and posts to Cloudflare Workers API.
 * Invoked by the daily market-scanner.yml workflow.
 */

const WORKER_URL = process.env.WORKER_URL!;
const ZILLOW_API_KEY = process.env.ZILLOW_API_KEY;

if (!WORKER_URL) {
  console.error('Missing WORKER_URL (e.g. https://cathedral-acquisitions.pages.dev)');
  process.exit(1);
}

async function main() {
  const resp = await fetch(`${WORKER_URL}/api/market-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!resp.ok) {
    console.error(`Error: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }

  const result = await resp.json() as { message: string; count: number };
  console.log(`✅ ${result.message}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
