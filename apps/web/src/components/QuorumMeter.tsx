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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#003087]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Commitment Threshold</h4>
            <p className="text-xs text-slate-500">Includes +{safetyMarginPct}% safety buffer for last-minute payment attrition</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-slate-900 mono">{approvedCount}</span>
          <span className="text-sm font-medium text-slate-400"> / {quorumTarget}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isUnlocked ? 'bg-emerald-600' : 'bg-[#003087]'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1.5 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Zero money moves until 100% threshold achieved</span>
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-1 font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Quorum Met</span>
          </div>
        ) : (
          <div className="font-semibold text-[#0079C1]">
            {quorumTarget - approvedCount} more required
          </div>
        )}
      </div>
    </div>
  );
};
