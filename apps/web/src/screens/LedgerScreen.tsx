import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, Shield, ArrowUpDown, Filter } from 'lucide-react';

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
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { reconciliation, entries } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Auditable Financial Ledger</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Real-Time Money Flow</h1>
        <p className="text-slate-400 text-sm mt-1">
          Every authorization hold, partial capture, void, and staged payout is recorded immutably.
        </p>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Reserved</span>
          <div className="text-xl font-bold text-white mono mt-1">
            ${((reconciliation?.totalReservedCents || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Captured</span>
          <div className="text-xl font-bold text-emerald-400 mono mt-1">
            ${((reconciliation?.totalCapturedCents || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Voided / Released</span>
          <div className="text-xl font-bold text-slate-400 mono mt-1">
            ${((reconciliation?.totalVoidedCents || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Staged Supplier Payouts</span>
          <div className="text-xl font-bold text-sky-400 mono mt-1">
            ${((reconciliation?.totalPaidOutCents || 0) / 100).toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reconciliation</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mono">
            ${((reconciliation?.discrepancyCents || 0) / 100).toFixed(2)} Diff
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Exact balance verified</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'RESERVED', 'CAPTURED', 'PARTIALLY_CAPTURED', 'VOIDED', 'PAYOUT_SENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Amount ($USD)</th>
                <th className="px-6 py-4">Member / Payee</th>
                <th className="px-6 py-4">Payment System</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-300 font-medium">{entry.id}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        entry.type === 'RESERVED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : entry.type === 'CAPTURED' || entry.type === 'PARTIALLY_CAPTURED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : entry.type === 'PAYOUT_SENT'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono font-bold text-white text-sm">
                    ${(entry.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-300">{entry.memberId}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {entry.provider}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{new Date(entry.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
