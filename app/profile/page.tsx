"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { User, Wallet, Activity, Shield, Award, Zap, TrendingUp, Users, Flame, Star, Crown, ChevronRight, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import AnimatedCounter from '@/components/AnimatedCounter';
import MagneticButton from '@/components/MagneticButton';
import { useMoonWallet } from '@/components/WalletProvider';
import { useWalletModal } from '@/components/SolanaProvider';
import { useTheme } from '@/components/ThemeProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

// ── DATA ──
const HOLDINGS = [
  { icon: "🐕", name: "Luna Doge",  ticker: "LDOGE", qty: "1,200,000", avgBuy: "$0.00097", current: "$0.00234", value: "$2,808",  pnl: "+$1,969", pnlPct: "+141.2%", pos: true, color: "#F59E0B" },
  { icon: "🧠", name: "NeuralFi",   ticker: "NFI",   qty: "4,500",     avgBuy: "$1.12",    current: "$1.42",    value: "$6,390",  pnl: "+$1,350", pnlPct: "+26.8%",  pos: true, color: "#8B5CF6" },
  { icon: "🚀", name: "RocketDoge", ticker: "RDOGE", qty: "500,000",   avgBuy: "$0.00310", current: "$0.00248", value: "$1,240",  pnl: "-$310",   pnlPct: "-20.0%",  pos: false, color: "#F43F5E" },
];

const ACHIEVEMENTS = [
  { title: "Early Hunter", desc: "Top 100 buyer in 5 launches", icon: "🎯", rarity: "LEGENDARY", color: "#F59E0B", unlocked: true },
  { title: "Whale Status", desc: "Deployed over 100 SOL in single trade", icon: "🐋", rarity: "EPIC", color: "#6366F1", unlocked: true },
  { title: "Diamond Hands", desc: "Held through 80% drawdown and recovered", icon: "💎", rarity: "RARE", color: "#06B6D4", unlocked: true },
  { title: "Graduation Day", desc: "Held a token that graduated to DEX", icon: "🎓", rarity: "EPIC", color: "#10B981", unlocked: false },
];

const CREATOR_ECONOMY = {
  score: 94,
  launches: 12,
  successRate: "100%",
  avgRetention: "78%",
  earnings: "--",
  followers: 0,
  following: 124,
};

export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const { connected, address } = useMoonWallet();
  const { setModalOpen } = useWalletModal();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'creator'>('portfolio');
  const [isFollowing, setIsFollowing] = useState(false);

  // AI Roast State
  const [roastData, setRoastData] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const handleRoast = async () => {
    setIsRoasting(true);
    try {
      const res = await fetch("/api/roast-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: "degendave.sol" })
      });
      const data = await res.json();
      setRoastData(data.roast);
    } catch (e) {
      showToast("Roast failed. The AI felt bad for you.", "error");
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pt-4 sm:pt-6 md:pt-8 pb-24 px-4 sm:px-6 md:px-8 max-w-full overflow-x-hidden">
      
      {/* ── TOP SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* IDENTITY CARD */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`backdrop-blur-2xl transition-all duration-300 ease-out p-6 flex flex-col justify-between border-t-4 border-t-[#6366F1] shadow-[0_8px_32px_rgba(99,102,241,0.15)] relative overflow-hidden ${isDark ? 'bg-[rgba(5,5,16,0.80)] border border-[rgba(99,102,241,0.08)] hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]' : 'bg-surface-1 border border-border-subtle hover:border-indigo-300'}`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_50%)]" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#818CF8] shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold mb-1 flex items-center gap-2 display-safe ${isDark ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'text-text-primary'}`}>
                  {connected && address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect Wallet'}
                  <span className="bg-[#6366F1] text-[10px] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">Pro</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[#818CF8] font-mono text-sm">
                    {connected && address ? `@${address.slice(0, 4)}...` : '@degendave'}
                  </span>
                  <button 
                    onClick={() => {
                      if (connected && address) {
                        navigator.clipboard.writeText(address);
                        showToast('Address copied to clipboard', 'success');
                      }
                    }}
                    className={`transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${isDark ? 'text-[#475569] hover:text-white' : 'text-text-muted hover:text-text-primary'}`} title="Copy Address">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <MagneticButton as="div" strength={0.25}>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${isFollowing ? (isDark ? 'bg-transparent border-[rgba(255,255,255,0.2)] text-white hover:border-[rgba(244,63,94,0.5)] hover:text-[#F43F5E]' : 'bg-transparent border-border-strong text-text-primary hover:border-red-500 hover:text-red-500') : 'bg-[#6366F1] border-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-[#4F46E5]'}`}
              >
                {isFollowing ? (
                  <>Following</>
                ) : (
                  <>Follow</>
                )}
              </button>
            </MagneticButton>
          </div>

          <div className="flex items-center gap-6 mb-6 relative z-10 text-sm">
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-text-primary'}`}>{CREATOR_ECONOMY.followers > 0 ? <AnimatedCounter value={CREATOR_ECONOMY.followers} /> : "--"}</span>
              <span className="text-text-secondary">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-text-primary'}`}><AnimatedCounter value={CREATOR_ECONOMY.following} /></span>
              <span className="text-text-secondary">Following</span>
            </div>
          </div>

          <div className={`relative z-10 border-t pt-4 ${isDark ? 'border-[rgba(255,255,255,0.05)]' : 'border-border-subtle'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary text-sm flex items-center gap-1.5"><Crown className="w-4 h-4 text-[#F59E0B]" /> Level 42</span>
              <span className="text-[#818CF8] font-mono font-bold"><AnimatedCounter value={94200} /> XP</span>
            </div>
            <div className="h-2 w-full bg-[rgba(99,102,241,0.1)] rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)]">
              <div className="h-full bg-[#6366F1] w-[75%] shadow-[0_0_10px_#6366F1] transition-all duration-700 ease-out" />
            </div>
          </div>
        </motion.div>

        {/* PORTFOLIO SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`backdrop-blur-2xl transition-all duration-300 ease-out p-6 flex flex-col justify-center border shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden ${isDark ? 'bg-[rgba(5,5,16,0.80)] border-[rgba(16,185,129,0.2)] hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]' : 'bg-surface-1 border-border-subtle hover:border-indigo-300'}`}>
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.8),transparent_70%)]" />
          <div className="flex items-center gap-2 text-text-secondary mb-2 font-semibold relative z-10">
            <Wallet className="w-4 h-4" /> Total Balance
          </div>
          <div className={`text-lg sm:text-xl md:text-2xl font-mono font-bold mb-2 relative z-10 ${isDark ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' : 'text-text-primary'}`}>Connect wallet to view</div>
          <div className="flex items-center gap-2 relative z-10">
            <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-1 rounded text-sm font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)]">
              <TrendingUp className="w-3.5 h-3.5" /> Connect wallet to view
            </span>
            <span className="text-text-muted text-sm">Past 30 days</span>
          </div>
        </motion.div>

        {/* AI WALLET ROAST */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`backdrop-blur-2xl transition-all duration-300 ease-out p-6 border relative overflow-hidden flex flex-col ${isDark ? 'bg-[rgba(5,5,16,0.80)] border-[rgba(244,63,94,0.3)] hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]' : 'bg-red-50 border-red-200 hover:border-red-300'}`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.8),transparent_60%)]" />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="flex items-center gap-2 text-[#F43F5E] font-bold text-sm uppercase tracking-wider drop-shadow-[0_0_5px_currentColor]">
              <Flame className="w-4 h-4" /> AI Wallet Roast
            </div>
            {!roastData && (
              <MagneticButton as="div" strength={0.25}>
                <button 
                  onClick={handleRoast} 
                  disabled={isRoasting}
                  className={`text-xs font-bold px-3 py-1.5 rounded transition-all border disabled:opacity-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${isDark ? 'bg-[rgba(244,63,94,0.15)] hover:bg-[rgba(244,63,94,0.25)] text-[#F43F5E] border-[rgba(244,63,94,0.3)]' : 'bg-red-100 hover:bg-red-200 text-red-700 border-red-200'}`}
                >
                  {isRoasting ? 'Roasting...' : 'Roast Me'}
                </button>
              </MagneticButton>
            )}
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {roastData ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'text-text-primary'}`}>{roastData.persona}</h3>
                  <div className="text-right">
                    <div className="text-[#F43F5E] font-mono text-xl font-bold">{roastData.portfolioScore}/100</div>
                    <div className="text-[10px] uppercase text-text-muted">Score</div>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed border-l-2 border-[#F43F5E] pl-3 ${isDark ? 'text-[#F1F5F9]' : 'text-text-primary'}`}>
                  "{roastData.roast}"
                </p>
                <div className="flex justify-between text-xs pt-2 font-mono">
                   <div className="text-text-secondary">Win Rate: <span className="text-[#10B981]">{roastData.winRate}</span></div>
                   <div className="text-text-secondary">Rugged: <span className="text-[#F43F5E]">{roastData.rugCount}x</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-text-muted text-sm">
                <div className="text-3xl mb-2 opacity-50 grayscale">🤖</div>
                Dare the AI to analyze your on-chain history? Warning: It will be brutal.
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── TABS ── */}
      <div className="flex gap-4 mb-6 border-b border-[rgba(255,255,255,0.05)]">
        <MagneticButton
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 font-medium transition-colors border-b-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${activeTab === 'portfolio' ? 'border-[#6366F1] text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Portfolio & Assets
        </MagneticButton>
        <MagneticButton
          onClick={() => setActiveTab('creator')}
          className={`pb-3 font-medium transition-colors border-b-2 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${activeTab === 'creator' ? 'border-[#10B981] text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Creator Economy
        </MagneticButton>
      </div>

      {/* ── PORTFOLIO TAB ── */}
      {activeTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          {/* Holdings Table */}
          <div className={`backdrop-blur-2xl transition-all duration-300 ease-out border overflow-hidden ${isDark ? 'bg-[rgba(5,5,16,0.80)] border-[rgba(99,102,241,0.08)] hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]' : 'bg-surface-1 border-border-subtle'}`}>
            <div className={`p-5 border-b backdrop-blur-2xl ${isDark ? 'border-[rgba(255,255,255,0.05)] bg-[rgba(5,5,16,0.80)]' : 'border-border-subtle bg-surface-base'}`}>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}>Current Holdings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b font-mono text-xs uppercase bg-[var(--color-surface-2)] ${isDark ? 'border-[rgba(255,255,255,0.05)] text-[#94A3B8]' : 'border-border-subtle text-text-muted'}`}>
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Balance</th>
                    <th className="p-4 font-semibold">Value</th>
                    <th className="p-4 font-semibold">Avg Buy</th>
                    <th className="p-4 font-semibold">Total PNL</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLDINGS.map((h, i) => (
                    <tr key={i} className={`border-b transition-colors ${isDark ? 'border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]' : 'border-border-subtle hover:bg-surface-hover'}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl drop-shadow-[0_0_5px_currentColor]">{h.icon}</div>
                          <div>
                            <div className={`font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}>{h.name}</div>
                            <div className="text-text-secondary font-mono text-xs">{h.ticker}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 font-mono ${isDark ? 'text-white' : 'text-text-primary'}`}>{h.qty}</td>
                      <td className={`p-4 font-mono ${isDark ? 'text-white' : 'text-text-primary'}`}>{h.value}</td>
                      <td className="p-4 font-mono text-text-secondary">{h.avgBuy}</td>
                      <td className="p-4">
                        <div className={`font-mono font-bold ${h.pos ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                          {h.pnl} <span className="text-[10px] ml-1 bg-current bg-opacity-10 px-1.5 py-0.5 rounded opacity-80 border border-current">{h.pnlPct}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
              <Award className="w-5 h-5 text-[#F59E0B]" /> Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} className={`bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-5 border relative overflow-hidden transition-all ${ach.unlocked ? 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'border-[rgba(255,255,255,0.05)] opacity-50 grayscale'}`}>
                  {ach.unlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: ach.color }} />
                  )}
                  <div className="text-3xl mb-3 drop-shadow-[0_0_8px_currentColor]" style={{ color: ach.color }}>{ach.icon}</div>
                  <h4 className="font-bold text-white mb-1">{ach.title}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">{ach.desc}</p>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${ach.unlocked ? 'bg-opacity-10 border border-current' : 'bg-[rgba(255,255,255,0.1)] text-[#94A3B8]'}`} style={ach.unlocked ? { color: ach.color, backgroundColor: `${ach.color}20` } : {}}>
                    {ach.unlocked ? ach.rarity : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* ── CREATOR ECONOMY TAB ── */}
      {activeTab === 'creator' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-4 sm:p-6 md:p-8 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.02)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.8),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] display-safe">
                <Crown className="w-6 h-6 text-[#10B981]" /> Creator Status: Elite
              </h2>
              <p className="text-[#94A3B8] max-w-lg">You are ranked in the top 5% of creators on MoonFluxx. Your launches receive priority indexing and verified badges.</p>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"><AnimatedCounter value={CREATOR_ECONOMY.score} /></div>
                <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Creator Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-5 border-l-2 border-l-[#10B981]">
              <div className="text-[#94A3B8] text-sm mb-1">Total Earnings</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.earnings}</div>
            </div>
            <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-5 border-l-2 border-l-[#6366F1]">
              <div className="text-[#94A3B8] text-sm mb-1">Tokens Launched</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.launches}</div>
            </div>
            <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-5 border-l-2 border-l-[#F43F5E]">
              <div className="text-[#94A3B8] text-sm mb-1">Success Rate</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.successRate}</div>
            </div>
            <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-5 border-l-2 border-l-[#F59E0B]">
              <div className="text-[#94A3B8] text-sm mb-1">Avg Retention</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.avgRetention}</div>
            </div>
          </div>

          <div className="bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] transition-all duration-300 ease-out hover:border-[rgba(99,102,241,0.20)] hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Launches</h3>
            <div className="space-y-4">
              {[
                { name: "Luna Doge", ticker: "LDOGE", mcap: "--", date: "2 weeks ago", rev: "--", status: "Graduated" },
                { name: "AstroCat", ticker: "ACAT", mcap: "--", date: "1 month ago", rev: "--", status: "Live" },
              ].map((launch, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-xl border border-[rgba(255,255,255,0.05)] gap-4 hover:border-[rgba(99,102,241,0.3)] transition-colors">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {launch.name} <span className="text-[#6366F1] font-mono text-xs">${launch.ticker}</span>
                      {launch.status === 'Graduated' && <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.2)]">Graduated</span>}
                    </div>
                    <div className="text-sm text-[#94A3B8]">{launch.date}</div>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Mkt Cap</div>
                      <div className="font-mono text-white font-bold">{launch.mcap}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Dev Revenue</div>
                      <div className="font-mono text-[#10B981] font-bold">{launch.rev}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
