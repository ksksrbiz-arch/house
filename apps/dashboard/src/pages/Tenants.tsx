import { useEffect, useState } from 'react';
import { fetchTenants, fetchDeals } from '../lib/api';
import type { Tenant, Deal } from '@cathedral/shared-types';

const VOUCHER_STAGES = [
  'referred',
  'screening',
  'approved',
  'rta_submitted',
  'hap_contract',
  'housed',
  'rejected',
] as const;

const STAGE_COLORS: Record<string, string> = {
  referred: 'bg-gray-100 text-gray-600',
  screening: 'bg-blue-100 text-blue-700',
  approved: 'bg-teal-100 text-teal-700',
  rta_submitted: 'bg-purple-100 text-purple-700',
  hap_contract: 'bg-yellow-100 text-yellow-700',
  housed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTenants(), fetchDeals()])
      .then(([t, d]) => {
        setTenants(t);
        setDeals(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tenants : tenants.filter((t) => t.voucher_status === filter);
  const dealMap = Object.fromEntries(deals.map((d) => [d.id, d]));

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading tenants…</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Voucher Pipeline</h2>
        <select
          className="rounded border border-cathedral-navy-200 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All stages</option>
          {VOUCHER_STAGES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400">No tenants in this stage.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cathedral-navy-400 border-b">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Voucher #</th>
                <th className="pb-2 pr-4 font-medium">Beds</th>
                <th className="pb-2 pr-4 font-medium">Deal</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cathedral-navy-50">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 pr-4 font-medium text-cathedral-navy-900">{t.full_name}</td>
                  <td className="py-3 pr-4 text-cathedral-navy-500">{t.voucher_number}</td>
                  <td className="py-3 pr-4">{t.bedroom_size}BR</td>
                  <td className="py-3 pr-4 text-cathedral-navy-500">
                    {dealMap[t.deal_id]?.address ?? t.deal_id.slice(0, 8)}
                  </td>
                  <td className="py-3">
                    <span className={`badge-stage ${STAGE_COLORS[t.voucher_status]}`}>
                      {t.voucher_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
