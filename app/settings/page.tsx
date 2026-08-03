"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, Shield, Bell, Palette, Globe, Wallet, Key, Trash2, Plus, BellRing, ChevronRight, Moon, Sun } from "lucide-react";
import { useMoonWallet } from "@/components/WalletProvider";
import { useToast } from "@/components/ToastProvider";
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/components/ThemeProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

type Item =
  | { label: string; value: string; type: "value" }
  | { label: string; value: boolean; type: "toggle" }
  | { label: string; value: string; type: "select" }
  | { label: string; type: "action"; actionLabel: string };

type Section = { title: string; icon: typeof Shield; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Wallet & Security", icon: Shield,
    items: [
      { label: "Connected Wallet", value: "0x...", type: "value" },
      { label: "Auto-Approve Transactions", value: false, type: "toggle" },
      { label: "Export Private Key", type: "action", actionLabel: "Export" },
      { label: "Disconnect Wallet", type: "action", actionLabel: "Disconnect" },
    ],
  },
  {
    title: "Trading Preferences", icon: Globe,
    items: [
      { label: "Default Slippage", value: "1.0%", type: "select" },
      { label: "Max MEV Protection", value: true, type: "toggle" },
      { label: "Priority Fee Level", value: "High (0.005 SOL)", type: "select" },
    ],
  },
  {
    title: "Notifications", icon: Bell,
    items: [
      { label: "Price Alerts", value: true, type: "toggle" },
      { label: "New Launches (AI Match)", value: true, type: "toggle" },
      { label: "Governance Proposals", value: false, type: "toggle" },
    ],
  },
  {
    title: "Display", icon: Palette,
    items: [
      { label: "Chart Type", value: "Area", type: "select" },
      { label: "Performance Animations", value: true, type: "toggle" },
    ],
  },
];

const INITIAL_ALERTS = [
  { id: "1", token: "LDOGE", condition: "above", price: 0.003, active: true },
  { id: "2", token: "SWRM", condition: "below", price: 0.0005, active: false },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const { anchorWallet } = useMoonWallet();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'general' | 'alerts'>('general');
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Auto-Approve Transactions": false,
    "Max MEV Protection": true,
    "Price Alerts": true,
    "New Launches (AI Match)": true,
    "Governance Proposals": false,
    "Performance Animations": true,
  });


  return (
    <div className="max-w-4xl mx-auto w-full pt-4 sm:pt-6 md:pt-8 pb-24 px-4 sm:px-6 md:px-8 max-w-full overflow-x-hidden">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-text-primary mb-2 flex items-center justify-center md:justify-start gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] display-safe">
            <Settings className="w-8 h-8 text-indigo-400" />
            Settings
          </h1>
          <p className="text-text-secondary">Manage your account, trading preferences, and alerts.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto p-1 bg-surface-base backdrop-blur-2xl border border-border-subtle rounded-xl shadow-card">
          <MagneticButton
            onClick={() => setActiveTab('general')}
            className={`flex w-full sm:w-auto justify-center items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${
              activeTab === 'general'
                ? 'bg-indigo-500/15 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            General Settings
          </MagneticButton>
          <MagneticButton
            onClick={() => setActiveTab('alerts')}
            className={`flex w-full sm:w-auto justify-center items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${
              activeTab === 'alerts'
                ? 'bg-indigo-500/15 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Price Alerts
          </MagneticButton>
        </div>
      </motion.div>

      {/* ── GENERAL SETTINGS ── */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((sec, i) => (
            <div key={i} className="bg-surface-base backdrop-blur-2xl border border-border-subtle flex flex-col overflow-hidden rounded-xl hover:border-border-focus transition-all">
              <div className="p-4 border-b border-border-subtle flex items-center gap-3">
                <sec.icon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-text-primary">{sec.title}</h3>
              </div>
              
              <div className="flex flex-col p-2">
                {sec.title === 'Display' && (
                  <div className="p-3 mb-2 border-b border-border-subtle">
                     <span className="text-sm font-medium text-text-secondary block mb-3">Theme Mode</span>
                     <div className="flex gap-3">
                       <button onClick={() => setTheme('dark')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-border-subtle hover:border-border-focus hover:bg-surface-hover'}`}>
                         <Moon className="w-5 h-5 mb-1.5 text-indigo-400" />
                         <span className="text-xs font-medium text-text-primary">Dark</span>
                       </button>
                       <button onClick={() => setTheme('light')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${!isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-border-subtle hover:border-border-focus hover:bg-surface-hover'}`}>
                         <Sun className="w-5 h-5 mb-1.5 text-indigo-400" />
                         <span className="text-xs font-medium text-text-primary">Light</span>
                       </button>
                     </div>
                  </div>
                )}
                {sec.items.map((item, idx) => (
                  <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 sm:gap-0 rounded-lg hover:bg-surface-hover transition-colors ${idx !== sec.items.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                    <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                    
                    {item.type === 'value' && (
                      <span className="text-sm text-text-primary font-mono bg-surface-1 border border-border-default px-2 py-1 rounded shadow-inner">{item.value === '0x...' && anchorWallet ? anchorWallet.publicKey.toBase58().substring(0,8)+'...' : item.value}</span>
                    )}
                    
                    {item.type === 'toggle' && (
                      <div 
                        onClick={() => setToggles(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors border ${(toggles[item.label] ?? item.value) ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-surface-1 border-border-default'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-text-primary transition-transform ${(toggles[item.label] ?? item.value) ? 'translate-x-5 shadow-[0_0_5px_var(--color-text-primary)]' : 'translate-x-0 opacity-50'}`} />
                      </div>
                    )}
                    
                    {item.type === 'select' && (
                      <div className="flex items-center gap-1 text-sm font-medium text-text-primary bg-surface-1 px-3 py-1 rounded cursor-pointer border border-border-subtle hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(129,140,248,0.2)] transition-all">
                        {item.value} <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                    )}
                    
                    {item.type === 'action' && (
                      <MagneticButton strength={0.2} className={`px-3 py-1 rounded text-sm font-bold transition-all border active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${item.actionLabel === 'Disconnect' ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'}`}>
                        {item.actionLabel}
                      </MagneticButton>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── PRICE ALERTS ── */}
      {activeTab === 'alerts' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
          <div className="bg-surface-base backdrop-blur-2xl border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-border-focus transition-all">
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-1 display-safe">Create New Alert</h3>
              <p className="text-sm text-text-secondary">Get notified when a token hits your target price.</p>
            </div>
            <MagneticButton strength={0.25} className="bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-400 rounded-lg font-bold px-4 py-2 transition-all flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">
              <Plus className="w-4 h-4" /> Add Alert
            </MagneticButton>
          </div>

          <div className="bg-surface-base backdrop-blur-2xl border border-border-subtle overflow-hidden rounded-xl">
            <div className="p-5 border-b border-border-subtle bg-surface-base backdrop-blur-2xl flex items-center gap-2">
              <BellRing className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.3)]" />
              <h3 className="text-lg font-bold text-text-primary drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Active Alerts</h3>
            </div>
            <div className="flex flex-col p-2">
              {alerts.length === 0 ? (
                <div className="p-4 sm:p-6 md:p-8 text-center text-text-secondary">No active price alerts.</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 sm:gap-0 border-b border-border-subtle hover:bg-surface-hover transition-colors rounded-lg group">
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, active: !a.active } : a))}
                        className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-all border ${alert.active ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-surface-1 border-border-default'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-text-primary transition-transform ${alert.active ? 'translate-x-5 shadow-[0_0_5px_var(--color-text-primary)]' : 'translate-x-0 opacity-50'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-text-primary group-hover:text-indigo-400 transition-colors">${alert.token}</div>
                        <div className="text-xs text-text-secondary font-mono">
                          {alert.condition === 'above' ? 'Goes above ' : 'Drops below '}
                          <span className="font-bold text-green-500"><AnimatedCounter value={alert.price} prefix="$" decimals={4} /></span>
                        </div>
                      </div>
                    </div>
                    <MagneticButton strength={0.2} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors border border-transparent hover:border-red-500/30 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">
                      <Trash2 className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
