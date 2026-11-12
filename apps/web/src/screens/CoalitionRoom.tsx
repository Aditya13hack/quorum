import React, { useState, useEffect } from 'react';
import { PriceCurve } from '../components/PriceCurve.js';
import { QuorumMeter } from '../components/QuorumMeter.js';
import { RosterTable } from '../components/RosterTable.js';
import { ApprovalModal } from '../components/ApprovalModal.js';
import { Shield, Zap, ArrowDownRight, CheckCircle2, ShieldCheck, Store, Lock, Info } from 'lucide-react';

export const CoalitionRoom: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/coalitions/coalition_monitor_demo');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLockAndCapture = async () => {
    try {
      const res = await fetch('/api/payments/lock-and-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coalitionId: 'coalition_monitor_demo' }),
      });
      const result = await res.json();
      setActionMessage(`Quorum locked. ${result.capturesExecuted} authorizations captured at $${(result.finalPriceCents / 100).toFixed(2)}. First staged supplier payout dispatched.`);
      fetchData();
    } catch (e) {
      alert('Capture failed: ' + String(e));
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs">Connecting to coalition room</p>
        </div>
      </div>
    );
  }

  const { product, coalition, memberCount, approvedCount, quorumTarget, currentPriceCents, soloPriceCents, savingsCents, savingsPct, offers } = data;
  const winningOffer = offers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Product Summary & Execution Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Active reverse auction
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{coalition.state.toLowerCase()}</span>
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                15 shopping agents pooled
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {product?.name || '27-inch 4K IPS Pro Monitor'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-2xl leading-relaxed">
                Autonomous buyer agents coordinate aggregate volume. The unit price steps down automatically as each new buyer reserves a spot.
              </p>
            </div>

            {/* Spec tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Panel: <span className="font-medium text-slate-800">{coalition.specEnvelope.requiredAttributes.panel}</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Resolution: <span className="font-medium text-slate-800">{coalition.specEnvelope.requiredAttributes.resolution}</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Refresh rate: <span className="font-medium text-slate-800">60Hz+</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Shipping: <span className="font-medium text-slate-800">Included</span>
              </span>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 lg:min-w-[320px] shrink-0 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">
                  Solo retail price
                </span>
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  ${(soloPriceCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-700 font-medium block flex items-center justify-end gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Quorum group price
                </span>
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                  ${(currentPriceCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-medium">
                Save ${((savingsCents || 0) / 100).toFixed(2)} ({savingsPct}% discount)
              </span>

              <button
                onClick={() => setModalOpen(true)}
                className="font-medium text-[#003087] hover:underline flex items-center gap-1"
              >
                <span>Authorize spot</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Volume-Tier Curve (2 cols) + Threshold & Actions (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceCurve
            currentMembers={approvedCount}
            soloPriceCents={soloPriceCents}
            currentPriceCents={currentPriceCents}
            quorumTarget={quorumTarget}
            tiers={winningOffer?.tierLadder || []}
          />

          <RosterTable members={data.members} />
        </div>

        {/* Right Column: Quorum Meter + Execution Controls + Competing Bids */}
        <div className="space-y-6">
          <QuorumMeter
            approvedCount={approvedCount}
            quorumTarget={quorumTarget}
            safetyMarginPct={coalition.safetyMarginPct}
          />

          {/* Action Trigger Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Human authorization</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  The AI negotiated this tier. Authorize with PayPal Sandbox to lock in your position.
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003087] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Hold amount:</span>
                <span className="font-medium text-slate-900 tabular-nums">${(currentPriceCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hold mechanism:</span>
                <span className="font-medium text-slate-900">PayPal authorization hold</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Risk exposure:</span>
                <span className="font-medium text-emerald-700">$0.00 until quorum locked</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Review and authorize in sandbox</span>
            </button>

            {approvedCount >= quorumTarget && coalition.state === 'COLLECTING' && (
              <button
                onClick={handleLockAndCapture}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors duration-150 flex items-center justify-center gap-2 shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Execute quorum lock and capture</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              No cancellation fee. The authorization is voided automatically if the threshold is not reached.
            </p>
          </div>

          {/* Competing Seller Bids Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-500" />
                <h4 className="font-medium text-slate-900 text-sm">Competing seller bids</h4>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {offers.length} sellers
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Autonomous seller agents reverse auction</p>

            <div className="space-y-3">
              {offers.map((offer: any, idx: number) => {
                const isWinner = idx === 0;
                return (
                  <div
                    key={offer.id}
                    className={`p-3.5 rounded-xl border transition-colors duration-150 ${
                      isWinner
                        ? 'bg-slate-50/90 border-[#003087]/30'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 text-xs">{offer.sellerId}</span>
                        {isWinner && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#003087] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Honor rate: {offer.honorPct}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">{offer.notes}</p>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-500">Max volume tier:</span>
                      <span className="font-medium text-slate-900 tabular-nums">
                        ${(offer.tierLadder[offer.tierLadder.length - 1].priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        finalPriceCents={currentPriceCents}
        soloPriceCents={soloPriceCents}
        savingsCents={savingsCents}
        coalitionId={coalition.id}
        onApproveSuccess={(authId, isReal) => {
          setActionMessage(`Reservation authorization created (${authId}). Funds held safely in PayPal sandbox.`);
          fetchData();
        }}
      />
    </div>
  );
};
