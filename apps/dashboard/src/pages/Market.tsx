import { useEffect, useState } from 'react';
import { fetchListings } from '../lib/api';
import type { MarketListing } from '@cathedral/shared-types';
import { formatCurrency, formatDate } from '../lib/format';

export default function Market() {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlagged, setShowFlagged] = useState(false);

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = showFlagged ? listings.filter((l) => l.flagged) : listings;

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading market data…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Market Scanner</h2>
        <label className="flex items-center gap-2 text-sm text-cathedral-navy-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showFlagged}
            onChange={(e) => setShowFlagged(e.target.checked)}
            className="rounded"
          />
          Flagged only
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400 mb-2">No listings yet.</p>
          <p className="text-sm text-cathedral-navy-400">
            Wire <code className="bg-cathedral-navy-100 px-1 rounded">scripts/market-scan.ts</code> to a data
            source (Zillow/RapidAPI) and trigger the daily workflow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <div key={listing.id} className={`card ${listing.flagged ? 'border-cathedral-gold-DEFAULT border-2' : ''}`}>
              {listing.flagged && (
                <span className="badge-stage bg-cathedral-gold-50 text-cathedral-gold-600 mb-2">
                  🏆 Flagged
                </span>
              )}
              <h3 className="font-semibold text-cathedral-navy-900">{listing.address}</h3>
              <p className="text-xs text-cathedral-navy-400">{listing.city}, {listing.state}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-cathedral-navy-400 text-xs">Asking</p>
                  <p className="font-semibold">{formatCurrency(listing.asking_price)}</p>
                </div>
                <div>
                  <p className="text-cathedral-navy-400 text-xs">Gross Rent/mo</p>
                  <p className="font-semibold">{formatCurrency(listing.gross_rent)}</p>
                </div>
                <div>
                  <p className="text-cathedral-navy-400 text-xs">GRM</p>
                  <p className="font-semibold">{listing.grm.toFixed(1)}x</p>
                </div>
                <div>
                  <p className="text-cathedral-navy-400 text-xs">Score</p>
                  <p className={`font-semibold ${listing.score >= 70 ? 'text-green-600' : listing.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {listing.score}/100
                  </p>
                </div>
              </div>
              <p className="text-xs text-cathedral-navy-300 mt-3">{listing.source} · {formatDate(listing.listed_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
