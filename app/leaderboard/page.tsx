"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Star, Crown, TrendingUp, Zap, Shield, Award, ArrowUpRight, BarChart3 } from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── FULL TRADER DATA ──────────────────────────────────────────────────────────
const ALL_TRADERS = {
  "top-traders": [
    { rank: 1, name: "WhaleKing",  handle: "@whaleking",  xp: 284100, vol: 2841.2, win: 91.2, pnl: "+$184K", badge: "👑", streak: 14 },
    { rank: 2, name: "0xSniper",   handle: "@0xsniper",   xp: 142500, vol: 1425.0, win: 87.4, pnl: "+$92K",  badge: "🎯", streak: 9  },
    { rank: 3, name: "DegenDave",  handle: "@degendave",  xp:  94200, vol:  942.0, win: 82.1, pnl: "+$61K",  badge: "🔥", streak: 6  },
    { rank: 4, name: "Trader_x92", handle: "@trader_x92", xp:  74000, vol:  842.1, win: 82.4, pnl: "+$54K",  badge: "",   streak: 4  },
    { rank: 5, name: "Trader_k81", handle: "@trader_k81", xp:  61200, vol:  712.5, win: 79.1, pnl: "+$46K",  badge: "",   streak: 3  },
    { rank: 6, name: "CryptoNova", handle: "@cryptonova", xp:  54800, vol:  654.2, win: 76.8, pnl: "+$42K",  badge: "",   streak: 2  },
    { rank: 7, name: "Trader_q99", handle: "@trader_q99", xp:  48300, vol:  590.8, win: 74.2, pnl: "+$38K",  badge: "",   streak: 5  },
    { rank: 8, name: "SolQueen",   handle: "@solqueen",   xp:  42100, vol:  543.4, win: 71.5, pnl: "+$35K",  badge: "",   streak: 2  },
    { rank: 9, name: "Trader_z88", handle: "@trader_z88", xp:  36900, vol:  490.1, win: 68.9, pnl: "+$31K",  badge: "",   streak: 1  },
    { rank: 10, name: "Trader_v45",handle: "@trader_v45", xp:  30200, vol:  412.7, win: 65.4, pnl: "+$26K",  badge: "",   streak: 3  },
  ],
  "diamond-hands": [
    { rank: 1, name: "DiamondLee", handle: "@diamondlee", xp: 312000, vol: 1200.0, win: 88.0, pnl: "+$210K", badge: "💎", streak: 22 },
    { rank: 2, name: "HodlKing",   handle: "@hodlking",   xp: 198000, vol:  980.5, win: 85.2, pnl: "+$133K", badge: "🏆", streak: 18 },
    { rank: 3, name: "IronHands",  handle: "@ironhands",  xp: 142000, vol:  820.0, win: 81.3, pnl: "+$95K",  badge: "⚡", streak: 15 },
    { rank: 4, name: "NeverSell",  handle: "@neversell",  xp: 112000, vol:  720.4, win: 78.9, pnl: "+$74K",  badge: "",   streak: 11 },
    { rank: 5, name: "StoneWall",  handle: "@stonewall",  xp:  94000, vol:  640.8, win: 75.1, pnl: "+$62K",  badge: "",   streak: 9  },
    { rank: 6, name: "VaultLord",  handle: "@vaultlord",  xp:  78000, vol:  510.2, win: 72.4, pnl: "+$51K",  badge: "",   streak: 7  },
    { rank: 7, name: "ChainHold",  handle: "@chainhold",  xp:  64000, vol:  430.6, win: 69.8, pnl: "+$42K",  badge: "",   streak: 5  },
    { rank: 8, name: "Trader_r11", handle: "@trader_r11", xp:  51000, vol:  380.3, win: 66.2, pnl: "+$33K",  badge: "",   streak: 4  },
    { rank: 9, name: "Trader_t55", handle: "@trader_t55", xp:  40000, vol:  310.7, win: 63.5, pnl: "+$26K",  badge: "",   streak: 3  },
    { rank: 10, name: "Trader_m20",handle: "@trader_m20", xp:  31000, vol:  260.1, win: 60.8, pnl: "+$20K",  badge: "",   streak: 2  },
  ],
  "early-hunters": [
    { rank: 1, name: "EarlyBird",  handle: "@earlybird",  xp: 402000, vol: 2100.0, win: 94.5, pnl: "+$312K", badge: "🦅", streak: 31 },
    { rank: 2, name: "SniperX",    handle: "@sniperx",    xp: 280000, vol: 1600.0, win: 91.0, pnl: "+$218K", badge: "🎯", streak: 24 },
    { rank: 3, name: "SkullHead",  handle: "@skullhead",  xp: 198000, vol: 1200.0, win: 87.3, pnl: "+$152K", badge: "💀", streak: 18 },
    { rank: 4, name: "ZeroToHero", handle: "@zerohero",   xp: 154000, vol:  980.5, win: 84.1, pnl: "+$118K", badge: "",   streak: 14 },
    { rank: 5, name: "LaunchPad",  handle: "@launchpad",  xp: 122000, vol:  820.0, win: 80.6, pnl: "+$94K",  badge: "",   streak: 11 },
    { rank: 6, name: "GunSlinger", handle: "@gunslinger", xp:  98000, vol:  720.4, win: 77.2, pnl: "+$75K",  badge: "",   streak: 8  },
    { rank: 7, name: "SpeedRun",   handle: "@speedrun",   xp:  78000, vol:  610.8, win: 74.5, pnl: "+$59K",  badge: "",   streak: 6  },
    { rank: 8, name: "Trader_s44", handle: "@trader_s44", xp:  62000, vol:  490.2, win: 71.0, pnl: "+$47K",  badge: "",   streak: 4  },
    { rank: 9, name: "Trader_n77", handle: "@trader_n77", xp:  49000, vol:  390.6, win: 67.8, pnl: "+$37K",  badge: "",   streak: 3  },
    { rank: 10, name: "Trader_b03",handle: "@trader_b03", xp:  38000, vol:  310.1, win: 64.2, pnl: "+$29K",  badge: "",   streak: 2  },
  ],
};

type CategoryKey = keyof typeof ALL_TRADERS;

const CATEGORIES = [
  { id: "top-traders"   as CategoryKey, label: "Top Traders",    icon: Flame  },
  { id: "diamond-hands" as CategoryKey, label: "Diamond Hands",  icon: Star   },
  { id: "early-hunters" as CategoryKey, label: "Early Hunters",  icon: Target },
];

// Podium order: 2nd left, 1st centre, 3rd right
const PODIUM_ORDER = [1, 0, 2];

const MEDAL = ["#C9B037", "#B4B4B4", "#AD8A56"];
const MEDAL_LABEL = ["GOLD", "SILVER", "BRONZE"];
const PODIUM_H = ["h-44", "h-56", "h-36"];
const PODIUM_GLOW = [
  "rgba(201,176,55,0.25)",
  "rgba(232,184,75,0.45)",
  "rgba(173,138,86,0.2)",
];

// ── WIN RATE BAR ──────────────────────────────────────────────────────────────
function WinBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#e8b84b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
        />
      </div>
      <span className="font-mono text-[0.6rem] w-10 text-right" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [activeCat, setActiveCat] = useState<CategoryKey>("top-traders");
  const traders = ALL_TRADERS[activeCat];
  const top3 = PODIUM_ORDER.map(i => traders[i]);
  const rest = traders.slice(3);

  return (
    <div className="w-full flex-1 flex flex-col pt-2 pb-2 gap-4" style={{ minHeight: 0 }}>

      {/* ── HEADER ROW ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        {/* Title */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Trophy size={24} style={{ color: "#e8b84b", filter: "drop-shadow(0 0 8px rgba(232,184,75,0.6))" }} />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl tracking-[0.12em] font-medium text-gold-liquid leading-none">LEADERBOARD</h1>
            <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color: "#6b6987" }}>Hall of Fame · Season 4</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.2)" }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-[0.58rem] tracking-widest uppercase transition-all"
                style={{
                  color: active ? "#000" : "#6b6987",
                  background: active ? "#e8b84b" : "transparent",
                  boxShadow: active ? "0 0 14px rgba(232,184,75,0.4)" : "none",
                }}
              >
                <Icon size={11} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── MAIN CONTENT: podium + table side by side ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 min-h-0 overflow-x-auto">

        {/* ── LEFT: PODIUM ── */}
        <motion.div
          layout
          className="rounded-3xl p-5 flex flex-col relative overflow-hidden"
          style={{ background: "rgba(10,8,5,0.97)", border: "1px solid rgba(232,184,75,0.28)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(232,184,75,0.07)" }} />

          <p className="font-mono text-[0.55rem] tracking-widest uppercase mb-5 text-center" style={{ color: "#6b6987" }}>
            — Top 3 Ranking —
          </p>

          {/* Podium columns: 2nd, 1st, 3rd */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-3 flex-1">
            <AnimatePresence mode="wait">
              {top3.map((trader, idx) => {
                const isFirst = idx === 1; // centre slot = rank 1
                const medal = MEDAL[idx];
                const medalLabel = MEDAL_LABEL[idx];
                const podH = PODIUM_H[idx];
                const glow = PODIUM_GLOW[idx];

                return (
                  <motion.div
                    key={`${activeCat}-${trader.rank}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ delay: idx * 0.08, duration: 0.5, ease: EASE }}
                    className={`relative flex flex-col items-center ${isFirst ? "flex-1" : "w-28"}`}
                  >
                    {/* Floating crown for #1 */}
                    {isFirst && (
                      <motion.div
                        className="mb-2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Crown size={28} fill="#e8b84b" style={{ color: "#e8b84b", filter: "drop-shadow(0 0 10px rgba(232,184,75,0.8))" }} />
                      </motion.div>
                    )}

                    {/* Avatar */}
                    <div
                      className="rounded-full flex items-center justify-center font-display mb-2 relative"
                      style={{
                        width: isFirst ? 72 : 52,
                        height: isFirst ? 72 : 52,
                        fontSize: isFirst ? "1.5rem" : "1.1rem",
                        background: `radial-gradient(circle at 35% 35%, ${medal}30, rgba(0,0,0,0.8))`,
                        border: `2px solid ${medal}80`,
                        boxShadow: `0 0 ${isFirst ? 30 : 16}px ${glow}`,
                        color: medal,
                      }}
                    >
                      {trader.badge || trader.name[0]}
                      {/* Rank badge */}
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[0.5rem] font-bold"
                        style={{ background: medal, color: "#000" }}
                      >
                        {trader.rank}
                      </div>
                    </div>

                    {/* Name & XP */}
                    <p className="font-display text-center leading-tight mb-0.5"
                      style={{ color: isFirst ? "#ffe6a3" : "#c4b5fd", fontSize: isFirst ? "1rem" : "0.8rem" }}>
                      {trader.name}
                    </p>
                    <p className="font-mono text-center mb-3" style={{ color: medal, fontSize: "0.55rem" }}>
                      {trader.xp.toLocaleString()} XP
                    </p>

                    {/* Pillar */}
                    <div
                      className={`w-full ${podH} rounded-t-2xl flex flex-col items-center justify-start pt-3 gap-1 relative overflow-hidden`}
                      style={{
                        background: `linear-gradient(to bottom, ${medal}18, ${medal}06)`,
                        border: `1px solid ${medal}40`,
                        borderBottom: "none",
                        boxShadow: `inset 0 0 30px ${glow}`,
                      }}
                    >
                      {/* Medal label watermark */}
                      <span className="font-display font-bold select-none pointer-events-none"
                        style={{ color: `${medal}18`, fontSize: "2.5rem", lineHeight: 1 }}>
                        {trader.rank}
                      </span>
                      <span className="font-mono text-[0.45rem] tracking-widest uppercase" style={{ color: `${medal}80` }}>
                        {medalLabel}
                      </span>
                      {/* Stats */}
                      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-0.5">
                        <span className="font-mono text-[0.5rem]" style={{ color: "#10b981" }}>{trader.pnl}</span>
                        <span className="font-mono text-[0.48rem]" style={{ color: "#6b6987" }}>{trader.win}% WR</span>
                      </div>
                      {/* Reflective floor */}
                      <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: `linear-gradient(to top, ${medal}20, transparent)` }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Stage floor line */}
          <div className="h-px mt-0" style={{ background: "linear-gradient(90deg, transparent, rgba(232,184,75,0.4), transparent)" }} />

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Total Traders", value: "12.4K", icon: Users2 },
              { label: "Total Volume", value: "$142M", icon: BarChart3 },
              { label: "Season Ends", value: "14d", icon: Zap },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(5,4,3,0.7)", border: "1px solid rgba(232,184,75,0.12)" }}>
                  <p className="font-mono text-[0.48rem] tracking-widest uppercase mb-0.5" style={{ color: "#6b6987" }}>{s.label}</p>
                  <p className="font-mono text-sm font-semibold" style={{ color: "#e8b84b" }}>{s.value}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── RIGHT: FULL TABLE (ranks 4–10) ── */}
        <div className="overflow-x-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="rounded-3xl flex flex-col overflow-hidden min-w-[560px]"
          style={{ background: "rgba(10,8,5,0.97)", border: "1px solid rgba(232,184,75,0.22)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />

          {/* Table header */}
          <div className="grid gap-3 px-5 py-3.5 font-mono text-[0.52rem] tracking-widest uppercase"
            style={{ gridTemplateColumns: "48px 1fr 120px 100px 90px 80px", borderBottom: "1px solid rgba(232,184,75,0.15)", color: "#6b6987" }}>
            <div>Rank</div>
            <div>Trader</div>
            <div>Win Rate</div>
            <div>Volume</div>
            <div>PnL</div>
            <div className="text-right">Streak</div>
          </div>

          {/* Table body */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCat}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col flex-1"
              >
                {rest.map((trader, i) => (
                  <motion.div
                    key={trader.rank}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }}
                    className="grid gap-3 px-5 py-3.5 items-center relative group cursor-pointer transition-all"
                    style={{
                      gridTemplateColumns: "48px 1fr 120px 100px 90px 80px",
                      borderBottom: i < rest.length - 1 ? "1px solid rgba(232,184,75,0.08)" : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,184,75,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Gold left accent on hover */}
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "linear-gradient(to bottom, #e8b84b, #a9791f)" }} />

                    {/* Rank */}
                    <div className="font-display text-lg font-bold" style={{ color: "rgba(232,184,75,0.5)" }}>
                      #{trader.rank}
                    </div>

                    {/* Trader */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm shrink-0"
                        style={{
                          background: `hsl(${(trader.rank * 47) % 360}, 40%, 15%)`,
                          border: "1px solid rgba(232,184,75,0.2)",
                          color: "#e8b84b"
                        }}>
                        {trader.badge || trader.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-sm truncate text-white group-hover:text-gold-liquid transition-colors">
                          {trader.name}
                        </p>
                        <p className="font-mono text-[0.5rem] truncate" style={{ color: "#6b6987" }}>{trader.handle}</p>
                      </div>
                    </div>

                    {/* Win Rate bar */}
                    <div>
                      <WinBar pct={trader.win} />
                    </div>

                    {/* Volume */}
                    <div className="font-mono text-xs" style={{ color: "#f4f2ff" }}>${trader.vol.toFixed(1)}K</div>

                    {/* PnL */}
                    <div className="font-mono text-xs flex items-center gap-1" style={{ color: "#10b981" }}>
                      <ArrowUpRight size={11} />
                      {trader.pnl}
                    </div>

                    {/* Streak */}
                    <div className="text-right">
                      <span className="font-mono text-[0.6rem] px-2 py-0.5 rounded-full"
                        style={{
                          background: trader.streak >= 5 ? "rgba(232,184,75,0.12)" : "rgba(255,255,255,0.05)",
                          color: trader.streak >= 5 ? "#e8b84b" : "#6b6987",
                          border: `1px solid ${trader.streak >= 5 ? "rgba(232,184,75,0.3)" : "rgba(255,255,255,0.08)"}`,
                        }}>
                        🔥 {trader.streak}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(232,184,75,0.12)" }}>
            <span className="font-mono text-[0.52rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>
              Showing ranks 4–10 of 12,450 traders
            </span>
            <button className="font-mono text-[0.55rem] tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
              style={{ border: "1px solid rgba(232,184,75,0.3)", color: "#e8b84b", background: "rgba(232,184,75,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,184,75,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(232,184,75,0.08)")}>
              View All <ArrowUpRight size={10} />
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

// inline icon to avoid extra import issues
function Users2({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
