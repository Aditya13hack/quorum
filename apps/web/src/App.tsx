import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { CoalitionRoom } from './screens/CoalitionRoom.js';
import { WishScreen } from './screens/WishScreen.js';
import { LedgerScreen } from './screens/LedgerScreen.js';
import { AuditScreen } from './screens/AuditScreen.js';
import { GuidedDemoScreen } from './screens/GuidedDemoScreen.js';
import { DeveloperScreen } from './screens/DeveloperScreen.js';

export function App() {
  const [currentTab, setTab] = useState('room');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-100 selection:text-[#003087]">
      <Navbar currentTab={currentTab} setTab={setTab} />

      <main className="flex-1 pb-12">
        {currentTab === 'room' && <CoalitionRoom />}
        {currentTab === 'wish' && <WishScreen onNavigateToRoom={() => setTab('room')} />}
        {currentTab === 'ledger' && <LedgerScreen />}
        {currentTab === 'audit' && <AuditScreen />}
        {currentTab === 'demo' && <GuidedDemoScreen onNavigateToRoom={() => setTab('room')} />}
        {currentTab === 'mcp' && <DeveloperScreen />}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#003087] text-white flex items-center justify-center font-bold text-[10px]">Q</span>
            <span className="font-semibold text-slate-800">Quorum Protocol</span>
            <span className="text-slate-300">•</span>
            <span>A Union for AI Shopping Agents</span>
          </div>

          <p className="text-slate-500">
            Built for <strong>"Build What's Next with PayPal and AI"</strong> (PayPal AI Hackathon 2026)
          </p>

          <div className="flex items-center gap-3 text-slate-400">
            <span>PayPal Sandbox Verified</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
