import { useEffect, useState } from 'react';
import { fetchDeals } from '../lib/api';
import type { Deal } from '@cathedral/shared-types';
import { calcCashflow, calcFHA } from '@cathedral/calculations';
import { formatCurrency, formatPct } from '../lib/format';

export default function Finances() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(7.25);

  useEffect(() => {
    fetchDeals()
      .then((d) => setDeals(d.filter((x) => x.stage === 'closed')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-cathedral-navy-400">Loading financials…</div>;

  const portfolioDeals = deals.map((deal) => {
    const fha = calcFHA({
      purchasePrice: deal.asking_price,
      downPaymentPct: 3.5,
      annualRatePct: rate,
      termYears: 30,
    });
    // Estimate rent at 1% of purchase price
    const grossRent = deal.asking_price * 0.01;
    const cf = calcCashflow({
      grossRent,
      vacancyRatePct: 5,
      operatingExpensePct: 40,
      monthlyDebtService: fha.monthlyPayment,
      purchasePrice: deal.asking_price,
      downPaymentAmt: deal.asking_price * 0.035,
    });
    return { deal, fha, cf };
  });

  const totalMonthlyRent = portfolioDeals.reduce((s, { cf }) => s + cf.effectiveGrossIncome, 0);
  const totalMonthlyCashflow = portfolioDeals.reduce((s, { cf }) => s + cf.cashflow, 0);
  const totalPortfolioValue = portfolioDeals.reduce((s, { deal }) => s + deal.asking_price, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cathedral-navy-900">Portfolio Finances</h2>
        <label className="flex items-center gap-2 text-sm text-cathedral-navy-500">
          Rate:
          <input
            type="number"
            step="0.125"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-20 rounded border border-cathedral-navy-200 px-2 py-1 text-sm"
          />
          %
        </label>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card border-l-4 border-l-cathedral-teal-DEFAULT">
          <p className="text-xs text-cathedral-navy-400">Portfolio Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPortfolioValue)}</p>
        </div>
        <div className="card border-l-4 border-l-cathedral-gold-DEFAULT">
          <p className="text-xs text-cathedral-navy-400">Monthly EGI</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalMonthlyRent)}</p>
        </div>
        <div className={`card border-l-4 ${totalMonthlyCashflow >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <p className="text-xs text-cathedral-navy-400">Monthly Cashflow</p>
          <p className={`text-2xl font-bold mt-1 ${totalMonthlyCashflow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCurrency(totalMonthlyCashflow)}
          </p>
        </div>
      </div>

      {/* Per-property breakdown */}
      {portfolioDeals.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-cathedral-navy-400">No closed deals yet. Close deals to see financial breakdown.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-4">Per-Property Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cathedral-navy-400 border-b">
                <th className="pb-2 pr-4 font-medium">Property</th>
                <th className="pb-2 pr-4 font-medium">Value</th>
                <th className="pb-2 pr-4 font-medium">Monthly Payment</th>
                <th className="pb-2 pr-4 font-medium">Est. Cashflow</th>
                <th className="pb-2 pr-4 font-medium">CoC Return</th>
                <th className="pb-2 font-medium">Cap Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cathedral-navy-50">
              {portfolioDeals.map(({ deal, fha, cf }) => (
                <tr key={deal.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-cathedral-navy-900">{deal.address}</p>
                    <p className="text-xs text-cathedral-navy-400">{deal.city}, {deal.state}</p>
                  </td>
                  <td className="py-3 pr-4">{formatCurrency(deal.asking_price)}</td>
                  <td className="py-3 pr-4">{formatCurrency(fha.monthlyPayment)}</td>
                  <td className={`py-3 pr-4 font-medium ${cf.cashflow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {formatCurrency(cf.cashflow)}
                  </td>
                  <td className="py-3 pr-4">{formatPct(cf.cocReturn)}</td>
                  <td className="py-3">{formatPct(cf.capRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
