"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star } from "lucide-react";
import { useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import { useTheme } from '@/components/ThemeProvider';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCat, setActiveCat] = useState<CategoryKey>("top-traders");
  const traders = ALL_TRADERS[activeCat];

  // Top 3 featured
  const topThree = traders.slice(0, 3);
  const rest = traders.slice(3);

  const brutalBorder = isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black';
  const brutalShadow = isDark ? 'shadow-[4px_4px_0px_0px_#10B981]' : 'shadow-[4px_4px_0px_0px_#000]';
  const brutalBg = isDark ? 'bg-[#050510]' : 'bg-white';
  const brutalText = 'font-mono font-black uppercase tracking-wider';

  const getBrutalShadow = (rank: number) => {
    if (rank === 1) return isDark ? 'shadow-[8px_8px_0px_0px_#F59E0B]' : 'shadow-[8px_8px_0px_0px_#000]';
    if (rank === 2) return isDark ? 'shadow-[8px_8px_0px_0px_#94A3B8]' : 'shadow-[8px_8px_0px_0px_#000]';
    if (rank === 3) return isDark ? 'shadow-[8px_8px_0px_0px_#B45309]' : 'shadow-[8px_8px_0px_0px_#000]';
    return brutalShadow;
  };

  const getBrutalBorder = (rank: number) => {
    const base = isDark ? 'border-2' : 'border-3';
    if (!isDark) return `${base} border-black`;
    if (rank === 1) return `${base} border-[#F59E0B]`;
    if (rank === 2) return `${base} border-[#94A3B8]`;
    if (rank === 3) return `${base} border-[#B45309]`;
    return `${base} border-[rgba(255,255,255,0.2)]`;
  };

  return (
    <div className={`max-w-6xl mx-auto w-full pt-2 pb-24 md:pb-16 px-4 ${brutalText}`}>
      
      {/* DEMO BANNER */}
      <div className={`mb-3 p-2 ${brutalBg} ${brutalBorder} ${brutalShadow} text-center`}>
        <p className={`text-xs ${isDark ? 'text-[#10B981]' : 'text-black'} flex items-center justify-center gap-2`}>
          <Flame className="w-4 h-4" /> [ STATUS: DEMO_DATA_ACTIVE // RANKINGS AWAITING LIVE INPUT ]
        </p>
      </div>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col md:flex-row justify-between items-end gap-3 mb-4 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h1 className={`text-2xl sm:text-3xl flex items-center gap-3 ${isDark ? 'text-[#F59E0B]' : 'text-black'}`}>
              <Trophy className="w-7 h-7" />
              HIGH SCORES
            </h1>
            <span className={`px-2 py-0.5 text-xs ${brutalBg} ${brutalBorder} ${isDark ? 'text-[#06B6D4]' : 'text-black'}`}>
              [ SEASON_01 ]
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>// THE ELITE TRADERS OF MOONFLUXX</p>
        </div>
        
        <div className={`flex p-2 flex-wrap md:flex-nowrap gap-3 ${brutalBg} ${brutalBorder} ${brutalShadow}`} role="tablist">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <MagneticButton
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 ${brutalText} transition-none focus-visible:outline-none ${brutalBorder} ${
                  active 
                    ? (isDark ? 'bg-[#10B981] text-black shadow-[4px_4px_0px_0px_#F59E0B]' : 'bg-black text-white shadow-[4px_4px_0px_0px_#F59E0B]')
                    : (isDark ? 'bg-transparent text-[#6366F1] hover:bg-[#6366F1] hover:text-black' : 'bg-white text-black hover:bg-gray-200')
                }`}
              >
                <Icon className="w-4 h-4" />
                [ --{cat.label.replace(' ', '-').toUpperCase()} ]
              </MagneticButton>
            );
          })}
        </div>
      </motion.div>

      {/* TOP 3 HERO PODIUM */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {topThree.map((trader, i) => {
          const rankNum = i + 1;
          
          return (
            <div key={trader.name} className={`flex flex-col p-3 relative ${brutalBg} ${getBrutalBorder(rankNum)} ${getBrutalShadow(rankNum)}`}>
              <div className={`absolute -top-3 -left-3 w-9 h-9 flex items-center justify-center text-lg ${brutalBg} ${getBrutalBorder(rankNum)} ${isDark ? 'text-white' : 'text-black'}`}>
                #{rankNum}
              </div>
              <div className="flex flex-col items-center mb-3 mt-2">
                <img 
                  src={`https://robohash.org/${trader.handle}?set=set1&bgset=bg1&size=400x400`} 
                  alt={trader.name}
                  className={`w-16 h-16 rounded-none mb-2 ${getBrutalBorder(rankNum)} ${isDark ? 'bg-[#6366F1]' : 'bg-gray-200'}`}
                />
                <div className={`text-lg truncate ${isDark ? 'text-white' : 'text-black'}`}>{trader.name}</div>
                <div className={`text-xs ${isDark ? 'text-[#F43F5E]' : 'text-gray-600'}`}>{trader.handle}</div>
              </div>
              
              <div className={`w-full p-2 ${isDark ? 'bg-black' : 'bg-gray-100'} ${brutalBorder} mb-2`}>
                <div className={`text-[10px] mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>// TERMINAL_STATS</div>
                <div className={`text-xs ${isDark ? 'text-[#10B981]' : 'text-black'}`}>
                  PNL: {trader.pnl} // WIN_RATE: {trader.win}%
                </div>
                <div className={`text-xs ${isDark ? 'text-[#06B6D4]' : 'text-black'}`}>
                  XP: {trader.xp.toLocaleString()}
                </div>
              </div>

              {trader.streak >= 3 && (
                <div className={`w-full text-center py-1.5 text-xs ${isDark ? 'bg-[#F59E0B] text-black' : 'bg-black text-white'} ${brutalBorder}`}>
                  [ 🔥 STREAK: {trader.streak} WINS ]
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ARCADE RANKING TABLE */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className="w-full overflow-x-auto pb-8">
        <div className={`flex flex-col min-w-[800px] p-6 ${brutalBg} ${brutalBorder} ${brutalShadow}`}>
          
          <div className={`mb-6 text-xl ${isDark ? 'text-[#6366F1]' : 'text-black'}`}>// FULL_RANKINGS_SYSTEM</div>

          {/* Header Row */}
          <div className={`flex items-center px-4 py-3 mb-4 ${isDark ? 'text-[#F43F5E]' : 'text-black'} ${brutalBorder} border-dashed border-b-2 border-t-0 border-l-0 border-r-0`}>
            <div className="w-24">RANK</div>
            <div className="w-16">AVATAR</div>
            <div className="flex-1">TRADER_ID</div>
            <div className="w-32 text-right">XP_SCORE</div>
            <div className="w-32 text-right">WIN_RATE</div>
            <div className="w-32 text-right">TOTAL_PNL</div>
            <div className="w-40 text-right">ACHIEVEMENTS</div>
          </div>

          <div className="flex flex-col gap-4">
            {rest.map((trader) => (
              <div key={trader.rank} className={`group flex items-center px-4 py-3 ${isDark ? 'bg-black' : 'bg-gray-100'} ${brutalBorder} hover:-translate-y-1 hover:translate-x-1 transition-transform ${isDark ? 'hover:shadow-[-4px_4px_0px_0px_#6366F1]' : 'hover:shadow-[-4px_4px_0px_0px_#000]'}`}>
                
                <div className={`w-24 text-lg ${isDark ? 'text-[#F59E0B]' : 'text-black'}`}>
                  [ #{trader.rank.toString().padStart(2, '0')} ]
                </div>

                <div className="w-16">
                  <img 
                    src={`https://robohash.org/${trader.handle}?set=set1&bgset=bg1&size=100x100`} 
                    alt={trader.name}
                    className={`w-10 h-10 ${brutalBorder} ${isDark ? 'bg-[#6366F1]' : 'bg-white'}`}
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className={`truncate ${isDark ? 'text-white' : 'text-black'} text-lg`}>{trader.name}</div>
                  <div className={`truncate ${isDark ? 'text-gray-500' : 'text-gray-600'} text-xs`}>{trader.handle}</div>
                </div>

                <div className={`w-32 text-right text-lg ${isDark ? 'text-[#06B6D4]' : 'text-black'}`}>
                  {trader.xp.toLocaleString()}
                </div>
                
                <div className={`w-32 text-right text-lg ${trader.win >= 80 ? (isDark ? 'text-[#10B981]' : 'text-green-600') : (isDark ? 'text-white' : 'text-black')}`}>
                  {trader.win}%
                </div>

                <div className={`w-32 text-right text-lg ${isDark ? 'text-[#10B981]' : 'text-black'}`}>
                  {trader.pnl}
                </div>

                <div className="w-40 flex justify-end items-center">
                  {trader.streak > 3 ? (
                    <div className={`px-2 py-1 text-xs ${isDark ? 'bg-[#F43F5E] text-white' : 'bg-black text-white'} ${brutalBorder}`}>
                      [ 🔥 x{trader.streak} ]
                    </div>
                  ) : (
                    <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>--</span>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      </motion.div>

    </div>
  );
}
