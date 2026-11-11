import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, Terminal, Shield, CheckCircle2 } from 'lucide-react';

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
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-medium">Verifying audit log integrity...</p>
        </div>
      </div>
    );
  }

  const { logs, blockedAttacks } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-semibold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Autonomous AI Safety & Defense Invariant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Audit Trail & Adversarial Defenses
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          <strong>"The AI proposes, the Guard decides."</strong> Deterministic rules G1–G12 execute as pure code without AI or network calls, neutralizing prompt injections and preventing money movement violations.
        </p>
      </div>

      {/* Blocked Attacks Alert Box */}
      <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Blocked Adversarial Attacks</h3>
            <p className="text-xs text-rose-800">
              Deterministic Guard successfully intercepted hostile seller AI agent attempts
            </p>
          </div>
        </div>

        {blockedAttacks.length === 0 ? (
          <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-rose-200/60">
            No attacks detected in current session. Run <strong>Step 3</strong> in the <strong>Evaluation Walkthrough</strong> tab to trigger live adversarial attacks against Seller Gamma!
          </div>
        ) : (
          <div className="space-y-3">
            {blockedAttacks.map((attack: any) => (
              <div
                key={attack.id}
                className="p-4 rounded-xl bg-white border border-rose-200 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 font-mono text-[11px] uppercase">
                    {attack.eventType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    BLOCKED BY GUARD
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{attack.summary}</p>
                <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                  <span>Target Actor: <strong className="text-slate-700">{attack.actor}</strong></span>
                  <span>Timestamp: <span className="mono">{new Date(attack.timestamp).toLocaleTimeString()}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Full Append-Only Decision Log</h4>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of every negotiation, bid, hold, and capture</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {logs.length} Logged Entries
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log: any) => {
            const isBlocked = log.verdict === 'blocked';
            return (
              <div
                key={log.id}
                className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">{log.eventType}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Actor: {log.actor} ({log.actorType})
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{log.summary}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-slate-400 text-[11px] shrink-0 gap-1">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      isBlocked
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isBlocked ? 'BLOCKED' : 'VERIFIED'}
                  </span>
                  <span className="mono text-slate-400 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
