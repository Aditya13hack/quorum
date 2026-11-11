import React, { useState } from 'react';
import { ShieldCheck, Check, AlertCircle, X, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003087]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Approve Best & Final Offer</h3>
            <p className="text-xs text-slate-500">Your AI agent secured volume pricing in the collective pool</p>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Solo Retail Price:</span>
            <span className="font-semibold line-through text-slate-400 mono">
              ${(soloPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Quorum Negotiated Unit Price:</span>
            <span className="text-2xl font-bold text-slate-900 mono">
              ${(finalPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Your Guaranteed Savings:</span>
            <span className="font-bold text-emerald-700 mono">
              -${(savingsCents / 100).toFixed(2)} ({Math.round((savingsCents / soloPriceCents) * 100)}% off)
            </span>
          </div>
        </div>

        {/* Escrow / Reservation Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-700 text-xs mb-6">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#003087]" />
          <div>
            <p className="font-semibold text-slate-900 mb-0.5">Funds are Reserved, NOT Charged</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              PayPal places an authorization hold for <strong>${(finalPriceCents / 100).toFixed(2)}</strong>. You are charged ONLY after the full quorum threshold (11 buyers) is reached and locked. If the coalition fails to close, the hold is voided with $0 charged.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            disabled={loading}
            onClick={handleSimulatedApprove}
            className="w-full py-3 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authorizing in PayPal Sandbox...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Authorize Reservation Hold (${(finalPriceCents / 100).toFixed(2)})</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors"
          >
            Cancel / Return to Coalition
          </button>
        </div>
      </div>
    </div>
  );
};
