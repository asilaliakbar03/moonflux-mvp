"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  User, Wallet, Activity, Award, Zap, TrendingUp, TrendingDown,
  Flame, Star, Crown, Copy, Check, Share2, Edit3, ExternalLink,
  Globe, MessageCircle, Rocket, Shield, BarChart2,
  ChevronRight, ArrowUpRight, ArrowDownRight, Calendar, Clock,
  Users, Bot, Bookmark, Target, Link2
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

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const HOLDINGS = [
  { icon: "🐕", name: "Luna Doge",  ticker: "LDOGE", qty: "1,200,000", avgBuy: "$0.00097", current: "$0.00234", value: "$2,808", pnl: "+$1,969", pnlPct: "+141.2%", pos: true,  color: "#F59E0B", sparkline: [8,12,19,25,31,44,52,71,65,89,95,110] },
  { icon: "🧠", name: "NeuralFi",   ticker: "NFI",   qty: "4,500",     avgBuy: "$1.12",    current: "$1.42",    value: "$6,390", pnl: "+$1,350", pnlPct: "+26.8%",  pos: true,  color: "#8B5CF6", sparkline: [50,55,58,62,60,65,70,72,75,80,82,88] },
  { icon: "🚀", name: "RocketDoge", ticker: "RDOGE", qty: "500,000",   avgBuy: "$0.00310", current: "$0.00248", value: "$1,240", pnl: "-$310",   pnlPct: "-20.0%",  pos: false, color: "#F43F5E", sparkline: [80,75,70,65,60,55,50,45,48,42,38,35] },
  { icon: "⚡", name: "NovaFlux",   ticker: "NVFX",  qty: "12,000",    avgBuy: "$0.038",   current: "$0.0445",  value: "$534",  pnl: "+$78",    pnlPct: "+17.1%",  pos: true,  color: "#10B981", sparkline: [30,35,38,42,48,52,58,65,70,68,75,80] },
];

const ACHIEVEMENTS = [
  { title: "Early Hunter",   desc: "Top 100 buyer in 5 launches",             icon: "🎯", rarity: "LEGENDARY", color: "#F59E0B", unlocked: true  },
  { title: "Whale Status",   desc: "Deployed over 100 SOL in a single trade", icon: "🐋", rarity: "EPIC",      color: "#6366F1", unlocked: true  },
  { title: "Diamond Hands",  desc: "Held through 80% drawdown and recovered", icon: "💎", rarity: "RARE",      color: "#06B6D4", unlocked: true  },
  { title: "Alpha Caller",   desc: "Predicted 3 tokens before 10x",           icon: "📡", rarity: "EPIC",      color: "#8B5CF6", unlocked: true  },
  { title: "Volume Titan",   desc: "50+ SOL traded in one week",              icon: "⚡", rarity: "RARE",      color: "#10B981", unlocked: true  },
  { title: "Graduation Day", desc: "Held a token that graduated to DEX",      icon: "🎓", rarity: "LEGENDARY", color: "#F59E0B", unlocked: false },
];

const CREATED_TOKENS = [
  { icon: "🐕", name: "Luna Doge", ticker: "LDOGE", status: "Graduated", mcap: "$1.87M", holders: 8341, progress: 100, date: "2w ago", color: "#F59E0B" },
  { icon: "🐱", name: "AstroCat",  ticker: "ACAT",  status: "Live",      mcap: "$440K",  holders: 2901, progress: 68,  date: "1mo ago", color: "#8B5CF6" },
];

const ACTIVITY_FEED = [
  { type: "buy",    icon: "💚", token: "Luna Doge",  ticker: "LDOGE", amount: "12.4 SOL",  time: "2h ago",   desc: "Bought 1.2M tokens" },
  { type: "launch", icon: "🚀", token: "AstroCat",   ticker: "ACAT",  amount: "",          time: "1d ago",   desc: "Launched new token" },
  { type: "sell",   icon: "🔴", token: "RocketDoge", ticker: "RDOGE", amount: "3.1 SOL",   time: "3d ago",   desc: "Sold 200K tokens" },
  { type: "vote",   icon: "⚔️", token: "Arena Battle", ticker: "",    amount: "",          time: "5d ago",   desc: "Voted in Arena vs. DegenApe" },
  { type: "buy",    icon: "💚", token: "NovaFlux",   ticker: "NVFX",  amount: "4.8 SOL",   time: "1w ago",   desc: "Bought 12,000 tokens" },
  { type: "launch", icon: "🚀", token: "Luna Doge",  ticker: "LDOGE", amount: "",          time: "2w ago",   desc: "Launched Luna Doge — now graduated" },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showToast } = useToast();
  const { connected, address } = useMoonWallet();
  const { setModalOpen } = useWalletModal();
  const [activeTab, setActiveTab] = useState<"portfolio" | "tokens" | "activity" | "badges" | "roast">("portfolio");
  const [copied, setCopied] = useState(false);
  const [activityFilter, setActivityFilter] = useState<"all" | "trades" | "launches" | "social">("all");
  const [roastData, setRoastData] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "Not Connected";

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      showToast("Address copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
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
      showToast("Roast failed. The AI felt bad for you.", "error");
    } finally {
      setIsRoasting(false);
    }
  };

  const filteredActivity = ACTIVITY_FEED.filter(a => {
    if (activityFilter === "all") return true;
    if (activityFilter === "trades") return a.type === "buy" || a.type === "sell";
    if (activityFilter === "launches") return a.type === "launch";
    if (activityFilter === "social") return a.type === "vote";
    return true;
  });

  const TABS = [
    { id: "portfolio", label: "Portfolio",  icon: BarChart2,    color: "#6366F1" },
    { id: "tokens",    label: "Tokens",     icon: Rocket,       color: "#10B981" },
    { id: "activity",  label: "Activity",   icon: Activity,     color: "#F59E0B" },
    { id: "badges",    label: "Badges",     icon: Award,        color: "#8B5CF6" },
    { id: "roast",     label: "AI Roast",   icon: Flame,        color: "#F43F5E" },
  ] as const;

  const surface = isDark
    ? "bg-[rgba(5,5,16,0.80)] border-[rgba(99,102,241,0.10)]"
    : "bg-white/80 border-gray-200";

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 overflow-x-hidden">

      {/* ── COVER BANNER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative w-full h-40 sm:h-52 md:h-60 rounded-2xl overflow-hidden mb-0"
      >
        {/* Animated gradient mesh banner */}
        <div className={`absolute inset-0 ${isDark
          ? "bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.35)_0%,rgba(139,92,246,0.15)_40%,rgba(5,5,16,1)_100%)]"
          : "bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.2)_0%,rgba(139,92,246,0.1)_40%,rgba(240,240,255,1)_100%)]"
        }`} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cpath d=M 0 30 L 60 30 M 30 0 L 30 60 stroke=rgba(99,102,241,0.06) stroke-width=1/%3E%3C/svg%3E')]" />

        {/* Glow orbs */}
        <div className="absolute top-8 left-1/4 w-32 h-32 bg-[#6366F1] rounded-full blur-[80px] opacity-20 animate-pulse" />
        <div className="absolute top-4 right-1/4 w-24 h-24 bg-[#8B5CF6] rounded-full blur-[60px] opacity-15 animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Banner label */}
        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-[rgba(255,255,255,0.3)] uppercase tracking-widest">
          MoonFluxx // Profile
        </div>
      </motion.div>

      {/* ── IDENTITY HEADER ──────────────────────────────────────────────── */}
      <div className="relative px-4 sm:px-6 -mt-14 sm:-mt-16 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

          {/* Avatar + identity */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#6366F1] blur-2xl opacity-40 animate-pulse" />
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-4 shadow-[0_0_40px_rgba(99,102,241,0.5)] ${isDark ? "bg-[rgba(30,25,60,0.95)] border-[#6366F1]" : "bg-indigo-50 border-[#6366F1]"}`}>
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#818CF8]" />
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              {/* Level badge */}
              <div className="absolute -top-1 -right-1 bg-[#F59E0B] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                Lv42
              </div>
            </div>

            {/* Name & handle */}
            <div className="pb-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-[var(--color-text-primary)] display-safe">
                  {connected && address ? `${address.slice(0,4)}...${address.slice(-4)}` : "DegenDave"}
                </h1>
                <span className="bg-[#6366F1] text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)] uppercase tracking-wider">Pro</span>
                <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[rgba(16,185,129,0.3)] uppercase tracking-wider">Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-mono text-sm flex-wrap">
                <span className="text-[#818CF8]">@{connected && address ? address.slice(0,8) : "degendave"}</span>
                <span className="text-[var(--color-text-faint)]">·</span>
                <div className="flex items-center gap-1 text-[var(--color-text-faint)] text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>Joined Jul 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pb-2 flex-wrap">
            {!connected ? (
              <MagneticButton as="div" strength={0.3}>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-5 py-2 rounded-full bg-[#6366F1] text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-[#4F46E5] transition-all active:scale-[0.97] border border-[#818CF8]"
                >
                  Connect Wallet
                </button>
              </MagneticButton>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border active:scale-[0.97] ${isDark ? "bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.25)] text-[#818CF8] hover:bg-[rgba(99,102,241,0.2)]" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"}`}
                >
                  {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  <span className="font-mono text-xs hidden sm:inline">{shortAddr}</span>
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Profile link copied!", "success"); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border active:scale-[0.97] ${isDark ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)]" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio & social links */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[var(--color-text-secondary)] text-sm max-w-lg leading-relaxed">
            Full-degen alpha hunter on Solana. 🎯 Top 5% Creator on MoonFluxx. Trading since 2021. Graduated 2 tokens to Raydium.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-[#94A3B8] hover:text-[#1DA1F2] transition-colors"><Link2 className="w-4 h-4" /></a>
            <a href="#" className="text-[#94A3B8] hover:text-[#818CF8] transition-colors"><MessageCircle className="w-4 h-4" /></a>
            <a href="#" className="text-[#94A3B8] hover:text-[var(--color-text-primary)] transition-colors"><Globe className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Stats row */}
        <div className={`mt-5 flex items-center gap-6 sm:gap-10 pt-5 border-t ${isDark ? "border-[rgba(255,255,255,0.06)]" : "border-gray-200"} flex-wrap`}>
          {[
            { label: "Followers",  value: "--",   color: "text-[var(--color-text-primary)]" },
            { label: "Following",  value: "124",  color: "text-[var(--color-text-primary)]" },
            { label: "Win Rate",   value: "68%",  color: "text-[#10B981]" },
            { label: "Tokens Made", value: "2",   color: "text-[#818CF8]" },
            { label: "Volume",     value: "42 SOL", color: "text-[#F59E0B]" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className={`font-bold text-base ${s.color} font-mono`}>{s.value}</span>
              <span className="text-[var(--color-text-faint)] text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── NET WORTH BANNER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: EASE }}
        className={`mx-4 sm:mx-6 mb-6 backdrop-blur-2xl border rounded-2xl p-5 sm:p-6 relative overflow-hidden ${surface}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(99,102,241,0.06),transparent_60%)]" />
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase font-mono tracking-wider mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Net Worth</div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--color-text-primary)]">$10,972</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[#10B981] text-xs font-bold font-mono">+$1,987 (+22.1%) today</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase font-mono tracking-wider mb-1">24h PnL</div>
            <div className="text-2xl font-mono font-black text-[#10B981]">+$1,987</div>
            <div className="text-xs text-[var(--color-text-faint)] font-mono mt-1">Past 24 hours</div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase font-mono tracking-wider mb-1">All-Time PnL</div>
            <div className="text-2xl font-mono font-black text-[#10B981]">+$4,240</div>
            <div className="text-xs text-[var(--color-text-faint)] font-mono mt-1">Since joining</div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-muted)] uppercase font-mono tracking-wider mb-1">AI Risk Score</div>
            <div className="text-2xl font-mono font-black text-[#F59E0B]">6.2<span className="text-sm text-[var(--color-text-muted)]">/10</span></div>
            <div className="text-xs text-[#F59E0B] font-mono mt-1">Moderate Degen</div>
          </div>
        </div>

        {/* XP bar */}
        <div className={`relative z-10 mt-5 pt-5 border-t ${isDark ? "border-[rgba(255,255,255,0.05)]" : "border-gray-100"}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Crown className="w-4 h-4 text-[#F59E0B]" />
              <span className="font-bold text-[var(--color-text-primary)]">Level 42</span>
              <span>· Diamond Trader</span>
            </div>
            <span className="text-[#818CF8] font-mono font-bold text-sm">94,200 / 125,000 XP</span>
          </div>
          <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-[rgba(99,102,241,0.1)]" : "bg-indigo-100"} border border-[rgba(99,102,241,0.2)]`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              className="h-full bg-[#6366F1] shadow-[0_0_12px_#6366F1]"
            />
          </div>
        </div>
      </motion.div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div className={`mx-4 sm:mx-6 mb-6 flex gap-1 p-1 rounded-xl border overflow-x-auto scrollbar-hide ${isDark ? "bg-[rgba(5,5,16,0.6)] border-[rgba(99,102,241,0.1)]" : "bg-gray-100 border-gray-200"}`}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all flex-1 justify-center focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${
                isActive
                  ? isDark ? "bg-[rgba(99,102,241,0.15)] text-[var(--color-text-primary)] shadow-[0_0_12px_rgba(99,102,241,0.2)]" : "bg-white text-gray-900 shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {isActive && (
                <motion.div layoutId="tab-indicator" className="absolute inset-0 rounded-lg border border-[rgba(99,102,241,0.3)]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
              <Icon className="w-4 h-4 relative z-10" style={{ color: isActive ? tab.color : undefined }} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6">
        <AnimatePresence mode="wait">

          {/* ─── PORTFOLIO TAB ─── */}
          {activeTab === "portfolio" && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE, duration: 0.35 }} className="flex flex-col gap-6">

              {/* Holdings table */}
              <div className={`backdrop-blur-2xl border rounded-2xl overflow-hidden ${surface}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-[rgba(255,255,255,0.05)]" : "border-gray-100"}`}>
                  <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#6366F1]" /> Holdings
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">{HOLDINGS.length} assets</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`text-xs font-mono uppercase border-b ${isDark ? "border-[rgba(255,255,255,0.04)] text-[#475569] bg-[rgba(255,255,255,0.02)]" : "border-gray-100 text-gray-400 bg-gray-50"}`}>
                        <th className="px-5 py-3">Asset</th>
                        <th className="px-5 py-3 hidden sm:table-cell">Balance</th>
                        <th className="px-5 py-3">Value</th>
                        <th className="px-5 py-3 hidden md:table-cell">Avg Buy</th>
                        <th className="px-5 py-3">PnL</th>
                        <th className="px-5 py-3 hidden lg:table-cell">Chart</th>
                        <th className="px-5 py-3 hidden md:table-cell"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {HOLDINGS.map((h, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07, ease: EASE }}
                          className={`border-b transition-colors ${isDark ? "border-[rgba(255,255,255,0.04)] hover:bg-[rgba(99,102,241,0.04)]" : "border-gray-50 hover:bg-indigo-50/30"}`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border" style={{ backgroundColor: `${h.color}18`, borderColor: `${h.color}30` }}>
                                {h.icon}
                              </div>
                              <div>
                                <div className="font-bold text-[var(--color-text-primary)] text-sm">{h.name}</div>
                                <div className="text-[var(--color-text-muted)] font-mono text-xs">${h.ticker}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-sm text-[var(--color-text-secondary)] hidden sm:table-cell">{h.qty}</td>
                          <td className="px-5 py-4 font-mono text-sm font-bold text-[var(--color-text-primary)]">{h.value}</td>
                          <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-muted)] hidden md:table-cell">{h.avgBuy}</td>
                          <td className="px-5 py-4">
                            <div className={`font-mono text-sm font-bold ${h.pos ? "text-[#10B981]" : "text-[#F43F5E]"}`}>
                              <div className="flex items-center gap-1">
                                {h.pos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {h.pnl}
                              </div>
                              <div className={`text-[10px] mt-0.5 px-1.5 py-0.5 rounded w-fit border ${h.pos ? "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)]" : "bg-[rgba(244,63,94,0.1)] border-[rgba(244,63,94,0.3)]"}`}>
                                {h.pnlPct}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <div className="w-20 h-10">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={h.sparkline.map((v, i) => ({ x: i, y: v }))}>
                                  <Line type="monotone" dataKey="y" stroke={h.pos ? "#10B981" : "#F43F5E"} strokeWidth={2} dot={false} isAnimationActive />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <Link href={`/token/tok_${h.ticker.toLowerCase()}`} className="text-xs text-[#818CF8] hover:text-[#6366F1] font-bold transition-colors flex items-center gap-1">
                              Trade <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allocation summary */}
              <div className={`backdrop-blur-2xl border rounded-2xl p-5 ${surface}`}>
                <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-[#F59E0B]" /> Portfolio Allocation
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Meme Coins", pct: 45, color: "#F59E0B" },
                    { label: "AI / DeFi",  pct: 32, color: "#8B5CF6" },
                    { label: "SOL Native", pct: 18, color: "#06B6D4" },
                    { label: "Staked",     pct: 5,  color: "#10B981" },
                  ].map((a, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[var(--color-text-secondary)]">{a.label}</span>
                        <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">{a.pct}%</span>
                      </div>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.06)]" : "bg-gray-100"}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${a.pct}%` }}
                          transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: a.color, boxShadow: `0 0 8px ${a.color}` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── CREATED TOKENS TAB ─── */}
          {activeTab === "tokens" && (
            <motion.div key="tokens" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE, duration: 0.35 }} className="flex flex-col gap-6">

              {/* Creator stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Tokens Launched", value: "2",    color: "#6366F1", icon: Rocket },
                  { label: "Total Holders",   value: "11.2K", color: "#10B981", icon: Users },
                  { label: "Success Rate",    value: "100%", color: "#F59E0B", icon: Star },
                  { label: "Creator Score",   value: "94",   color: "#8B5CF6", icon: Crown },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, ease: EASE }}
                    className={`backdrop-blur-2xl border rounded-2xl p-4 relative overflow-hidden ${surface}`}
                    style={{ borderLeftColor: s.color, borderLeftWidth: "3px" }}
                  >
                    <div className="absolute top-2 right-2 opacity-10">
                      <s.icon className="w-8 h-8" style={{ color: s.color }} />
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mb-1 font-mono uppercase">{s.label}</div>
                    <div className="text-2xl font-mono font-black" style={{ color: s.color }}>{s.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Token cards */}
              <div className="flex flex-col gap-4">
                {CREATED_TOKENS.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, ease: EASE }}
                    className={`backdrop-blur-2xl border rounded-2xl p-5 relative overflow-hidden hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] transition-all ${surface}`}
                  >
                    <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_60%)]" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border" style={{ backgroundColor: `${t.color}18`, borderColor: `${t.color}30` }}>
                          {t.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[var(--color-text-primary)] text-lg">{t.name}</span>
                            <span className="font-mono text-[#818CF8] text-sm">${t.ticker}</span>
                            {t.status === "Graduated" ? (
                              <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[rgba(16,185,129,0.3)] uppercase">🎓 Graduated</span>
                            ) : (
                              <span className="bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[rgba(99,102,241,0.3)] uppercase">Live</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] font-mono">
                            <span>MCap: <span className="text-[var(--color-text-primary)] font-bold">{t.mcap}</span></span>
                            <span>Holders: <span className="text-[var(--color-text-primary)] font-bold">{t.holders.toLocaleString()}</span></span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <div className="flex justify-between text-xs font-mono text-[var(--color-text-muted)]">
                          <span>Bonding Curve</span>
                          <span className="text-[#818CF8] font-bold">{t.progress}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.06)]" : "bg-gray-100"} border border-[rgba(99,102,241,0.2)]`}>
                          <div className="h-full bg-[#6366F1] shadow-[0_0_10px_#6366F1] transition-all" style={{ width: `${t.progress}%` }} />
                        </div>
                        <Link href={`/token/tok_${t.ticker.toLowerCase()}`}>
                          <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-[#818CF8] border border-[rgba(99,102,241,0.25)] hover:bg-[rgba(99,102,241,0.1)] transition-all">
                            View Token <ExternalLink className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty CTA */}
                <div className={`backdrop-blur-2xl border rounded-2xl p-8 text-center border-dashed ${isDark ? "border-[rgba(99,102,241,0.2)]" : "border-indigo-200"}`}>
                  <div className="text-4xl mb-3">🚀</div>
                  <div className="font-bold text-[var(--color-text-primary)] mb-1">Launch Your Next Token</div>
                  <div className="text-sm text-[var(--color-text-muted)] mb-4">Create a new token with AI assistance and ride the bonding curve to Raydium.</div>
                  <Link href="/launch">
                    <button className="px-6 py-2.5 bg-[#6366F1] text-white font-bold rounded-full shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-[#4F46E5] transition-all text-sm">
                      Launch Token
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ACTIVITY TAB ─── */}
          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE, duration: 0.35 }} className="flex flex-col gap-6">

              {/* Filter pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {(["all", "trades", "launches", "social"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all ${
                      activityFilter === f
                        ? "bg-[#6366F1] text-white border-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                        : `border-[rgba(99,102,241,0.15)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] ${isDark ? "bg-[rgba(99,102,241,0.05)]" : "bg-white"}`
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Feed */}
              <div className={`backdrop-blur-2xl border rounded-2xl overflow-hidden ${surface}`}>
                {filteredActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ease: EASE }}
                    className={`flex items-center gap-4 px-5 py-4 border-b transition-colors ${
                      isDark ? "border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]" : "border-gray-50 hover:bg-indigo-50/20"
                    } last:border-0`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.12)]">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--color-text-primary)] text-sm">{item.desc}</span>
                        {item.ticker && <span className="text-[#818CF8] font-mono text-xs">${item.ticker}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[var(--color-text-faint)] text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                        {item.amount && (
                          <span className={`text-xs font-mono font-bold ${item.type === "buy" ? "text-[#10B981]" : item.type === "sell" ? "text-[#F43F5E]" : "text-[#818CF8]"}`}>
                            {item.amount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                      item.type === "buy" ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" :
                      item.type === "sell" ? "bg-[rgba(244,63,94,0.1)] text-[#F43F5E]" :
                      item.type === "launch" ? "bg-[rgba(99,102,241,0.1)] text-[#818CF8]" :
                      "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"
                    }`}>{item.type}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── BADGES TAB ─── */}
          {activeTab === "badges" && (
            <motion.div key="badges" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE, duration: 0.35 }} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map((ach, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, ease: EASE }}
                    className={`relative overflow-hidden border rounded-2xl p-5 transition-all ${
                      ach.unlocked
                        ? `${isDark ? "bg-[rgba(5,5,16,0.80)]" : "bg-white"} hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] hover:-translate-y-0.5`
                        : `${isDark ? "bg-[rgba(5,5,16,0.40)]" : "bg-gray-50"} opacity-50 grayscale`
                    } ${isDark ? "border-[rgba(99,102,241,0.1)]" : "border-gray-200"}`}
                  >
                    {ach.unlocked && (
                      <>
                        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-[0.08]" style={{ backgroundColor: ach.color }} />
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#10B981]" />
                        </div>
                      </>
                    )}
                    <div className="text-4xl mb-3 drop-shadow-[0_0_10px_currentColor]" style={{ color: ach.color }}>{ach.icon}</div>
                    <h4 className="font-bold text-[var(--color-text-primary)] mb-1">{ach.title}</h4>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-3">{ach.desc}</p>
                    <span
                      className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border"
                      style={ach.unlocked ? { color: ach.color, backgroundColor: `${ach.color}18`, borderColor: `${ach.color}40` } : {}}
                    >
                      {ach.unlocked ? ach.rarity : "🔒 LOCKED"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── AI ROAST TAB ─── */}
          {activeTab === "roast" && (
            <motion.div key="roast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE, duration: 0.35 }} className="flex flex-col gap-6">
              <div className={`backdrop-blur-2xl border rounded-2xl p-6 sm:p-8 relative overflow-hidden ${isDark ? "bg-[rgba(5,5,16,0.80)] border-[rgba(244,63,94,0.25)]" : "bg-red-50 border-red-200"}`}>
                <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.8),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(244,63,94,0.15)] flex items-center justify-center border border-[rgba(244,63,94,0.3)]">
                        <Flame className="w-5 h-5 text-[#F43F5E]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-text-primary)]">AI Wallet Roast</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Let the AI analyze your on-chain behaviour. Warning: brutal.</p>
                      </div>
                    </div>
                    {!roastData && (
                      <MagneticButton as="div" strength={0.25}>
                        <button
                          onClick={handleRoast}
                          disabled={isRoasting}
                          className={`px-5 py-2 rounded-full font-bold text-sm border transition-all active:scale-[0.97] disabled:opacity-50 ${isDark ? "bg-[rgba(244,63,94,0.15)] text-[#F43F5E] border-[rgba(244,63,94,0.35)] hover:bg-[rgba(244,63,94,0.25)]" : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"}`}
                        >
                          {isRoasting ? "⏳ Roasting..." : "🔥 Roast Me"}
                        </button>
                      </MagneticButton>
                    )}
                  </div>

                  {roastData ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-xl font-bold text-[var(--color-text-primary)]">{roastData.persona}</h4>
                        <div className="text-right shrink-0">
                          <div className="text-3xl font-mono font-black text-[#F43F5E]">{roastData.portfolioScore}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">/ 100</div>
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed border-l-2 border-[#F43F5E] pl-4 py-1 ${isDark ? "text-[#F1F5F9]" : "text-gray-800"}`}>
                        "{roastData.roast}"
                      </p>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-lg font-mono font-bold text-[#10B981]">{roastData.winRate}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Win Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-mono font-bold text-[#F43F5E]">{roastData.rugCount}x</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Rugged</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-mono font-bold text-[#818CF8]">{roastData.portfolioScore}/100</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] uppercase">Score</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setRoastData(null)}
                        className={`text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mt-2`}
                      >
                        Roast again →
                      </button>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4 opacity-60">🤖</div>
                      <p className="text-[var(--color-text-muted)] text-sm max-w-xs mx-auto leading-relaxed">
                        The AI will analyze your on-chain history, portfolio choices, and trading patterns — then mercilessly roast you.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
