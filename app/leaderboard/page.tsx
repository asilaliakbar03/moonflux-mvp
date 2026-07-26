"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star, ChevronRight, Crown } from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const ALL_TRADERS = {
  "top-traders": [
    { rank: 1, name: "WhaleKing",  handle: "@whaleking",  xp: 284100, win: 91.2, pnl: "+$184K", streak: 14 },
    { rank: 2, name: "0xSniper",   handle: "@0xsniper",   xp: 142500, win: 87.4, pnl: "+$92K",  streak: 9  },
    { rank: 3, name: "DegenDave",  handle: "@degendave",  xp:  94200, win: 82.1, pnl: "+$61K",  streak: 6  },
    { rank: 4, name: "Trader_x92", handle: "@trader_x92", xp:  74000, win: 82.4, pnl: "+$54K",  streak: 4  },
    { rank: 5, name: "Trader_k81", handle: "@trader_k81", xp:  61200, win: 79.1, pnl: "+$46K",  streak: 3  },
    { rank: 6, name: "CryptoNova", handle: "@cryptonova", xp:  54800, win: 76.8, pnl: "+$42K",  streak: 2  },
    { rank: 7, name: "Trader_q99", handle: "@trader_q99", xp:  48300, win: 74.2, pnl: "+$38K",  streak: 5  },
    { rank: 8, name: "SolQueen",   handle: "@solqueen",   xp:  42100, win: 71.5, pnl: "+$35K",  streak: 2  },
    { rank: 9, name: "Trader_z88", handle: "@trader_z88", xp:  36900, win: 68.9, pnl: "+$31K",  streak: 1  },
    { rank: 10, name: "Trader_v45",handle: "@trader_v45", xp:  30200, win: 65.4, pnl: "+$26K",  streak: 3  },
  ],
  "diamond-hands": [
    { rank: 1, name: "DiamondLee", handle: "@diamondlee", xp: 312000, win: 88.0, pnl: "+$210K", streak: 22 },
    { rank: 2, name: "HodlKing",   handle: "@hodlking",   xp: 198000, win: 85.2, pnl: "+$133K", streak: 18 },
    { rank: 3, name: "IronHands",  handle: "@ironhands",  xp: 142000, win: 81.3, pnl: "+$95K",  streak: 15 },
    { rank: 4, name: "NeverSell",  handle: "@neversell",  xp: 112000, win: 78.9, pnl: "+$74K",  streak: 11 },
    { rank: 5, name: "StoneWall",  handle: "@stonewall",  xp:  94000, win: 75.1, pnl: "+$62K",  streak: 9  },
  ],
  "early-hunters": [
    { rank: 1, name: "EarlyBird",  handle: "@earlybird",  xp: 402000, win: 94.5, pnl: "+$312K", streak: 31 },
    { rank: 2, name: "SniperX",    handle: "@sniperx",    xp: 280000, win: 91.0, pnl: "+$218K", streak: 24 },
    { rank: 3, name: "SkullHead",  handle: "@skullhead",  xp: 198000, win: 87.3, pnl: "+$152K", streak: 18 },
    { rank: 4, name: "ZeroToHero", handle: "@zerohero",   xp: 154000, win: 84.1, pnl: "+$118K", streak: 14 },
    { rank: 5, name: "LaunchPad",  handle: "@launchpad",  xp: 122000, win: 80.6, pnl: "+$94K",  streak: 11 },
  ],
};

type CategoryKey = keyof typeof ALL_TRADERS;
const CATEGORIES = [
  { id: "top-traders" as CategoryKey, label: "Top Traders", icon: Flame },
  { id: "diamond-hands" as CategoryKey, label: "Diamond Hands", icon: Star },
  { id: "early-hunters" as CategoryKey, label: "Early Hunters", icon: Target },
];

export default function LeaderboardPage() {
  const [activeCat, setActiveCat] = useState<CategoryKey>("top-traders");
  const traders = ALL_TRADERS[activeCat];

  // Podium order: 2nd, 1st, 3rd
  const podium = [traders[1], traders[0], traders[2]].filter(Boolean);
  const rest = traders.slice(3);

  return (
    <div className="max-w-5xl mx-auto w-full pt-8 pb-16">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-4xl font-bold font-display text-[#F1F5F9] flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#F59E0B]" />
              Leaderboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(99,102,241,0.15)] text-[#818CF8] border border-[rgba(99,102,241,0.3)]">
              Season 1
            </span>
          </div>
          <p className="text-[#94A3B8]">The highest ranked traders on MoonFluxx. Updated in real-time.</p>
        </div>
        
        <div className="flex p-1.5 flex-nowrap overflow-x-auto max-w-full fluxx-card rounded-2xl">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-medium text-sm transition-all duration-300 ${
                  active 
                    ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── PODIUM ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-6 mb-16 px-4">
        {podium.map((trader, i) => {
          const isFirst = i === 1; // 2nd, 1st, 3rd mapping
          const rankNum = isFirst ? 1 : i === 0 ? 2 : 3;
          
          const colors = {
            1: { border: '#F59E0B', shadow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
            2: { border: '#94A3B8', shadow: 'rgba(148,163,184,0.2)', bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' },
            3: { border: '#CD7F32', shadow: 'rgba(205,127,50,0.2)', bg: 'rgba(205,127,50,0.15)', text: '#CD7F32' }
          }[rankNum];

          return (
            <div key={trader.name} className={`flex flex-col items-center relative transition-transform duration-500 hover:-translate-y-4 ${isFirst ? 'order-1 md:order-2 z-20' : 'order-2 md:order-1 z-10'} ${i===2 ? 'md:order-3' : ''}`}>
              
              <div 
                className={`w-full min-w-[160px] md:min-w-[200px] flex flex-col items-center justify-between rounded-t-3xl border-t-2 border-x border-b-0 relative overflow-hidden pt-8 pb-6 px-4 fluxx-card`}
                style={{ 
                  height: isFirst ? '280px' : '220px', 
                  borderColor: colors.border,
                  boxShadow: `0 0 ${isFirst ? '30px' : '20px'} ${colors.shadow}`
                }}
              >
                {/* Top Glow Ray */}
                <div className="absolute top-0 inset-x-0 h-40 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle at top, ${colors.border}, transparent 70%)` }} />
                
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl font-display font-bold fluxx-card relative z-10 shadow-2xl"
                     style={{ borderColor: colors.border, color: '#F1F5F9', boxShadow: `0 0 20px ${colors.bg}` }}>
                  {trader.name.charAt(0)}
                  {isFirst && <Crown className="absolute -top-7 w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] text-[#F59E0B]" />}
                  <div className="absolute -bottom-3 border rounded-full px-3 py-0.5 text-xs font-bold font-mono shadow-lg"
                       style={{ borderColor: colors.border, color: colors.text, background: colors.bg }}>
                    #{rankNum}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center relative z-10 w-full mt-auto">
                  <div className="font-bold text-[#F1F5F9] text-lg md:text-xl truncate w-full text-center drop-shadow-md mb-1">{trader.name}</div>
                  <div className="text-[#94A3B8] font-mono text-xs md:text-sm mb-3">{trader.xp.toLocaleString()} XP</div>
                  <div className="font-bold font-mono tracking-tight px-4 py-1.5 rounded-xl border text-[#10B981]"
                       style={{ borderColor: colors.border, backgroundColor: colors.bg, boxShadow: `0 0 10px ${colors.bg}` }}>
                    {trader.pnl}
                  </div>
                </div>

                {/* Large Background Number */}
                <div className="absolute -bottom-6 -right-2 text-[120px] font-black font-display opacity-[0.07] select-none pointer-events-none leading-none" style={{ color: colors.text }}>
                  {rankNum}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── LEADERBOARD LIST ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex flex-col gap-2">
          {/* Header Row */}
          <div className="flex items-center px-4 py-3 text-[#94A3B8] font-mono text-xs uppercase tracking-wider hidden md:flex">
            <div className="w-16">Rank</div>
            <div className="flex-1">Trader</div>
            <div className="w-32 text-right">XP Score</div>
            <div className="w-48 text-center">Win Rate</div>
            <div className="w-32 text-right">Total PNL</div>
            <div className="w-24 text-right">Streak</div>
          </div>

          {rest.map((trader) => (
            <div key={trader.rank} className="fluxx-card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors odd:bg-[rgba(99,102,241,0.03)] hover:bg-[rgba(99,102,241,0.05)]">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-mono text-[#94A3B8] font-bold border border-[rgba(255,255,255,0.1)]">
                  {trader.rank}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center font-bold text-[#818CF8] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {trader.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#F1F5F9] transition-colors">{trader.name}</div>
                    <div className="text-xs font-mono text-[#94A3B8]">{trader.handle}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-0">
                <div className="md:w-32 md:text-right font-mono font-bold text-[#F1F5F9]">
                  <span className="text-[#94A3B8] text-xs uppercase md:hidden block mb-1">XP Score</span>
                  {trader.xp.toLocaleString()}
                </div>
                
                <div className="md:w-48 md:flex md:justify-center">
                  <div className="w-full max-w-[120px]">
                    <span className="text-[#94A3B8] text-xs uppercase md:hidden block mb-1">Win Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${trader.win >= 80 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>{trader.win}%</span>
                      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full" style={{ width: `${trader.win}%`, color: trader.win >= 80 ? '#10B981' : '#F59E0B' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-32 md:text-right font-mono font-bold text-[#10B981]">
                  <span className="text-[#94A3B8] text-xs uppercase md:hidden block mb-1">Total PNL</span>
                  {trader.pnl}
                </div>

                <div className="md:w-24 md:flex md:justify-end">
                  <span className="text-[#94A3B8] text-xs uppercase md:hidden block mb-1">Streak</span>
                  {trader.streak > 3 ? (
                    <div className="inline-flex items-center gap-1 bg-[rgba(245,158,11,0.15)] text-[#F59E0B] font-bold font-mono px-2.5 py-1 rounded-full text-sm">
                      <Flame className="w-4 h-4" /> {trader.streak}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[#94A3B8] font-bold font-mono px-2.5 py-1 text-sm">
                      <Flame className="w-4 h-4 opacity-50" /> {trader.streak}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
