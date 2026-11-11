import React from 'react';
import { Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Quorum Commitment Meter</h4>
            <p className="text-xs text-slate-400">Includes +{safetyMarginPct}% risk safety margin</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-extrabold text-white mono">{approvedCount}</span>
          <span className="text-sm font-semibold text-slate-400"> / {quorumTarget}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50 relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isUnlocked
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30'
              : 'bg-gradient-to-r from-blue-600 to-sky-400'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Zero money moves until 100% quorum reached</span>
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-1 font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Quorum Met — Deal Locked!</span>
          </div>
        ) : (
          <div className="font-semibold text-sky-400">
            {quorumTarget - approvedCount} more needed
          </div>
        )}
      </div>
    </div>
  );
};
