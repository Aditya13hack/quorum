import React, { useState, useEffect } from 'react';
import { PriceCurve } from '../components/PriceCurve.js';
import { QuorumMeter } from '../components/QuorumMeter.js';
import { RosterTable } from '../components/RosterTable.js';
import { ApprovalModal } from '../components/ApprovalModal.js';
import { Shield, Zap, ArrowDownRight, Tag, CheckCircle2, ShieldCheck, Store, Info, Lock } from 'lucide-react';

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
      setActionMessage(`Quorum locked! ${result.capturesExecuted} authorizations captured at $${(result.finalPriceCents / 100).toFixed(2)}. Staged payout 1 dispatched.`);
      fetchData();
    } catch (e) {
      alert('Capture failed: ' + String(e));
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-medium">Connecting to Coalition Room...</p>
        </div>
      </div>
    );
  }

  const { product, coalition, memberCount, approvedCount, quorumTarget, currentPriceCents, soloPriceCents, savingsCents, savingsPct, offers } = data;
  const winningOffer = offers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Active Reverse Auction
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                {coalition.state}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Autonomous AI Negotiation Protocol
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {product?.name || '27-inch 4K IPS Pro Monitor'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Aggregated collective demand from multiple buyer agents. Pricing steps down automatically as new buyers join the pool.
              </p>
            </div>

            {/* Spec tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Resolution: <strong>{coalition.specEnvelope.requiredAttributes.resolution}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Panel: <strong>{coalition.specEnvelope.requiredAttributes.panel}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Refresh: <strong>60Hz+</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Shipping: <strong>Included</strong>
              </span>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 lg:min-w-[340px] shrink-0 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                  Solo Retail Price
                </span>
                <span className="text-sm font-semibold text-slate-400 line-through mono">
                  ${(soloPriceCents / 100).toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider flex items-center justify-end gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Quorum Group Price
                </span>
                <span className="text-3xl font-bold text-slate-900 mono">
                  ${(currentPriceCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100/70 text-emerald-800 text-xs font-semibold">
                <span>Save ${((savingsCents || 0) / 100).toFixed(0)}/unit ({savingsPct}%)</span>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold text-[#003087] hover:underline flex items-center gap-1"
              >
                <span>Authorize Spot</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Price Curve (2 cols) + Quorum Meter & Actions (1 col) */}
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

        {/* Right Sidebar: Quorum Meter + Actions + Competing Seller Bids */}
        <div className="space-y-6">
          <QuorumMeter
            approvedCount={approvedCount}
            quorumTarget={quorumTarget}
            safetyMarginPct={coalition.safetyMarginPct}
          />

          {/* Action Trigger Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Human Approval & Reservation</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  The AI negotiated this bulk tier. Authorize via PayPal Sandbox to hold your position.
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003087] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Hold Amount:</span>
                <span className="font-semibold text-slate-800 mono">${(currentPriceCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Hold Mechanism:</span>
                <span className="font-medium text-slate-800">PayPal Authorization (Escrow)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Risk Exposure:</span>
                <span className="font-semibold text-emerald-700">$0.00 until Quorum Locked</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Review & Authorize in Sandbox</span>
            </button>

            {approvedCount >= quorumTarget && coalition.state === 'COLLECTING' && (
              <button
                onClick={handleLockAndCapture}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Execute Quorum Lock & Capture</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Zero penalty cancellation. Voided automatically if quorum target is unmet by the deadline.
            </p>
          </div>

          {/* Competing Seller Bids Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-500" />
                <h4 className="font-bold text-slate-900 text-sm">Competing Seller Bids</h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {offers.length} Bidders
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Autonomous seller agents competing in reverse auction</p>

            <div className="space-y-3">
              {offers.map((offer: any, idx: number) => {
                const isWinner = idx === 0;
                return (
                  <div
                    key={offer.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWinner
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{offer.sellerId}</span>
                        {isWinner && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#003087] text-white">
                            BEST OFFER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Honor: {offer.honorPct}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mb-2 leading-relaxed">{offer.notes}</div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/70">
                      <span className="text-slate-500">Max Discount Tier:</span>
                      <span className="font-bold text-slate-900 mono">
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
          setActionMessage(`Reservation authorization created (${authId}). Funds safely held in PayPal sandbox!`);
          fetchData();
        }}
      />
    </div>
  );
};
