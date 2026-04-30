import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDeal, fetchDeadlines, fetchInspections, fetchTenants } from '../lib/api';
import type { Deal, ComplianceDeadline, Inspection, Tenant } from '@cathedral/shared-types';
import {
  calcMortgage,
  calcFHA,
  calcDSCR,
  calcCashflow,
  calcCapitalStack,
} from '@cathedral/calculations';
import { formatCurrency, formatPct, formatDate, STAGE_LABELS, STAGE_COLORS } from '../lib/format';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Calc inputs (simplified)
  const [rate, setRate] = useState(7.25);
  const [grossRent, setGrossRent] = useState(2000);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchDeal(id), fetchDeadlines(id), fetchInspections(id), fetchTenants(id)])
      .then(([d, dl, ins, ten]) => {
        setDeal(d);
        setDeadlines(dl);
        setInspections(ins);
        setTenants(ten);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading deal…</div>;
  if (!deal) return <div className="p-8 text-red-500">Deal not found.</div>;

  // Live calculations
  const fha = calcFHA({
    purchasePrice: deal.asking_price,
    downPaymentPct: 3.5,
    annualRatePct: rate,
    termYears: 30,
  });

  const cashflow = calcCashflow({
    grossRent,
    vacancyRatePct: 5,
    operatingExpensePct: 40,
    monthlyDebtService: fha.monthlyPayment,
    purchasePrice: deal.asking_price,
    downPaymentAmt: deal.asking_price * 0.035,
  });

  const dscr = calcDSCR({
    noi: cashflow.noi * 12,
    annualDebtService: fha.monthlyPayment * 12,
  });

  const stack = calcCapitalStack({
    purchasePrice: deal.asking_price,
    rehabCost: 0,
    closingCostsPct: 3,
    downPaymentPct: 3.5,
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cathedral-navy-900">{deal.address}</h2>
          <p className="text-cathedral-navy-400">{deal.city}, {deal.state} {deal.zip}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-cathedral-teal-DEFAULT">
            {formatCurrency(deal.asking_price)}
          </span>
          <span className={`badge-stage ${STAGE_COLORS[deal.stage]}`}>
            {STAGE_LABELS[deal.stage]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Calc */}
        <div className="card">
          <h3 className="font-semibold mb-4">Live Calculator (FHA 3.5%)</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-xs text-cathedral-navy-400">Interest Rate %</span>
              <input
                type="number"
                step="0.125"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded border border-cathedral-navy-200 px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-cathedral-navy-400">Monthly Gross Rent $</span>
              <input
                type="number"
                step="50"
                value={grossRent}
                onChange={(e) => setGrossRent(parseFloat(e.target.value))}
                className="mt-1 block w-full rounded border border-cathedral-navy-200 px-2 py-1 text-sm"
              />
            </label>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Monthly P&I + MIP" value={formatCurrency(fha.monthlyPayment)} />
            <Row label="Monthly Cashflow" value={formatCurrency(cashflow.cashflow)} highlight={cashflow.cashflow >= 0 ? 'green' : 'red'} />
            <Row label="Annual Cashflow" value={formatCurrency(cashflow.annualCashflow)} />
            <Row label="Cash-on-Cash" value={formatPct(cashflow.cocReturn)} />
            <Row label="Cap Rate" value={formatPct(cashflow.capRate)} />
            <Row label="DSCR" value={`${dscr.dscr.toFixed(2)} (${dscr.tier})`} highlight={dscr.tier === 'fail' ? 'red' : 'green'} />
          </div>
        </div>

        {/* Capital Stack */}
        <div className="card">
          <h3 className="font-semibold mb-4">Capital Stack (FHA 3.5%)</h3>
          <div className="space-y-2 text-sm">
            <Row label="Purchase Price" value={formatCurrency(stack.totalUses)} />
            <Row label="Down Payment (3.5%)" value={formatCurrency(stack.downPayment)} />
            <Row label="Loan Amount" value={formatCurrency(stack.loanAmount)} />
            <Row label="FHA UFMIP" value={formatCurrency(fha.ufmip)} />
            <Row label="Closing Costs (3%)" value={formatCurrency(stack.closingCosts)} />
            <Row label="Cash to Close" value={formatCurrency(stack.cashToClose)} highlight="gold" />
          </div>
        </div>

        {/* Tenants */}
        <div className="card">
          <h3 className="font-semibold mb-4">Tenants / Vouchers ({tenants.length})</h3>
          {tenants.length === 0 ? (
            <p className="text-cathedral-navy-400 text-sm">No tenants yet.</p>
          ) : (
            <div className="space-y-2">
              {tenants.map((t) => (
                <div key={t.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{t.full_name}</span>
                  <span className="badge-stage bg-blue-100 text-blue-700">{t.voucher_status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspections */}
        <div className="card">
          <h3 className="font-semibold mb-4">Inspections ({inspections.length})</h3>
          {inspections.length === 0 ? (
            <p className="text-cathedral-navy-400 text-sm">No inspections recorded.</p>
          ) : (
            <div className="space-y-2">
              {inspections.map((ins) => (
                <div key={ins.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{ins.inspection_date ? formatDate(ins.inspection_date) : 'TBD'}</span>
                  <span className={`badge-stage ${ins.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ins.passed ? 'Pass' : 'Fail'} {ins.score != null ? `(${ins.score})` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'green' | 'red' | 'gold';
}) {
  const color =
    highlight === 'green'
      ? 'text-green-700 font-semibold'
      : highlight === 'red'
      ? 'text-red-700 font-semibold'
      : highlight === 'gold'
      ? 'text-cathedral-gold-600 font-semibold'
      : 'text-cathedral-navy-700';

  return (
    <div className="flex justify-between border-b border-cathedral-navy-50 pb-1">
      <span className="text-cathedral-navy-500">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
