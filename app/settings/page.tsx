"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, Shield, Bell, Palette, Globe, Wallet, Key, Trash2, Plus, BellRing, ChevronRight } from "lucide-react";
import { useMoonWallet } from "@/components/WalletProvider";
import { useToast } from "@/components/ToastProvider";

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
      { label: "Connected Wallet", value: "0x71C...9711", type: "value" },
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
      { label: "Theme", value: "Midnight Indigo", type: "select" },
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
  const { anchorWallet } = useMoonWallet();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'general' | 'alerts'>('general');
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  return (
    <div className="max-w-4xl mx-auto w-full pt-8 pb-16">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold font-display text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <Settings className="w-8 h-8 text-[#818CF8]" />
            Settings
          </h1>
          <p className="text-[#94A3B8]">Manage your account, trading preferences, and alerts.</p>
        </div>
        
        <div className="flex p-1 bg-[#161B27] border border-[rgba(99,102,241,0.15)] rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'general'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'alerts'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Price Alerts
          </button>
        </div>
      </motion.div>

      {/* ── GENERAL SETTINGS ── */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECTIONS.map((sec, i) => (
            <div key={i} className="surface-card flex flex-col overflow-hidden border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.3)] transition-colors">
              <div className="p-4 border-b border-[rgba(99,102,241,0.1)] bg-[#161B27] flex items-center gap-3">
                <sec.icon className="w-5 h-5 text-[#818CF8]" />
                <h3 className="font-bold text-white">{sec.title}</h3>
              </div>
              
              <div className="flex flex-col p-2">
                {sec.items.map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-3 rounded-lg hover:bg-[rgba(99,102,241,0.03)] transition-colors ${idx !== sec.items.length - 1 ? 'border-b border-[rgba(99,102,241,0.05)]' : ''}`}>
                    <span className="text-sm font-medium text-[#94A3B8]">{item.label}</span>
                    
                    {item.type === 'value' && (
                      <span className="text-sm text-white font-mono bg-[#161B27] px-2 py-1 rounded">{item.value === '0x71C...9711' && anchorWallet ? anchorWallet.publicKey.toBase58().substring(0,8)+'...' : item.value}</span>
                    )}
                    
                    {item.type === 'toggle' && (
                      <div className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${item.value ? 'bg-[#10B981]' : 'bg-[#475569]'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    )}
                    
                    {item.type === 'select' && (
                      <div className="flex items-center gap-1 text-sm font-medium text-white bg-[#161B27] px-3 py-1 rounded cursor-pointer border border-[rgba(99,102,241,0.15)] hover:border-[#6366F1] transition-colors">
                        {item.value} <ChevronRight className="w-3.5 h-3.5 text-[#475569]" />
                      </div>
                    )}
                    
                    {item.type === 'action' && (
                      <button className={`px-3 py-1 rounded text-sm font-medium transition-colors ${item.actionLabel === 'Disconnect' ? 'bg-[rgba(244,63,94,0.1)] text-[#F43F5E] hover:bg-[rgba(244,63,94,0.2)]' : 'bg-[rgba(99,102,241,0.1)] text-[#818CF8] hover:bg-[rgba(99,102,241,0.2)]'}`}>
                        {item.actionLabel}
                      </button>
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
          <div className="surface-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Create New Alert</h3>
              <p className="text-sm text-[#94A3B8]">Get notified when a token hits your target price.</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Alert
            </button>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(99,102,241,0.15)] bg-[#161B27] flex items-center gap-2">
              <BellRing className="w-5 h-5 text-[#818CF8]" />
              <h3 className="text-lg font-bold text-white">Active Alerts</h3>
            </div>
            <div className="flex flex-col p-2">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-[#475569]">No active price alerts.</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex justify-between items-center p-4 border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.03)] transition-colors rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${alert.active ? 'bg-[#10B981]' : 'bg-[#475569]'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alert.active ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-white">${alert.token}</div>
                        <div className="text-xs text-[#94A3B8] font-mono">
                          {alert.condition === 'above' ? 'Goes above ' : 'Drops below '}
                          <span className="font-bold text-white">${alert.price}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-[#475569] hover:text-[#F43F5E] hover:bg-[rgba(244,63,94,0.1)] rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
