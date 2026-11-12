import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, ShieldAlert, Swords, CheckCircle2 } from 'lucide-react';

interface AuditScreenProps {
  dataMode?: 'simulated' | 'live';
}

export const AuditScreen: React.FC<AuditScreenProps> = ({ dataMode = 'simulated' }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringAttack, setTriggeringAttack] = useState(false);
  const [attackFeedback, setAttackFeedback] = useState<string | null>(null);

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/audit?mode=${dataMode}`);
      if (!res.ok) {
        return;
      }
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
  }, [dataMode]);

  const handleTriggerAttack = async (attackType: string) => {
    setTriggeringAttack(true);
    setAttackFeedback(null);
    try {
      const res = await fetch(`/api/audit/test-attack?mode=${dataMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setAttackFeedback(`Intercepted by Guard: ${result.summary}`);
      await fetchAudit();
    } catch (err: any) {
      alert('Attack simulation failed: ' + err.message);
    } finally {
      setTriggeringAttack(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs">Loading audit records</p>
        </div>
      </div>
    );
  }

  const { logs = [], blockedAttacks = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety invariant</span>
          {dataMode === 'live' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
              ⚡ Real-Time Mode
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Audit trail and adversarial defenses
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
          <strong>"The AI proposes, the Guard decides."</strong> Deterministic rules G1–G12 execute as pure code without network calls or prompt trust, stopping prompt injections and unauthorized money movement.
        </p>
      </div>

      {/* Interactive Adversarial Threat Simulator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-600" />
              <h3 className="font-semibold text-slate-900 text-sm">
                Interactive Adversarial Threat Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any vector below to simulate a rogue seller AI agent attempting an exploit. Watch the pure-code Guard intercept it live.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
            Zero Network • Pure Code
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => handleTriggerAttack('G1_PRICE_CEILING')}
            disabled={triggeringAttack}
            className="p-3 text-left rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 text-slate-900 text-xs font-medium space-y-1 transition-all duration-150 disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-rose-700 font-semibold text-[11px]">
              <span>Rule G1: Price Ceiling</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
              Seller AI proposes $450/unit offer exceeding the user's hard $380 ceiling.
            </p>
          </button>

          <button
            onClick={() => handleTriggerAttack('G8_SELLER_AS_BUYER')}
            disabled={triggeringAttack}
            className="p-3 text-left rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 text-slate-900 text-xs font-medium space-y-1 transition-all duration-150 disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-rose-700 font-semibold text-[11px]">
              <span>Rule G8: Sybil Collusion</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
              Seller attempts to join the buyer union to artificially manipulate quorum count.
            </p>
          </button>

          <button
            onClick={() => handleTriggerAttack('G4_HONOR_PCT')}
            disabled={triggeringAttack}
            className="p-3 text-left rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 text-slate-900 text-xs font-medium space-y-1 transition-all duration-150 disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-rose-700 font-semibold text-[11px]">
              <span>Rule G4: Ghost Inventory</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
              Supplier proposes 55% fulfillment honor rate, violating minimum 80% protocol bar.
            </p>
          </button>

          <button
            onClick={() => handleTriggerAttack('G7_DUPLICATE_SYBIL')}
            disabled={triggeringAttack}
            className="p-3 text-left rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 text-slate-900 text-xs font-medium space-y-1 transition-all duration-150 disabled:opacity-50"
          >
            <div className="flex items-center justify-between text-rose-700 font-semibold text-[11px]">
              <span>Rule G7: Duplicate Payer</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
              Sybil agent attempts multiple registrations using identical PayPal payer accounts.
            </p>
          </button>
        </div>

        {attackFeedback && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in duration-150">
            <span>{attackFeedback}</span>
            <button
              onClick={() => setAttackFeedback(null)}
              className="font-medium text-rose-900 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Blocked Attacks Alert Box */}
      <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Intercepted adversarial attempts ({blockedAttacks.length})
            </h3>
            <p className="text-xs text-rose-800">
              Deterministic Guard rules intercepted non-compliant seller AI agent inputs
            </p>
          </div>
        </div>

        {blockedAttacks.length === 0 ? (
          <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-rose-200/60">
            No attacks detected in the current session. Click any of the 4 test vectors above to simulate live adversarial defense.
          </div>
        ) : (
          <div className="space-y-3">
            {blockedAttacks.map((attack: any) => (
              <div
                key={attack.id}
                className="p-4 rounded-xl bg-white border border-rose-200 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium text-rose-700">
                    {attack.eventType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    Blocked by Guard
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed">{attack.summary}</p>
                <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                  <span>Actor: <span className="font-medium text-slate-700">{attack.actor}</span></span>
                  <span>Time: <span className="font-mono tabular-nums">{new Date(attack.timestamp).toLocaleTimeString()}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-slate-900 text-sm">Append-only decision log</h4>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of every negotiation, bid, hold, and capture</p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
            {logs.length} entries
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            0 live audit logs recorded. Actions taken in Real-Time mode will be appended here in real time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log: any) => {
              const isBlocked = log.verdict === 'blocked';
              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-medium text-slate-900">{log.eventType}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {log.actor} ({log.actorType})
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{log.summary}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-slate-400 text-[11px] shrink-0 gap-1">
                    <span
                      className={`font-medium px-2 py-0.5 rounded text-[10px] ${
                        isBlocked
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isBlocked ? 'Blocked' : 'Verified'}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
