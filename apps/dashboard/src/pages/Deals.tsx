import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDeals } from '../lib/api';
import type { Deal, DealStage } from '@cathedral/shared-types';
import { formatCurrency, STAGE_LABELS, STAGE_COLORS } from '../lib/format';

const STAGES: DealStage[] = [
  'prospecting',
  'under_contract',
  'due_diligence',
  'financing',
  'closing',
  'closed',
];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals()
      .then(setDeals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-cathedral-navy-400">Loading deals…</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Deal Pipeline</h2>
        <a
          href="https://github.com/ksksrbiz-arch/house/issues/new?template=deal.yml"
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          + New Deal
        </a>
      </div>

      {deals.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400 mb-4">No deals yet.</p>
          <p className="text-sm text-cathedral-navy-400">
            Create your first deal using the GitHub Issue template or run{' '}
            <code className="bg-cathedral-navy-100 px-1 rounded">pnpm deal:new</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Kanban columns */}
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              return (
                <div key={stage} className="w-64 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge-stage ${STAGE_COLORS[stage]}`}>
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="text-xs text-cathedral-navy-400">{stageDeals.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageDeals.map((deal) => (
                      <Link
                        key={deal.id}
                        to={`/deals/${deal.id}`}
                        className="block card p-4 hover:shadow-md transition-shadow"
                      >
                        <p className="font-medium text-sm text-cathedral-navy-900 truncate">
                          {deal.address}
                        </p>
                        <p className="text-xs text-cathedral-navy-400 mt-0.5">
                          {deal.city}, {deal.state}
                        </p>
                        <p className="text-cathedral-teal-DEFAULT font-semibold mt-2 text-sm">
                          {formatCurrency(deal.asking_price)}
                        </p>
                        <p className="text-xs text-cathedral-navy-400 mt-0.5">
                          {deal.units} unit{deal.units !== 1 ? 's' : ''}
                        </p>
                      </Link>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="border-2 border-dashed border-cathedral-navy-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-cathedral-navy-300">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
