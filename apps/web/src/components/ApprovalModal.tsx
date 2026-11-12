import React, { useState } from 'react';
import { ShieldCheck, Check, X, Lock, ExternalLink } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalPriceCents: number;
  soloPriceCents: number;
  savingsCents: number;
  coalitionId: string;
  dataMode: 'simulated' | 'live';
  onApproveSuccess: (authId: string, isReal: boolean) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  finalPriceCents,
  soloPriceCents,
  savingsCents,
  coalitionId,
  dataMode,
  onApproveSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [useRealPayPal, setUseRealPayPal] = useState(dataMode === 'live');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEffectiveMode = useRealPayPal ? 'live' : 'simulated';

  // Step 1: Start Authorization (Create order)
  const handleStartApproval = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch(`/api/payments/create-order?mode=${currentEffectiveMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coalitionId,
          userId: `buyer_${Math.floor(Math.random() * 900) + 100}`,
          amountCents: finalPriceCents,
          useRealPayPal,
        }),
      });

      const order = await orderRes.json();
      if (order.error) {
        throw new Error(order.error);
      }

      if (useRealPayPal && order.approvalUrl && order.provider === 'paypal') {
        // Real PayPal Sandbox: open approval URL in new window/tab
        setPendingOrderId(order.orderId);
        setApprovalUrl(order.approvalUrl);
        window.open(order.approvalUrl, '_blank', 'width=500,height=700');
        setLoading(false);
      } else {
        // Simulated: immediately authorize order without opening popup
        await completeAuthorization(order.orderId, false);
      }
    } catch (e) {
      alert('Order creation failed: ' + String(e));
      setLoading(false);
    }
  };

  // Step 2: Complete Authorization Hold
  const completeAuthorization = async (orderId: string, isReal: boolean) => {
    setLoading(true);
    try {
      const authRes = await fetch(`/api/payments/authorize-order?mode=${isReal ? 'live' : 'simulated'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coalitionId,
          userId: `buyer_${Math.floor(Math.random() * 900) + 100}`,
          orderId,
          amountCents: finalPriceCents,
          useRealPayPal: isReal,
        }),
      });

      const auth = await authRes.json();
      if (auth.error) {
        throw new Error(auth.error);
      }

      onApproveSuccess(auth.authorizationId, isReal);
      onClose();
    } catch (e) {
      alert('Authorization failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 transition-opacity">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl relative animate-in fade-in duration-150">
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
            <h3 className="text-base font-semibold text-slate-900">Authorize Purchase Guarantee</h3>
            <p className="text-xs text-slate-500">Autonomous pooling reserve held securely until quorum execution</p>
          </div>
        </div>

        {/* Mode Toggle Switch (Simulated vs Real PayPal Sandbox) */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-5 text-xs font-medium border border-slate-200">
          <button
            onClick={() => { setUseRealPayPal(true); setPendingOrderId(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 ${
              useRealPayPal ? 'bg-[#003087] text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real PayPal Sandbox</span>
          </button>
          <button
            onClick={() => { setUseRealPayPal(false); setPendingOrderId(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 ${
              !useRealPayPal ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Simulated Instant Test</span>
          </button>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-2.5">
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
              -${(savingsCents / 100).toFixed(2)} ({soloPriceCents > 0 ? Math.round((savingsCents / soloPriceCents) * 100) : 0}% off)
            </span>
          </div>
        </div>

        {/* Pending Real PayPal Flow State */}
        {pendingOrderId && approvalUrl ? (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-3 mb-5">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-[#003087] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">PayPal Sandbox checkout window opened</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Log in using your Sandbox test buyer account:
                </p>
                <div className="mt-1.5 bg-white p-2.5 rounded-lg border border-blue-200/80 font-mono text-[11px] space-y-1 text-slate-800">
                  <div>Email: <strong className="select-all">sb-anis353857682@personal.example.com</strong></div>
                  <div>Password: <strong className="select-all">{"Je<}|8an"}</strong></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Once approved in PayPal, click the button below to lock your authorization hold in the coalition:
            </p>

            <button
              disabled={loading}
              onClick={() => completeAuthorization(pendingOrderId, true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Confirming PayPal authorization...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>I approved in PayPal — Lock authorization</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Escrow Notice */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs mb-5">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#003087]" />
              <div>
                <p className="font-medium text-slate-900 mb-0.5">Funds are reserved on hold, not charged</p>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  PayPal places an authorization hold for ${(finalPriceCents / 100).toFixed(2)}. The card is charged only after the full quorum threshold is reached and locked. If the group fails, the hold voids at $0 cost.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                disabled={loading}
                onClick={handleStartApproval}
                className="w-full py-2.5 px-4 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Connecting to PayPal...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {useRealPayPal
                        ? `Authorize in PayPal Sandbox ($${(finalPriceCents / 100).toFixed(2)})`
                        : `Authorize simulated hold ($${(finalPriceCents / 100).toFixed(2)})`}
                    </span>
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
          </>
        )}
      </div>
    </div>
  );
};
