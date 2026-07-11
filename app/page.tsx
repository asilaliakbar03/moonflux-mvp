"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Rocket,
  Brain,
  Shield,
  Activity,
  BarChart3,
  Star,
  ChevronRight,
  Globe,
  Share2,
} from "lucide-react";
import { ALL_TOKENS } from "@/lib/mock";
import { useMoonWallet } from "@/components/WalletProvider";
import { useSOLPrice } from "@/lib/useSOLPrice";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  gold: "#e8b84b",
  goldHi: "#ffe6a3",
  goldDeep: "#a9791f",
  bg: "rgba(10,8,5,0.95)",
  bgPanel: "rgba(8,7,4,0.92)",
  border: "rgba(232,184,75,0.22)",
  borderViolet: "rgba(168,85,247,0.35)",
  success: "#10b981",
  danger: "#ef4444",
  violet: "#a855f7",
  blue: "#38bdf8",
  dim: "#6b6987",
  obsidian: "#050403",
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1) return n.toFixed(4).replace(/\.?0+$/, "");
  return n.toPrecision(4);
}

function timeSince(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = now - then;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  return `${m}mo ago`;
}

// ── MINI SPARKLINE ───────────────────────────────────────────────────────────

function MiniSparkline({
  data,
  positive,
  width = 60,
  height = 24,
}: {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  const last10 = data.slice(-10);
  const min = Math.min(...last10);
  const max = Math.max(...last10);
  const pts = last10
    .map((v, i) => {
      const x = (i / (last10.length - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const color = positive ? C.success : C.danger;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
    </svg>
  );
}

// ── ANIMATED NUMBER ──────────────────────────────────────────────────────────

function AnimNumber({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={style}
    >
      {value}
    </motion.span>
  );
}

// ── EXTRA TICKER PILLS ───────────────────────────────────────────────────────
const EXTRA_PILLS = [
  { ticker: "MOON", change: "+34.7", pos: true },
  { ticker: "FLUX", change: "+18.2", pos: true },
];


// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function CommandCenter() {
  const { connected, address } = useMoonWallet();

  // Roast My Wallet State
  const [isRoastModalOpen, setIsRoastModalOpen] = useState(false);
  const [roastData, setRoastData] = useState<any>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const handleRoast = async () => {
    setIsRoasting(true);
    setIsRoastModalOpen(true);
    try {
      const res = await fetch("/api/roast-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address ?? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" }),
      });
      const data = await res.json();
      setRoastData(data);
    } catch {
      setRoastData({
        persona: "The Rug Magnet",
        roast: "Your portfolio is a crime scene. Every token you hold has a 'sold' sign on it already.",
        winRate: "12%",
        rugCount: "42",
        biggestBag: "SQUID2",
      });
    } finally {
      setIsRoasting(false);
    }
  };

  // ── SOL live price (real — Jupiter API) ────────────────────────────────────
  const { price: solPrice, change24h: solChange24h, isLive: solIsLive } = useSOLPrice();

  // ── Derived token sets ─────────────────────────────────────────────────────
  const trending = [...ALL_TOKENS]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 5);

  const recentLaunches = [...ALL_TOKENS]
    .sort(
      (a, b) =>
        new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime()
    )
    .slice(0, 4);

  // ── Ticker pills (first 12 + 2 extra) ─────────────────────────────────────
  const tickerPills = [
    ...ALL_TOKENS.slice(0, 12).map((t) => ({
      ticker: t.ticker,
      change: (t.change24h >= 0 ? "+" : "") + t.change24h.toFixed(1),
      pos: t.change24h >= 0,
    })),
    ...EXTRA_PILLS,
  ];

  const panelStyle: React.CSSProperties = {
    background: C.bgPanel,
    border: `1px solid ${C.border}`,
    borderRadius: "1.5rem",
  };

  const violetPanelStyle: React.CSSProperties = {
    background: C.bgPanel,
    border: `1px solid ${C.borderViolet}`,
    borderRadius: "1.5rem",
  };

  return (
    <div
      style={{ maxWidth: "80rem", margin: "0 auto" }}
      className="flex flex-col gap-6 pb-12 px-4 lg:px-0"
    >
      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO STRIP (Command Bar)
          ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          background: "rgba(10,8,5,0.9)",
          border: `1px solid ${C.border}`,
          borderRadius: "1.5rem",
          padding: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* top gold hairline */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            opacity: 0.7,
          }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* LEFT — title */}
          <div className="flex flex-col gap-0.5 min-w-max">
            <span
              className="font-mono uppercase tracking-[0.3em]"
              style={{ fontSize: "0.6rem", color: C.gold }}
            >
              MoonFluxx · Live Dashboard
            </span>
            <h1
              className="font-display font-bold text-white"
              style={{ fontSize: "2.25rem", lineHeight: 1.1 }}
            >
              Command Center
            </h1>
          </div>

          {/* CENTER — stat chips */}
          <div className="flex items-center gap-3 flex-1 flex-wrap gap-y-2">
            {/* SOL Price — live via Jupiter API */}
            <div
              style={{
                background: "rgba(232,184,75,0.08)",
                border: `1px solid ${C.border}`,
                borderRadius: "0.75rem",
                padding: "0.5rem 1rem",
              }}
              className="flex flex-col gap-0"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: "0.5rem", color: C.dim }}
                >
                  SOL
                </span>
                {/* Live/stale indicator dot */}
                <span
                  title={solIsLive ? "Live price" : "Last known price"}
                  style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: solIsLive ? C.success : C.dim,
                    display: "inline-block",
                    boxShadow: solIsLive ? `0 0 4px ${C.success}` : "none",
                  }}
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <AnimNumber
                  value={solPrice > 0 ? `$${solPrice.toFixed(2)}` : "…"}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    color: C.gold,
                    fontWeight: 600,
                  }}
                />
                {solPrice > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.55rem",
                      color: solChange24h >= 0 ? C.success : C.danger,
                      fontWeight: 600,
                    }}
                  >
                    {solChange24h >= 0 ? "+" : ""}{solChange24h.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            {/* 24h Vol */}
            <div
              style={{
                background: "rgba(232,184,75,0.08)",
                border: `1px solid ${C.border}`,
                borderRadius: "0.75rem",
                padding: "0.5rem 1rem",
              }}
            >
              <div
                className="font-mono uppercase tracking-widest"
                style={{ fontSize: "0.5rem", color: C.dim }}
              >
                24h Vol
              </div>
              <div
                className="font-mono font-semibold"
                style={{ fontSize: "0.9rem", color: C.gold }}
              >
                $2.84B
              </div>
            </div>

            {/* Active Launches */}
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "0.75rem",
                padding: "0.5rem 1rem",
              }}
              className="flex flex-col gap-0"
            >
              <div
                className="font-mono uppercase tracking-widest"
                style={{ fontSize: "0.5rem", color: C.dim }}
              >
                Active Launches
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.success,
                    boxShadow: `0 0 8px ${C.success}`,
                    display: "inline-block",
                  }}
                  className="animate-pulse"
                />
                <span
                  className="font-mono font-semibold"
                  style={{ fontSize: "0.9rem", color: C.success }}
                >
                  142
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <Link href="/launch">
              <button
                className="sheen-gold font-mono uppercase tracking-widest flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${C.goldDeep}, ${C.gold})`,
                  color: "#0a0800",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.6rem 1.2rem",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                <Rocket size={12} />
                Launch Token
              </button>
            </Link>
            <Link href="/explore">
              <button
                className="font-mono uppercase tracking-widest flex items-center gap-2"
                style={{
                  background: "transparent",
                  color: C.gold,
                  border: `1px solid ${C.border}`,
                  borderRadius: "0.75rem",
                  padding: "0.6rem 1.2rem",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.2em",
                }}
              >
                <Globe size={12} />
                Explore
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — LIVE TICKER TAPE
          ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        style={{
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(5,4,3,0.8)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* fade edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(5,4,3,0.9) 0%, transparent 8%, transparent 92%, rgba(5,4,3,0.9) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div className="overflow-hidden" style={{ padding: "0.4rem 0" }}>
          <ul
            className="animate-mf-marquee"
            style={{
              display: "inline-flex",
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
              alignItems: "center",
              gap: 0,
            }}
          >
            {[...tickerPills, ...tickerPills].map((pill, i) => (
              <li
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginRight: "0",
                }}
              >
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{
                    fontSize: "0.62rem",
                    color: pill.pos ? C.success : C.danger,
                    padding: "0.2rem 0.7rem",
                    background: pill.pos
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(239,68,68,0.08)",
                    border: `1px solid ${pill.pos ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: "9999px",
                  }}
                >
                  ${pill.ticker}{" "}
                  <span style={{ fontWeight: 700 }}>{pill.change}%</span>
                </span>
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: C.gold,
                    opacity: 0.5,
                    margin: "0 0.5rem",
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — MAIN GRID
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* ── 3A: Hot Right Now ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            style={{ ...panelStyle, padding: "1.25rem" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={16} style={{ color: C.gold }} />
                <span
                  className="font-display font-bold text-white"
                  style={{ fontSize: "1rem" }}
                >
                  Hot Right Now
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.success,
                    boxShadow: `0 0 8px ${C.success}`,
                    display: "inline-block",
                  }}
                  className="animate-pulse"
                />
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: "0.5rem", color: C.success }}
                >
                  Updated live
                </span>
              </div>
            </div>

            {/* Token rows */}
            <div className="flex flex-col gap-0">
              {trending.map((token, idx) => {
                const pos = token.change24h >= 0;
                return (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.25 + idx * 0.07,
                      ease: EASE,
                    }}
                  >
                    <Link href={`/token/${token.id}`}>
                      <div
                        className="group"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.6rem 0.5rem",
                          borderRadius: "0.75rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          borderLeft: "2px solid transparent",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.borderLeftColor = C.gold;
                          el.style.transform = "translateY(-1px)";
                          el.style.background = "rgba(232,184,75,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.borderLeftColor = "transparent";
                          el.style.transform = "translateY(0)";
                          el.style.background = "transparent";
                        }}
                      >
                        {/* rank */}
                        <span
                          className="font-mono font-bold"
                          style={{
                            fontSize: "0.65rem",
                            color: C.gold,
                            width: "1.2rem",
                            textAlign: "center",
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </span>

                        {/* icon */}
                        <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>
                          {token.icon}
                        </span>

                        {/* name + ticker */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            className="font-display text-white"
                            style={{ fontSize: "0.85rem", fontWeight: 600 }}
                          >
                            {token.name}
                          </div>
                          <div
                            className="font-mono uppercase tracking-widest"
                            style={{ fontSize: "0.55rem", color: C.goldDeep }}
                          >
                            ${token.ticker}
                          </div>
                        </div>

                        {/* price */}
                        <div
                          className="font-mono text-white"
                          style={{ fontSize: "0.78rem", fontWeight: 500 }}
                        >
                          ${fmt(token.price)}
                        </div>

                        {/* change badge */}
                        <span
                          className="font-mono font-bold"
                          style={{
                            fontSize: "0.65rem",
                            color: pos ? C.success : C.danger,
                            background: pos
                              ? "rgba(16,185,129,0.1)"
                              : "rgba(239,68,68,0.1)",
                            border: `1px solid ${pos ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                            borderRadius: "9999px",
                            padding: "0.15rem 0.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem",
                          }}
                        >
                          {pos ? (
                            <ArrowUpRight size={9} />
                          ) : (
                            <ArrowDownRight size={9} />
                          )}
                          {Math.abs(token.change24h).toFixed(1)}%
                        </span>

                        {/* sparkline */}
                        <MiniSparkline
                          data={token.chartData}
                          positive={pos}
                        />

                        {/* chevron */}
                        <ChevronRight
                          size={13}
                          style={{ color: C.dim, flexShrink: 0 }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── 3B: Recent Launches ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
            style={{ ...panelStyle, padding: "1.25rem" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Rocket size={16} style={{ color: C.gold }} />
                <span
                  className="font-display font-bold text-white"
                  style={{ fontSize: "1rem" }}
                >
                  Recent Launches
                </span>
              </div>
              <Link href="/launch">
                <button
                  className="font-mono uppercase tracking-widest"
                  style={{
                    background: "rgba(232,184,75,0.1)",
                    color: C.gold,
                    border: `1px solid ${C.border}`,
                    borderRadius: "0.5rem",
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.2em",
                  }}
                >
                  + Launch Token
                </button>
              </Link>
            </div>

            {/* Launch rows */}
            <div className="flex flex-col gap-3">
              {recentLaunches.map((token, idx) => {
                const prog = token.bondingCurveProgress;
                const graduated = token.graduated;
                return (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.35 + idx * 0.08,
                      ease: EASE,
                    }}
                  >
                    <Link href={`/token/${token.id}`}>
                      <div
                        style={{
                          background: "rgba(232,184,75,0.03)",
                          border: `1px solid ${C.border}`,
                          borderRadius: "0.875rem",
                          padding: "0.75rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = "rgba(232,184,75,0.07)";
                          el.style.borderColor = "rgba(232,184,75,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = "rgba(232,184,75,0.03)";
                          el.style.borderColor = C.border;
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.6rem",
                          }}
                        >
                          {/* icon */}
                          <span style={{ fontSize: "1.5rem" }}>
                            {token.icon}
                          </span>
                          {/* name + ticker */}
                          <div style={{ flex: 1 }}>
                            <div
                              className="font-display text-white"
                              style={{ fontSize: "0.85rem", fontWeight: 600 }}
                            >
                              {token.name}
                            </div>
                            <span
                              className="font-mono uppercase tracking-widest"
                              style={{
                                fontSize: "0.5rem",
                                color: C.goldDeep,
                                background: "rgba(232,184,75,0.1)",
                                border: `1px solid ${C.border}`,
                                borderRadius: "9999px",
                                padding: "0.1rem 0.4rem",
                                display: "inline-block",
                              }}
                            >
                              ${token.ticker}
                            </span>
                          </div>
                          {/* time + badge */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: "0.25rem",
                            }}
                          >
                            <span
                              className="font-mono"
                              style={{ fontSize: "0.55rem", color: C.dim }}
                            >
                              {timeSince(token.launchDate)}
                            </span>
                            <span
                              className="font-mono uppercase tracking-widest"
                              style={{
                                fontSize: "0.48rem",
                                fontWeight: 700,
                                color: graduated ? C.success : C.gold,
                                background: graduated
                                  ? "rgba(16,185,129,0.1)"
                                  : "rgba(232,184,75,0.1)",
                                border: `1px solid ${graduated ? "rgba(16,185,129,0.3)" : C.border}`,
                                borderRadius: "9999px",
                                padding: "0.12rem 0.45rem",
                              }}
                            >
                              {graduated ? "GRADUATED" : "LIVE"}
                            </span>
                          </div>
                        </div>

                        {/* bonding curve bar */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.3rem",
                            }}
                          >
                            <span
                              className="font-mono uppercase tracking-widest"
                              style={{ fontSize: "0.48rem", color: C.dim }}
                            >
                              Bonding Curve
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: "0.55rem",
                                color: prog >= 100 ? C.success : C.gold,
                                fontWeight: 600,
                              }}
                            >
                              {prog}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 4,
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: 9999,
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${prog}%` }}
                              transition={{
                                duration: 1.2,
                                delay: 0.4 + idx * 0.1,
                                ease: EASE,
                              }}
                              style={{
                                height: "100%",
                                background:
                                  prog >= 100
                                    ? `linear-gradient(90deg, ${C.success}, ${C.goldHi})`
                                    : `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`,
                                borderRadius: 9999,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN (sticky sidebar) ───────────────────────────────── */}
        <div className="flex flex-col gap-6" style={{ position: "relative" }}>
          <div
            style={{ position: "sticky", top: "5.5rem" }}
            className="flex flex-col gap-6"
          >
            {/* ── 3C: Portfolio Snapshot ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
              style={{ ...panelStyle, padding: "1.25rem" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} style={{ color: C.gold }} />
                <span
                  className="font-display font-bold text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Portfolio Snapshot
                </span>
              </div>

              {connected ? (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: "0.55rem",
                        color: C.dim,
                        marginBottom: "0.2rem",
                      }}
                    >
                      TOTAL VALUE
                    </div>
                    <div
                      className="font-display font-bold text-white"
                      style={{ fontSize: "1.8rem" }}
                    >
                      $23,986
                    </div>
                    <div
                      className="font-mono font-semibold"
                      style={{ fontSize: "0.78rem", color: C.success }}
                    >
                      +$1,842 (+9.4%) 24h
                    </div>
                  </div>

                  {/* mini allocation bar */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      className="font-mono uppercase tracking-widest"
                      style={{
                        fontSize: "0.48rem",
                        color: C.dim,
                        marginBottom: "0.4rem",
                      }}
                    >
                      Allocation
                    </div>
                    <div
                      style={{
                        display: "flex",
                        height: 6,
                        borderRadius: 9999,
                        overflow: "hidden",
                        gap: 2,
                      }}
                    >
                      {[
                        { w: 35, color: C.gold },
                        { w: 25, color: C.violet },
                        { w: 20, color: C.blue },
                        { w: 12, color: C.success },
                        { w: 8, color: C.danger },
                      ].map((seg, i) => (
                        <motion.div
                          key={i}
                          initial={{ width: 0 }}
                          animate={{ width: `${seg.w}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.4 + i * 0.08,
                            ease: EASE,
                          }}
                          style={{
                            background: seg.color,
                            height: "100%",
                            borderRadius: 9999,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* quick stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.5rem",
                    }}
                  >
                    {[
                      {
                        label: "Tokens Held",
                        val: "5",
                        icon: <Star size={11} />,
                      },
                      {
                        label: "Open Positions",
                        val: "3",
                        icon: <Activity size={11} />,
                      },
                      {
                        label: "Best Return",
                        val: "+412%",
                        icon: <TrendingUp size={11} />,
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${C.border}`,
                          borderRadius: "0.625rem",
                          padding: "0.5rem",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ color: C.gold, marginBottom: "0.2rem" }}>
                          {s.icon}
                        </div>
                        <div
                          className="font-mono font-bold text-white"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {s.val}
                        </div>
                        <div
                          className="font-mono"
                          style={{ fontSize: "0.45rem", color: C.dim }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Roast My Wallet Button */}
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      onClick={() => {
                        setIsRoastModalOpen(true);
                        if (!roastData) handleRoast();
                      }}
                      className="w-full flex items-center justify-center gap-2 font-mono uppercase tracking-widest"
                      style={{
                        background: `linear-gradient(135deg, #ef4444, #991b1b)`,
                        color: "white",
                        border: "1px solid rgba(239,68,68,0.5)",
                        borderRadius: "0.625rem",
                        padding: "0.6rem",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        letterSpacing: "0.15em",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)"
                      }}
                    >
                      <Flame size={14} /> AI Wallet Roast
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{ textAlign: "center", padding: "1.5rem 0" }}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(232,184,75,0.1)",
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield size={20} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <div
                      className="font-display text-white font-semibold"
                      style={{ fontSize: "0.85rem", marginBottom: "0.2rem" }}
                    >
                      Connect Wallet
                    </div>
                    <div
                      className="font-body"
                      style={{ fontSize: "0.7rem", color: C.dim }}
                    >
                      View your portfolio and positions
                    </div>
                  </div>
                  <button
                    className="sheen-gold font-mono uppercase tracking-widest"
                    style={{
                      background: `linear-gradient(135deg, ${C.goldDeep}, ${C.gold})`,
                      color: "#0a0800",
                      border: "none",
                      borderRadius: "0.625rem",
                      padding: "0.55rem 1.2rem",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.2em",
                    }}
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </motion.div>

            {/* ── 3D: AI Narrative Radar ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
              style={{ ...violetPanelStyle, padding: "1.25rem" }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Brain size={15} style={{ color: C.violet }} />
                  <span
                    className="font-display font-bold text-white"
                    style={{ fontSize: "0.9rem" }}
                  >
                    AI Narrative Radar
                  </span>
                </div>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: C.violet,
                    boxShadow: `0 0 8px ${C.violet}`,
                    display: "inline-block",
                  }}
                  className="animate-pulse"
                />
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "0.55rem",
                  color: C.dim,
                  marginBottom: "1rem",
                }}
              >
                Live sentiment · X · Telegram · Reddit
              </div>

              {/* Narrative rows */}
              {[
                { name: "Dog Meta", score: 94, trend: 12, color: C.gold },
                { name: "Meme Season", score: 88, trend: 8, color: "#f97316" },
                { name: "AI Agents", score: 81, trend: 15, color: C.violet },
                { name: "Gaming", score: 71, trend: 3, color: C.blue },
                { name: "RWA", score: 58, trend: -2, color: C.danger },
              ].map((row, idx) => (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + idx * 0.07,
                    ease: EASE,
                  }}
                  style={{ marginBottom: "0.75rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{ fontSize: "0.65rem", color: "#f4f2ff" }}
                    >
                      {row.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono font-bold"
                        style={{ fontSize: "0.65rem", color: row.color }}
                      >
                        {row.score}
                      </span>
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: row.trend >= 0 ? C.success : C.danger,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.1rem",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {row.trend >= 0 ? (
                          <ArrowUpRight size={9} />
                        ) : (
                          <ArrowDownRight size={9} />
                        )}
                        {Math.abs(row.trend)}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.score}%` }}
                      transition={{
                        duration: 1.1,
                        delay: 0.5 + idx * 0.1,
                        ease: EASE,
                      }}
                      style={{
                        height: "100%",
                        background: row.color,
                        borderRadius: 9999,
                        boxShadow: `0 0 6px ${row.color}66`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ── 3E: Quick Actions ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.42, ease: EASE }}
              style={{ ...panelStyle, padding: "1rem" }}
            >
              <div
                className="font-mono uppercase tracking-[0.2em]"
                style={{
                  fontSize: "0.55rem",
                  color: C.dim,
                  marginBottom: "0.75rem",
                }}
              >
                Quick Actions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                {[
                  {
                    icon: <Rocket size={18} />,
                    label: "Launch Token",
                    href: "/launch",
                  },
                  {
                    icon: <Zap size={18} />,
                    label: "Discover",
                    href: "/explore",
                  },
                  {
                    icon: <BarChart3 size={18} />,
                    label: "Terminal",
                    href: "/terminal",
                  },
                  {
                    icon: <Award size={18} />,
                    label: "Leaderboard",
                    href: "/leaderboard",
                  },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${C.border}`,
                        borderRadius: "1rem",
                        padding: "0.875rem 0.5rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = C.gold;
                        el.style.background = "rgba(232,184,75,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderColor = C.border;
                        el.style.background = "rgba(255,255,255,0.03)";
                      }}
                    >
                      <span style={{ color: C.gold }}>{action.icon}</span>
                      <span
                        className="font-mono text-white"
                        style={{ fontSize: "0.58rem", fontWeight: 500 }}
                      >
                        {action.label}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — AI INTELLIGENCE BAR
          ═════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.5, ease: EASE }}
        style={{
          background: C.bgPanel,
          border: `1px solid ${C.border}`,
          borderRadius: "1.5rem",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain size={15} style={{ color: C.gold }} />
          <span
            className="font-display font-bold text-white"
            style={{ fontSize: "0.9rem" }}
          >
            L4 AI Intelligence
          </span>
          <span
            className="font-mono uppercase tracking-widest"
            style={{
              fontSize: "0.48rem",
              color: C.success,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "9999px",
              padding: "0.12rem 0.5rem",
            }}
          >
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Bull Signal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.55, ease: EASE }}
            style={{
              background: "rgba(232,184,75,0.05)",
              border: `1px solid ${C.border}`,
              borderRadius: "1rem",
              padding: "1rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <TrendingUp size={15} style={{ color: C.gold }} />
              <span
                className="font-mono uppercase tracking-widest"
                style={{
                  fontSize: "0.45rem",
                  color: C.success,
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "9999px",
                  padding: "0.1rem 0.4rem",
                }}
              >
                BULLISH
              </span>
            </div>
            <div
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: C.gold, lineHeight: 1 }}
            >
              87%
            </div>
            <div
              className="font-mono"
              style={{ fontSize: "0.55rem", color: C.dim, marginTop: "0.25rem" }}
            >
              confidence
            </div>
            {/* animated ring accent */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: `2px solid ${C.gold}33`,
              }}
            />
          </motion.div>

          {/* Fear & Greed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.62, ease: EASE }}
            style={{
              background: "rgba(249,115,22,0.05)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: "1rem",
              padding: "1rem",
            }}
          >
            <div className="flex items-center gap-1 mb-2">
              <Flame size={15} style={{ color: "#f97316" }} />
            </div>
            <div
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: "#f97316", lineHeight: 1 }}
            >
              72
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "0.55rem",
                color: "#f97316",
                opacity: 0.8,
                marginTop: "0.15rem",
              }}
            >
              Greed
            </div>
            {/* gradient bar */}
            <div
              style={{
                height: 3,
                background:
                  "linear-gradient(90deg, #10b981, #f97316, #ef4444)",
                borderRadius: 9999,
                marginTop: "0.5rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -3,
                  left: "72%",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#f97316",
                  border: "1.5px solid #0a0800",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </motion.div>

          {/* Market Momentum */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.69, ease: EASE }}
            style={{
              background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "1rem",
              padding: "1rem",
            }}
          >
            <div className="flex items-center gap-1 mb-2">
              <Activity size={15} style={{ color: C.success }} />
            </div>
            <div
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: C.success, lineHeight: 1 }}
            >
              +14.2%
            </div>
            <div
              className="font-mono"
              style={{ fontSize: "0.55rem", color: C.dim, marginTop: "0.15rem" }}
            >
              7d avg momentum
            </div>
          </motion.div>

          {/* Social Velocity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.76, ease: EASE }}
            style={{
              background: "rgba(168,85,247,0.05)",
              border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: "1rem",
              padding: "1rem",
            }}
          >
            <div className="flex items-center gap-1 mb-2">
              <Zap size={15} style={{ color: C.violet }} />
            </div>
            <div
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: C.violet, lineHeight: 1 }}
            >
              8.4x
            </div>
            <div
              className="font-mono"
              style={{ fontSize: "0.55rem", color: C.dim, marginTop: "0.15rem" }}
            >
              viral coefficient
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── ROAST MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isRoastModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setIsRoastModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-6 overflow-hidden rounded-3xl"
              style={{
                background: "rgba(15,10,10,0.95)",
                border: "1px solid rgba(239,68,68,0.3)",
                boxShadow: "0 20px 40px rgba(239,68,68,0.15)"
              }}
            >
              {/* Bg glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-red-500" />
                  <h2 className="font-display text-xl font-bold text-white">AI Wallet Roast</h2>
                </div>
                <button onClick={() => setIsRoastModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {isRoasting ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                  <p className="font-mono text-sm text-red-400 animate-pulse">Scanning on-chain disasters...</p>
                </div>
              ) : roastData ? (
                <div className="flex flex-col gap-5 relative">
                  <div className="text-center">
                    <p className="font-mono text-xs text-gray-400 mb-1 tracking-widest uppercase">Diagnosis</p>
                    <h3 className="font-display text-2xl font-bold text-red-500">{roastData.persona}</h3>
                  </div>

                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <p className="font-body text-sm text-gray-200 leading-relaxed italic">
                      "{roastData.roast}"
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                      <p className="font-mono text-[10px] text-gray-500 uppercase">Win Rate</p>
                      <p className="font-mono text-lg font-bold text-white">{roastData.winRate}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                      <p className="font-mono text-[10px] text-gray-500 uppercase">Rugs Survived</p>
                      <p className="font-mono text-lg font-bold text-white">{roastData.rugCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
                      <p className="font-mono text-[10px] text-gray-500 uppercase">Biggest Bag</p>
                      <p className="font-mono text-xs font-bold text-white mt-1 truncate px-1" title={roastData.biggestBag}>{roastData.biggestBag}</p>
                    </div>
                  </div>

                  <button className="w-full py-3 mt-2 rounded-xl bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1DA1F2]/20 transition-colors">
                    <Share2 size={16} /> Share to X
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
