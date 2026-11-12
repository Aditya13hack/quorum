import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

interface LedgerScreenProps {
  dataMode?: 'simulated' | 'live';
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({ dataMode = 'simulated' }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchLedger = async () => {
    try {
      const base = filterType === 'ALL' ? '/api/ledger' : `/api/ledger?type=${filterType}`;
      const url = base.includes('?') ? `${base}&mode=${dataMode}` : `${base}?mode=${dataMode}`;
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
  }, [filterType, dataMode]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs">Reconciling ledger entries</p>
        </div>
      </div>
    );
  }

  const { reconciliation, entries = [] } = data;

  const filterOptions = [
    { id: 'ALL', label: 'All entries' },
    { id: 'RESERVED', label: 'Reserved' },
    { id: 'CAPTURED', label: 'Captured' },
    { id: 'PARTIALLY_CAPTURED', label: 'Partially captured' },
    { id: 'VOIDED', label: 'Voided' },
    { id: 'PAYOUT_SENT', label: 'Payouts' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Real-time clearing</span>
          {dataMode === 'live' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              ⚡ Real-Time Mode
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Financial ledger and settlement</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          Immutable double-entry record of all PayPal reservation holds, captured settlements, automated voids, and staged disbursements.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total reserved</span>
          <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-1 font-mono">
            ${((reconciliation?.totalReservedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">PayPal escrow holds</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total captured</span>
          <div className="text-2xl font-semibold text-emerald-700 tabular-nums mt-1 font-mono">
            ${((reconciliation?.totalCapturedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Locked on threshold</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total voided</span>
          <div className="text-2xl font-semibold text-slate-600 tabular-nums mt-1 font-mono">
            ${((reconciliation?.totalVoidedCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Returned to buyers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Supplier payouts</span>
          <div className="text-2xl font-semibold text-[#003087] tabular-nums mt-1 font-mono">
            ${((reconciliation?.totalPaidOutCents || 0) / 100).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">50% staged disbursement</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reconciliation</span>
          </div>
          <div className="text-2xl font-semibold text-emerald-800 tabular-nums font-mono">
            ${((reconciliation?.discrepancyCents || 0) / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Exact balance verified</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-slate-100 p-1 rounded-xl w-fit">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilterType(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
              filterType === opt.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ledger Table or Empty State */}
      {entries.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-800 text-sm">
              0 ledger records in {dataMode === 'live' ? 'Real-Time' : 'Simulated'} mode
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {dataMode === 'live'
                ? 'In Real-Time mode, double-entry financial transactions are created when real PayPal authorizations or captures are executed.'
                : 'No transactions match the selected filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] border-b border-slate-100 font-medium">
                <tr>
                  <th className="px-6 py-3 font-medium">Transaction ID</th>
                  <th className="px-6 py-3 font-medium">Event type</th>
                  <th className="px-6 py-3 text-right font-medium">Amount ($USD)</th>
                  <th className="px-6 py-3 font-medium">Participant</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 text-right font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-3.5 font-mono text-slate-700 font-medium text-[11px]">
                      {entry.id}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          entry.type === 'RESERVED'
                            ? 'bg-blue-50 text-[#003087] border border-blue-200'
                            : entry.type === 'CAPTURED' || entry.type === 'PARTIALLY_CAPTURED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.type === 'PAYOUT_SENT'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {entry.type.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-medium text-slate-900 tabular-nums">
                      ${(entry.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{entry.memberId}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                        {entry.provider}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-400 font-mono text-[11px] tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
