import React from 'react';
import type { Membership } from '@quorum/shared/src/types.js';
import { Users, ShieldCheck, Check } from 'lucide-react';

interface RosterTableProps {
  members: Membership[];
}

export const RosterTable: React.FC<RosterTableProps> = ({ members }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h4 className="font-bold text-slate-900 text-sm">Coalition Member Roster</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pooled demand from verified human shoppers and autonomous buyer agents
          </p>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
          {members.length} Total Members
        </div>
      </div>

      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-100 z-10">
            <tr>
              <th className="px-6 py-3">Agent / User</th>
              <th className="px-6 py-3">Source Type</th>
              <th className="px-6 py-3">State</th>
              <th className="px-6 py-3 text-right">Max Approved</th>
              <th className="px-6 py-3">Authorization ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => {
              const isSim = m.isSimulated;
              const authId = m.authorizationId || m.simAuthId || 'Pending Approval';
              return (
                <tr key={m.userId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                        {m.userId.substring(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{m.userId}</span>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    {isSim ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        SIMULATED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" />
                        REAL PAYPAL
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        m.state === 'APPROVED'
                          ? 'bg-blue-50 text-[#003087] border border-blue-200'
                          : m.state === 'CAPTURED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.state === 'WAITLISTED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.state}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-right font-medium text-slate-800 mono">
                    ${((m.approvedMaxCents || 0) / 100).toFixed(2)}
                  </td>

                  <td className="px-6 py-3.5 text-slate-500 mono text-[11px] truncate max-w-[170px]">
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
