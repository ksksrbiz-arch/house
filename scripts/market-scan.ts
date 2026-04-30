#!/usr/bin/env tsx
/**
 * market-scan.ts
 * Fetches listings, scores them, and upserts to Supabase.
 * Invoked by the daily market-scanner.yml workflow.
 *
 * Wire fetchListings() to your data source:
 *   - RapidAPI Zillow (~$10/mo): https://rapidapi.com/apimaker/api/zillow-com1
 *   - Realtor.com via 3rd-party: https://rapidapi.com/realtymole/api/realtor
 *   - Direct MLS feed (most expensive but cleanest)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ZILLOW_API_KEY = process.env.ZILLOW_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Listing {
  address: string;
  city: string;
  state: string;
  asking_price: number;
  units: number;
  gross_rent: number;
  source: string;
  raw_data?: Record<string, unknown>;
}

/**
 * Replace this with a real API call.
 * Shape: { address, city, state, asking_price, units, gross_rent }
 */
async function fetchListings(): Promise<Listing[]> {
  if (ZILLOW_API_KEY) {
    // TODO: implement Zillow RapidAPI call
    // const resp = await fetch('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?...', {
    //   headers: { 'X-RapidAPI-Key': ZILLOW_API_KEY, 'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com' }
    // });
    // const data = await resp.json();
    // return data.props.map(normalize);
    console.log('[market-scan] ZILLOW_API_KEY present — implement fetchListings()');
  }
  return [];
}

function scoreListing(l: Listing): number {
  let score = 0;
  const grm = l.gross_rent > 0 ? l.asking_price / (l.gross_rent * 12) : 99;
  if (grm < 10) score += 30;
  if (grm < 8) score += 20;
  if (l.units >= 2 && l.units <= 4) score += 20;
  if (l.asking_price < 150_000) score += 15;
  if (l.asking_price < 100_000) score += 10;
  if (l.gross_rent > 0) score += 5;
  return Math.min(100, score);
}

async function main() {
  const listings = await fetchListings();

  if (listings.length === 0) {
    console.log('No listings fetched. Wire a data source in fetchListings().');
    return;
  }

  const scored = listings.map((l) => {
    const grm = l.gross_rent > 0 ? l.asking_price / (l.gross_rent * 12) : 0;
    const score = scoreListing(l);
    return {
      ...l,
      grm: Math.round(grm * 100) / 100,
      score,
      flagged: score >= 65,
      listed_at: new Date().toISOString().split('T')[0],
    };
  });

  const { error } = await supabase
    .from('market_listings')
    .upsert(scored, { onConflict: 'address,city,state' });

  if (error) {
    console.error('Error upserting listings:', error.message);
    process.exit(1);
  }

  const flagged = scored.filter((l) => l.flagged).length;
  console.log(`✅ Scanned ${scored.length} listings. ${flagged} flagged.`);

  if (flagged > 0) {
    console.log('\n🏆 Flagged listings:');
    scored
      .filter((l) => l.flagged)
      .forEach((l) => console.log(`  - ${l.address}, ${l.city} — $${l.asking_price.toLocaleString()} — score: ${l.score}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
