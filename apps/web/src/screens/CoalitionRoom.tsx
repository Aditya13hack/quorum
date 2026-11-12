import React, { useState, useEffect } from 'react';
import { PriceCurve } from '../components/PriceCurve.js';
import { QuorumMeter } from '../components/QuorumMeter.js';
import { RosterTable } from '../components/RosterTable.js';
import { ApprovalModal } from '../components/ApprovalModal.js';
import { Shield, Zap, ArrowDownRight, CheckCircle2, ShieldCheck, Store, Lock, UserPlus, RefreshCw, ShoppingCart, Users, Layers, Sparkles } from 'lucide-react';

interface CoalitionRoomProps {
  coalitionId?: string;
  dataMode?: 'simulated' | 'live';
  onSelectCoalition?: (id: string) => void;
  onNavigateToWish?: () => void;
}

export const CoalitionRoom: React.FC<CoalitionRoomProps> = ({
  coalitionId = '',
  dataMode = 'simulated',
  onSelectCoalition,
  onNavigateToWish,
}) => {
  const [activeId, setActiveId] = useState(coalitionId || (dataMode === 'simulated' ? 'coalition_monitor_demo' : ''));
  const [data, setData] = useState<any>(null);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New member input for user and teammates
  const [newMemberName, setNewMemberName] = useState('');
  const [joining, setJoining] = useState(false);
  const [negotiating, setNegotiating] = useState(false);

  // Sync activeId when coalitionId or dataMode changes
  useEffect(() => {
    if (coalitionId) {
      setActiveId(coalitionId);
    } else if (dataMode === 'simulated') {
      setActiveId('coalition_monitor_demo');
    } else {
      setActiveId('');
    }
  }, [coalitionId, dataMode]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`/api/coalitions?mode=${dataMode}`);
      if (!res.ok) {
        setAllRooms([]);
        return;
      }
      const json = await res.json();
      const rooms = json.coalitions || [];
      setAllRooms(rooms);

      // If activeId is empty and rooms are available, pick the first
      if (!activeId && rooms.length > 0) {
        setActiveId(rooms[0].id);
        if (onSelectCoalition) onSelectCoalition(rooms[0].id);
      }
    } catch (e) {
      console.error(e);
      setAllRooms([]);
    }
  };

  const fetchData = async () => {
    if (!activeId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/coalitions/${activeId}?mode=${dataMode}`);
      if (!res.ok) {
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [dataMode]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [activeId, dataMode]);

  // Handle User or Teammate Joining
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeId) return;

    setJoining(true);
    try {
      const res = await fetch(`/api/coalitions/${activeId}/join?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newMemberName.trim(),
          isSimulated: dataMode !== 'live',
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setActionMessage(`Participant "${newMemberName.trim()}" joined the coalition pool.`);
      setNewMemberName('');
      fetchData();
      fetchRooms();
    } catch (err: any) {
      alert('Join failed: ' + err.message);
    } finally {
      setJoining(false);
    }
  };

  // Handle Real-time AI Negotiation
  const handleNegotiate = async () => {
    if (!activeId) return;
    setNegotiating(true);
    try {
      const res = await fetch(`/api/coalitions/${activeId}/negotiate?mode=${dataMode}`, {
        method: 'POST',
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setActionMessage(result.message);
      fetchData();
    } catch (err: any) {
      alert('Negotiation failed: ' + err.message);
    } finally {
      setNegotiating(false);
    }
  };

  const handleLockAndCapture = async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/payments/lock-and-capture?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coalitionId: activeId }),
      });
      const result = await res.json();
      setActionMessage(`Quorum locked! ${result.capturesExecuted} authorizations captured at $${(result.finalPriceCents / 100).toFixed(2)}. First staged supplier payout dispatched.`);
      fetchData();
    } catch (e) {
      alert('Capture failed: ' + String(e));
    }
  };

  // 1. Pristine Blank State for Real-Time Mode (when no live rooms have been created yet)
  if (dataMode === 'live' && allRooms.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <Users className="w-7 h-7" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Real-Time Sandbox Mode Active
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              No Real-Time Coalition Pools Active
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In Real-Time mode, everything starts <strong>100% clean and blank</strong>. There are no fake buyers, no simulated transactions, and no mock data.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToWish}
              className="px-6 py-3 rounded-xl bg-[#003087] hover:bg-[#00256c] text-white font-medium text-sm shadow-xs transition-colors duration-150 inline-flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Create Your First Real Coalition Pool</span>
            </button>
          </div>

          {/* Real-time Architecture Guide */}
          <div className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-[#003087] block">1. Post Demand</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Define the item and your price ceiling in "Create demand". A live reverse auction pool is initialized.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-[#003087] block">2. Pool Live Teammates</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                You and your teammates join with custom handles. Live buyer agents aggregate collective volume.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-bold text-[#003087] block">3. Real PayPal Sandbox</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorize purchase limits via real PayPal Sandbox popup. Zero dollars charged until quorum locks.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs">Loading coalition room data...</p>
        </div>
      </div>
    );
  }

  const { product, coalition, memberCount, approvedCount, quorumTarget, currentPriceCents, soloPriceCents, savingsCents, savingsPct, offers } = data;
  const winningOffer = offers && offers.length > 0 ? offers[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Room Selector Pills */}
      <div className="flex items-center justify-between pb-1 overflow-x-auto gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active Room:</span>
          {allRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setActiveId(room.id);
                if (onSelectCoalition) onSelectCoalition(room.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 border ${
                activeId === room.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              <span>{room.name}</span>
              <span className="ml-1.5 text-[10px] opacity-75">({room.memberCount} buyers)</span>
            </button>
          ))}
        </div>

        {onNavigateToWish && (
          <button
            onClick={onNavigateToWish}
            className="text-xs font-medium text-[#003087] hover:underline whitespace-nowrap flex items-center gap-1"
          >
            <span>+ Create new room</span>
          </button>
        )}
      </div>

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
                {memberCount} shopping agents pooled
              </span>
              {dataMode === 'live' && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  ⚡ Live Mode
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {product?.name || coalition.specEnvelope?.category || 'Autonomous Buyer Coalition'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-2xl leading-relaxed">
                Autonomous buyer agents coordinate aggregate volume. The unit price steps down automatically as each new buyer reserves a spot.
              </p>
            </div>

            {/* Spec tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              {Object.entries(coalition.specEnvelope.requiredAttributes || {}).map(([key, val]) => (
                <span key={key} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                  {key}: <span className="font-medium text-slate-800">{String(val)}</span>
                </span>
              ))}
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                Delivery: <span className="font-medium text-slate-800">Included</span>
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
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

          {/* Join Coalition as Participant/Agent & AI Negotiation Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Join Coalition or Trigger Negotiation</h4>
                <p className="text-xs text-slate-500">You and your teammates can add agent handles to this live room</p>
              </div>

              <button
                onClick={handleNegotiate}
                disabled={negotiating}
                className="px-3 py-1.5 rounded-xl border border-[#003087] text-[#003087] hover:bg-blue-50 text-xs font-medium flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${negotiating ? 'animate-spin' : ''}`} />
                <span>{negotiating ? 'Negotiating with sellers...' : 'Bargain with Seller AI'}</span>
              </button>
            </div>

            <form onSubmit={handleJoin} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Enter handle (e.g. Aditya, Alex, DevTeam-1)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#003087]"
              />
              <button
                type="submit"
                disabled={joining || !newMemberName.trim()}
                className="px-4 py-2 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs flex items-center gap-1.5 transition-colors duration-150"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{joining ? 'Joining...' : 'Join Pool'}</span>
              </button>
            </form>
          </div>

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
                  The AI negotiated this tier. Authorize with PayPal to lock in your position.
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
              <span>Review and authorize spot</span>
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
          {offers && offers.length > 0 && (
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
          )}

          {/* Two-Sided PayPal Settlement & Payouts Architecture Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#003087]" />
              <h4 className="font-medium text-slate-900 text-sm">Two-Sided PayPal Settlement</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quorum integrates both sides of PayPal's financial engine: consumer authorization hold escrow and automated supplier milestone payouts.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-semibold text-slate-900 text-[11px] block">1. Buyer Protection (Orders v2 Hold)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  $0 charged upfront. Authorizations void automatically at zero penalty if quorum threshold is unmet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-semibold text-[#003087] text-[11px] block">2. Supplier Payouts (50/50 Staged Batch)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Upon quorum execution, 50% upfront disbursement is dispatched to the supplier via PayPal Payouts, with 50% completion retention held until carrier tracking verification.
                </p>
              </div>
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
        coalitionId={activeId}
        dataMode={dataMode}
        onApproveSuccess={(authId, isReal) => {
          setActionMessage(`Reservation authorization confirmed (${authId}). Funds held safely in PayPal ${isReal ? 'Sandbox' : 'Escrow'}.`);
          fetchData();
        }}
      />
    </div>
  );
};
