import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, Terminal } from 'lucide-react';

export const AuditScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      const res = await fetch('/api/audit');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { logs, blockedAttacks } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Autonomous AI Safety Guard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Audit Trail & Blocked Attacks</h1>
        <p className="text-slate-400 text-sm mt-1">
          "The AI proposes, the Guard decides." Deterministic rules G1–G12 prevent prompt injections and money violations.
        </p>
      </div>

      {/* Blocked Attacks Alert Box */}
      <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Blocked Adversarial Attacks</h3>
            <p className="text-xs text-rose-300">Deterministic code successfully neutralized hostile seller AI agent</p>
          </div>
        </div>

        {blockedAttacks.length === 0 ? (
          <div className="text-xs text-slate-400 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            No attacks detected yet. Run Step 3 in the <strong>Judge Guided Demo</strong> to test adversarial defense!
          </div>
        ) : (
          <div className="space-y-3">
            {blockedAttacks.map((attack: any) => (
              <div key={attack.id} className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono uppercase">{attack.eventType}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    BLOCKED BY GUARD
                  </span>
                </div>
                <p className="text-slate-200 font-medium leading-relaxed">{attack.summary}</p>
                <div className="flex items-center gap-4 text-slate-400 text-[11px] pt-1">
                  <span>Actor: {attack.actor}</span>
                  <span>Time: {new Date(attack.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-white text-base">Full Append-Only Decision Log</h4>
          <span className="text-xs text-slate-400 font-mono">{logs.length} Logged Entries</span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {logs.map((log: any) => (
            <div key={log.id} className="p-4 sm:px-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">{log.eventType}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Actor: {log.actor} ({log.actorType})
                  </span>
                </div>
                <p className="text-slate-300">{log.summary}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between text-slate-400 text-[11px] shrink-0">
                <span className={`font-semibold ${log.verdict === 'blocked' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {log.verdict === 'blocked' ? 'BLOCKED' : 'VERIFIED'}
                </span>
                <span className="mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
