import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HeldoutMetrics from './pages/HeldoutMetrics';
import RingSentinel from './pages/RingSentinel';
import AutoResponder from './pages/AutoResponder';
import Sandbox from './pages/Sandbox';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-rzp-dark text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'heldout' && <HeldoutMetrics />}
        {activeTab === 'sentinel' && <RingSentinel />}
        {activeTab === 'autoresponder' && <AutoResponder />}
        {activeTab === 'sandbox' && <Sandbox />}
      </main>

      {/* Razorpay Buildathon Submission Footer */}
      <footer className="border-t border-rzp-border bg-rzp-dark py-6 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">Razorpay RiskShield AI</span>
            <span>— Built for Razorpay AI Buildathon (Track 02: AI Risk Manager)</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-rzp-accent font-semibold">AI Risk Manager Platform</span>
            <span className="text-emerald-400 font-bold">Strictly Defense-Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
