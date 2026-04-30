import { useEffect, useState } from 'react';
import { fetchPortfolioDeals } from '../lib/api';
import { aggregatePortfolio, conversionRate, type PortfolioDeal } from '@cathedral/calculations';
import type { PortfolioMetrics } from '@cathedral/shared-types';
import { formatCurrency, STAGE_LABELS } from '../lib/format';

export default function Reports() {
  const [deals, setDeals] = useState<PortfolioDeal[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioDeals()
      .then((d) => {
        setDeals(d);
        setMetrics(aggregatePortfolio(d));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-cathedral-navy-400">Crunching portfolio numbers…</div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="p-8 text-cathedral-navy-400">No portfolio data.</div>;
  }

  const conv = conversionRate(deals, true);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Portfolio Reports</h2>
        <p className="text-cathedral-navy-400 text-sm mt-1">
          Roll-ups across all deals. Weighted returns reflect closed deals only.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Units" value={metrics.totalUnits.toString()} />
        <Stat label="Pipeline Value" value={formatCurrency(metrics.pipelineValue)} />
        <Stat label="Annual NOI (closed)" value={formatCurrency(metrics.totalAnnualNOI)} />
        <Stat
          label="Conversion (excl. dead)"
          value={`${conv.toFixed(1)}%`}
        />
        <Stat label="Weighted Cap Rate" value={`${metrics.weightedCapRate.toFixed(2)}%`} />
        <Stat label="Weighted CoC" value={`${metrics.weightedCoCReturn.toFixed(2)}%`} />
        <Stat label="Weighted DSCR" value={metrics.weightedDSCR.toFixed(2)} />
        <Stat
          label="Monthly Gross Rent"
          value={formatCurrency(metrics.totalMonthlyGrossRent)}
        />
      </div>

      <div className="card">
        <h3 className="font-semibold text-cathedral-navy-900 mb-4">Stage Breakdown</h3>
        {metrics.totalDeals === 0 ? (
          <p className="text-sm text-cathedral-navy-400">No deals yet.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(metrics.stageBreakdown).map(([stage, count]) => {
              const pct = (count / metrics.totalDeals) * 100;
              const label = STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage;
              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cathedral-navy-700">{label}</span>
                    <span className="text-cathedral-navy-400">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-cathedral-navy-100 rounded">
                    <div
                      className="h-2 bg-cathedral-teal-DEFAULT rounded"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card border-l-4 border-l-cathedral-gold-DEFAULT">
      <p className="text-cathedral-navy-400 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-cathedral-navy-900 mt-1">{value}</p>
    </div>
  );
}
