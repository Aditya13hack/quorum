import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sliders, Clock, DollarSign } from 'lucide-react';

export const WishScreen: React.FC<{ onNavigateToRoom: () => void }> = ({ onNavigateToRoom }) => {
  const [wishText, setWishText] = useState('27-inch 4K IPS monitor with 60Hz+ refresh rate');
  const [maxPrice, setMaxPrice] = useState(380);
  const [deadlineDays, setDeadlineDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const chips = [
    '27-inch 4K IPS monitor with USB-C PD',
    'Neighborhood 5kW solar & 10kWh battery microgrid',
    'Commercial 150W high-bay LED 10-pack bundle',
  ];

  const handleInterpret = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishes/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wishText,
          maxPriceCents: maxPrice * 100,
          deadlineHours: deadlineDays * 24,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('Interpretation failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Demand aggregation</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Formulate shopping wish</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          State your requirements along with hard price ceilings. The system parses your criteria into a deterministic specification envelope and matches active reverse auctions.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-medium text-slate-900 mb-2">
            Target product or service requirements
          </label>
          <textarea
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#003087] text-sm transition-colors duration-150"
            placeholder="e.g. 27-inch 4K monitor under $400..."
          />

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-slate-400">Presets:</span>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setWishText(chip)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Hard Limits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-900 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span>Hard price ceiling ($USD)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium tabular-nums text-sm focus:bg-white focus:outline-none focus:border-[#003087]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Deterministic Guard rule G1 enforces that no offer above this ceiling can be accepted.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-900 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Maximum aggregation horizon</span>
            </label>
            <select
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#003087]"
            >
              <option value={1}>24 hours (fast closure)</option>
              <option value={3}>3 days (standard aggregation)</option>
              <option value={7}>7 days (deep volume discounts)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              If the quorum threshold is not met before expiration, the hold voids at $0 cost.
            </p>
          </div>
        </div>

        <button
          onClick={handleInterpret}
          disabled={loading}
          className="w-full py-2.5 px-5 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Compiling specification envelope...</span>
          ) : (
            <span>Compile specification envelope and match coalitions</span>
          )}
        </button>
      </div>

      {/* Result Spec Card */}
      {result && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 text-sm">Specification envelope compiled</h3>
                <p className="text-xs text-slate-500">Deterministic structure validated against Guard rules</p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              Rule G1 validated
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Product category:</span>
              <span className="font-medium text-slate-900">
                {result.interpretation.specEnvelope.category}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Price ceiling:</span>
              <span className="font-medium text-slate-900 tabular-nums">
                ${(result.interpretation.specEnvelope.priceCeilingCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Extracted attributes:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-sm">
                {JSON.stringify(result.interpretation.specEnvelope.requiredAttributes)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              Matched active room: <span className="font-mono text-slate-900">coalition_monitor_demo</span> (15 pooled buyers)
            </div>

            <button
              onClick={onNavigateToRoom}
              className="py-2 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors duration-150"
            >
              <span>Enter coalition room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
