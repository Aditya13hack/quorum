import React from 'react';
import { ShieldCheck, ShoppingCart, Activity, FileSpreadsheet, PlayCircle, Code2 } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'room', label: 'Coalition Overview', icon: Activity },
    { id: 'wish', label: 'Create Demand', icon: ShoppingCart },
    { id: 'ledger', label: 'Financial Ledger', icon: FileSpreadsheet },
    { id: 'audit', label: 'Security & Guard', icon: ShieldCheck },
    { id: 'demo', label: 'Evaluation Walkthrough', icon: PlayCircle },
    { id: 'mcp', label: 'API & MCP Server', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('room')}>
          <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center font-bold text-white text-lg tracking-tight shadow-sm">
            Q
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">Quorum</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Agentic Commerce
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">Autonomous buyer coalition protocol</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#0079C1]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sandbox Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>PayPal Sandbox</span>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                active ? 'bg-white text-slate-900 border border-slate-200 shadow-xs' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
