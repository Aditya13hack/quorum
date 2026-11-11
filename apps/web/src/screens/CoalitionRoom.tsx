import React, { useState, useEffect } from 'react';
import { PriceCurve } from '../components/PriceCurve.js';
import { QuorumMeter } from '../components/QuorumMeter.js';
import { RosterTable } from '../components/RosterTable.js';
import { ApprovalModal } from '../components/ApprovalModal.js';
import { ShoppingBag, Zap, Shield, Clock, ArrowDownRight, Tag } from 'lucide-react';

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
      setActionMessage(`🎉 Quorum locked! ${result.capturesExecuted} authorizations captured at $${(result.finalPriceCents / 100).toFixed(2)}. Staged payout 1 issued.`);
      fetchData();
    } catch (e) {
      alert('Capture failed: ' + String(e));
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Connecting to Coalition Room...</p>
        </div>
      </div>
    );
  }

  const { product, coalition, memberCount, approvedCount, quorumTarget, currentPriceCents, soloPriceCents, savingsCents, savingsPct, offers, priceCurve } = data;
  const winningOffer = offers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Active Reverse Auction
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {coalition.state}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {product?.name || '27-inch 4K IPS Pro Monitor'}
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            {coalition.specEnvelope.requiredAttributes.resolution} • {coalition.specEnvelope.requiredAttributes.panel} Panel • 60Hz+ • Flat Shipping Included
          </p>
        </div>

        {/* Big Price Savings Card */}
        <div className="flex items-center gap-6 bg-slate-950/70 border border-slate-800 p-5 rounded-2xl relative z-10 shrink-0">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span>Solo Retail Price</span>
            </div>
            <div className="text-lg font-bold text-slate-500 line-through mono">
              ${(soloPriceCents / 100).toFixed(2)}
            </div>
          </div>

          <div className="w-px h-10 bg-slate-800"></div>

          <div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Current Group Price</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mono">
              ${(currentPriceCents / 100).toFixed(2)}
            </div>
          </div>

          <div className="hidden sm:block pl-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs">
              Save ${((savingsCents || 0) / 100).toFixed(0)} ({savingsPct}%)
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Price Curve + Quorum Meter & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceCurve
            currentMembers={approvedCount}
            soloPriceCents={soloPriceCents}
            currentPriceCents={currentPriceCents}
            quorumTarget={quorumTarget}
            tiers={winningOffer?.tierLadder || []}
          />
        </div>

        <div className="space-y-6">
          <QuorumMeter
            approvedCount={approvedCount}
            quorumTarget={quorumTarget}
            safetyMarginPct={coalition.safetyMarginPct}
          />

          {/* Action Trigger Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="font-bold text-white text-sm">Human Approval & Reservation</h4>
            <p className="text-xs text-slate-400">
              The AI negotiated this bulk tier. Now authorize with PayPal to reserve your spot.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Review & Authorize in Sandbox</span>
            </button>

            {approvedCount >= quorumTarget && coalition.state === 'COLLECTING' && (
              <button
                onClick={handleLockAndCapture}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Execute Quorum Lock & Capture</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roster & Seller Offers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RosterTable members={data.members} />
        </div>

        {/* Active Bids Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h4 className="font-bold text-white text-base mb-1">Competing Seller Bids</h4>
          <p className="text-xs text-slate-400 mb-4">Autonomous seller agents reverse auction</p>

          <div className="space-y-3">
            {offers.map((offer: any) => (
              <div key={offer.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">{offer.sellerId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold">
                    Honor: {offer.honorPct}%
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">{offer.notes}</div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lowest Tier: ${(offer.tierLadder[offer.tierLadder.length - 1].priceCents / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
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
          setActionMessage(`✅ Reservation authorization created (${authId}). Funds safely held in PayPal sandbox!`);
          fetchData();
        }}
      />
    </div>
  );
};
