import React from 'react';
import { Users, CheckCircle2, ShieldCheck } from 'lucide-react';

interface QuorumMeterProps {
  approvedCount: number;
  quorumTarget: number;
  safetyMarginPct: number;
}

export const QuorumMeter: React.FC<QuorumMeterProps> = ({
  approvedCount,
  quorumTarget,
  safetyMarginPct,
}) => {
  const percentage = Math.min(100, Math.round((approvedCount / quorumTarget) * 100));
  const isUnlocked = approvedCount >= quorumTarget;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003087]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 text-sm">Commitment threshold</h4>
            <p className="text-xs text-slate-500">Includes +{safetyMarginPct}% risk buffer for payment attrition</p>
          </div>
        </div>

        <div className="text-right tabular-nums">
          <span className="text-2xl font-semibold text-slate-900">{approvedCount}</span>
          <span className="text-xs text-slate-400"> / {quorumTarget}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
            isUnlocked ? 'bg-emerald-600' : 'bg-[#003087]'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-1.5 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Zero funds move until threshold is locked</span>
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-1 font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Threshold reached</span>
          </div>
        ) : (
          <div className="font-medium text-[#003087]">
            {quorumTarget - approvedCount} more needed
          </div>
        )}
      </div>
    </div>
  );
};
