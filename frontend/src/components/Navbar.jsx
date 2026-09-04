import React from 'react';
import { ShieldCheck, Activity, Network, FileCheck, Sliders, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Live Operations', icon: Activity },
    { id: 'heldout', label: 'Held-Out Benchmark & FP Cost', icon: ShieldCheck, badge: 'THE BAR' },
    { id: 'sentinel', label: 'Abuse Ring Sentinel', icon: Network },
    { id: 'autoresponder', label: 'Chargeback Auto-Responder', icon: FileCheck },
    { id: 'sandbox', label: 'Risk Inspector Sandbox', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-rzp-border px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Track Identification */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rzp-blue to-rzp-cyan flex items-center justify-center shadow-lg shadow-rzp-blue/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Razorpay <span className="text-rzp-accent">RiskShield AI</span></h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rzp-blue/20 text-rzp-accent border border-rzp-blue/40 rounded-full">
                BUILDATHON TRACK 02
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Risk Manager — Return Fraud, Chargebacks & Abuse Rings</p>
          </div>
        </div>

        {/* Live System Defense Status */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>DEFENSE ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rzp-panel border border-rzp-border text-slate-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-rzp-accent" />
            <span>v1.4.2-HistGB</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-rzp-dark/60 p-1 rounded-xl border border-rzp-border overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-rzp-blue text-white shadow-md shadow-rzp-blue/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-rzp-panel/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 font-bold rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rzp-amber/20 text-rzp-amber border border-rzp-amber/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
