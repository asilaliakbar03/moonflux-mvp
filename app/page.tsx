"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Rocket,
  Brain,
  Shield,
  BarChart3,
  ChevronRight,
  Compass,
  Sparkles,
  Activity,
  Radio,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import { ALL_TOKENS } from "@/lib/mock";
import { useMoonWallet } from "@/components/WalletProvider";
import { useSOLPrice } from "@/lib/useSOLPrice";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const EASE = [0.16, 1, 0.3, 1] as const;

const C = {
  gold:       "#F59E0B",
  goldHi:     "#FBBF24",
  goldDeep:   "#D97706",
  cyan:       "#06B6D4",
  cyanDim:    "#0891B2",
  navy:       "#0C0A14",
  navyLight:  "#141222",
  navyMid:    "#1A1830",
  ink:        "#F0ECE5",
  dim:        "#6B7280",
  dimmer:     "#374151",
  green:      "#22C55E",
  red:        "#EF4444",
  surface:    "rgba(14, 12, 24, 0.8)",
  border:     "rgba(245, 158, 11, 0.12)",
  borderHi:   "rgba(245, 158, 11, 0.3)",
} as const;

const FONT = {
  heading: "'Space Grotesk', sans-serif",
  body:    "'Exo 2', 'Inter', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

/* ── Sparkline ─────────────────────────────────────────────────────────────── */
function Sparkline({
  data, color, w = 100, h = 24, fill = true,
}: { data: number[]; color: string; w?: number; h?: number; fill?: boolean }) {
  if (!data.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * (h - 2) - 1}`
  ).join(" ");
  const uid = `sp-${color.replace("#", "")}-${w}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && (
        <polyline
          points={`0,${h} ${pts} ${w},${h}`}
          fill={`url(#${uid})`}
          stroke="none"
        />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* endpoint dot */}
      {data.length > 1 && (() => {
        const lastX = w;
        const lastY = h - ((data[data.length - 1] - mn) / range) * (h - 2) - 1;
        return <circle cx={lastX} cy={lastY} r={2} fill={color} />;
      })()}
    </svg>
  );
}

/* ── Mini progress bar ─────────────────────────────────────────────────────── */
function BondingBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1, ease: EASE }}
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
      />
    </div>
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
function fmtVol(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n.toFixed(0)}`;
}
function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* ── Live Clock ────────────────────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.cyan, letterSpacing: "0.08em" }}>
      {time}
    </span>
  );
}

/* ── Animated Counter ──────────────────────────────────────────────────────── */
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2, style }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; style?: React.CSSProperties;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = displayValue;
    const diff = value - start;
    const duration = 1200;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(start + diff * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span style={style}>{prefix}{displayValue.toFixed(decimals)}{suffix}</span>;
}

/* ── Cursor spotlight hook ─────────────────────────────────────────────────── */
function useCursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  return { ref, pos, hovering, setHovering, handleMove };
}

/* ── Narrative Radar Data ──────────────────────────────────────────────────── */
const NARRATIVES = [
  { name: "Dog Meta",     score: 94, delta: 12,  color: "#F97316", badge: "Peak"    as const },
  { name: "Meme Season",  score: 88, delta: 8,   color: "#FBBF24", badge: "Rising"  as const },
  { name: "AI Agents",    score: 81, delta: 15,  color: "#A78BFA", badge: "Rising"  as const },
  { name: "Gaming",       score: 71, delta: -3,  color: "#06B6D4", badge: "Cooling" as const },
];

const BADGE_STYLES: Record<string, { bg: string; fg: string }> = {
  Peak:    { bg: "rgba(249,115,22,0.15)", fg: "#F97316" },
  Rising:  { bg: "rgba(34,197,94,0.12)",  fg: "#22C55E" },
  Cooling: { bg: "rgba(99,102,241,0.12)", fg: "#818CF8" },
};

/* ── Live Activity Feed Data ───────────────────────────────────────────────── */
const ACTIVITY_FEED = [
  { type: "buy"  as const, user: "SolKing",     amount: "2.1M",  ticker: "LDOGE", time: "12s ago" },
  { type: "sell" as const, user: "0xDegen",     amount: "500K",  ticker: "CPEP",  time: "34s ago" },
  { type: "buy"  as const, user: "WhaleHunter", amount: "8.2M",  ticker: "SWRM",  time: "1m ago"  },
  { type: "buy"  as const, user: "0xNova",      amount: "1.5M",  ticker: "NVFX",  time: "2m ago"  },
  { type: "sell" as const, user: "PaperHands",  amount: "3.1M",  ticker: "LDOGE", time: "4m ago"  },
];

/* ── Mock portfolio data ───────────────────────────────────────────────────── */
const MOCK_HOLDINGS = [
  { ticker: "LDOGE", icon: "🐕", amount: "4.2M",    value: 9828.00,  change: 12.4, color: "#E8B84B" },
  { ticker: "SWRM",  icon: "🤖", amount: "1.8M",    value: 1208.78,  change: 8.2,  color: "#38BDF8" },
  { ticker: "SOL",   icon: "◎",  amount: "8.21",     value: 1443.54,  change: 2.1,  color: "#9945FF" },
];

/* ── Card wrapper ──────────────────────────────────────────────────────────── */
function GlassCard({ children, className = "", style = {}, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        backdropFilter: "blur(16px)",
        border: `1px solid ${C.border}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMMAND CENTER — Main Dashboard
   ══════════════════════════════════════════════════════════════════════════════ */
export default function CommandCenter() {
  const { connected } = useMoonWallet();
  const { price: solPrice, change24h: solChange, isLive } = useSOLPrice();
  const solUp = solChange >= 0;
  const [mounted, setMounted] = useState(false);
  const [radarAngle, setRadarAngle] = useState(0);
  useEffect(() => setMounted(true), []);

  // Radar sweep animation
  useEffect(() => {
    const id = setInterval(() => setRadarAngle((a) => (a + 2) % 360), 40);
    return () => clearInterval(id);
  }, []);

  // Sort tokens
  const hotTokens = [...ALL_TOKENS].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  const recentLaunches = [...ALL_TOKENS]
    .sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())
    .slice(0, 4);

  if (!mounted) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">

      {/* ══════════════════════════════════════════════════════════════
          HERO HEADER — Aurora Mesh + Live Clock + Stats
          ══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          backdropFilter: "blur(20px)",
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Aurora mesh background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{
              background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)`,
              top: "-30%", left: "-10%",
              animation: "mf-mesh-a 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{
              background: `radial-gradient(circle, ${C.cyan} 0%, transparent 70%)`,
              bottom: "-40%", right: "-5%",
              animation: "mf-mesh-b 14s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{
              background: `radial-gradient(circle, #A78BFA 0%, transparent 70%)`,
              top: "10%", right: "20%",
              animation: "mf-mesh-a 16s ease-in-out infinite reverse",
            }}
          />
          {/* Scan line */}
          <div
            className="absolute inset-x-0 h-px opacity-[0.06]"
            style={{
              background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              animation: "mf-scan 4s linear infinite",
            }}
          />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Top row: brand + clock + live indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <p
                className="uppercase tracking-[0.25em]"
                style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 600, color: C.dim }}
              >
                MOONFLUXX • COMMAND CENTER
              </p>
              {/* LIVE indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: C.green }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, color: C.green, letterSpacing: "0.1em" }}>
                  LIVE
                </span>
              </div>
            </div>
            <LiveClock />
          </div>

          {/* Main row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            {/* Title */}
            <div className="space-y-2">
              <h1 style={{
                fontFamily: FONT.heading,
                fontSize: 52,
                fontWeight: 700,
                lineHeight: "56px",
                letterSpacing: "-0.03em",
                background: `linear-gradient(135deg, ${C.ink} 0%, ${C.goldHi} 50%, ${C.ink} 100%)`,
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "mf-gold-flow 6s ease-in-out infinite",
              }}>
                Command Center
              </h1>
              <p style={{ fontFamily: FONT.body, fontSize: 14, color: C.dim, maxWidth: 420 }}>
                Real-time intelligence across Solana&apos;s memecoin ecosystem
              </p>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-3">
              {/* SOL Price */}
              <motion.div
                whileHover={{ borderColor: C.borderHi, boxShadow: `0 0 24px ${C.gold}15` }}
                className="p-4 rounded-xl min-w-[150px] transition-shadow"
                style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
              >
                <p style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.dim, marginBottom: 4 }}>SOL / USD</p>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: FONT.heading, fontSize: 26, fontWeight: 700, color: C.goldHi }}>
                    ${solPrice.toFixed(2)}
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-xs font-semibold"
                    style={{ fontFamily: FONT.mono, fontSize: 11, color: solUp ? C.green : C.red }}
                  >
                    {solUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(solChange).toFixed(1)}%
                  </span>
                </div>
                {!isLive && (
                  <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.dim }}>CACHED</span>
                )}
              </motion.div>

              {/* 24h Volume */}
              <motion.div
                whileHover={{ borderColor: "rgba(6,182,212,0.3)", boxShadow: `0 0 24px ${C.cyan}15` }}
                className="p-4 rounded-xl min-w-[150px] transition-shadow"
                style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
              >
                <p style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.dim, marginBottom: 4 }}>24H VOLUME</p>
                <span style={{ fontFamily: FONT.heading, fontSize: 26, fontWeight: 700, color: C.cyan }}>$2.84B</span>
              </motion.div>

              {/* Active Launches */}
              <motion.div
                whileHover={{ borderColor: "rgba(34,197,94,0.3)", boxShadow: `0 0 24px ${C.green}15` }}
                className="p-4 rounded-xl min-w-[150px] transition-shadow"
                style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
              >
                <p style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.dim, marginBottom: 4 }}>ACTIVE</p>
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-2 h-2 rounded-full"
                    style={{ background: C.green }}
                    animate={{ boxShadow: [`0 0 4px ${C.green}`, `0 0 12px ${C.green}`, `0 0 4px ${C.green}`] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span style={{ fontFamily: FONT.heading, fontSize: 26, fontWeight: 700, color: C.ink }}>{ALL_TOKENS.length}</span>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/launch">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${C.gold}40` }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                  style={{
                    fontFamily: FONT.body,
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldHi})`,
                    color: "#1A0E00",
                    boxShadow: `0 0 20px ${C.gold}25`,
                  }}
                >
                  <Rocket size={16} /> Launch Token
                </motion.button>
              </Link>
              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: C.goldHi }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ border: `1px solid ${C.border}`, color: C.ink, fontFamily: FONT.body }}
                >
                  <Compass size={16} /> Explore
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════
          BENTO GRID
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ═══ HOT RIGHT NOW (8 cols) ══════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="lg:col-span-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame size={20} style={{ color: C.gold }} />
              <h2 style={{ fontFamily: FONT.heading, fontSize: 22, fontWeight: 700, color: C.ink }}>
                Hot Right Now
              </h2>
            </div>
            <div className="flex items-center gap-2" style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: C.green, textTransform: "uppercase" }}>
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: C.green }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              STREAMING
            </div>
          </div>

          {/* Table header */}
          <div
            className="hidden md:grid items-center px-5 py-2"
            style={{
              gridTemplateColumns: "44px 1fr 120px 120px 120px 140px 28px",
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: C.dim,
              textTransform: "uppercase",
            }}
          >
            <span>#</span>
            <span>TOKEN</span>
            <span className="text-right">PRICE</span>
            <span className="text-right">MCAP</span>
            <span className="text-right">VOL 24H</span>
            <span className="text-right">24H</span>
            <span />
          </div>

          <GlassCard className="overflow-hidden">
            {hotTokens.map((token, i) => {
              const up = token.change24h > 0;
              return (
                <HotTokenRow key={token.id} token={token} index={i} up={up} />
              );
            })}
          </GlassCard>
        </motion.section>

        {/* ═══ SIDEBAR (4 cols) ════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-5">

          {/* ── Portfolio Snapshot ──────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          >
            <GlassCard className="p-6 relative overflow-hidden" style={{ minHeight: 360 }}>
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(ellipse at 50% 0%, ${C.gold}08 0%, transparent 60%)`,
              }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 size={18} style={{ color: C.dim }} />
                  <h3 style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink }}>
                    Portfolio Snapshot
                  </h3>
                </div>

                {connected ? (
                  <>
                    {/* Total Value */}
                    <div className="text-center mb-5">
                      <p style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: "0.1em", color: C.dim, marginBottom: 4 }}>
                        TOTAL VALUE
                      </p>
                      <p style={{ fontFamily: FONT.heading, fontSize: 36, fontWeight: 700, color: C.goldHi }}>
                        $12,480.32
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <ArrowUp size={12} style={{ color: C.green }} />
                        <span style={{ fontFamily: FONT.mono, fontSize: 12, color: C.green }}>+8.4% (24h)</span>
                      </div>
                      {/* Mini sparkline */}
                      <div className="flex justify-center mt-3">
                        <Sparkline data={[40, 42, 44, 43, 47, 50, 48, 52, 55, 58, 56, 60, 63, 62, 65, 68, 72, 70, 74, 78]} color={C.green} w={180} h={32} />
                      </div>
                    </div>

                    {/* Holdings */}
                    <div className="space-y-2.5">
                      {MOCK_HOLDINGS.map((h) => (
                        <div
                          key={h.ticker}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.04)` }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{h.icon}</span>
                            <div>
                              <p style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 700, color: C.ink }}>${h.ticker}</p>
                              <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.dim }}>{h.amount}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>
                              ${h.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </p>
                            <p style={{ fontFamily: FONT.mono, fontSize: 10, color: h.change > 0 ? C.green : C.red }}>
                              {h.change > 0 ? "+" : ""}{h.change}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link href="/profile">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${C.gold}30` }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-2.5 rounded-lg font-bold text-sm"
                        style={{
                          fontFamily: FONT.body,
                          background: `linear-gradient(135deg, ${C.gold}, ${C.goldHi})`,
                          color: "#1A0E00",
                        }}
                      >
                        VIEW PORTFOLIO
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    {/* Animated ring */}
                    <div className="relative w-24 h-24 mb-5">
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: `2px solid ${C.gold}30` }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-1 rounded-full"
                        style={{ border: `1px dashed ${C.cyan}25` }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-3 rounded-full flex items-center justify-center"
                        style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                        animate={{ boxShadow: [`0 0 20px ${C.gold}10`, `0 0 40px ${C.gold}25`, `0 0 20px ${C.gold}10`] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Shield size={28} style={{ color: C.goldHi }} />
                      </motion.div>
                    </div>
                    <h4 style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                      Connect to Unlock
                    </h4>
                    <p style={{ fontFamily: FONT.body, fontSize: 13, color: C.dim, marginBottom: 20, maxWidth: 240 }}>
                      Link your Solana wallet to track holdings, PnL, and trade history in real-time.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: `0 0 24px ${C.gold}30` }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-lg font-bold text-sm"
                      style={{
                        fontFamily: FONT.body,
                        background: `linear-gradient(135deg, ${C.gold}, ${C.goldHi})`,
                        color: "#1A0E00",
                      }}
                    >
                      CONNECT WALLET
                    </motion.button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.section>

          {/* ── AI Narrative Radar ──────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          >
            <GlassCard className="p-6 space-y-5 relative overflow-hidden" style={{ borderLeft: `3px solid ${C.cyan}` }}>
              {/* Radar sweep background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
                  style={{
                    top: "50%", left: "50%",
                    transform: `translate(-50%, -50%)`,
                    background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, ${C.cyan} 30deg, transparent 60deg)`,
                  }}
                />
                {/* Concentric rings */}
                {[100, 160, 220].map((size) => (
                  <div
                    key={size}
                    className="absolute rounded-full"
                    style={{
                      width: size, height: size,
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      border: `1px solid rgba(6,182,212,0.06)`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={18} style={{ color: C.cyan }} />
                    <h3 style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink }}>
                      AI Narrative Radar
                    </h3>
                  </div>
                  <motion.span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#A855F7" }}
                    animate={{ boxShadow: [`0 0 4px #A855F7`, `0 0 14px #A855F7`, `0 0 4px #A855F7`] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: C.dim, textTransform: "uppercase", marginTop: 2 }}>
                  LIVE SENTIMENT • X • TELEGRAM • REDDIT
                </p>

                <div className="space-y-4 mt-5">
                  {NARRATIVES.map((n) => {
                    const deltaUp = n.delta > 0;
                    const bStyle = BADGE_STYLES[n.badge];
                    return (
                      <div key={n.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 700, color: C.ink }}>{n.name}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ fontFamily: FONT.mono, background: bStyle.bg, color: bStyle.fg, letterSpacing: "0.05em" }}
                            >
                              {n.badge.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: C.ink }}>{n.score}</span>
                            <span className="flex items-center gap-0.5" style={{ fontFamily: FONT.mono, fontSize: 11, color: deltaUp ? C.green : C.red }}>
                              {deltaUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {Math.abs(n.delta)}
                            </span>
                          </div>
                        </div>
                        <div className="h-[5px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${n.score}%` }}
                            transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${n.color}CC, ${n.color})`,
                              boxShadow: `0 0 10px ${n.color}50, 0 0 20px ${n.color}20`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.section>
        </div>

        {/* ═══ RECENT LAUNCHES (Full Width) ═════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="lg:col-span-12 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} style={{ color: C.goldHi }} />
              <h2 style={{ fontFamily: FONT.heading, fontSize: 22, fontWeight: 700, color: C.ink }}>
                Recent Launches
              </h2>
            </div>
            <Link
              href="/explore"
              className="flex items-center gap-1 group"
              style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.goldHi }}
            >
              VIEW ALL <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentLaunches.map((token, i) => {
              const isLive = token.bondingCurveProgress < 100;
              const up = token.change24h > 0;
              return (
                <Link href={`/token/${token.id}`} key={token.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: EASE }}
                    whileHover={{
                      y: -4,
                      boxShadow: `0 8px 40px ${C.gold}15, 0 0 0 1px ${C.borderHi}`,
                    }}
                    className="h-full rounded-2xl p-5 cursor-pointer transition-all"
                    style={{
                      background: C.surface,
                      backdropFilter: "blur(16px)",
                      border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${token.color}`,
                    }}
                  >
                    {/* Header row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                        >
                          <span className="text-lg">{token.icon || token.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 700, color: C.ink }}>{token.name}</h4>
                          <p style={{ fontFamily: FONT.mono, fontSize: 10, color: C.dim }}>${token.ticker}</p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded font-bold"
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 9,
                          letterSpacing: "0.05em",
                          background: isLive ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                          color: isLive ? C.green : C.dim,
                        }}
                      >
                        {isLive ? "● LIVE" : "GRADUATED"}
                      </span>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${token.color}25` }}>
                        <span style={{ fontSize: 8 }}>👤</span>
                      </div>
                      <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.dim }}>
                        {token.creator.name}
                      </span>
                      {token.creator.verified && (
                        <span style={{ fontSize: 10 }}>✓</span>
                      )}
                    </div>

                    {/* Sparkline */}
                    <div className="mb-3">
                      <Sparkline data={token.chartData ?? []} color={up ? C.green : C.red} w={220} h={36} />
                    </div>

                    {/* Bonding curve */}
                    {isLive && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.dim }}>BONDING CURVE</span>
                          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: token.color }}>{token.bondingCurveProgress}%</span>
                        </div>
                        <BondingBar progress={token.bondingCurveProgress} color={token.color} />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-end pt-2" style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                      <div>
                        <p style={{ fontFamily: FONT.mono, fontSize: 9, color: C.dim }}>MCAP</p>
                        <p style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>{fmtMcap(token.marketCap)}</p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontFamily: FONT.mono, fontSize: 9, color: C.dim }}>LAUNCHED</p>
                        <p style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>{timeSince(token.launchDate)}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* ═══ LIVE ACTIVITY FEED (Full Width) ══════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="lg:col-span-12 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <Activity size={18} style={{ color: C.cyan }} />
            <h2 style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink }}>
              Live Activity
            </h2>
            <motion.div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-1"
              style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}
            >
              <Radio size={10} style={{ color: C.cyan }} />
              <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 600, color: C.cyan, letterSpacing: "0.08em" }}>STREAM</span>
            </motion.div>
          </div>

          <GlassCard className="overflow-hidden">
            {ACTIVITY_FEED.map((item, i) => {
              const isBuy = item.type === "buy";
              return (
                <motion.div
                  key={`${item.user}-${item.ticker}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.3, ease: EASE }}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{
                    borderBottom: i < ACTIVITY_FEED.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                    borderLeft: `2px solid ${isBuy ? C.green : C.red}`,
                  }}
                >
                  {/* Type badge */}
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-xs"
                    style={{ background: isBuy ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", fontSize: 10 }}
                  >
                    {isBuy ? "🟢" : "🔴"}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span style={{ fontFamily: FONT.mono, fontSize: 12, color: C.ink }}>
                      <span style={{ color: isBuy ? C.green : C.red, fontWeight: 700 }}>{item.user}</span>
                      <span style={{ color: C.dim }}> {isBuy ? "bought" : "sold"} </span>
                      <span style={{ fontWeight: 600 }}>{item.amount}</span>
                      <span style={{ color: C.goldHi, fontWeight: 700 }}> ${item.ticker}</span>
                    </span>
                  </div>

                  {/* Time */}
                  <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.dim, whiteSpace: "nowrap" }}>
                    {item.time}
                  </span>
                </motion.div>
              );
            })}
          </GlassCard>
        </motion.section>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <footer className="relative pt-8 mt-8">
        {/* Gradient divider */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${C.gold}40 25%, ${C.cyan}30 50%, ${C.gold}40 75%, transparent 100%)`,
          }}
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
          {/* Left */}
          <div className="flex items-center gap-5">
            <span style={{ fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: C.goldHi, letterSpacing: "0.08em" }}>
              MOONFLUXX
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: 11, color: C.dim }}>
              © {new Date().getFullYear()} Moonflux Protocol
            </span>
          </div>

          {/* Center: Built on Solana badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(153,69,255,0.08)", border: "1px solid rgba(153,69,255,0.15)" }}
          >
            <Globe size={12} style={{ color: "#9945FF" }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, color: "#B794F6", letterSpacing: "0.05em" }}>
              BUILT ON SOLANA
            </span>
          </div>

          {/* Right: Links + Social icons */}
          <div className="flex items-center gap-5">
            {[
              { label: "Docs", href: "#" },
              { label: "Security", href: "#" },
              { label: "Terms", href: "#" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-[#FBBF24]"
                style={{ fontFamily: FONT.mono, fontSize: 11, color: C.dim }}
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-3 ml-2">
              {/* X/Twitter */}
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={C.dim}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Discord */}
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={C.dim}>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="transition-opacity hover:opacity-80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={C.dim}>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOT TOKEN ROW — Extracted for cursor-spotlight effect
   ══════════════════════════════════════════════════════════════════════════════ */
function HotTokenRow({ token, index, up }: {
  token: typeof ALL_TOKENS[number]; index: number; up: boolean;
}) {
  const { ref, pos, hovering, setHovering, handleMove } = useCursorSpotlight();

  return (
    <Link href={`/token/${token.id}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative grid items-center px-5 py-4 cursor-pointer group"
        style={{
          gridTemplateColumns: "44px 1fr 120px 120px 120px 140px 28px",
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
        }}
        whileHover={{ backgroundColor: "rgba(245,158,11,0.03)" }}
      >
        {/* Cursor spotlight */}
        {hovering && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${C.gold}08, transparent 60%)`,
            }}
          />
        )}

        {/* Left accent bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: token.color }}
        />

        {/* Rank badge */}
        <div className="relative z-10 flex items-center">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              background: `${token.color}18`,
              color: token.color,
              border: `1px solid ${token.color}30`,
            }}
          >
            {index + 1}
          </span>
        </div>

        {/* Token info */}
        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
          >
            <span className="text-lg">{token.icon || token.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h4
              className="truncate"
              style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 700, color: C.ink }}
            >
              {token.name}
            </h4>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: FONT.mono, fontSize: 10, color: C.dim }}>${token.ticker}</span>
              {/* Mini bonding bar */}
              {token.bondingCurveProgress < 100 && (
                <div className="w-12">
                  <BondingBar progress={token.bondingCurveProgress} color={token.color} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="relative z-10 text-right hidden md:block">
          <p style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 600, color: C.ink }}>
            {fmtPrice(token.price)}
          </p>
        </div>

        {/* Market Cap */}
        <div className="relative z-10 text-right hidden md:block">
          <p style={{ fontFamily: FONT.mono, fontSize: 12, color: C.dim }}>
            {fmtMcap(token.marketCap)}
          </p>
        </div>

        {/* Volume */}
        <div className="relative z-10 text-right hidden md:block">
          <p style={{ fontFamily: FONT.mono, fontSize: 12, color: C.cyan }}>
            ${fmtVol(token.volume24h)}
          </p>
        </div>

        {/* Sparkline + Change */}
        <div className="relative z-10 hidden md:flex items-center justify-end gap-3">
          <div className="w-20 h-8">
            <Sparkline data={token.chartData ?? []} color={up ? C.green : C.red} w={80} h={28} />
          </div>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-bold min-w-[56px] text-center"
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: up ? C.green : C.red,
            }}
          >
            {up ? "+" : ""}{token.change24h.toFixed(1)}%
          </span>
        </div>

        {/* Chevron */}
        <div className="relative z-10 flex justify-end">
          <ChevronRight
            size={16}
            className="opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all"
            style={{ color: C.goldHi }}
          />
        </div>
      </motion.div>
    </Link>
  );
}
