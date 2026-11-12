import React from 'react';
import { ShieldCheck, ShoppingCart, Activity, FileSpreadsheet, PlayCircle, Code2 } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  dataMode: 'simulated' | 'live';
  setDataMode: (mode: 'simulated' | 'live') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  dataMode,
  setDataMode,
}) => {
  const tabs = [
    { id: 'room', label: 'Coalition room', icon: Activity },
    { id: 'wish', label: 'Create demand', icon: ShoppingCart },
    { id: 'ledger', label: 'Financial ledger', icon: FileSpreadsheet },
    { id: 'audit', label: 'Safety & guard', icon: ShieldCheck },
    { id: 'demo', label: 'Walkthrough', icon: PlayCircle },
    { id: 'mcp', label: 'API & MCP', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTab('room')}>
          <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center font-medium text-white text-base">
            Q
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-slate-900 tracking-tight">Quorum</span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">Buyer union protocol</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${active ? 'text-[#003087]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Real-Time vs Simulated Mode Toggle Button */}
        <div className="flex items-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDataMode('simulated')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                dataMode === 'simulated'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Switch to Simulated Demo with pre-seeded data for presentation"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Simulated Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setDataMode('live')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                dataMode === 'live'
                  ? 'bg-[#003087] text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Switch to Real-Time mode (starts 100% blank, real PayPal sandbox only)"
            >
              <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>Real-Time (Blank)</span>
            </button>
          </div>
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
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
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
