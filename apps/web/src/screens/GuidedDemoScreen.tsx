import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const GuidedDemoScreen: React.FC<{ onNavigateToRoom: () => void }> = ({ onNavigateToRoom }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState<any>(null);

  const steps = [
    {
      num: 1,
      title: 'Formulate wish and envelope',
      desc: 'AI compiles "4K monitor under $400" into a deterministic specification envelope with hard limits.',
    },
    {
      num: 2,
      title: 'Buyer agents join in bursts',
      desc: 'Autonomous agents aggregate volume into the room. Unit price steps down automatically to $315.',
    },
    {
      num: 3,
      title: 'Intercept adversarial attack',
      desc: 'Seller Gamma attempts prompt injection and malformed ladder. Guard stops it cold.',
    },
    {
      num: 4,
      title: 'Human authorizer hold',
      desc: 'Shopper explicitly authorizes via PayPal Sandbox. Funds are held in escrow, not charged.',
    },
    {
      num: 5,
      title: 'Quorum lock and healing',
      desc: 'Quorum reached. A simulated payment failure occurs, and the waiting list auto-heals immediately.',
    },
    {
      num: 6,
      title: 'Fulfillment and staged payout',
      desc: 'Orders dispatched with tracking. Supplier gets 50% upfront, 50% upon delivery. Ledger reconciles.',
    },
  ];

  const runStep = async (stepNum: number) => {
    setLoading(true);
    setCurrentStep(stepNum);
    try {
      const res = await fetch('/api/scenario/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepNum }),
      });
      const json = await res.json();
      setStepData(json);
    } catch (e) {
      alert('Step execution failed: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset entire demo scenario to initial seed state?')) {
      await fetch('/api/scenario/reset', { method: 'POST' });
      setCurrentStep(1);
      setStepData(null);
      alert('Demo scenario reset to initial seed state.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#003087] font-medium text-xs mb-1">
            <Play className="w-3.5 h-3.5" />
            <span>Evaluation walkthrough</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Six-step protocol scenario
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
            Step through the multi-agent reverse auction lifecycle to verify escrow holds, deterministic defenses, and automated healing.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-center shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset scenario</span>
        </button>
      </div>

      {/* Step Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          return (
            <div
              key={s.num}
              onClick={() => runStep(s.num)}
              className={`p-5 rounded-xl border cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-50 border-[#003087]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-md text-xs font-medium flex items-center justify-center ${
                    isActive ? 'bg-[#003087] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.num}
                </span>
                {isActive && (
                  <span className="text-[10px] font-medium text-[#003087]">
                    Active
                  </span>
                )}
              </div>
              <h4 className="font-medium text-slate-900 text-xs sm:text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Active Step Output Viewer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400">Step {currentStep} of 6</span>
            <h3 className="text-base font-semibold text-slate-900 mt-0.5">{steps[currentStep - 1]?.title}</h3>
          </div>

          <button
            onClick={() => runStep(currentStep < 6 ? currentStep + 1 : 1)}
            disabled={loading}
            className="py-2 px-3.5 rounded-xl bg-[#003087] hover:bg-[#00256c] disabled:opacity-60 text-white font-medium text-xs flex items-center gap-2 transition-colors duration-150 shadow-xs"
          >
            {loading ? (
              <span>Executing step...</span>
            ) : (
              <>
                <span>Next step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {stepData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
              <p className="text-slate-800 leading-relaxed">{stepData.description}</p>
            </div>

            {/* Special highlights based on step */}
            {currentStep === 3 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Attack intercepted by Guard rule G5</span>
                </div>
                <p className="text-rose-900/80 leading-relaxed">
                  Seller Gamma tried injecting instructions to override limits. The deterministic Guard rejected the payload without execution.
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Waiting list healing verified</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  sim_buyer_1 payment hold failed. The engine promoted <strong>{stepData.promotedMember}</strong> from the waiting list autonomously to maintain quorum.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400 font-mono">Response: 200 OK</span>
              <button
                onClick={onNavigateToRoom}
                className="font-medium text-[#003087] hover:underline flex items-center gap-1"
              >
                <span>View updated state in coalition room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Select any step above or click "Next step" to run the scenario.
          </div>
        )}
      </div>
    </div>
  );
};
