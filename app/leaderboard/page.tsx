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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold font-display text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <Trophy className="w-8 h-8 text-[#F59E0B]" />
            Leaderboard
          </h1>
          <p className="text-[#94A3B8]">The highest ranked traders on MoonFluxx. Updated in real-time.</p>
        </div>
        
        <div className="flex p-1 bg-[#161B27] border border-[rgba(99,102,241,0.15)] rounded-xl overflow-x-auto max-w-full">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg whitespace-nowrap font-medium text-sm transition-all ${
                  active 
                    ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' 
                    : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-12">
        {podium.map((trader, i) => {
          const isFirst = i === 1; // 2nd, 1st, 3rd mapping
          const rankNum = isFirst ? 1 : i === 0 ? 2 : 3;
          const colors = {
            1: { border: '#F59E0B', bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
            2: { border: '#94A3B8', bg: 'rgba(148,163,184,0.15)', text: '#F1F5F9' },
            3: { border: '#B45309', bg: 'rgba(180,83,9,0.15)', text: '#D97706' }
          }[rankNum];

          return (
            <div key={trader.name} className={`flex flex-col items-center ${isFirst ? 'order-1 md:order-2 md:-mt-8' : 'order-2 md:order-1'} ${i===2 ? 'md:order-3' : ''}`}>
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold bg-[#080B12] shadow-xl mb-4 relative z-10"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                #{rankNum}
                {isFirst && <Crown className="absolute -top-6 text-[#F59E0B] w-8 h-8" />}
              </div>
              
              <div 
                className={`w-40 md:w-48 surface-card flex flex-col items-center justify-end rounded-t-2xl border-b-0`}
                style={{ height: isFirst ? '200px' : '160px', borderColor: colors.border, background: colors.bg }}
              >
                <div className="text-center p-4 w-full bg-[#080B12] rounded-t-xl h-full border-t border-x border-[rgba(99,102,241,0.1)]">
                  <div className="font-bold text-white text-lg truncate mb-1">{trader.name}</div>
                  <div className="text-[#818CF8] font-mono text-sm mb-4">{trader.xp.toLocaleString()} XP</div>
                  <div className="text-[#10B981] font-bold">{trader.pnl}</div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── LEADERBOARD LIST ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(99,102,241,0.15)] bg-[#161B27]">
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">Rank</th>
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">Trader</th>
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">XP Score</th>
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">Win Rate</th>
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">Total PNL</th>
                <th className="p-4 text-[#475569] font-mono text-xs uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((trader) => (
                <tr key={trader.rank} className="border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.03)] transition-colors group">
                  <td className="p-4">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-mono text-[#94A3B8] font-bold">
                      {trader.rank}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center font-bold text-[#818CF8]">
                        {trader.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-[#818CF8] transition-colors">{trader.name}</div>
                        <div className="text-xs font-mono text-[#475569]">{trader.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{trader.xp.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={trader.win >= 80 ? 'text-[#10B981]' : 'text-[#F59E0B]'}>{trader.win}%</span>
                      <div className="w-16 h-1.5 bg-[#161B27] rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full" style={{ width: `${trader.win}%`, color: trader.win >= 80 ? '#10B981' : '#F59E0B' }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#10B981]">{trader.pnl}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[#F59E0B] font-bold font-mono">
                      <Flame className="w-4 h-4" /> {trader.streak}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
