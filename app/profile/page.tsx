"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { User, Wallet, Activity, Shield, Award, Zap, TrendingUp, Users, Flame, Star, Crown, ChevronRight, Copy } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── DATA ──
const HOLDINGS = [
  { icon: "🐕", name: "Luna Doge",  ticker: "LDOGE", qty: "1,200,000", avgBuy: "$0.00097", current: "$0.00234", value: "$2,808",  pnl: "+$1,969", pnlPct: "+141.2%", pos: true, color: "#e8b84b" },
  { icon: "🧠", name: "NeuralFi",   ticker: "NFI",   qty: "4,500",     avgBuy: "$1.12",    current: "$1.42",    value: "$6,390",  pnl: "+$1,350", pnlPct: "+26.8%",  pos: true, color: "#a855f7" },
  { icon: "🚀", name: "RocketDoge", ticker: "RDOGE", qty: "500,000",   avgBuy: "$0.00310", current: "$0.00248", value: "$1,240",  pnl: "-$310",   pnlPct: "-20.0%",  pos: false, color: "#ef4444" },
];

const ACHIEVEMENTS = [
  { title: "Early Hunter", desc: "Top 100 buyer in 5 launches", icon: "🎯", rarity: "LEGENDARY", color: "#e8b84b", unlocked: true },
  { title: "Whale Status", desc: "Deployed over 100 SOL in single trade", icon: "🐋", rarity: "EPIC", color: "#a855f7", unlocked: true },
  { title: "Diamond Hands", desc: "Held through 80% drawdown and recovered", icon: "💎", rarity: "RARE", color: "#38bdf8", unlocked: true },
  { title: "Graduation Day", desc: "Held a token that graduated to DEX", icon: "🎓", rarity: "EPIC", color: "#10b981", unlocked: false },
];

const CREATOR_ECONOMY = {
  score: 94,
  launches: 12,
  successRate: "100%",
  avgRetention: "78%",
  earnings: "$42,500",
  followers: 4520,
};

export default function ProfilePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'creator'>('portfolio');

  return (
    <div className="max-w-6xl mx-auto w-full pt-8 pb-16">
      
      {/* ── TOP SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* IDENTITY CARD */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6 flex flex-col justify-between border-t-4 border-t-[#6366F1]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#818CF8]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">DegenDave</h2>
                <span className="text-[#94A3B8] font-mono text-sm">@degendave</span>
              </div>
            </div>
            <button className="text-[#94A3B8] hover:text-white transition-colors" title="Copy Address">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#94A3B8] text-sm">Level 42</span>
              <span className="text-[#6366F1] font-mono font-bold">94,200 XP</span>
            </div>
            <div className="h-2 w-full bg-[rgba(99,102,241,0.1)] rounded-full overflow-hidden">
              <div className="h-full bg-[#6366F1] w-[75%]" />
            </div>
          </div>
        </motion.div>

        {/* PORTFOLIO SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2 font-semibold">
            <Wallet className="w-4 h-4" /> Total Balance
          </div>
          <div className="text-4xl font-mono font-bold text-white mb-2">$14,560.00</div>
          <div className="flex items-center gap-2">
            <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24.5%
            </span>
            <span className="text-[#475569] text-sm">Past 30 days</span>
          </div>
        </motion.div>

        {/* DNA ARCHETYPE */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card p-6 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.02)]">
          <div className="flex items-center gap-2 text-[#10B981] mb-4 font-bold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Trader Archetype
          </div>
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-xl font-bold text-white mb-2">High-Velocity Momentum</h3>
          <p className="text-[#94A3B8] text-sm leading-relaxed">
            You chase narratives early, hold with conviction, and aren't afraid of volatility. Your edge is speed.
          </p>
        </motion.div>

      </div>

      {/* ── TABS ── */}
      <div className="flex gap-4 mb-6 border-b border-[rgba(99,102,241,0.15)]">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'portfolio' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Portfolio & Assets
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'creator' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'}`}
        >
          Creator Economy
        </button>
      </div>

      {/* ── PORTFOLIO TAB ── */}
      {activeTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          
          {/* Holdings Table */}
          <div className="surface-card overflow-hidden">
            <div className="p-5 border-b border-[rgba(99,102,241,0.15)] bg-[#161B27]">
              <h3 className="text-lg font-bold text-white">Current Holdings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(99,102,241,0.1)] text-[#475569] font-mono text-xs uppercase">
                    <th className="p-4 font-semibold">Asset</th>
                    <th className="p-4 font-semibold">Balance</th>
                    <th className="p-4 font-semibold">Value</th>
                    <th className="p-4 font-semibold">Avg Buy</th>
                    <th className="p-4 font-semibold">Total PNL</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLDINGS.map((h, i) => (
                    <tr key={i} className="border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.03)] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{h.icon}</div>
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
                          {h.pnl} <span className="text-xs ml-1 bg-current bg-opacity-10 px-1.5 py-0.5 rounded opacity-80">{h.pnlPct}</span>
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
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#818CF8]" /> Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} className={`surface-card p-5 border relative overflow-hidden transition-all ${ach.unlocked ? 'border-[rgba(99,102,241,0.3)]' : 'border-[rgba(255,255,255,0.05)] opacity-50 grayscale'}`}>
                  {ach.unlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-current opacity-10" style={{ color: ach.color }} />
                  )}
                  <div className="text-3xl mb-3">{ach.icon}</div>
                  <h4 className="font-bold text-white mb-1">{ach.title}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">{ach.desc}</p>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${ach.unlocked ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' : 'bg-[rgba(255,255,255,0.1)] text-[#475569]'}`}>
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
          
          <div className="surface-card p-8 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.02)] flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Crown className="w-6 h-6 text-[#10B981]" /> Creator Status: Elite
              </h2>
              <p className="text-[#94A3B8] max-w-lg">You are ranked in the top 5% of creators on MoonFluxx. Your launches receive priority indexing and verified badges.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-[#10B981]">{CREATOR_ECONOMY.score}</div>
                <div className="text-xs text-[#475569] uppercase font-bold tracking-wider">Creator Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-5 border-l-2 border-l-[#818CF8]">
              <div className="text-[#94A3B8] text-sm mb-1">Total Earnings</div>
              <div className="text-2xl font-mono font-bold text-white">{CREATOR_ECONOMY.earnings}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#10B981]">
              <div className="text-[#94A3B8] text-sm mb-1">Tokens Launched</div>
              <div className="text-2xl font-mono font-bold text-white">{CREATOR_ECONOMY.launches}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#F59E0B]">
              <div className="text-[#94A3B8] text-sm mb-1">Success Rate</div>
              <div className="text-2xl font-mono font-bold text-white">{CREATOR_ECONOMY.successRate}</div>
            </div>
            <div className="surface-card p-5 border-l-2 border-l-[#F43F5E]">
              <div className="text-[#94A3B8] text-sm mb-1">Followers</div>
              <div className="text-2xl font-mono font-bold text-white">{CREATOR_ECONOMY.followers.toLocaleString()}</div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Launches</h3>
            <div className="space-y-4">
              {[
                { name: "Luna Doge", ticker: "LDOGE", mcap: "$1.87M", date: "2 weeks ago", rev: "$12,400", status: "Graduated" },
                { name: "AstroCat", ticker: "ACAT", mcap: "$420K", date: "1 month ago", rev: "$4,200", status: "Live" },
              ].map((launch, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#080B12] rounded-xl border border-[rgba(99,102,241,0.1)] gap-4">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {launch.name} <span className="text-[#94A3B8] font-mono text-xs">${launch.ticker}</span>
                      {launch.status === 'Graduated' && <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Graduated</span>}
                    </div>
                    <div className="text-sm text-[#475569]">{launch.date}</div>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-[10px] text-[#475569] uppercase font-bold">Mkt Cap</div>
                      <div className="font-mono text-white">{launch.mcap}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#475569] uppercase font-bold">Creator Rev</div>
                      <div className="font-mono text-[#10B981]">{launch.rev}</div>
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
