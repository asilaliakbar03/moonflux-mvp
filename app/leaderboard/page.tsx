"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star } from "lucide-react";
import { useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";

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

  // Top 3 featured
  const topThree = traders.slice(0, 3);
  const rest = traders.slice(3);

  return (
    <div className="max-w-5xl mx-auto w-full pt-8 pb-16 px-4">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-[#F1F5F9] flex items-center gap-3 tracking-tight">
              <Trophy className="w-7 h-7 text-[#F59E0B]" />
              Leaderboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(99,102,241,0.1)] text-[#818CF8] border border-[rgba(99,102,241,0.2)]">
              Season 1
            </span>
          </div>
          <p className="text-[#94A3B8] text-sm">The highest ranked traders on MoonFluxx. Updated in real-time.</p>
        </div>
        
        <div className="flex p-1 flex-nowrap overflow-x-auto max-w-full rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)]" role="tablist">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <MagneticButton
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm transition-all duration-200 focus-visible:outline-none ${
                  active 
                    ? 'bg-[rgba(99,102,241,0.12)] text-[#818CF8]' 
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[rgba(99,102,241,0.04)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </MagneticButton>
            );
          })}
        </div>
      </motion.div>

      {/* TOP 3 FEATURED CARDS */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {topThree.map((trader, i) => {
          const rankNum = i + 1;
          const borderColors = {
            1: 'border-[#F59E0B]',
            2: 'border-[#94A3B8]',
            3: 'border-[#CD7F32]'
          };
          
          return (
            <div key={trader.name} className={`flex items-center p-5 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] border-l-2 ${borderColors[rankNum as keyof typeof borderColors]}`}>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl font-light text-[#F1F5F9] font-mono leading-none">#{rankNum}</span>
                  <div>
                    <div className="font-semibold text-[#F1F5F9] truncate">{trader.name}</div>
                    <div className="text-xs text-[#94A3B8] font-mono">{trader.handle}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mt-1">
                  <div>
                    <div className="text-[#475569] text-xs mb-0.5">XP</div>
                    <AnimatedCounter value={trader.xp} className="text-[#F1F5F9] font-mono" />
                  </div>
                  <div>
                    <div className="text-[#475569] text-xs mb-0.5">Win Rate</div>
                    <div className={`font-mono ${trader.win >= 80 ? 'text-[#10B981]' : 'text-[#F1F5F9]'}`}>
                      <AnimatedCounter value={trader.win} suffix="%" decimals={1} className="font-mono" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[#475569] text-xs mb-0.5">PNL</div>
                    <div className="text-[#10B981] font-mono">{trader.pnl}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* LEADERBOARD LIST */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className="w-full overflow-x-auto pb-4">
        <div className="flex flex-col gap-1 min-w-[700px] bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] rounded-xl p-2">
          {/* Header Row */}
          <div className="flex items-center px-4 py-3 text-[#475569] font-mono text-xs uppercase tracking-wider">
            <div className="w-12 text-center">Rank</div>
            <div className="flex-1 pl-4">Trader</div>
            <div className="w-28 text-right">XP</div>
            <div className="w-24 text-right">Win Rate</div>
            <div className="w-28 text-right">PNL</div>
            <div className="w-20 text-right">Streak</div>
          </div>

          {rest.map((trader) => (
            <div key={trader.rank} className="group flex items-center px-4 py-3 rounded-lg hover:bg-[rgba(99,102,241,0.04)] transition-colors">
              <div className="w-12 text-center font-mono text-[#94A3B8] text-sm">
                {trader.rank}
              </div>
              
              <div className="flex-1 flex items-center gap-3 pl-4 min-w-0">
                <div className="w-8 h-8 rounded bg-[rgba(99,102,241,0.08)] flex items-center justify-center font-medium text-[#818CF8] text-sm shrink-0">
                  {trader.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[#F1F5F9] truncate text-sm">{trader.name}</div>
                  <div className="text-xs font-mono text-[#475569] truncate">{trader.handle}</div>
                </div>
              </div>

              <div className="w-28 text-right font-mono text-sm text-[#F1F5F9]">
                {trader.xp.toLocaleString()}
              </div>
              
              <div className={`w-24 text-right font-mono text-sm ${trader.win >= 80 ? 'text-[#10B981]' : 'text-[#F1F5F9]'}`}>
                {trader.win}%
              </div>

              <div className="w-28 text-right font-mono text-sm text-[#10B981]">
                {trader.pnl}
              </div>

              <div className="w-20 flex justify-end items-center gap-1.5 font-mono text-sm">
                {trader.streak > 3 ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="text-[#F1F5F9]">{trader.streak}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#475569]">{trader.streak}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
