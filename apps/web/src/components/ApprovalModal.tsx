import React, { useState } from 'react';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 transition-opacity">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003087]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Approve best and final offer</h3>
            <p className="text-xs text-slate-500">Autonomous agents pooled volume demand to unlock this tier</p>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Solo retail price:</span>
            <span className="text-slate-400 line-through tabular-nums">
              ${(soloPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Quorum negotiated unit price:</span>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums">
              ${(finalPriceCents / 100).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Volume discount:</span>
            <span className="font-medium text-emerald-700 tabular-nums">
              -${(savingsCents / 100).toFixed(2)} ({Math.round((savingsCents / soloPriceCents) * 100)}% off)
            </span>
          </div>
        </div>

        {/* Escrow Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs mb-6">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#003087]" />
          <div>
            <p className="font-medium text-slate-900 mb-0.5">Funds are reserved on hold, not charged</p>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              PayPal places an authorization hold for ${(finalPriceCents / 100).toFixed(2)}. The card is charged only after the full quorum threshold (11 buyers) is reached and locked. If the group fails to reach threshold, the hold voids with $0 charged.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            disabled={loading}
            onClick={handleSimulatedApprove}
            className="w-full py-2.5 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authorizing in PayPal Sandbox...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Authorize reservation hold (${(finalPriceCents / 100).toFixed(2)})</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors duration-150"
          >
            Cancel and return
          </button>
        </div>
      </div>
    </div>
  );
};
