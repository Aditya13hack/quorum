import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { CoalitionRoom } from './screens/CoalitionRoom.js';
import { WishScreen } from './screens/WishScreen.js';
import { LedgerScreen } from './screens/LedgerScreen.js';
import { AuditScreen } from './screens/AuditScreen.js';
import { DeveloperScreen } from './screens/DeveloperScreen.js';

export function App() {
  const [currentTab, setTab] = useState('room');
  const [dataMode, setDataMode] = useState<'simulated' | 'live'>('simulated');
  const [activeCoalitionId, setActiveCoalitionId] = useState('coalition_monitor_demo');

  const handleNavigateToRoom = (newCoalitionId?: string) => {
    if (newCoalitionId) {
      setActiveCoalitionId(newCoalitionId);
    }
    setTab('room');
  };

  // Reset active coalition when switching to live mode if it was the simulated demo room
  const handleToggleDataMode = (newMode: 'simulated' | 'live') => {
    setDataMode(newMode);
    if (newMode === 'live') {
      setActiveCoalitionId('');
    } else {
      setActiveCoalitionId('coalition_monitor_demo');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-100 selection:text-[#003087]">
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        dataMode={dataMode}
        setDataMode={handleToggleDataMode}
      />

      {/* Visual Status Indicator Banner for Active Mode */}
      {dataMode === 'live' ? (
        <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-4 py-2 text-center text-xs text-emerald-900 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>
            <strong>Real-Time Data Active:</strong> 100% pristine live environment with 0 fake data. All coalitions, participants, and PayPal Sandbox authorizations are real.
          </span>
          <button
            onClick={() => handleToggleDataMode('simulated')}
            className="underline hover:text-emerald-700 font-semibold ml-2 text-xs"
          >
            Switch to Simulated Demo
          </button>
        </div>
      ) : (
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-1.5 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>
            <strong>Simulated Demo Active:</strong> Showing pre-seeded 4K Monitor coalition with 15 synthetic agents & sample ledger for presentation.
          </span>
          <button
            onClick={() => handleToggleDataMode('live')}
            className="underline hover:text-amber-800 font-semibold ml-2 text-xs"
          >
            Switch to Real-Time (Blank)
          </button>
        </div>
      )}

      <main className="flex-1 pb-12">
        <ErrorBoundary>
          {currentTab === 'room' && (
            <CoalitionRoom
              coalitionId={activeCoalitionId}
              dataMode={dataMode}
              onSelectCoalition={(id) => setActiveCoalitionId(id)}
              onNavigateToWish={() => setTab('wish')}
            />
          )}
          {currentTab === 'wish' && (
            <WishScreen
              dataMode={dataMode}
              onNavigateToRoom={handleNavigateToRoom}
            />
          )}
          {currentTab === 'ledger' && <LedgerScreen dataMode={dataMode} />}
          {currentTab === 'audit' && <AuditScreen dataMode={dataMode} />}
          {currentTab === 'mcp' && <DeveloperScreen dataMode={dataMode} />}
        </ErrorBoundary>
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
            <span className="font-medium text-emerald-600">PayPal Sandbox Verified</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
