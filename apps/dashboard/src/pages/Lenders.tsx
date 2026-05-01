import { useEffect, useState } from 'react';
import { fetchLenders } from '../lib/api';
import type { Lender } from '@cathedral/shared-types';
import { formatPct } from '../lib/format';

const LOAN_TYPE_COLORS: Record<string, string> = {
  FHA: 'bg-blue-100 text-blue-700',
  DSCR: 'bg-purple-100 text-purple-700',
  Conventional: 'bg-gray-100 text-gray-700',
  Portfolio: 'bg-teal-100 text-teal-700',
  'Hard Money': 'bg-red-100 text-red-700',
};

export default function Lenders() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLenders()
      .then(setLenders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? lenders : lenders.filter((l) => l.loan_type === filter);
  const loanTypes = ['FHA', 'DSCR', 'Conventional', 'Portfolio', 'Hard Money'];

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading lenders…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cathedral-navy-900">Lender Database</h2>
          <p className="text-cathedral-navy-400 text-sm mt-0.5">April 2026 pricing</p>
        </div>
        <select
          className="rounded border border-cathedral-navy-200 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {loanTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400">No lenders found. Run D1 migrations to seed data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((lender) => (
            <div key={lender.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-cathedral-navy-900">{lender.name}</h3>
                <span className={`badge-stage ${LOAN_TYPE_COLORS[lender.loan_type] ?? 'bg-gray-100 text-gray-600'}`}>
                  {lender.loan_type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-cathedral-navy-400">Rate Range</p>
                  <p className="font-medium">{formatPct(lender.rate_floor)} – {formatPct(lender.rate_ceiling)}</p>
                </div>
                <div>
                  <p className="text-xs text-cathedral-navy-400">Max LTV</p>
                  <p className="font-medium">{formatPct(lender.max_ltv)}</p>
                </div>
                <div>
                  <p className="text-xs text-cathedral-navy-400">Min FICO</p>
                  <p className="font-medium">{lender.min_fico}</p>
                </div>
                {lender.min_dscr && (
                  <div>
                    <p className="text-xs text-cathedral-navy-400">Min DSCR</p>
                    <p className="font-medium">{lender.min_dscr.toFixed(2)}</p>
                  </div>
                )}
              </div>
              {lender.states.length > 0 && (
                <p className="text-xs text-cathedral-navy-400 mt-3">
                  States: {lender.states.slice(0, 5).join(', ')}{lender.states.length > 5 ? ` +${lender.states.length - 5}` : ''}
                </p>
              )}
              {lender.notes && (
                <p className="text-xs text-cathedral-navy-500 mt-2 border-t border-cathedral-navy-100 pt-2">{lender.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
