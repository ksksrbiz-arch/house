import { useEffect, useState } from 'react';
import { fetchDeals } from '../lib/api';
import type { Deal } from '@cathedral/shared-types';
import { generateChecklist, preFailAudit, scoreChecklist } from '@cathedral/nspire-engine';
import type { NSPIREChecklistItem } from '@cathedral/nspire-engine';

export default function Inspections() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [checklist, setChecklist] = useState<NSPIREChecklistItem[]>([]);
  const [audit, setAudit] = useState<ReturnType<typeof preFailAudit> | null>(null);
  const [score, setScore] = useState(100);

  useEffect(() => {
    fetchDeals().then(setDeals).catch(console.error);
  }, []);

  function handleGenerateChecklist() {
    const cl = generateChecklist();
    setChecklist(cl);
    setAudit(preFailAudit(cl));
    setScore(scoreChecklist(cl));
  }

  function toggleItem(id: string, status: NSPIREChecklistItem['status']) {
    const updated = checklist.map((i) => (i.id === id ? { ...i, status } : i));
    setChecklist(updated);
    setAudit(preFailAudit(updated));
    setScore(scoreChecklist(updated));
  }

  const systems = ['site', 'building_exterior', 'building_systems', 'common_areas', 'unit'] as const;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-cathedral-navy-900 mb-6">NSPIRE Inspections</h2>

      <div className="card mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm text-cathedral-navy-500 mb-1">Select Deal</label>
            <select
              className="w-full rounded border border-cathedral-navy-200 px-3 py-2 text-sm"
              value={selectedDeal}
              onChange={(e) => setSelectedDeal(e.target.value)}
            >
              <option value="">— Choose a deal —</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.address}, {d.city}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={handleGenerateChecklist}>
            Generate Checklist
          </button>
        </div>
      </div>

      {checklist.length > 0 && (
        <>
          {/* Score & audit summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card border-l-4 border-l-cathedral-teal-DEFAULT">
              <p className="text-xs text-cathedral-navy-400">NSPIRE Score</p>
              <p className={`text-3xl font-bold mt-1 ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
                {score}
              </p>
            </div>
            <div className="card border-l-4 border-l-red-500">
              <p className="text-xs text-cathedral-navy-400">Critical Failures</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{audit?.critical.length ?? 0}</p>
            </div>
            <div className="card border-l-4 border-l-yellow-400">
              <p className="text-xs text-cathedral-navy-400">Est. Remediation Cost</p>
              <p className="text-3xl font-bold mt-1 text-cathedral-navy-800">
                ${((audit?.totalEstimatedCostHigh ?? 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          {audit && !audit.passLikely && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-semibold text-sm">⚠️ Likely to fail NSPIRE inspection</p>
              <p className="text-red-600 text-xs mt-1">
                {audit.critical.length} critical deficiencie(s) found. Address these before inspection.
              </p>
            </div>
          )}

          {/* Checklist by system */}
          {systems.map((sys) => {
            const items = checklist.filter((i) => i.system === sys);
            if (items.length === 0) return null;
            return (
              <div key={sys} className="card mb-4">
                <h3 className="font-semibold capitalize mb-3 text-cathedral-navy-800">
                  {sys.replace(/_/g, ' ')}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-cathedral-navy-50 last:border-0">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm text-cathedral-navy-800">{item.deficiency}</p>
                        <p className="text-xs text-cathedral-navy-400">
                          {item.hud_ref} · severity: {item.severity}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {(['pass', 'fail', 'n/a'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleItem(item.id, s)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              item.status === s
                                ? s === 'pass'
                                  ? 'bg-green-100 border-green-400 text-green-700'
                                  : s === 'fail'
                                  ? 'bg-red-100 border-red-400 text-red-700'
                                  : 'bg-gray-100 border-gray-400 text-gray-600'
                                : 'border-cathedral-navy-200 text-cathedral-navy-400 hover:border-cathedral-navy-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
