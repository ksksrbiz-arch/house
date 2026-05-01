import type { Env } from './_helpers';
import { json } from './_helpers';

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

/**
 * POST /api/market-scan
 * Scans market listings, scores them, and upserts to D1.
 * Replaces supabase/functions/market-scan.
 */
export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    // Placeholder: wire to Zillow/MLS API
    const listings: Listing[] = [];

    if (env.ZILLOW_API_KEY) {
      console.log('[market-scan] ZILLOW_API_KEY detected — implement fetchFromZillow()');
    }

    if (listings.length === 0) {
      return json({
        message: 'No listings fetched — wire a data source',
        count: 0,
      });
    }

    const scored = listings.map((l) => {
      const grm = l.gross_rent > 0 ? l.asking_price / (l.gross_rent * 12) : 0;
      const score = scoreListing(l);
      return { ...l, grm: Math.round(grm * 100) / 100, score, flagged: score >= 65 };
    });

    for (const s of scored) {
      await env.DB.prepare(`
        INSERT INTO market_listings (id, address, city, state, asking_price, units, gross_rent, grm, score, flagged, source, listed_at)
        VALUES (lower(hex(randomblob(16))), ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, date('now'))
        ON CONFLICT(address, city, state) DO UPDATE SET
          asking_price = excluded.asking_price,
          units = excluded.units,
          gross_rent = excluded.gross_rent,
          grm = excluded.grm,
          score = excluded.score,
          flagged = excluded.flagged
      `).bind(
        s.address, s.city, s.state, s.asking_price, s.units,
        s.gross_rent, s.grm, s.score, s.flagged ? 1 : 0, s.source,
      ).run();
    }

    const flagged = scored.filter((l) => l.flagged).length;
    return json({ message: `Scanned ${scored.length} listings; ${flagged} flagged`, count: scored.length });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Internal server error' }, 500);
  }
};
