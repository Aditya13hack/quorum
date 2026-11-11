import React, { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle, X } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalPriceCents: number;
  soloPriceCents: number;
  savingsCents: number;
  coalitionId: string;
  onApproveSuccess: (authId: string, isReal: boolean) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  finalPriceCents,
  soloPriceCents,
  savingsCents,
  coalitionId,
  onApproveSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedApprove = async () => {
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coalitionId,
          userId: `human_shopper_${Math.floor(Math.random() * 1000)}`,
          amountCents: finalPriceCents,
          useRealPayPal: false,
        }),
      });
      const order = await orderRes.json();

      // 2. Authorize
      const authRes = await fetch('/api/payments/authorize-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coalitionId,
          userId: `human_shopper_${Math.floor(Math.random() * 1000)}`,
          orderId: order.orderId,
          amountCents: finalPriceCents,
          useRealPayPal: false,
        }),
      });
      const auth = await authRes.json();

      onApproveSuccess(auth.authorizationId, false);
      onClose();
    } catch (e) {
      alert('Approval failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Approve Best & Final Offer</h3>
            <p className="text-xs text-slate-400">Your AI agent secured volume pricing</p>
          </div>
        </div>

        {/* Pricing comparison summary */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Solo Shopping Price:</span>
            <span className="text-sm font-semibold line-through text-slate-500 mono">
              ${(soloPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Quorum Negotiated Price:</span>
            <span className="text-2xl font-extrabold text-emerald-400 mono">
              ${(finalPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Guaranteed Savings:</span>
            <span className="font-bold text-sky-400 mono">
              +${(savingsCents / 100).toFixed(2)} ({Math.round((savingsCents / soloPriceCents) * 100)}% off)
            </span>
          </div>
        </div>

        {/* Prime Directive 3 Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-semibold mb-0.5">Funds are Reserved, NOT Charged</p>
            <p className="text-amber-300/80">
              PayPal holds a reservation authorization. You are charged ONLY if the full quorum is met. If the group fails, the reservation is voided automatically with $0 paid.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            disabled={loading}
            onClick={handleSimulatedApprove}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authorizing in Sandbox...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Approve & Authorize Reservation (${(finalPriceCents / 100).toFixed(2)})</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-colors"
          >
            Decline / Adjust Limits
          </button>
        </div>
      </div>
    </div>
  );
};
