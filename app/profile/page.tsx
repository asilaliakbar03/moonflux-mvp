"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { User, Wallet, Activity, Shield, Award, Zap, TrendingUp, Users, Flame, Star, Crown, ChevronRight, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

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
  earnings: "$42,500",
  followers: 4520,
  following: 124,
};

export default function ProfilePage() {
  const { showToast } = useToast();
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
    <div className="max-w-6xl mx-auto w-full pt-8 pb-16">
      
      {/* ── TOP SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* IDENTITY CARD */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6 flex flex-col justify-between border-t-4 border-t-[#6366F1] shadow-[0_8px_32px_rgba(99,102,241,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_50%)]" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#818CF8] shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  DegenDave
                  <span className="bg-[#6366F1] text-[10px] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">Pro</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[#818CF8] font-mono text-sm">@degendave</span>
                  <button className="text-[#475569] hover:text-white transition-colors" title="Copy Address">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${isFollowing ? 'bg-transparent border-[rgba(255,255,255,0.2)] text-white hover:border-[rgba(244,63,94,0.5)] hover:text-[#F43F5E]' : 'bg-[#6366F1] border-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-[#4F46E5]'}`}
            >
              {isFollowing ? (
                <>Following</>
              ) : (
                <>Follow</>
              )}
            </button>
          </div>

          <div className="flex items-center gap-6 mb-6 relative z-10 text-sm">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{CREATOR_ECONOMY.followers.toLocaleString()}</span>
              <span className="text-[#94A3B8]">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{CREATOR_ECONOMY.following.toLocaleString()}</span>
              <span className="text-[#94A3B8]">Following</span>
            </div>
          </div>

          <div className="relative z-10 border-t border-[rgba(255,255,255,0.05)] pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#94A3B8] text-sm flex items-center gap-1.5"><Crown className="w-4 h-4 text-[#F59E0B]" /> Level 42</span>
              <span className="text-[#818CF8] font-mono font-bold">94,200 XP</span>
            </div>
            <div className="h-2 w-full bg-[rgba(99,102,241,0.1)] rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)]">
              <div className="h-full bg-[#6366F1] w-[75%] shadow-[0_0_10px_#6366F1]" />
            </div>
          </div>
        </motion.div>

        {/* PORTFOLIO SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-6 flex flex-col justify-center border border-[rgba(16,185,129,0.2)] shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.8),transparent_70%)]" />
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2 font-semibold relative z-10">
            <Wallet className="w-4 h-4" /> Total Balance
          </div>
          <div className="text-4xl font-mono font-bold text-white mb-2 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">$14,560.00</div>
          <div className="flex items-center gap-2 relative z-10">
            <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-1 rounded text-sm font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-[rgba(16,185,129,0.3)]">
              <TrendingUp className="w-3.5 h-3.5" /> +24.5%
            </span>
            <span className="text-[#475569] text-sm">Past 30 days</span>
          </div>
        </motion.div>

        {/* AI WALLET ROAST */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card p-6 border border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.02)] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.8),transparent_60%)]" />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="flex items-center gap-2 text-[#F43F5E] font-bold text-sm uppercase tracking-wider drop-shadow-[0_0_5px_currentColor]">
              <Flame className="w-4 h-4" /> AI Wallet Roast
            </div>
            {!roastData && (
              <button 
                onClick={handleRoast} 
                disabled={isRoasting}
                className="bg-[rgba(244,63,94,0.15)] hover:bg-[rgba(244,63,94,0.25)] text-[#F43F5E] text-xs font-bold px-3 py-1.5 rounded transition-all border border-[rgba(244,63,94,0.3)] disabled:opacity-50"
              >
                {isRoasting ? 'Roasting...' : 'Roast Me'}
              </button>
            )}
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {roastData ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{roastData.persona}</h3>
                  <div className="text-right">
                    <div className="text-[#F43F5E] font-mono text-xl font-bold">{roastData.portfolioScore}/100</div>
                    <div className="text-[10px] uppercase text-[#94A3B8]">Score</div>
                  </div>
                </div>
                <p className="text-[#F1F5F9] text-sm leading-relaxed italic border-l-2 border-[#F43F5E] pl-3">
                  "{roastData.roast}"
                </p>
                <div className="flex justify-between text-xs pt-2 font-mono">
                   <div className="text-[#94A3B8]">Win Rate: <span className="text-[#10B981]">{roastData.winRate}</span></div>
                   <div className="text-[#94A3B8]">Rugged: <span className="text-[#F43F5E]">{roastData.rugCount}x</span></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#94A3B8] text-sm">
                <div className="text-3xl mb-2 opacity-50 grayscale">🤖</div>
                Dare the AI to analyze your on-chain history? Warning: It will be brutal.
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* ── TABS ── */}
      <div className="flex gap-4 mb-6 border-b border-[rgba(255,255,255,0.05)]">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'portfolio' ? 'border-[#6366F1] text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)]' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Portfolio & Assets
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'creator' ? 'border-[#10B981] text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Creator Economy
        </button>
      </div>

      {/* ── PORTFOLIO TAB ── */}
      {activeTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          {/* Holdings Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
              <h3 className="text-lg font-bold text-white">Current Holdings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.05)] text-[#94A3B8] font-mono text-xs uppercase bg-[#0D1117]">
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Balance</th>
                    <th className="p-4 font-semibold">Value</th>
                    <th className="p-4 font-semibold">Avg Buy</th>
                    <th className="p-4 font-semibold">Total PNL</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLDINGS.map((h, i) => (
                    <tr key={i} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl drop-shadow-[0_0_5px_currentColor]">{h.icon}</div>
                          <div>
                            <div className="font-bold text-white">{h.name}</div>
                            <div className="text-[#94A3B8] font-mono text-xs">{h.ticker}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-white">{h.qty}</td>
                      <td className="p-4 font-mono text-white">{h.value}</td>
                      <td className="p-4 font-mono text-[#94A3B8]">{h.avgBuy}</td>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} className={`surface-card p-5 border relative overflow-hidden transition-all ${ach.unlocked ? 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] shadow-[0_0_10px_rgba(0,0,0,0.5)]' : 'border-[rgba(255,255,255,0.05)] opacity-50 grayscale'}`}>
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
          
          <div className="surface-card p-8 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.02)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.8),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                <Crown className="w-6 h-6 text-[#10B981]" /> Creator Status: Elite
              </h2>
              <p className="text-[#94A3B8] max-w-lg">You are ranked in the top 5% of creators on MoonFluxx. Your launches receive priority indexing and verified badges.</p>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{CREATOR_ECONOMY.score}</div>
                <div className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Creator Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-5 border-l-2 border-l-[#10B981]">
              <div className="text-[#94A3B8] text-sm mb-1">Total Earnings</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.earnings}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#6366F1]">
              <div className="text-[#94A3B8] text-sm mb-1">Tokens Launched</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.launches}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#F43F5E]">
              <div className="text-[#94A3B8] text-sm mb-1">Success Rate</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.successRate}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#F59E0B]">
              <div className="text-[#94A3B8] text-sm mb-1">Avg Retention</div>
              <div className="text-2xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{CREATOR_ECONOMY.avgRetention}</div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Launches</h3>
            <div className="space-y-4">
              {[
                { name: "Luna Doge", ticker: "LDOGE", mcap: "$1.87M", date: "2 weeks ago", rev: "$12,400", status: "Graduated" },
                { name: "AstroCat", ticker: "ACAT", mcap: "$420K", date: "1 month ago", rev: "$4,200", status: "Live" },
              ].map((launch, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#080B12] rounded-xl border border-[rgba(255,255,255,0.05)] gap-4 hover:border-[rgba(99,102,241,0.3)] transition-colors">
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
