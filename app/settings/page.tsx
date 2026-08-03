"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Settings, Shield, Bell, Palette, Globe, Wallet, Key, Trash2, Plus, BellRing, ChevronRight, Moon, Sun, AlertTriangle } from "lucide-react";
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

  const getBorder = () => isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black';
  const getShadow = (color?: string) => isDark ? `shadow-[4px_4px_0px_0px_${color || '#10B981'}]` : `shadow-[4px_4px_0px_0px_#000]`;
  const getBg = () => isDark ? 'bg-[#050510]' : 'bg-white';
  const getPanelBg = () => isDark ? 'bg-black' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${getBg()} font-mono uppercase tracking-wider text-sm sm:text-base ${isDark ? 'text-white' : 'text-black'} p-4 md:p-8 pb-24 overflow-x-hidden`}>
      <div className="max-w-5xl mx-auto w-full">
        
        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className={`${getPanelBg()} ${getBorder()} ${getShadow('#06B6D4')} p-4 flex flex-col md:flex-row justify-between items-center mb-6`}>
            <div className="font-black flex flex-wrap items-center gap-2 mb-4 md:mb-0 text-[#06B6D4]">
              <Settings className="w-5 h-5 hidden md:block" />
              <span>&gt; SYSTEM STATUS: ONLINE</span>
              <span className="hidden xl:inline"> // </span>
              <span className="hidden lg:inline text-[#10B981]">RPC LATENCY: 24MS</span>
              <span className="hidden xl:inline"> // </span>
              <span className="hidden md:inline text-[#F59E0B]">WALLET: {anchorWallet ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 md:flex-none px-4 py-2 font-black transition-all ${getBorder()} ${
                  activeTab === 'general'
                    ? (isDark ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#10B981]' : 'bg-black text-white shadow-[2px_2px_0px_0px_#000]')
                    : 'bg-transparent hover:bg-gray-500/10'
                }`}
              >
                [ GENERAL ]
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 md:flex-none px-4 py-2 font-black transition-all ${getBorder()} ${
                  activeTab === 'alerts'
                    ? (isDark ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#10B981]' : 'bg-black text-white shadow-[2px_2px_0px_0px_#000]')
                    : 'bg-transparent hover:bg-gray-500/10'
                }`}
              >
                [ ALERTS ]
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── GENERAL SETTINGS ── */}
        {activeTab === 'general' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SECTIONS.map((sec, i) => (
              <div key={i} className={`${getPanelBg()} ${getBorder()} ${getShadow('#10B981')} flex flex-col`}>
                <div className={`p-4 ${getBorder()} border-t-0 border-l-0 border-r-0 flex items-center gap-3 ${isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'}`}>
                  <sec.icon className="w-6 h-6" />
                  <h3 className="font-black tracking-widest">[ &gt; {sec.title} ]</h3>
                </div>
                
                <div className="flex flex-col p-4 gap-4">
                  {sec.title === 'Display' && (
                    <div className={`p-4 mb-2 ${getBorder()} flex flex-col gap-3`}>
                       <span className="font-black text-[#F59E0B]">&gt; THEME MODE</span>
                       <div className="flex gap-3">
                         <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 p-2 font-black transition-all ${getBorder()} ${isDark ? 'bg-[#F43F5E] text-black shadow-[2px_2px_0px_0px_#F43F5E]' : 'bg-transparent hover:bg-gray-200'}`}>
                           <Moon className="w-5 h-5" />
                           [ DARK ]
                         </button>
                         <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 p-2 font-black transition-all ${getBorder()} ${!isDark ? 'bg-[#F43F5E] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-transparent hover:bg-gray-200'}`}>
                           <Sun className="w-5 h-5" />
                           [ LIGHT ]
                         </button>
                       </div>
                    </div>
                  )}
                  {sec.items.map((item, idx) => (
                    <div key={idx} className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${idx !== sec.items.length - 1 ? `pb-4 border-b-2 border-dashed ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}` : ''}`}>
                      <span className="font-bold">{item.label}</span>
                      
                      {item.type === 'value' && (
                        <span className={`font-black p-2 ${getBorder()} ${isDark ? 'bg-[#06B6D4] text-black' : 'bg-gray-200 text-black'}`}>
                          {item.value === '0x...' && anchorWallet ? anchorWallet.publicKey.toBase58().substring(0,8)+'...' : item.value}
                        </span>
                      )}
                      
                      {item.type === 'toggle' && (
                         <button 
                           onClick={() => setToggles(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                           className={`font-black px-3 py-1 ${getBorder()} transition-all ${(toggles[item.label] ?? item.value) ? (isDark ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#10B981]' : 'bg-black text-white shadow-[2px_2px_0px_0px_#000]') : 'bg-transparent text-gray-500'}`}
                         >
                           { (toggles[item.label] ?? item.value) ? '[ ENABLED ]' : '[ DISABLED ]' }
                         </button>
                      )}
                      
                      {item.type === 'select' && (
                        <div className={`flex items-center gap-2 font-black px-3 py-1 cursor-pointer ${getBorder()} hover:bg-gray-200 transition-all ${!isDark && 'hover:bg-gray-300'} ${isDark && 'hover:text-black hover:bg-[#F59E0B]'}`}>
                          {item.value} <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                      
                      {item.type === 'action' && (
                        <button className={`px-4 py-1 font-black transition-all active:translate-y-1 active:shadow-none ${getBorder()} ${item.actionLabel === 'Disconnect' ? 'bg-[#F43F5E] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-[#6366F1] text-black shadow-[2px_2px_0px_0px_#000]'} `}>
                          [ {item.actionLabel.toUpperCase()} ]
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* DANGER ZONE */}
            <div className={`col-span-1 lg:col-span-2 mt-4 p-6 ${getBorder()} bg-[#F43F5E] text-black flex flex-col md:flex-row justify-between items-center gap-4 ${getShadow('#F43F5E')}`}>
               <div className="flex items-center gap-3 font-black text-lg md:text-xl">
                 <AlertTriangle className="w-8 h-8" />
                 DANGER ZONE
               </div>
               <button className={`px-6 py-3 font-black bg-black text-[#F43F5E] ${isDark ? 'border-2 border-black' : 'border-3 border-black'} hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none`}>
                 [ ⚠️ RESET ALL SYSTEM PREFERENCES ]
               </button>
            </div>
          </motion.div>
        )}

        {/* ── PRICE ALERTS ── */}
        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
            <div className={`p-6 ${getPanelBg()} ${getBorder()} ${getShadow('#6366F1')} flex flex-col md:flex-row justify-between items-center gap-4`}>
              <div>
                <h3 className="text-xl font-black mb-2 text-[#06B6D4]">&gt; SYSTEM ALERTS PROVISIONING</h3>
                <p className="text-sm font-bold opacity-80">ESTABLISH NEW PRICE TARGET THRESHOLDS.</p>
              </div>
              <button className={`font-black px-6 py-3 bg-[#6366F1] text-black ${getBorder()} shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2`}>
                <Plus className="w-5 h-5" /> [ ADD ALERT ]
              </button>
            </div>

            <div className={`${getPanelBg()} ${getBorder()} ${getShadow('#F59E0B')}`}>
              <div className={`p-4 ${getBorder()} border-t-0 border-l-0 border-r-0 flex items-center gap-3 ${isDark ? 'bg-[#F59E0B] text-black' : 'bg-black text-white'}`}>
                <BellRing className="w-6 h-6" />
                <h3 className="font-black tracking-widest">[ &gt; ACTIVE ALERTS ]</h3>
              </div>
              
              <div className="flex flex-col p-4">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center font-bold opacity-50">&gt; NO ACTIVE ALERTS IN SYSTEM.</div>
                ) : (
                  alerts.map((alert, idx) => (
                    <div key={alert.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 sm:gap-0 ${idx !== alerts.length - 1 ? `border-b-2 border-dashed ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}` : ''}`}>
                      <div className="flex items-center gap-6">
                        <button 
                           onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, active: !a.active } : a))}
                           className={`font-black px-3 py-1 transition-all ${getBorder()} ${alert.active ? (isDark ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#10B981]' : 'bg-black text-white shadow-[2px_2px_0px_0px_#000]') : 'bg-transparent text-gray-500'}`}
                         >
                           { alert.active ? '[ ACTIVE ]' : '[ INACTIVE ]' }
                        </button>
                        <div>
                          <div className="font-black text-lg sm:text-xl flex items-center gap-2">
                             <img src={`https://robohash.org/${alert.token.toLowerCase()}?set=set1&bgset=bg1&size=400x400`} alt={alert.token} className={`w-8 h-8 rounded-none ${getBorder()} bg-white`} />
                             ${alert.token}
                          </div>
                          <div className="text-sm font-bold opacity-80 mt-1">
                            {alert.condition === 'above' ? 'TARGET > ' : 'TARGET < '}
                            <span className="text-[#10B981]"><AnimatedCounter value={alert.price} prefix="$" decimals={4} /></span>
                          </div>
                        </div>
                      </div>
                      <button className={`p-3 font-black bg-[#F43F5E] text-black ${getBorder()} shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-none hover:bg-black hover:text-[#F43F5E] transition-all`}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
