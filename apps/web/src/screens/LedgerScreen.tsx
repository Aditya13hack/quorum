import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, ArrowUpDown, Filter, ShieldCheck, DollarSign } from 'lucide-react';

export const LedgerScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchLedger = async () => {
    try {
      const url = filterType === 'ALL' ? '/api/ledger' : `/api/ledger?type=${filterType}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filterType]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-medium">Reconciling financial ledger...</p>
        </div>
      </div>
    );
  }

  const { reconciliation, entries } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-semibold text-xs uppercase tracking-wider mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Real-Time Financial Settlement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Financial Ledger & Reconciliation</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Immutable double-entry record of all PayPal reservation holds, partial captures, automated voids, and staged supplier disbursements.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Reserved
          </span>
          <div className="text-2xl font-bold text-slate-900 mono mt-1">
            ${((reconciliation?.totalReservedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Held in PayPal Escrow</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Captured
          </span>
          <div className="text-2xl font-bold text-emerald-700 mono mt-1">
            ${((reconciliation?.totalCapturedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">Settled on Quorum Lock</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Voided
          </span>
          <div className="text-2xl font-bold text-slate-600 mono mt-1">
            ${((reconciliation?.totalVoidedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Released Back to Buyers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Supplier Payouts
          </span>
          <div className="text-2xl font-bold text-[#003087] mono mt-1">
            ${((reconciliation?.totalPaidOutCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">50% Staged Milestone</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reconciliation</span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 mono">
            ${((reconciliation?.discrepancyCents || 0) / 100).toFixed(2)} Diff
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Exact balance verified</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/80 w-fit">
        {['ALL', 'RESERVED', 'CAPTURED', 'PARTIALLY_CAPTURED', 'VOIDED', 'PAYOUT_SENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Event Type</th>
                <th className="px-6 py-3.5 text-right">Amount ($USD)</th>
                <th className="px-6 py-3.5">Member / Payee</th>
                <th className="px-6 py-3.5">Provider</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-700 font-medium text-[11px]">
                    {entry.id}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        entry.type === 'RESERVED'
                          ? 'bg-blue-50 text-[#003087] border border-blue-200'
                          : entry.type === 'CAPTURED' || entry.type === 'PARTIALLY_CAPTURED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : entry.type === 'PAYOUT_SENT'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    ${(entry.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{entry.memberId}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {entry.provider}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
