import { useEffect, useState } from 'react';
import { fetchDeals, fetchDeadlines } from '../lib/api';
import type { Deal, ComplianceDeadline } from '@cathedral/shared-types';
import { formatCurrency, formatDate, daysUntil, STAGE_LABELS, STAGE_COLORS } from '../lib/format';

export default function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDeals(), fetchDeadlines()])
      .then(([d, dl]) => {
        setDeals(d);
        setDeadlines(dl);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeDeals = deals.filter((d) => d.stage !== 'dead' && d.stage !== 'closed');
  const closedDeals = deals.filter((d) => d.stage === 'closed');
  const overdueDeadlines = deadlines.filter(
    (d) => !d.completed_at && daysUntil(d.due_date) < 0
  );
  const upcomingDeadlines = deadlines
    .filter((d) => !d.completed_at && daysUntil(d.due_date) >= 0 && daysUntil(d.due_date) <= 30)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cathedral-navy-400">Loading portfolio…</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-cathedral-navy-900 mb-6">Portfolio Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Active Deals" value={activeDeals.length.toString()} color="teal" />
        <KpiCard label="Closed Deals" value={closedDeals.length.toString()} color="navy" />
        <KpiCard label="Overdue Items" value={overdueDeadlines.length.toString()} color={overdueDeadlines.length > 0 ? 'red' : 'teal'} />
        <KpiCard
          label="Portfolio Value"
          value={formatCurrency(deals.reduce((s, d) => s + (d.asking_price ?? 0), 0))}
          color="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Summary */}
        <div className="card">
          <h3 className="font-semibold text-cathedral-navy-900 mb-4">Pipeline</h3>
          {activeDeals.length === 0 ? (
            <p className="text-cathedral-navy-400 text-sm">No active deals. Add your first deal via the Deals page.</p>
          ) : (
            <div className="space-y-2">
              {activeDeals.slice(0, 6).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between py-2 border-b border-cathedral-navy-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-cathedral-navy-900">{deal.address}</p>
                    <p className="text-xs text-cathedral-navy-400">{deal.city}, {deal.state}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatCurrency(deal.asking_price)}</span>
                    <span className={`badge-stage ${STAGE_COLORS[deal.stage]}`}>
                      {STAGE_LABELS[deal.stage]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h3 className="font-semibold text-cathedral-navy-900 mb-4">
            Upcoming Deadlines
            {overdueDeadlines.length > 0 && (
              <span className="ml-2 badge-stage bg-red-100 text-red-700">
                {overdueDeadlines.length} overdue
              </span>
            )}
          </h3>
          {upcomingDeadlines.length === 0 && overdueDeadlines.length === 0 ? (
            <p className="text-cathedral-navy-400 text-sm">No upcoming deadlines in the next 30 days.</p>
          ) : (
            <div className="space-y-2">
              {[...overdueDeadlines.slice(0, 3), ...upcomingDeadlines].map((dl) => {
                const days = daysUntil(dl.due_date);
                return (
                  <div key={dl.id} className="flex items-center justify-between py-2 border-b border-cathedral-navy-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{dl.deadline_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-cathedral-navy-400">{formatDate(dl.due_date)}</p>
                    </div>
                    <span className={`text-xs font-medium ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-cathedral-navy-500'}`}>
                      {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  const borderColor = {
    teal: 'border-l-cathedral-teal-DEFAULT',
    navy: 'border-l-cathedral-navy-DEFAULT',
    gold: 'border-l-cathedral-gold-DEFAULT',
    red: 'border-l-red-500',
  }[color] ?? 'border-l-gray-300';

  return (
    <div className={`card border-l-4 ${borderColor}`}>
      <p className="text-cathedral-navy-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-cathedral-navy-900 mt-1">{value}</p>
    </div>
  );
}
