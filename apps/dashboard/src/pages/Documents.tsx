import { useEffect, useMemo, useState } from 'react';
import { fetchDeals, fetchDocuments, createDocument, deleteDocument } from '../lib/api';
import type { Deal, DealDocument, DocType } from '@cathedral/shared-types';
import { formatDate } from '../lib/format';

const DOC_TYPES: DocType[] = [
  'PSA',
  'inspection_report',
  'appraisal',
  'loan_estimate',
  'closing_disclosure',
  'HAP_contract',
  'RFTA',
  'lease',
  'tenant_id',
  'voucher',
  'tax_return',
  'insurance',
  'other',
];

export default function Documents() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [docs, setDocs] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDeal, setFilterDeal] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);

  const dealsById = useMemo(() => {
    const m = new Map<string, Deal>();
    deals.forEach((d) => m.set(d.id, d));
    return m;
  }, [deals]);

  function reload() {
    setLoading(true);
    Promise.all([fetchDeals(), fetchDocuments()])
      .then(([d, dx]) => {
        setDeals(d);
        setDocs(dx);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  const filtered = docs.filter(
    (d) =>
      (!filterDeal || d.deal_id === filterDeal) &&
      (!filterType || d.doc_type === filterType),
  );

  async function handleDelete(id: string) {
    if (!confirm('Delete this document record? The underlying file is not removed.')) return;
    await deleteDocument(id);
    reload();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Documents</h2>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-4 py-2 bg-cathedral-teal-DEFAULT text-white rounded text-sm font-medium hover:opacity-90"
        >
          {showAdd ? 'Cancel' : '+ Register Document'}
        </button>
      </div>

      {showAdd && (
        <AddDocumentForm
          deals={deals}
          onSaved={() => {
            setShowAdd(false);
            reload();
          }}
        />
      )}

      <div className="card mb-4 flex flex-wrap gap-3">
        <select
          value={filterDeal}
          onChange={(e) => setFilterDeal(e.target.value)}
          className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
        >
          <option value="">All deals</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              {d.address}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
        >
          <option value="">All types</option>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-cathedral-navy-400 self-center">
          {filtered.length} of {docs.length}
        </span>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-cathedral-navy-400 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-cathedral-navy-400 text-sm">
            No documents match these filters.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-cathedral-navy-400 uppercase text-xs">
              <tr>
                <th className="py-2">Name</th>
                <th>Type</th>
                <th>Deal</th>
                <th>Uploaded</th>
                <th>By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-cathedral-navy-100">
                  <td className="py-2 font-medium">{d.name}</td>
                  <td>{d.doc_type ?? '—'}</td>
                  <td>{dealsById.get(d.deal_id)?.address ?? '—'}</td>
                  <td>{formatDate(d.created_at)}</td>
                  <td>{d.uploaded_by ?? '—'}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddDocumentForm({
  deals,
  onSaved,
}: {
  deals: Deal[];
  onSaved: () => void;
}) {
  const [dealId, setDealId] = useState(deals[0]?.id ?? '');
  const [name, setName] = useState('');
  const [docType, setDocType] = useState<DocType>('other');
  const [storageKey, setStorageKey] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealId || !name || !storageKey) return;
    setSaving(true);
    try {
      await createDocument({
        deal_id: dealId,
        name,
        doc_type: docType,
        storage_key: storageKey,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to register document');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <select
        value={dealId}
        onChange={(e) => setDealId(e.target.value)}
        className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
        required
      >
        <option value="">— Select deal —</option>
        {deals.map((d) => (
          <option key={d.id} value={d.id}>
            {d.address}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Document name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
        required
      />
      <select
        value={docType}
        onChange={(e) => setDocType(e.target.value as DocType)}
        className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
      >
        {DOC_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Storage key (e.g. deals/<id>/psa.pdf)"
        value={storageKey}
        onChange={(e) => setStorageKey(e.target.value)}
        className="px-3 py-2 border border-cathedral-navy-200 rounded text-sm"
        required
      />
      <button
        type="submit"
        disabled={saving}
        className="md:col-span-2 px-4 py-2 bg-cathedral-navy-DEFAULT text-white rounded text-sm font-medium disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Register Document'}
      </button>
    </form>
  );
}
