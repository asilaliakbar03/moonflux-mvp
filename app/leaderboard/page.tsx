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
          <h1 className="text-4xl font-bold font-display text-white mb-2 flex items-center justify-center md:justify-start gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
            <Trophy className="w-8 h-8 text-[#FFD700]" />
            Leaderboard
          </h1>
          <p className="text-[#C8A2C8]">The highest ranked traders on MoonFluxx. Updated in real-time.</p>
        </div>
        
        <div className="flex p-1.5 bg-[rgba(18,7,33,0.6)] backdrop-blur-md border border-[rgba(5,213,250,0.2)] rounded-2xl overflow-x-auto max-w-full shadow-[0_0_20px_rgba(5,213,250,0.1)]">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap font-medium text-sm transition-all duration-300 ${
                  active 
                    ? 'bg-gradient-to-r from-[rgba(5,213,250,0.2)] to-[rgba(5,213,250,0.05)] text-[#05D5FA] shadow-[0_0_15px_rgba(5,213,250,0.2)] border border-[rgba(5,213,250,0.3)]' 
                    : 'text-[#8B6A8B] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
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
            1: { border: '#FFD700', bg: 'rgba(255,215,0,0.2)', text: '#FFEA00' },
            2: { border: '#05D5FA', bg: 'rgba(5,213,250,0.2)', text: '#E0FFFF' },
            3: { border: '#FF2A6D', bg: 'rgba(255,42,109,0.2)', text: '#FFB3C6' }
          }[rankNum];

          return (
            <div key={trader.name} className={`flex flex-col items-center relative transition-transform duration-500 hover:-translate-y-4 ${isFirst ? 'order-1 md:order-2 z-20' : 'order-2 md:order-1 z-10'} ${i===2 ? 'md:order-3' : ''}`}>
              
              <div 
                className={`w-full min-w-[160px] md:min-w-[200px] flex flex-col items-center justify-between rounded-t-3xl border-t-2 border-x border-b-0 relative overflow-hidden pt-8 pb-6 px-4`}
                style={{ 
                  height: isFirst ? '280px' : '220px', 
                  borderColor: colors.border,
                  background: `linear-gradient(to bottom, ${colors.bg}, rgba(8,11,18,0.95))`
                }}
              >
                {/* Top Glow Ray */}
                <div className="absolute top-0 inset-x-0 h-40 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(circle at top, ${colors.border}, transparent 70%)` }} />
                
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl font-display font-bold bg-[#080B12] relative z-10 shadow-2xl"
                     style={{ borderColor: colors.border, color: colors.text, boxShadow: `0 0 20px ${colors.bg}` }}>
                  {trader.name.charAt(0)}
                  {isFirst && <Crown className="absolute -top-7 text-[#FFD700] w-8 h-8 drop-shadow-[0_0_12px_rgba(255,215,0,1)]" />}
                  <div className="absolute -bottom-3 bg-[#080B12] border rounded-full px-3 py-0.5 text-xs font-bold font-mono shadow-lg"
                       style={{ borderColor: colors.border, color: colors.text }}>
                    #{rankNum}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center relative z-10 w-full mt-auto">
                  <div className="font-bold text-white text-lg md:text-xl truncate w-full text-center drop-shadow-md mb-1">{trader.name}</div>
                  <div className="text-[#05D5FA] font-mono text-xs md:text-sm mb-3 opacity-90">{trader.xp.toLocaleString()} XP</div>
                  <div className="font-bold font-mono tracking-tight bg-[#080B12] px-4 py-1.5 rounded-xl border"
                       style={{ borderColor: colors.border, color: colors.text, boxShadow: `0 0 10px ${colors.bg}` }}>
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(5,213,250,0.2)] bg-[#120721]">
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">Rank</th>
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">Trader</th>
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">XP Score</th>
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">Win Rate</th>
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">Total PNL</th>
                <th className="p-4 text-[#C8A2C8] font-mono text-xs uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((trader) => (
                <tr key={trader.rank} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(5,213,250,0.05)] transition-colors group">
                  <td className="p-4">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center font-mono text-[#C8A2C8] font-bold border border-[rgba(255,255,255,0.1)]">
                      {trader.rank}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(5,213,250,0.1)] border border-[rgba(5,213,250,0.2)] flex items-center justify-center font-bold text-[#05D5FA] shadow-[0_0_10px_rgba(5,213,250,0.2)]">
                        {trader.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-[#05D5FA] transition-colors">{trader.name}</div>
                        <div className="text-xs font-mono text-[#8B6A8B]">{trader.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{trader.xp.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={trader.win >= 80 ? 'text-[#39FF14]' : 'text-[#FFD700]'}>{trader.win}%</span>
                      <div className="w-16 h-1.5 bg-[#0B0414] border border-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                        <div className="h-full bg-current rounded-full" style={{ width: `${trader.win}%`, color: trader.win >= 80 ? '#39FF14' : '#FFD700' }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#39FF14] drop-shadow-[0_0_5px_rgba(57,255,20,0.3)]">{trader.pnl}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[#FF2A6D] font-bold font-mono drop-shadow-[0_0_5px_rgba(255,42,109,0.3)]">
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
