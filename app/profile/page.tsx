"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  User, Wallet, Copy, Check, Share2, ExternalLink,
  Globe, MessageCircle, Rocket, BarChart2,
  ArrowUpRight, ArrowDownRight, Clock,
  Users, Crown, Flame, Award, Activity, ChevronRight,
  TrendingUp, Star, Zap, Target
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import { useMoonWallet } from "@/components/WalletProvider";
import { useWalletModal } from "@/components/SolanaProvider";
import { useTheme } from "@/components/ThemeProvider";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

const HOLDINGS = [
  { icon: "🐕", name: "Luna Doge",  ticker: "LDOGE", qty: "1,200,000", value: "$2,808", pnl: "+$1,969", pnlPct: "+141.2%", pos: true,  color: "#F59E0B", sparkline: [8,12,19,25,31,44,52,71,65,89,95,110] },
  { icon: "🧠", name: "NeuralFi",   ticker: "NFI",   qty: "4,500",     value: "$6,390", pnl: "+$1,350", pnlPct: "+26.8%",  pos: true,  color: "#8B5CF6", sparkline: [50,55,58,62,60,65,70,72,75,80,82,88] },
  { icon: "🚀", name: "RocketDoge", ticker: "RDOGE", qty: "500,000",   value: "$1,240", pnl: "-$310",   pnlPct: "-20.0%",  pos: false, color: "#F43F5E", sparkline: [80,75,70,65,60,55,50,45,48,42,38,35] },
  { icon: "⚡", name: "NovaFlux",   ticker: "NVFX",  qty: "12,000",    value: "$534",   pnl: "+$78",    pnlPct: "+17.1%",  pos: true,  color: "#10B981", sparkline: [30,35,38,42,48,52,58,65,70,68,75,80] },
];

const ACHIEVEMENTS = [
  { title: "Early Hunter",   icon: "🎯", rarity: "LEGENDARY", color: "#F59E0B", unlocked: true  },
  { title: "Whale Status",   icon: "🐋", rarity: "EPIC",      color: "#6366F1", unlocked: true  },
  { title: "Diamond Hands",  icon: "💎", rarity: "RARE",      color: "#06B6D4", unlocked: true  },
  { title: "Alpha Caller",   icon: "📡", rarity: "EPIC",      color: "#8B5CF6", unlocked: true  },
  { title: "Volume Titan",   icon: "⚡", rarity: "RARE",      color: "#10B981", unlocked: true  },
  { title: "Graduation Day", icon: "🎓", rarity: "LEGENDARY", color: "#F59E0B", unlocked: false },
];

const ACTIVITY_FEED = [
  { type: "buy",    icon: "💚", ticker: "LDOGE", amount: "12.4 SOL",  time: "2h ago",  desc: "Bought 1.2M Luna Doge" },
  { type: "launch", icon: "🚀", ticker: "ACAT",  amount: "",          time: "1d ago",  desc: "Launched AstroCat" },
  { type: "sell",   icon: "🔴", ticker: "RDOGE", amount: "3.1 SOL",   time: "3d ago",  desc: "Sold 200K RocketDoge" },
  { type: "vote",   icon: "⚔️", ticker: "",      amount: "",          time: "5d ago",  desc: "Voted in Arena battle" },
  { type: "buy",    icon: "💚", ticker: "NVFX",  amount: "4.8 SOL",   time: "1w ago",  desc: "Bought 12K NovaFlux" },
];

const CREATED_TOKENS = [
  { icon: "🐕", name: "Luna Doge", ticker: "LDOGE", status: "Graduated", mcap: "$1.87M", holders: 8341, progress: 100, color: "#F59E0B" },
  { icon: "🐱", name: "AstroCat",  ticker: "ACAT",  status: "Live",      mcap: "$440K",  holders: 2901, progress: 68,  color: "#8B5CF6" },
];

// ── Stat pill component ───────────────────────────────────────────────────────
function StatPill({ label, value, color = "text-[var(--color-text-primary)]" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`font-black font-mono text-sm ${color}`}>{value}</span>
      <span className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showToast } = useToast();
  const { connected, address } = useMoonWallet();
  const { setModalOpen } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"portfolio" | "activity" | "badges">("portfolio");
  const [roastData, setRoastData] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const displayName = connected && address ? `${address.slice(0,4)}...${address.slice(-4)}` : "DegenDave";
  const handle = connected && address ? address.slice(0, 8) : "degendave";

  const handleCopy = () => {
    if (address) { navigator.clipboard.writeText(address); }
    setCopied(true);
    showToast("Address copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoast = async () => {
    setIsRoasting(true);
    try {
      const res = await fetch("/api/roast-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address || "degendave.sol" }),
      });
      const data = await res.json();
      setRoastData(data.roast);
    } catch {
      showToast("Roast failed.", "error");
    } finally {
      setIsRoasting(false);
    }
  };

  const glass = isDark
    ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)]"
    : "bg-white/70 border-gray-200/80";

  const glassHover = isDark
    ? "hover:bg-[rgba(99,102,241,0.06)] hover:border-[rgba(99,102,241,0.25)]"
    : "hover:bg-indigo-50/60 hover:border-indigo-300/60";

  const TABS = [
    { id: "portfolio", label: "Portfolio", icon: BarChart2 },
    { id: "activity",  label: "Activity",  icon: Activity  },
    { id: "badges",    label: "Badges",    icon: Award     },
  ] as const;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-2 pb-24 overflow-x-hidden">

      {/* ─────────────────────────────────────────────────────────────────
          HERO — cinematic full-width banner with integrated identity
      ───────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className={`relative w-full rounded-2xl overflow-hidden mb-6 border backdrop-blur-xl ${glass}`}
      >
        {/* Animated banner background */}
        <div className="relative h-36 sm:h-44 overflow-hidden">
          <div className={`absolute inset-0 ${isDark
            ? "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]"
            : "bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50"
          }`} />
          {/* Glow orbs */}
          <div className="absolute -left-10 top-0 w-56 h-56 bg-[#6366F1] rounded-full blur-[100px] opacity-30" />
          <div className="absolute right-20 -top-8 w-40 h-40 bg-[#8B5CF6] rounded-full blur-[80px] opacity-20" />
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#06B6D4] rounded-full blur-[70px] opacity-15" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          {/* Username watermark top right */}
          <div className="absolute top-4 right-4 text-[10px] font-mono tracking-[0.3em] uppercase opacity-30 text-[var(--color-text-primary)]">
            moonflux // profile
          </div>
        </div>

        {/* Identity bar — overlaps banner bottom */}
        <div className="relative px-4 sm:px-6 pb-5 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            {/* Avatar + name */}
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-[-4px] rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] blur-[8px] opacity-60" />
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-4 shadow-xl ${
                  isDark ? "bg-[#0d0b1a] border-[#6366F1]" : "bg-indigo-50 border-[#6366F1]"
                }`}>
                  <User className="w-9 h-9 sm:w-11 sm:h-11 text-[#818CF8]" />
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#10B981] rounded-full border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                </div>
                {/* Level badge */}
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  LVL 42
                </div>
              </div>

              {/* Name block */}
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="text-lg sm:text-2xl font-black font-display text-[var(--color-text-primary)] tracking-tight">
                    {displayName}
                  </h1>
                  <span className="text-[10px] bg-[#6366F1] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)]">Pro</span>
                  <span className="text-[10px] bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded-full font-bold uppercase border border-[rgba(16,185,129,0.3)]">✓ Verified</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-mono">
                  <span className="text-[#818CF8]">@{handle}</span>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Joined Jul 2024</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-1">
              {connected ? (
                <>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                      isDark ? "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.25)] text-[#818CF8] hover:bg-[rgba(99,102,241,0.18)]"
                             : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Link copied!", "success"); }}
                    className={`p-2 rounded-xl text-xs border transition-all active:scale-95 ${
                      isDark ? "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                             : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-[#6366F1] text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-[#4F46E5] transition-all active:scale-95"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
            Full-degen alpha hunter on Solana 🎯 · Top 5% Creator on MoonFluxx · Graduated 2 tokens to Raydium · Trading since 2021
          </p>

          {/* Stats strip */}
          <div className={`mt-4 pt-4 border-t flex items-center gap-6 sm:gap-10 flex-wrap ${isDark ? "border-[rgba(255,255,255,0.05)]" : "border-gray-100"}`}>
            <StatPill label="Followers"  value="—"        />
            <StatPill label="Following"  value="124"      />
            <StatPill label="Win Rate"   value="68%"      color="text-[#10B981]" />
            <StatPill label="Launched"   value="2 Tokens" color="text-[#818CF8]" />
            <StatPill label="Vol. Traded" value="42 SOL"  color="text-[#F59E0B]" />
            {/* XP Progress */}
            <div className="flex-1 min-w-[120px] hidden sm:block">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--color-text-faint)]"><Crown className="w-3 h-3 inline text-[#F59E0B]" /> Lv42 Diamond Trader</span>
                <span className="text-[#818CF8]">94.2K XP</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(99,102,241,0.12)]" : "bg-indigo-100"}`}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: "75%" }}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-[0_0_8px_#6366F1]"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
          BENTO METRICS GRID
      ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Net Worth", value: "$10,972", sub: "+$1,987 today",
            subColor: "text-[#10B981]", icon: Wallet, iconColor: "#10B981",
            gradient: "from-[#10B981]/10 to-transparent",
          },
          {
            label: "24h PnL", value: "+$1,987", sub: "+22.1%",
            subColor: "text-[#10B981]", icon: TrendingUp, iconColor: "#10B981",
            gradient: "from-[#10B981]/8 to-transparent",
          },
          {
            label: "All-Time PnL", value: "+$4,240", sub: "Since Jul 2024",
            subColor: "text-[var(--color-text-faint)]", icon: BarChart2, iconColor: "#818CF8",
            gradient: "from-[#6366F1]/8 to-transparent",
          },
          {
            label: "AI Risk Score", value: "6.2/10", sub: "Moderate Degen",
            subColor: "text-[#F59E0B]", icon: Zap, iconColor: "#F59E0B",
            gradient: "from-[#F59E0B]/8 to-transparent",
          },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, ease: EASE }}
            className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all ${glass} ${glassHover}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} pointer-events-none`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[var(--color-text-faint)] uppercase font-mono tracking-wider">{m.label}</span>
                <m.icon className="w-4 h-4 opacity-50" style={{ color: m.iconColor }} />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-[var(--color-text-primary)] leading-none mb-1">{m.value}</div>
              <div className={`text-xs font-mono ${m.subColor}`}>{m.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TABS
      ───────────────────────────────────────────────────────────────── */}
      <div className={`flex gap-0 mb-5 rounded-xl overflow-hidden border p-1 w-fit ${isDark ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)]" : "bg-gray-100/80 border-gray-200"}`}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                active
                  ? isDark ? "bg-[rgba(99,102,241,0.2)] text-[var(--color-text-primary)] shadow-[inset_0_0_12px_rgba(99,102,241,0.2)]"
                           : "bg-white text-gray-900 shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {active && <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-lg border border-[rgba(99,102,241,0.4)]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB CONTENT
      ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── PORTFOLIO ── */}
        {activeTab === "portfolio" && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ ease: EASE, duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Holdings — takes 2 cols */}
              <div className={`lg:col-span-2 rounded-2xl border overflow-hidden backdrop-blur-xl ${glass}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-100"}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2 text-sm">
                    <BarChart2 className="w-4 h-4 text-[#6366F1]" /> Holdings
                  </h3>
                  <span className="text-xs text-[var(--color-text-faint)] font-mono">{HOLDINGS.length} assets · $10,972</span>
                </div>
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {HOLDINGS.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ease: EASE }}
                      className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                        isDark ? "hover:bg-[rgba(99,102,241,0.05)]" : "hover:bg-indigo-50/40"
                      }`}
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border" style={{ backgroundColor: `${h.color}15`, borderColor: `${h.color}30` }}>
                        {h.icon}
                      </div>
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[var(--color-text-primary)] text-sm truncate">{h.name}</div>
                        <div className="text-[var(--color-text-faint)] font-mono text-[10px]">{h.qty}</div>
                      </div>
                      {/* Sparkline */}
                      <div className="w-16 h-8 hidden sm:block shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={h.sparkline.map((v, i) => ({ x: i, y: v }))}>
                            <Line type="monotone" dataKey="y" stroke={h.pos ? "#10B981" : "#F43F5E"} strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Value */}
                      <div className="text-right shrink-0">
                        <div className="font-black font-mono text-sm text-[var(--color-text-primary)]">{h.value}</div>
                        <div className={`text-[11px] font-mono font-bold flex items-center justify-end gap-0.5 ${h.pos ? "text-[#10B981]" : "text-[#F43F5E]"}`}>
                          {h.pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {h.pnlPct}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right column: Allocation + Created tokens */}
              <div className="flex flex-col gap-4">
                {/* Allocation */}
                <div className={`rounded-2xl border p-5 backdrop-blur-xl ${glass}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#F59E0B]" /> Allocation
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Meme",  pct: 45, color: "#F59E0B" },
                      { label: "AI",    pct: 32, color: "#8B5CF6" },
                      { label: "SOL",   pct: 18, color: "#06B6D4" },
                      { label: "Stake", pct: 5,  color: "#10B981" },
                    ].map((a, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--color-text-muted)]">{a.label}</span>
                          <span className="font-mono font-bold text-[var(--color-text-primary)]">{a.pct}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.06)]" : "bg-gray-100"}`}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${a.pct}%` }}
                            transition={{ duration: 0.8, ease: EASE, delay: 0.1 * i }}
                            className="h-full rounded-full" style={{ backgroundColor: a.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creator quick stats */}
                <div className={`rounded-2xl border p-5 backdrop-blur-xl ${glass}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-[#10B981]" /> Created Tokens
                  </h3>
                  <div className="space-y-3">
                    {CREATED_TOKENS.map((t, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDark ? "border-[rgba(255,255,255,0.06)] hover:border-[rgba(99,102,241,0.25)]" : "border-gray-100 hover:border-indigo-200"}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border" style={{ backgroundColor: `${t.color}15`, borderColor: `${t.color}30` }}>{t.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[var(--color-text-primary)] text-xs truncate">{t.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className={`h-1 rounded-full flex-1 overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.06)]" : "bg-gray-100"}`}>
                              <div className="h-full bg-[#6366F1]" style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-[#818CF8] shrink-0">{t.progress}%</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${t.status === "Graduated" ? "text-[#10B981] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)]" : "text-[#818CF8] bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.3)]"}`}>
                          {t.status === "Graduated" ? "🎓" : "●"} {t.status}
                        </span>
                      </div>
                    ))}
                    <Link href="/launch">
                      <div className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${isDark ? "border-[rgba(99,102,241,0.2)] text-[var(--color-text-muted)] hover:border-[rgba(99,102,241,0.4)] hover:text-[#818CF8]" : "border-indigo-200 text-indigo-500 hover:bg-indigo-50"}`}>
                        <span>+ Launch New Token</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVITY ── */}
        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ ease: EASE, duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Feed */}
              <div className={`lg:col-span-2 rounded-2xl border overflow-hidden backdrop-blur-xl ${glass}`}>
                <div className={`px-5 py-4 border-b ${isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-100"}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#F59E0B]" /> Recent Activity
                  </h3>
                </div>
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {ACTIVITY_FEED.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ease: EASE }}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${isDark ? "hover:bg-[rgba(255,255,255,0.02)]" : "hover:bg-gray-50/60"}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border ${
                        item.type === "buy"    ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)]" :
                        item.type === "sell"   ? "bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.2)]"  :
                        item.type === "launch" ? "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.2)]" :
                                                 "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]"
                      }`}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[var(--color-text-primary)] text-sm">{item.desc}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.ticker && <span className="text-[#818CF8] font-mono text-[10px] font-bold">${item.ticker}</span>}
                          <span className="text-[var(--color-text-faint)] text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{item.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.amount && <span className={`font-mono text-xs font-bold ${item.type === "buy" ? "text-[#10B981]" : "text-[#F43F5E]"}`}>{item.amount}</span>}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.type === "buy"    ? "bg-[rgba(16,185,129,0.15)] text-[#10B981]" :
                          item.type === "sell"   ? "bg-[rgba(244,63,94,0.15)] text-[#F43F5E]"  :
                          item.type === "launch" ? "bg-[rgba(99,102,241,0.15)] text-[#818CF8]" :
                                                   "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]"
                        }`}>{item.type}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Roast Panel */}
              <div className={`rounded-2xl border overflow-hidden backdrop-blur-xl relative ${isDark ? "bg-[rgba(244,63,94,0.04)] border-[rgba(244,63,94,0.2)]" : "bg-red-50/60 border-red-200"}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.08),transparent_60%)] pointer-events-none" />
                <div className={`px-5 py-4 border-b relative z-10 ${isDark ? "border-[rgba(244,63,94,0.15)]" : "border-red-100"}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#F43F5E]" /> AI Wallet Roast
                  </h3>
                </div>
                <div className="p-5 relative z-10">
                  {roastData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-[var(--color-text-primary)]">{roastData.persona}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-black font-mono text-[#F43F5E]">{roastData.portfolioScore}</div>
                          <div className="text-[9px] text-[var(--color-text-faint)] uppercase">score</div>
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed border-l-2 border-[#F43F5E] pl-3 ${isDark ? "text-[#F1F5F9]" : "text-gray-800"}`}>
                        "{roastData.roast}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className={`text-center rounded-xl p-2 border ${isDark ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]" : "bg-white border-gray-100"}`}>
                          <div className="text-sm font-mono font-black text-[#10B981]">{roastData.winRate}</div>
                          <div className="text-[9px] text-[var(--color-text-faint)] uppercase">Win Rate</div>
                        </div>
                        <div className={`text-center rounded-xl p-2 border ${isDark ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]" : "bg-white border-gray-100"}`}>
                          <div className="text-sm font-mono font-black text-[#F43F5E]">{roastData.rugCount}x</div>
                          <div className="text-[9px] text-[var(--color-text-faint)] uppercase">Rugged</div>
                        </div>
                      </div>
                      <button onClick={() => setRoastData(null)} className="text-[10px] text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)] transition-colors">
                        ← Roast again
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3 opacity-50">🤖</div>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-5">
                        Let the AI brutally analyze your on-chain history. Warning: no mercy.
                      </p>
                      <button
                        onClick={handleRoast}
                        disabled={isRoasting}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 disabled:opacity-50 ${
                          isDark ? "bg-[rgba(244,63,94,0.15)] text-[#F43F5E] border-[rgba(244,63,94,0.35)] hover:bg-[rgba(244,63,94,0.25)]"
                                 : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                        }`}
                      >
                        {isRoasting ? "⏳ Analyzing..." : "🔥 Roast My Wallet"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BADGES ── */}
        {activeTab === "badges" && (
          <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ ease: EASE, duration: 0.3 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((ach, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07, ease: EASE }}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all group cursor-default ${
                    ach.unlocked
                      ? `${glass} ${glassHover} hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]`
                      : `${glass} opacity-40 grayscale`
                  }`}
                >
                  {ach.unlocked && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ backgroundColor: ach.color }} />
                  )}
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{ach.icon}</div>
                  <div className="font-bold text-[var(--color-text-primary)] text-xs mb-1 leading-tight">{ach.title}</div>
                  <span
                    className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border"
                    style={ach.unlocked ? { color: ach.color, backgroundColor: `${ach.color}18`, borderColor: `${ach.color}40` } : {}}
                  >
                    {ach.unlocked ? ach.rarity : "🔒 LOCKED"}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats summary */}
            <div className={`mt-4 rounded-2xl border p-5 backdrop-blur-xl ${glass}`}>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-black font-mono text-[#F59E0B]">5</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Badges Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">Level 42</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Diamond Trader</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-[#818CF8]">94.2K</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Total XP</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
