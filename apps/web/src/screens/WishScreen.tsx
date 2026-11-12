import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Sliders, Clock, DollarSign, Users, PlusCircle } from 'lucide-react';

interface WishScreenProps {
  dataMode?: 'simulated' | 'live';
  onNavigateToRoom: (coalitionId?: string) => void;
}

export const WishScreen: React.FC<WishScreenProps> = ({
  dataMode = 'simulated',
  onNavigateToRoom,
}) => {
  const [wishText, setWishText] = useState('27-inch 4K IPS monitor with 60Hz+ refresh rate');
  const [maxPrice, setMaxPrice] = useState(380);
  const [deadlineDays, setDeadlineDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [allCoalitions, setAllCoalitions] = useState<any[]>([]);

  const chips = [
    '27-inch 4K IPS monitor with USB-C PD',
    'Neighborhood 5kW solar & 10kWh battery microgrid',
    'Commercial 150W high-bay LED 10-pack bundle',
  ];

  // Fetch all existing coalition rooms on mount and whenever dataMode changes
  const fetchCoalitions = async () => {
    try {
      const res = await fetch(`/api/coalitions?mode=${dataMode}`);
      if (!res.ok) {
        console.warn('Coalitions endpoint returned status', res.status);
        return;
      }
      const data = await res.json();
      setAllCoalitions(data.coalitions || []);
    } catch (e) {
      console.error('Failed to load coalitions', e);
    }
  };

  useEffect(() => {
    fetchCoalitions();
  }, [dataMode]);

  const handleInterpret = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wishes/interpret?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wishText,
          maxPriceCents: maxPrice * 100,
          deadlineHours: deadlineDays * 24,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        let message = `API server error (${res.status})`;
        try {
          const errJson = JSON.parse(errText);
          message = errJson.error || errJson.message || message;
        } catch {
          if (errText) message = errText;
        }
        throw new Error(message);
      }
      const data = await res.json();
      setResult(data);
      await fetchCoalitions();
    } catch (e: any) {
      alert('Interpretation failed: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewRoom = async () => {
    setCreatingRoom(true);
    try {
      const category = result?.interpretation?.specEnvelope?.category || 'electronics';
      const attributes = result?.interpretation?.specEnvelope?.requiredAttributes || { item: wishText };
      const res = await fetch(`/api/coalitions?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wishText,
          category,
          priceCeilingCents: maxPrice * 100,
          deadlineHours: deadlineDays * 24,
          requiredAttributes: attributes,
          creatorUserId: `creator_${Math.floor(Math.random() * 900) + 100}`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned ${res.status}`);
      }

      const newRoom = await res.json();
      if (newRoom.error) throw new Error(newRoom.error);

      // Refresh and switch to new room
      await fetchCoalitions();
      onNavigateToRoom(newRoom.coalition.id);
    } catch (e: any) {
      alert('Failed to create new room: ' + (e?.message || String(e)));
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Demand aggregation</span>
          {dataMode === 'live' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              ⚡ Real-Time Mode
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Formulate shopping wish</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          State your requirements in plain language. The system compiles your criteria into a deterministic specification envelope, discovers matching active coalition rooms, or lets you spawn a brand new room.
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
              <span className="absolute left-3.5 top-2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium tabular-nums text-sm focus:bg-white focus:outline-none focus:border-[#003087]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Guard rule G1 strictly enforces that no offer above this ceiling can be accepted.
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
              If threshold is not met before expiration, the hold voids at $0 cost.
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
            <span>Compile specification envelope & find active coalition rooms</span>
          )}
        </button>
      </div>

      {/* Result Spec Card (if compiled) */}
      {result && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 animate-in fade-in duration-150">
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
              <span className="font-medium text-slate-900">{result.interpretation.specEnvelope.category}</span>
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
        </div>
      )}

      {/* Active Coalition Rooms List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              Active Coalition Rooms ({allCoalitions.length})
            </h3>
            <p className="text-xs text-slate-500">
              {dataMode === 'live' && allCoalitions.length === 0
                ? 'No live rooms active yet. Spawn the first real room using your criteria.'
                : 'Choose an existing room to pool demand or start your own collective group'}
            </p>
          </div>

          <button
            onClick={handleCreateNewRoom}
            disabled={creatingRoom}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors duration-150 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{creatingRoom ? 'Creating room...' : 'Create new room for this wish'}</span>
          </button>
        </div>

        {allCoalitions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-800 text-sm">No active rooms found in {dataMode === 'live' ? 'Real-Time' : 'Simulated'} mode</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Create new room for this wish" above to initialize a live reverse auction pool with this product specification.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCoalitions.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors duration-150"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {c.category}
                    </span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{c.timeRemainingHours || 48}h left</span>
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{c.name}</h4>

                  <div className="flex items-baseline justify-between pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 line-through text-[11px] tabular-nums block">
                        ${(c.soloPriceCents / 100).toFixed(2)}
                      </span>
                      <span className="font-semibold text-slate-900 text-base tabular-nums">
                        ${(c.currentPriceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      Save {c.savingsPct}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong>{c.memberCount}</strong> / {c.quorumTarget} buyers</span>
                  </div>

                  <button
                    onClick={() => onNavigateToRoom(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#003087] hover:bg-[#00256c] text-white font-medium text-xs flex items-center gap-1 shadow-xs transition-colors duration-150"
                  >
                    <span>Enter Room</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
