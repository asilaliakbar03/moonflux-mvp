"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  User, Wallet, Activity, Copy, Settings, Shield, Award,
  Zap, Star, TrendingUp, Users, Lock, CheckCircle,
  ArrowUpRight, ArrowDownRight, Flame, BarChart3, Globe, AtSign,
  ChevronRight, Share2, MessageCircle, Eye, PieChart, Clock, Filter
} from "lucide-react";
import { MOCK_DATA } from "@/lib/mock";
import { useToast } from "@/components/ToastProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── L11: PORTFOLIO DNA ────────────────────────────────────────────────────────
const DNA_TRAITS = [
  { trait: "DEGEN", value: 85, color: "#e8b84b", glow: "rgba(232,184,75,0.4)", label: "High-risk appetite" },
  { trait: "DIAMOND", value: 60, color: "#38bdf8", glow: "rgba(56,189,248,0.35)", label: "Holds under pressure" },
  { trait: "SNIPER", value: 40, color: "#a855f7", glow: "rgba(168,85,247,0.35)", label: "Early entry hunter" },
  { trait: "WHALE", value: 15, color: "#10b981", glow: "rgba(16,185,129,0.35)", label: "Volume deployer" },
];
const DNA_ARCHETYPE = { title: "High-Velocity Momentum Trader", emoji: "⚡", description: "You chase narratives early, hold with conviction, and are not afraid of volatility. Your edge is speed — you're usually first in." };

// ── L3: CREATOR REPUTATION ────────────────────────────────────────────────────
const CREATOR_SCORE = {
  overall: 94,
  launchScore: 92,
  totalLaunches: 12,
  successfulLaunches: 12,
  rugCount: 0,
  avgRetention: "78%",
  avgLiquidityKept: "94%",
  verifiedCreator: true,
  rank: 7,
};

// ── L8: ACHIEVEMENTS ──────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: "early_hunter", title: "Early Hunter", desc: "Top 100 buyer in 5 launches", icon: "🎯", rarity: "LEGENDARY", color: "#e8b84b", unlocked: true, xp: 500 },
  { id: "whale_status", title: "Whale Status", desc: "Deployed over 100 SOL in single trade", icon: "🐋", rarity: "EPIC", color: "#a855f7", unlocked: true, xp: 350 },
  { id: "diamond_hands", title: "Diamond Hands", desc: "Held through 80% drawdown and recovered", icon: "💎", rarity: "RARE", color: "#38bdf8", unlocked: true, xp: 200 },
  { id: "first_grad", title: "Graduation Day", desc: "Held a token that graduated to DEX", icon: "🎓", rarity: "EPIC", color: "#10b981", unlocked: true, xp: 300 },
  { id: "speed_run", title: "Speed Runner", desc: "Bought within 5 seconds of launch", icon: "⚡", rarity: "RARE", color: "#f59e0b", unlocked: true, xp: 150 },
  { id: "social_king", title: "Social King", desc: "Referred 10+ traders who completed a trade", icon: "👑", rarity: "RARE", color: "#ec4899", unlocked: false, xp: 250 },
  { id: "triple_grad", title: "Hat Trick", desc: "Hold 3 tokens that graduated", icon: "🏆", rarity: "LEGENDARY", color: "#e8b84b", unlocked: false, xp: 750 },
  { id: "volume_lord", title: "Volume Lord", desc: "$500K+ total trade volume", icon: "📊", rarity: "EPIC", color: "#a855f7", unlocked: false, xp: 400 },
];

const RARITY_COLORS: Record<string, string> = {
  LEGENDARY: "#e8b84b",
  EPIC: "#a855f7",
  RARE: "#38bdf8",
  COMMON: "#6b6987",
};

// ── VAULT ASSETS ──────────────────────────────────────────────────────────────
const ASSETS = [
  { name: "Luna Doge", ticker: "LDOGE", amount: "1.2M", value: "$2,808", change: "+142.5%", pos: true, icon: "🐕" },
  { name: "NeuralFi", ticker: "NFI", amount: "4,500", value: "$6,390", change: "+24.0%", pos: true, icon: "🧠" },
  { name: "Solana", ticker: "SOL", amount: "84.2", value: "$12,141", change: "+4.2%", pos: true, icon: "◎" },
];

// ── TIMELINE ACTIVITY ─────────────────────────────────────────────────────────
const TIMELINE = [
  { type: "buy", color: "#10b981", label: "Bought", detail: "1.2M LDOGE for 2.8 SOL", time: "2m ago" },
  { type: "achievement", color: "#e8b84b", label: "Achievement Unlocked", detail: "Diamond Hands 💎", time: "2h ago" },
  { type: "launch", color: "#a855f7", label: "Launched Token", detail: "NOVA — Viral meme token", time: "1d ago" },
  { type: "deposit", color: "#38bdf8", label: "Deposited", detail: "50 SOL from Phantom", time: "1d ago" },
  { type: "sell", color: "#ef4444", label: "Sold", detail: "500K ROCKET for 3.1 SOL (+80%)", time: "2d ago" },
];

// ── LAUNCHED TOKENS ───────────────────────────────────────────────────────────
const LAUNCHED_TOKENS = [
  { name: "Luna Doge", ticker: "LDOGE", mcap: "$1.87M", status: "Graduated", statusColor: "#10b981", change: "+142%" },
  { name: "AstroCat", ticker: "ACAT", mcap: "$420K", status: "Live", statusColor: "#38bdf8", change: "+38%" },
  { name: "NovaDoge", ticker: "NOVA", mcap: "$95K", status: "Live", statusColor: "#38bdf8", change: "+12%" },
];

// ── HOLDINGS ──────────────────────────────────────────────────────────────────
const HOLDINGS = [
  { icon: "🐕", name: "Luna Doge",  ticker: "LDOGE", qty: "1,200,000", avgBuy: "$0.00097", current: "$0.00234", value: "$2,808",  pnl: "+$1,969", pnlPct: "+141.2%", pos: true,  alloc: 13.2, color: "#e8b84b" },
  { icon: "🧠", name: "NeuralFi",   ticker: "NFI",   qty: "4,500",     avgBuy: "$1.12",    current: "$1.42",    value: "$6,390",  pnl: "+$1,350", pnlPct: "+26.8%",  pos: true,  alloc: 29.9, color: "#a855f7" },
  { icon: "◎",  name: "Solana",     ticker: "SOL",   qty: "84.2",      avgBuy: "$122",     current: "$144.2",   value: "$12,141", pnl: "+$1,869", pnlPct: "+18.2%",  pos: true,  alloc: 56.9, color: "#38bdf8" },
  { icon: "🚀", name: "RocketDoge", ticker: "RDOGE", qty: "500,000",   avgBuy: "$0.00310", current: "$0.00248", value: "$1,240",  pnl: "-$310",   pnlPct: "-20.0%",  pos: false, alloc: 5.8,  color: "#ef4444" },
  { icon: "🤖", name: "AI Swarm",   ticker: "SWRM",  qty: "2,100,000", avgBuy: "$0.00022", current: "$0.00067", value: "$1,407",  pnl: "+$945",   pnlPct: "+204.5%", pos: true,  alloc: 6.6,  color: "#10b981" },
];

const TX_HISTORY = [
  { type: "buy",  icon: "🐕", ticker: "LDOGE", detail: "Bought 1.2M LDOGE",     amount: "+1,200,000", sol: "−2.80 SOL",  usd: "$2,808",  time: "2m ago",  pos: true  },
  { type: "sell", icon: "🚀", ticker: "RDOGE", detail: "Sold 200K RDOGE",        amount: "−200,000",  sol: "+0.62 SOL", usd: "$496",   time: "1h ago",  pos: false },
  { type: "buy",  icon: "🤖", ticker: "SWRM",  detail: "Bought 2.1M SWRM",       amount: "+2,100,000", sol: "−0.46 SOL", usd: "$462",   time: "3h ago",  pos: true  },
  { type: "buy",  icon: "◎",  ticker: "SOL",   detail: "Deposited 50 SOL",        amount: "+50",        sol: "+50 SOL",  usd: "$7,210", time: "1d ago",  pos: true  },
  { type: "sell", icon: "🧠", ticker: "NFI",   detail: "Sold 1,000 NFI (+80%)",   amount: "−1,000",    sol: "+1.24 SOL", usd: "$1,420",  time: "2d ago",  pos: false },
  { type: "buy",  icon: "🧠", ticker: "NFI",   detail: "Bought 5,500 NFI",         amount: "+5,500",    sol: "−4.40 SOL", usd: "$6,160",  time: "3d ago",  pos: true  },
];

// ── CREATOR MILESTONE BAR ─────────────────────────────────────────────────────
function ScoreRing({ score, color = "#e8b84b" }: { score: number; color?: string }) {
  const r = 36, c = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88" className="rotate-[-90deg]">
      <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <motion.circle
        cx={44} cy={44} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (score / 100) * c }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { showToast } = useToast();
  const user = MOCK_DATA.user;
  const [activeTab, setActiveTab] = useState<"portfolio" | "holdings" | "launched" | "social">("portfolio");
  const [txFilter, setTxFilter] = useState<"all"|"buy"|"sell">("all");
  const [hoveredAch, setHoveredAch] = useState<string | null>(null);
  const [followed, setFollowed] = useState(false);

  return (
    <div className="max-w-6xl mx-auto flex-1 flex flex-col pt-2 pb-4 gap-4 w-full px-4 lg:px-0">

      {/* ── TOP ROW: Identity + DNA + Creator Score ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-4">

        {/* ─ L6: IDENTITY CARD ─ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden"
          style={{ background: "rgba(12,10,7,0.95)", border: "1px solid rgba(232,184,75,0.35)", boxShadow: "0 0 40px -10px rgba(232,184,75,0.12)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(232,184,75,0.07)" }} />

          <div className="flex justify-between items-start mb-4">
            <span className="font-mono text-[0.5rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>Members Card</span>
            <button className="transition-colors" style={{ color: "#6b6987" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b6987")}>
              <Settings size={15} />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-end gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #e8b84b, #a9791f)" }}>
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: "#0c0a07" }}>
                  <User size={28} style={{ color: "#e8b84b" }} />
                </div>
              </div>
              <motion.div
                animate={{ boxShadow: ["0 0 10px rgba(232,184,75,0.3)", "0 0 20px rgba(232,184,75,0.6)", "0 0 10px rgba(232,184,75,0.3)"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -bottom-1.5 -right-1.5 font-mono text-[0.55rem] px-2 py-0.5 rounded-full"
                style={{ background: "#e8b84b", color: "#000", fontWeight: 700 }}
              >
                LVL 24
              </motion.div>
            </div>
          </div>

          <div>
            <h1 className="font-display text-xl text-gold-liquid mb-0.5">0xNova</h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs" style={{ color: "#8a8099" }}>0x71C...9711</span>
              <button onClick={() => { navigator.clipboard.writeText("0x71C...9711"); showToast("Address copied!", "success"); }}>
                <Copy size={11} style={{ color: "#6b6987" }} />
              </button>
            </div>

            {/* L11 Archetype badge */}
            <div className="rounded-xl px-3 py-2 mb-4" style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.2)" }}>
              <p className="font-mono text-[0.5rem] tracking-widest uppercase mb-0.5" style={{ color: "#6b6987" }}>Trader Archetype</p>
              <p className="font-mono text-[0.62rem]" style={{ color: "#ffe6a3" }}>{DNA_ARCHETYPE.emoji} {DNA_ARCHETYPE.title}</p>
            </div>

            {/* Social stats */}
            <div className="flex gap-4 mb-4">
              {[{ v: "12.4K", l: "Followers" }, { v: "842", l: "Following" }, { v: "#42", l: "Rank" }].map(s => (
                <div key={s.l}>
                  <p className="font-display text-sm" style={{ color: "#f4f2ff" }}>{s.v}</p>
                  <p className="font-mono text-[0.5rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>{s.l}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setFollowed(!followed); showToast(followed ? "Unfollowed" : "Following 0xNova!", "success"); }}
                className="flex-1 py-2 rounded-xl font-mono text-[0.6rem] tracking-widest uppercase transition-all"
                style={{
                  background: followed ? "rgba(232,184,75,0.15)" : "#e8b84b",
                  color: followed ? "#e8b84b" : "#000",
                  border: "1px solid rgba(232,184,75,0.4)",
                  fontWeight: 600,
                }}
              >
                {followed ? "Following ✓" : "Follow"}
              </button>
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.2)" }}
              >
                <Share2 size={13} style={{ color: "#e8b84b" }} />
              </button>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(232,184,75,0.15)" }}>
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-[0.5rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>XP to Lvl 25</span>
              <span className="font-mono text-[0.5rem]" style={{ color: "#e8b84b" }}>4,500 / 5,000</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "90%" }}
                transition={{ delay: 0.4, duration: 1, ease: EASE }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #a9791f, #e8b84b, #ffe6a3)", boxShadow: "0 0 10px rgba(232,184,75,0.5)" }}
              />
            </div>
          </div>
        </motion.div>

        {/* ─ L11: TRADER DNA ─ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.25)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />
          <span className="absolute -top-3 right-4 font-display text-[6rem] leading-none pointer-events-none select-none" style={{ color: "rgba(232,184,75,0.04)" }}>DNA</span>

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={15} style={{ color: "#e8b84b" }} />
              <span className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>L·11 — Portfolio DNA</span>
            </div>
            {/* Shareable badge */}
            <button className="font-mono text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
              style={{ border: "1px solid rgba(232,184,75,0.25)", color: "#6b6987" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6b6987")}
            >
              <Share2 size={9} /> Share
            </button>
          </div>

          {/* Archetype headline */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.15)" }}>
            <p className="font-mono text-[0.5rem] tracking-widest uppercase mb-1" style={{ color: "#6b6987" }}>Your Trader Archetype</p>
            <p className="font-display text-lg" style={{ color: "#ffe6a3" }}>{DNA_ARCHETYPE.emoji} {DNA_ARCHETYPE.title}</p>
            <p className="font-mono text-[0.58rem] mt-1 leading-relaxed" style={{ color: "#6b6987" }}>{DNA_ARCHETYPE.description}</p>
          </div>

          {/* DNA bars */}
          <div className="flex flex-col gap-3">
            {DNA_TRAITS.map((trait, i) => (
              <motion.div
                key={trait.trait}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
              >
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.55rem] tracking-widest uppercase" style={{ color: trait.color }}>{trait.trait}</span>
                    <span className="font-mono text-[0.5rem]" style={{ color: "#6b6987" }}>{trait.label}</span>
                  </div>
                  <span className="font-mono text-[0.58rem]" style={{ color: trait.color }}>{trait.value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.value}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.9, ease: EASE }}
                    style={{ background: trait.color, boxShadow: `0 0 10px ${trait.glow}` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─ L3: CREATOR REPUTATION ─ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: EASE }}
          className="rounded-3xl p-5 relative overflow-hidden flex flex-col"
          style={{ background: "rgba(8,16,10,0.97)", border: "1px solid rgba(16,185,129,0.35)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-success/50 to-transparent" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(16,185,129,0.08)" }} />

          <div className="flex items-center gap-2 mb-4">
            <Star size={14} style={{ color: "#10b981" }} />
            <span className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#059669" }}>L·03 — Creator Score</span>
          </div>

          {/* Score ring + value */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <ScoreRing score={CREATOR_SCORE.overall} color="#10b981" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-display text-xl" style={{ color: "#10b981" }}>{CREATOR_SCORE.overall}</span>
                <span className="font-mono text-[0.45rem] uppercase" style={{ color: "#6b6987" }}>/ 100</span>
              </div>
            </div>
            <div>
              <p className="font-display text-sm text-white mb-0.5">Verified Creator</p>
              <p className="font-mono text-[0.55rem]" style={{ color: "#10b981" }}>Global Rank #{CREATOR_SCORE.rank}</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={10} style={{ color: "#10b981" }} />
                <span className="font-mono text-[0.5rem]" style={{ color: "#10b981" }}>0 Rugs · All-time</span>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2 flex-1">
            {[
              { label: "Launches", value: `${CREATOR_SCORE.totalLaunches}`, sub: "12/12 success", color: "#10b981" },
              { label: "Rug Count", value: `${CREATOR_SCORE.rugCount}`, sub: "Perfect record", color: "#10b981" },
              { label: "Avg Retention", value: CREATOR_SCORE.avgRetention, sub: "30d holder rate", color: "#38bdf8" },
              { label: "Liquidity Kept", value: CREATOR_SCORE.avgLiquidityKept, sub: "Never pulled", color: "#e8b84b" },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-2.5" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <p className="font-mono text-[0.5rem] tracking-widest uppercase mb-0.5" style={{ color: "#6b6987" }}>{m.label}</p>
                <p className="font-mono text-sm font-semibold" style={{ color: m.color }}>{m.value}</p>
                <p className="font-mono text-[0.5rem]" style={{ color: "#6b6987" }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── L8: ACHIEVEMENTS ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.6, ease: EASE }}
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.2)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={15} style={{ color: "#e8b84b" }} />
            <span className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>L·08 — Achievements</span>
          </div>
          <span className="font-mono text-[0.55rem]" style={{ color: "#6b6987" }}>
            {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
              onMouseEnter={() => setHoveredAch(ach.id)}
              onMouseLeave={() => setHoveredAch(null)}
              className="relative flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all"
                style={{
                  background: ach.unlocked ? `rgba(${ach.color === "#e8b84b" ? "232,184,75" : ach.color === "#a855f7" ? "168,85,247" : ach.color === "#38bdf8" ? "56,189,248" : ach.color === "#10b981" ? "16,185,129" : "245,158,11"}, 0.12)` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${ach.unlocked ? ach.color + "55" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: ach.unlocked && hoveredAch === ach.id ? `0 0 20px ${ach.color}50` : "none",
                  filter: ach.unlocked ? "none" : "grayscale(1) opacity(0.3)",
                  transform: hoveredAch === ach.id ? "scale(1.1) translateY(-2px)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                <span>{ach.icon}</span>
              </div>
              <span className="font-mono text-[0.45rem] text-center leading-tight" style={{ color: ach.unlocked ? "#8a8099" : "#4a4860" }}>{ach.title}</span>

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredAch === ach.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute bottom-full mb-2 z-20 rounded-xl p-3 w-40 pointer-events-none left-1/2 -translate-x-1/2"
                    style={{ background: "rgba(12,10,7,0.98)", border: `1px solid ${ach.color}40`, boxShadow: `0 8px 30px rgba(0,0,0,0.8)` }}
                  >
                    <p className="font-mono text-[0.5rem] tracking-widest uppercase mb-1" style={{ color: RARITY_COLORS[ach.rarity] }}>{ach.rarity}</p>
                    <p className="font-mono text-[0.62rem] mb-1" style={{ color: "#f4f2ff" }}>{ach.title}</p>
                    <p className="font-mono text-[0.55rem] leading-relaxed mb-1.5" style={{ color: "#6b6987" }}>{ach.desc}</p>
                    <p className="font-mono text-[0.5rem]" style={{ color: ach.color }}>+{ach.xp} XP</p>
                    {!ach.unlocked && <p className="font-mono text-[0.5rem] mt-1" style={{ color: "#6b6987" }}>🔒 Locked</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── BOTTOM ROW: Tabs (Portfolio / Launches / Social) + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 flex-1 min-h-0">

        {/* Tab panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          className="rounded-3xl flex flex-col overflow-hidden"
          style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}
        >
          {/* Tab bar */}
          <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid rgba(232,184,75,0.15)" }}>
            {[
              { id: "portfolio", icon: Wallet,      label: "Portfolio" },
              { id: "holdings",  icon: PieChart,     label: "Holdings"  },
              { id: "launched",  icon: Zap,          label: "Launched"  },
              { id: "social",    icon: MessageCircle,label: "Social"    },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 py-3.5 flex items-center justify-center gap-2 relative transition-all"
                style={{ color: activeTab === tab.id ? "#e8b84b" : "#6b6987" }}
              >
                <tab.icon size={13} />
                <span className="font-mono text-[0.58rem] tracking-widest uppercase">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, transparent, #e8b84b, transparent)" }} />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">

              {/* ─ PORTFOLIO TAB ─ */}
              {activeTab === "portfolio" && (
                <motion.div key="portfolio" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                  {/* Total value */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>Total Value</span>
                    <span className="font-display text-2xl text-gold-liquid">$21,339</span>
                  </div>

                  {/* Portfolio bars */}
                  <div className="space-y-3">
                    {ASSETS.map((asset, i) => {
                      const totalVal = 21339;
                      const pct = (parseFloat(asset.value.replace("$", "").replace(",", "")) / totalVal) * 100;
                      return (
                        <motion.div
                          key={asset.ticker}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-2xl p-4 cursor-pointer group transition-all"
                          style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,184,75,0.3)")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(232,184,75,0.12)")}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{asset.icon}</span>
                              <div>
                                <p className="font-mono text-[0.62rem] text-white">{asset.name}</p>
                                <p className="font-mono text-[0.5rem]" style={{ color: "#6b6987" }}>{asset.ticker} · {asset.amount}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[0.65rem]" style={{ color: "#f4f2ff" }}>{asset.value}</p>
                              <p className="font-mono text-[0.55rem]" style={{ color: "#10b981" }}>{asset.change}</p>
                            </div>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.9, ease: EASE, delay: 0.3 + i * 0.1 }}
                              style={{ background: "linear-gradient(90deg, #a9791f, #e8b84b)", boxShadow: "0 0 8px rgba(232,184,75,0.4)" }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ─ HOLDINGS TAB ─ */}
              {activeTab === "holdings" && (
                <motion.div key="holdings" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>

                  {/* Summary strip */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Total Value", value: "$23,986", sub: "+$5,823 all time", color: "#e8b84b" },
                      { label: "24h P&L",     value: "+$1,842", sub: "+9.4% today",      color: "#10b981" },
                      { label: "Tokens Held", value: "5",       sub: "across 3 chains",  color: "#a855f7" },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl p-3" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}>
                        <p className="font-mono text-xs mb-1" style={{ color: "#6b6987" }}>{s.label}</p>
                        <p className="font-mono font-bold text-base" style={{ color: s.color }}>{s.value}</p>
                        <p className="font-mono text-xs" style={{ color: "rgba(200,185,155,0.45)" }}>{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Holdings table */}
                  <div className="rounded-2xl overflow-x-auto mb-5" style={{ border: "1px solid rgba(232,184,75,0.15)" }}>
                    {/* Table header */}
                    <div className="grid px-4 py-2.5" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: "rgba(232,184,75,0.04)", borderBottom: "1px solid rgba(232,184,75,0.1)" }}>
                      {["Token", "Qty", "Avg Buy", "Value", "P&L"].map(h => (
                        <span key={h} className="font-mono text-xs font-semibold" style={{ color: "#6b6987" }}>{h}</span>
                      ))}
                    </div>
                    {/* Rows */}
                    {HOLDINGS.map((h, i) => (
                      <motion.div
                        key={h.ticker}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="grid px-4 py-3 cursor-pointer transition-all items-center"
                        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: i < HOLDINGS.length - 1 ? "1px solid rgba(232,184,75,0.06)" : "none", background: "rgba(5,4,3,0.6)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,184,75,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(5,4,3,0.6)")}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: `${h.color}18`, border: `1px solid ${h.color}40` }}>
                            {h.icon}
                          </div>
                          <div>
                            <p className="font-mono text-sm font-semibold" style={{ color: "#f4f2ff" }}>{h.ticker}</p>
                            <p className="font-mono text-xs" style={{ color: "#6b6987" }}>{h.name}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs" style={{ color: "#a09880" }}>{h.qty}</span>
                        <span className="font-mono text-xs" style={{ color: "#a09880" }}>{h.avgBuy}</span>
                        <div>
                          <p className="font-mono text-sm font-semibold" style={{ color: "#f4f2ff" }}>{h.value}</p>
                          <p className="font-mono text-xs" style={{ color: "#6b6987" }}>{h.current}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {h.pos ? <ArrowUpRight size={12} color="#10b981" /> : <ArrowDownRight size={12} color="#ef4444" />}
                          <div>
                            <p className="font-mono text-sm font-bold" style={{ color: h.pos ? "#10b981" : "#ef4444" }}>{h.pnlPct}</p>
                            <p className="font-mono text-xs" style={{ color: h.pos ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)" }}>{h.pnl}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Allocation bars */}
                  <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <PieChart size={13} color="#e8b84b" />
                      <span className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: "#e8b84b" }}>Allocation</span>
                    </div>
                    {/* Stacked bar */}
                    <div className="flex rounded-full overflow-hidden h-3 mb-4" style={{ gap: 2 }}>
                      {HOLDINGS.map(h => (
                        <motion.div key={h.ticker} initial={{ width: 0 }} animate={{ width: `${h.alloc}%` }} transition={{ duration: 1, ease: [0.16,1,0.3,1] }}
                          style={{ background: h.color, height: "100%" }} title={`${h.ticker} ${h.alloc}%`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {HOLDINGS.map(h => (
                        <div key={h.ticker} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color }} />
                          <span className="font-mono text-xs" style={{ color: "#a09880" }}>{h.ticker}</span>
                          <span className="font-mono text-xs font-semibold" style={{ color: h.color }}>{h.alloc}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction history */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(232,184,75,0.12)" }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(232,184,75,0.1)", background: "rgba(232,184,75,0.04)" }}>
                      <div className="flex items-center gap-2">
                        <Clock size={12} color="#e8b84b" />
                        <span className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: "#e8b84b" }}>Transaction History</span>
                      </div>
                      <div className="flex gap-1">
                        {(["all","buy","sell"] as const).map(f => (
                          <button key={f} onClick={() => setTxFilter(f)}
                            className="font-mono text-xs rounded-full px-2.5 py-1 transition-all"
                            style={{ background: txFilter === f ? "rgba(232,184,75,0.18)" : "transparent", border: txFilter === f ? "1px solid rgba(232,184,75,0.4)" : "1px solid transparent", color: txFilter === f ? "#e8b84b" : "#6b6987" }}>
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    {TX_HISTORY.filter(tx => txFilter === "all" || tx.type === txFilter).map((tx, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between px-4 py-3 transition-all"
                        style={{ borderBottom: i < TX_HISTORY.length - 1 ? "1px solid rgba(232,184,75,0.06)" : "none", background: "rgba(5,4,3,0.6)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(232,184,75,0.04)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(5,4,3,0.6)")}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                            style={{ background: tx.type === "buy" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${tx.type === "buy" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                            {tx.type === "buy" ? <ArrowUpRight size={14} color="#10b981" /> : <ArrowDownRight size={14} color="#ef4444" />}
                          </div>
                          <div>
                            <p className="font-mono text-sm" style={{ color: "#f4f2ff" }}>{tx.detail}</p>
                            <p className="font-mono text-xs" style={{ color: "#6b6987" }}>{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm font-semibold" style={{ color: tx.type === "buy" ? "#10b981" : "#ef4444" }}>{tx.usd}</p>
                          <p className="font-mono text-xs" style={{ color: "#6b6987" }}>{tx.sol}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─ LAUNCHED TAB ─ */}
              {activeTab === "launched" && (
                <motion.div key="launched" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>Tokens Launched ({LAUNCHED_TOKENS.length})</span>
                    <button className="font-mono text-[0.55rem] tracking-widest uppercase px-3 py-1 rounded-full transition-all flex items-center gap-1"
                      style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)", color: "#e8b84b" }}>
                      <Zap size={9} /> Launch New
                    </button>
                  </div>
                  <div className="space-y-2">
                    {LAUNCHED_TOKENS.map((t, i) => (
                      <motion.div
                        key={t.ticker}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center justify-between p-4 rounded-2xl cursor-pointer group transition-all"
                        style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.1)" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,184,75,0.28)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(232,184,75,0.1)")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-display text-sm" style={{ background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.3)", color: "#e8b84b" }}>
                            {t.name[0]}
                          </div>
                          <div>
                            <p className="font-mono text-[0.62rem] text-white">{t.name}</p>
                            <p className="font-mono text-[0.5rem]" style={{ color: "#6b6987" }}>${t.ticker}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-mono text-[0.62rem]" style={{ color: "#f4f2ff" }}>{t.mcap}</p>
                            <p className="font-mono text-[0.55rem]" style={{ color: "#10b981" }}>{t.change}</p>
                          </div>
                          <span className="font-mono text-[0.52rem] px-2 py-0.5 rounded-full" style={{ color: t.statusColor, background: `${t.statusColor}15`, border: `1px solid ${t.statusColor}40` }}>
                            {t.status}
                          </span>
                          <ChevronRight size={12} style={{ color: "#6b6987" }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─ SOCIAL TAB ─ */}
              {activeTab === "social" && (
                <motion.div key="social" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
                  <p className="font-mono text-[0.58rem] tracking-widest uppercase mb-3" style={{ color: "#6b6987" }}>Community Posts</p>
                  {[
                    { text: "Just aped into $LDOGE at launch. This creator's track record speaks for itself. 🔥", time: "15m ago", likes: 24 },
                    { text: "That ACAT call was clean. +142% in 2 days. Trust the process.", time: "2h ago", likes: 87 },
                    { text: "GM. Watching $NOVA closely. Narrative is strong.", time: "1d ago", likes: 41 },
                  ].map((post, i) => (
                    <div key={i} className="mb-3 p-4 rounded-2xl" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.1)" }}>
                      <p className="font-body text-xs mb-2" style={{ color: "#c4b5fd" }}>{post.text}</p>
                      <div className="flex justify-between">
                        <span className="font-mono text-[0.5rem]" style={{ color: "#6b6987" }}>{post.time}</span>
                        <span className="font-mono text-[0.55rem]" style={{ color: "#e8b84b" }}>❤️ {post.likes}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─ ACTIVITY TIMELINE ─ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
          className="rounded-3xl p-5 relative overflow-hidden flex flex-col"
          style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.2)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />

          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} style={{ color: "#e8b84b" }} />
            <span className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>Activity</span>
          </div>

          <div className="relative flex-1">
            {/* Timeline line */}
            <div className="absolute left-[14px] top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(232,184,75,0.4), rgba(232,184,75,0.05))" }} />

            <div className="space-y-4">
              {TIMELINE.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="pl-9 relative"
                >
                  {/* Dot */}
                  <div className="absolute left-[7px] top-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: `${event.color}18`, border: `1px solid ${event.color}60`, boxShadow: `0 0 8px ${event.color}30` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: event.color }} />
                  </div>
                  <p className="font-mono text-[0.55rem] tracking-widest uppercase mb-0.5" style={{ color: event.color }}>{event.label}</p>
                  <p className="font-mono text-[0.62rem] text-white leading-snug">{event.detail}</p>
                  <p className="font-mono text-[0.5rem] mt-0.5" style={{ color: "#6b6987" }}>{event.time}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
