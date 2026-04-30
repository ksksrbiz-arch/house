import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

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
 * Placeholder: wire this to RapidAPI Zillow, Realtor.com, or MLS feed.
 * Returns mock listings for local testing.
 */
async function fetchListings(): Promise<Listing[]> {
  const zillow_key = Deno.env.get('ZILLOW_API_KEY');
  if (zillow_key) {
    // TODO: Implement real Zillow API call
    console.log('[market-scan] ZILLOW_API_KEY detected — implement fetchFromZillow()');
  }
  // Return empty array until wired
  return [];
}

/**
 * Score a listing 0-100 based on:
 * - GRM < 10  → +30
 * - GRM < 8   → +20 bonus
 * - 2-4 units → +20 (Section 8 multifamily)
 * - price < 150k → +15
 * - price < 100k → +10 bonus
 */
function scoreListing(listing: Listing): number {
  let score = 0;
  const grm = listing.gross_rent > 0
    ? listing.asking_price / (listing.gross_rent * 12)
    : 99;

  if (grm < 10) score += 30;
  if (grm < 8) score += 20;
  if (listing.units >= 2 && listing.units <= 4) score += 20;
  if (listing.asking_price < 150_000) score += 15;
  if (listing.asking_price < 100_000) score += 10;
  if (listing.gross_rent > 0) score += 5;

  return Math.min(100, score);
}

Deno.serve(async (_req) => {
  try {
    const listings = await fetchListings();

    if (listings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No listings fetched — wire a data source in fetchListings()', count: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
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

    const { error } = await supabase.from('market_listings').upsert(scored, {
      onConflict: 'address,city,state',
    });

    if (error) throw error;

    const flagged = scored.filter((l) => l.flagged).length;

    return new Response(
      JSON.stringify({ message: `Scanned ${scored.length} listings; ${flagged} flagged`, count: scored.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
