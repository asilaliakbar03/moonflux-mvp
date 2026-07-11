"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowUpRight,
  Rocket,
  Brain,
  Shield,
  BarChart3,
  ChevronRight,
  Compass,
  Sparkles,
} from "lucide-react";
import { ALL_TOKENS } from "@/lib/mock";
import { useMoonWallet } from "@/components/WalletProvider";
import { useSOLPrice } from "@/lib/useSOLPrice";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Sparkline ─────────────────────────────────────────────────────────────── */
function Sparkline({ data, color, w = 100, h = 20 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (!data.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace('#','')})`} opacity={0.1} />
    </svg>
  );
}

/* ── Format helpers ────────────────────────────────────────────────────────── */
function fmtPrice(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toPrecision(4)}`;
}
function fmtMcap(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* ── Narrative Radar Data ──────────────────────────────────────────────────── */
const NARRATIVES = [
  { name: "Dog Meta", score: 94, delta: 12, color: "#f97316" },
  { name: "Meme Season", score: 88, delta: 8, color: "#ffd369" },
  { name: "AI Agents", score: 81, delta: 15, color: "#d0bcff" },
  { name: "Gaming", score: 71, delta: -3, color: "#00dce5" },
];

/* ══════════════════════════════════════════════════════════════════════════════
   COMMAND CENTER — Main Dashboard
   ══════════════════════════════════════════════════════════════════════════════ */
export default function CommandCenter() {
  const { connected } = useMoonWallet();
  const { price: solPrice, change24h: solChange } = useSOLPrice();
  const solUp = solChange >= 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Sort tokens by 24h change for "Hot Right Now"
  const hotTokens = [...ALL_TOKENS].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  // Recent launches — sorted by date
  const recentLaunches = [...ALL_TOKENS]
    .sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())
    .slice(0, 4);

  if (!mounted) return null;

  return (
    <div className="max-w-[1340px] mx-auto space-y-10 pb-16">
      {/* ── HERO HEADER ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative rounded-2xl ct-glass-panel p-6 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Title */}
          <div className="space-y-1 relative z-10">
            <p
              className="uppercase tracking-[0.3em]"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}
            >
              MOONFLUXX • LIVE DASHBOARD
            </p>
            <h1
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, lineHeight: "56px", letterSpacing: "-0.02em", color: "#fff3e1" }}
            >
              Command Center
            </h1>
          </div>

          {/* Middle: Stats */}
          <div className="flex flex-wrap gap-4 relative z-10">
            <div className="p-4 rounded-xl min-w-[140px]" style={{ background: "#1c1b1c", border: "1px solid #4e4636" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}>SOL PRICE</p>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#ecc159" }}>
                ${solPrice.toFixed(2)}{" "}
                <span style={{ fontSize: 12, color: solUp ? "#22c55e" : "#ef4444" }}>{solUp ? "↑" : "↓"}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl min-w-[140px]" style={{ background: "#1c1b1c", border: "1px solid #4e4636" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}>24H VOL</p>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#00dce5" }}>$2.84B</p>
            </div>
            <div className="p-4 rounded-xl min-w-[140px]" style={{ background: "#1c1b1c", border: "1px solid #4e4636" }}>
              <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}>ACTIVE LAUNCHES</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <p style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#e5e2e3" }}>{ALL_TOKENS.length}</p>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex gap-3 relative z-10">
            <Link href="/launch">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm ct-flux-glow-primary"
                style={{ background: "#ffd369", color: "#775a00", fontFamily: "'Inter'" }}
              >
                <Rocket size={18} /> Launch Token
              </motion.button>
            </Link>
            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                style={{ border: "1px solid #4e4636", color: "#e5e2e3", fontFamily: "'Inter'" }}
              >
                <Compass size={18} /> Explore
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ── BENTO GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ═══ HOT RIGHT NOW (8 cols) ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="lg:col-span-8 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={20} style={{ color: "#ecc159" }} />
              <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#e5e2e3" }}>
                Hot Right Now
              </h2>
            </div>
            <div className="flex items-center gap-2" style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#22c55e", textTransform: "uppercase" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Updated Live
            </div>
          </div>

          <div className="ct-glass-panel rounded-2xl overflow-hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {hotTokens.map((token, i) => {
              const up = token.change24h > 0;
              return (
                <Link href={`/token/${token.id}`} key={token.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }}
                    className="flex items-center justify-between p-6 cursor-pointer group transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    whileHover={{ backgroundColor: "rgba(53,52,54,0.3)" }}
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      {/* Rank */}
                      <span style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ background: "#2a2a2b", border: "1px solid #4e4636" }}
                      >
                        <span className="text-xl">{token.icon || token.name.charAt(0)}</span>
                      </div>
                      {/* Name */}
                      <div className="min-w-0">
                        <h4 style={{ fontFamily: "'Inter'", fontSize: 16, fontWeight: 700, color: "#e5e2e3" }} className="truncate">
                          {token.name}
                        </h4>
                        <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d" }}>
                          ${token.ticker}
                        </p>
                      </div>
                    </div>
                    {/* Price + Change */}
                    <div className="hidden sm:flex flex-col items-end">
                      <p style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 500, color: "#e5e2e3" }}>
                        {fmtPrice(token.price)}
                      </p>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-mono"
                        style={{
                          background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                          color: up ? "#22c55e" : "#ef4444",
                          fontFamily: "'Space Grotesk'",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {up ? "+" : ""}{token.change24h.toFixed(1)}%
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="w-32 h-12 hidden md:block">
                      <Sparkline data={token.chartData ?? []} color={up ? "#22c55e" : "#ef4444"} />
                    </div>
                    {/* Chevron */}
                    <ChevronRight
                      size={20}
                      className="transition-all duration-200"
                      style={{ color: "#9a907d" }}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* ═══ SIDEBAR (4 cols) ═══ */}
        <div className="lg:col-span-4 space-y-5">
          {/* Portfolio Snapshot */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="ct-glass-panel rounded-2xl p-6 flex flex-col items-center text-center justify-center relative overflow-hidden"
            style={{ minHeight: 320 }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,243,225,0.03), rgba(0,220,229,0.03))" }} />
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 size={20} style={{ color: "#9a907d" }} />
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#e5e2e3" }}>
                  Portfolio Snapshot
                </h3>
              </div>
              <div className="my-6 flex justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center ct-flux-glow-primary"
                  style={{ background: "#2a2a2b", border: "1px solid #4e4636" }}
                >
                  <Shield size={32} style={{ color: "#ffd369" }} />
                </div>
              </div>
              {connected ? (
                <>
                  <p style={{ fontFamily: "'Inter'", fontSize: 16, fontWeight: 700, color: "#e5e2e3", marginBottom: 4 }}>
                    Portfolio Connected
                  </p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "#9a907d", marginBottom: 20, padding: "0 24px" }}>
                    Your holdings and PnL are being tracked in real-time.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: "'Inter'", fontSize: 16, fontWeight: 700, color: "#e5e2e3", marginBottom: 4 }}>
                    Connect Wallet
                  </p>
                  <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "#9a907d", marginBottom: 20, padding: "0 24px" }}>
                    Link your Solana wallet to track your holdings, PnL, and recent trade history.
                  </p>
                </>
              )}
              <Link href="/profile">
                <button
                  className="w-full py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ background: "#ffd369", color: "#775a00", fontFamily: "'Inter'" }}
                >
                  {connected ? "VIEW PORTFOLIO" : "CONNECT WALLET"}
                </button>
              </Link>
            </div>
          </motion.section>

          {/* AI Narrative Radar */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="ct-glass-panel rounded-2xl p-6 space-y-5"
            style={{ borderLeft: "4px solid #00dce5" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={20} style={{ color: "#00dce5" }} />
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#e5e2e3" }}>
                  AI Narrative Radar
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full" style={{ background: "#a855f7", boxShadow: "0 0 8px rgba(168,85,247,0.8)" }} />
            </div>
            <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d", textTransform: "uppercase" }}>
              Live sentiment • X • Telegram • Reddit
            </p>
            <div className="space-y-4">
              {NARRATIVES.map((n) => {
                const deltaUp = n.delta > 0;
                return (
                  <div key={n.name} className="space-y-1">
                    <div className="flex justify-between" style={{ fontFamily: "'Inter'", fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: "#e5e2e3" }}>{n.name}</span>
                      <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 500, color: "#e5e2e3" }}>
                        {n.score}{" "}
                        <span style={{ fontSize: 12, color: deltaUp ? "#4ade80" : "#f87171" }}>
                          {deltaUp ? "↗" : "↘"}{Math.abs(n.delta)}
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#2a2a2b" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${n.score}%` }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="h-full rounded-full"
                        style={{ background: n.color, boxShadow: `0 0 8px ${n.color}66` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* ═══ RECENT LAUNCHES (Full Width) ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="lg:col-span-12 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} style={{ color: "#ffd369" }} />
              <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 600, color: "#e5e2e3" }}>
                Recent Launches
              </h2>
            </div>
            <Link href="/explore" className="flex items-center gap-1 hover:underline decoration-2 underline-offset-4"
              style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: "#ffd369" }}>
              VIEW ALL <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentLaunches.map((token, i) => {
              const isLive = token.bondingCurveProgress < 100;
              return (
                <Link href={`/token/${token.id}`} key={token.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.35, ease: EASE }}
                    className="ct-glass-panel p-5 rounded-2xl cursor-pointer group transition-all"
                    whileHover={{ borderColor: "rgba(255,211,105,0.4)" }}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ background: "#2a2a2b", border: "1px solid #4e4636" }}
                      >
                        <span className="text-lg">{token.icon || token.name.charAt(0)}</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded font-bold"
                        style={{
                          fontSize: 10,
                          background: isLive ? "rgba(34,197,94,0.1)" : "rgba(209,197,177,0.1)",
                          color: isLive ? "#22c55e" : "#d1c5b1",
                        }}
                      >
                        {isLive ? "LIVE" : "COMPLETED"}
                      </span>
                    </div>
                    <h4
                      className="transition-colors"
                      style={{ fontFamily: "'Inter'", fontSize: 16, fontWeight: 700, color: "#e5e2e3" }}
                    >
                      {token.name}
                    </h4>
                    <p style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#9a907d", marginBottom: 16 }}>
                      ${token.ticker}
                    </p>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p style={{ fontSize: 10, color: "#9a907d" }}>MCAP</p>
                        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 500, color: "#e5e2e3" }}>
                          {fmtMcap(token.marketCap)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: 10, color: "#9a907d" }}>TIME</p>
                        <p style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 500, color: "#e5e2e3" }}>
                          {timeSince(token.launchDate)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="w-full border-t pt-4 mt-10" style={{ borderColor: "#4e4636" }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span style={{ fontFamily: "'Inter'", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#ffd369" }}>
              MOONFLUXX
            </span>
            <p style={{ fontFamily: "'Inter'", fontSize: 14, color: "rgba(209,197,177,0.6)" }}>
              © 2024 Moonflux Protocol. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {["Security", "Terms", "Discord", "Twitter"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-[#ffd369]"
                style={{ fontFamily: "'Inter'", fontSize: 14, color: "#d1c5b1" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
