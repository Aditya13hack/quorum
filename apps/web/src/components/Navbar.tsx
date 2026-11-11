import React from 'react';
import { ShieldCheck, Sparkles, Activity, FileSpreadsheet, Lock, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: 'room', label: 'Coalition Room', icon: Activity },
    { id: 'wish', label: 'Make a Wish', icon: Sparkles },
    { id: 'ledger', label: 'Ledger & Reconcile', icon: FileSpreadsheet },
    { id: 'audit', label: 'Guard & Attacks', icon: ShieldCheck },
    { id: 'demo', label: 'Judge Guided Demo', icon: Lock },
    { id: 'mcp', label: 'MCP & APIs', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('room')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-blue-500/20">
            Q
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Quorum</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Agentic Commerce
              </span>
            </div>
            <p className="text-xs text-slate-400">Union for AI Shopping Agents</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sandbox Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          PayPal Sandbox Only
        </div>
      </div>
    </header>
  );
};
