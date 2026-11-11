import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Autonomous AI Buying Union</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Make a Shopping Wish</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tell your AI agent what you want and your hard limits. Your agent will find other buyers and negotiate volume tiers.
        </p>
      </div>

      {/* Wish Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            What do you want to buy?
          </label>
          <textarea
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            placeholder="e.g. 27-inch 4K monitor under $400..."
          />

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setWishText(chip)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Hard Limits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Maximum Price Ceiling ($USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-semibold">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Enforced by deterministic Guard code.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Maximum Wait Time
            </label>
            <select
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={1}>1 Day (Fast)</option>
              <option value={3}>3 Days (Recommended)</option>
              <option value={7}>7 Days (Deepest Discount)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">If quorum isn't met in time, you pay $0.</p>
          </div>
        </div>

        <button
          onClick={handleInterpret}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Interpreting Wish with AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Interpret & Match Coalition</span>
            </>
          )}
        </button>
      </div>

      {/* Result Spec Card */}
      {result && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Interpreted Spec Envelope</h3>
              <p className="text-xs text-slate-400">Deterministic envelope ready for reverse auction</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white uppercase">{result.interpretation.specEnvelope.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hard Price Ceiling:</span>
              <span className="font-bold text-emerald-400 mono">
                ${(result.interpretation.specEnvelope.priceCeilingCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Required Attributes:</span>
              <span className="font-semibold text-slate-200">
                {JSON.stringify(result.interpretation.specEnvelope.requiredAttributes)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-sky-400 font-semibold">
              Matched Coalition Room: coalition_monitor_demo
            </div>

            <button
              onClick={onNavigateToRoom}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
            >
              <span>Enter Coalition Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
