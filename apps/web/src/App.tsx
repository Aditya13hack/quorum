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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar currentTab={currentTab} setTab={setTab} />

      <main className="flex-1">
        {currentTab === 'room' && <CoalitionRoom />}
        {currentTab === 'wish' && <WishScreen onNavigateToRoom={() => setTab('room')} />}
        {currentTab === 'ledger' && <LedgerScreen />}
        {currentTab === 'audit' && <AuditScreen />}
        {currentTab === 'demo' && <GuidedDemoScreen onNavigateToRoom={() => setTab('room')} />}
        {currentTab === 'mcp' && <DeveloperScreen />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>
          Quorum • Built for <strong>"Build What's Next with PayPal and AI"</strong> (PayPal AI Hackathon 2026)
        </p>
        <p className="mt-1">
          Open Source under MIT License • PayPal Sandbox Environment Only • Honest Simulated Data Labels Enforced
        </p>
      </footer>
    </div>
  );
}
