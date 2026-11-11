import React from 'react';
import type { Membership } from '@quorum/shared/src/types.js';

interface RosterTableProps {
  members: Membership[];
}

export const RosterTable: React.FC<RosterTableProps> = ({ members }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white text-base">Coalition Member Roster</h4>
          <p className="text-xs text-slate-400">All participating AI buyer agents and human holders</p>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
          {members.length} Total Members
        </div>
      </div>

      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold tracking-wider sticky top-0">
            <tr>
              <th className="px-5 py-3">Agent / User</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Max Approved</th>
              <th className="px-5 py-3">Authorization ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => {
              const isSim = m.isSimulated;
              const authId = m.authorizationId || m.simAuthId || 'Pending Approval';
              return (
                <tr key={m.userId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {m.userId}
                  </td>
                  <td className="px-5 py-3">
                    {isSim ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        SIMULATED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        REAL PAYPAL
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold ${
                        m.state === 'APPROVED'
                          ? 'bg-blue-500/10 text-blue-400'
                          : m.state === 'CAPTURED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : m.state === 'WAITLISTED'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.state}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-300 mono font-semibold">
                    ${((m.approvedMaxCents || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-slate-400 mono text-[11px] truncate max-w-[160px]">
                    {authId}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
