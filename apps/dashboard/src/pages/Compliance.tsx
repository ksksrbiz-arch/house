import { useEffect, useState } from 'react';
import { fetchDeadlines, fetchDeals } from '../lib/api';
import type { ComplianceDeadline, Deal } from '@cathedral/shared-types';
import { formatDate, daysUntil } from '../lib/format';

export default function Compliance() {
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDeadlines(), fetchDeals()])
      .then(([dl, d]) => {
        setDeadlines(dl);
        setDeals(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dealMap = Object.fromEntries(deals.map((d) => [d.id, d]));

  const visible = showCompleted
    ? deadlines
    : deadlines.filter((d) => !d.completed_at);

  const sorted = [...visible].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading compliance data…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Compliance Calendar</h2>
        <label className="flex items-center gap-2 text-sm text-cathedral-navy-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Show completed
        </label>
      </div>

      {sorted.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400">No deadlines found. Add deals and compliance items via Supabase Studio.</p>
        </div>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cathedral-navy-400 border-b pb-2">
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Deal</th>
                <th className="pb-3 pr-4 font-medium">Due Date</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cathedral-navy-50">
              {sorted.map((dl) => {
                const days = daysUntil(dl.due_date);
                const overdue = !dl.completed_at && days < 0;
                const urgent = !dl.completed_at && days >= 0 && days <= 7;
                return (
                  <tr key={dl.id} className={overdue ? 'bg-red-50' : urgent ? 'bg-yellow-50' : ''}>
                    <td className="py-3 pr-4 font-medium text-cathedral-navy-900">
                      {dl.deadline_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 pr-4 text-cathedral-navy-500">
                      {dealMap[dl.deal_id]?.address ?? dl.deal_id.slice(0, 8)}
                    </td>
                    <td className="py-3 pr-4">{formatDate(dl.due_date)}</td>
                    <td className="py-3 pr-4">
                      {dl.completed_at ? (
                        <span className="badge-stage bg-green-100 text-green-700">Done</span>
                      ) : overdue ? (
                        <span className="badge-stage bg-red-100 text-red-700">
                          {Math.abs(days)}d overdue
                        </span>
                      ) : (
                        <span className={`badge-stage ${urgent ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {days}d left
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-cathedral-navy-400 text-xs">{dl.notes ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
