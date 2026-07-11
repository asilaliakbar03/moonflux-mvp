"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, Zap, Brain, TrendingUp, Trophy, Crown,
  Users, RefreshCw, Check,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── COUNTDOWN HOOK ────────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => (s <= 0 ? 86400 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ── COUNT-UP HOOK ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// ── MOCK ANALYSIS PARAGRAPHS ─────────────────────────────────────────────────
const ANALYSIS_A = [
  "$LDOGE enters the arena with a devastating +142% weekly gain, backed by explosive social velocity. The Dog Meta narrative is at peak strength (94/100). Holder count up 340% this week. $LDOGE is the favorite.",
  "$PEPE2 fights back with classic underdog energy. Memetic potential is high — Pepe narratives have historically reversed against strong dogs. Volume spike in last 2h suggests whale accumulation.",
  "AI Prediction: LDOGE wins with 73% probability, but if PEPE2 crosses 40% vote threshold, a narrative flip could trigger a surprise pump.",
];

const ANALYSIS_B = [
  "$LDOGE's on-chain metrics are extraordinary: 847 Battle Power units forged from social momentum, holder velocity, and volume consistency. Dog meta is entering euphoric territory — 91% positive mentions in last 6h.",
  "$PEPE2 has quietly built a war chest. Three historically accurate early-mover wallets loaded significant positions 4 hours ago. Memetic resilience: 78/100. Do not count out the frog.",
  "Updated Prediction: LDOGE retains the edge at 69% confidence, but the gap is closing. If PEPE2 social velocity crosses 15K/hr the model flips. This battle is live — stay alert.",
];

// ── PAST BATTLES DATA ─────────────────────────────────────────────────────────
const PAST_BATTLES = [
  { a: "BONK", b: "WIF",  winner: "BONK", winnerPct: 71, loserPct: 29, ago: "2d ago" },
  { a: "MYRO", b: "FLOKI", winner: "FLOKI", winnerPct: 58, loserPct: 42, ago: "3d ago" },
  { a: "ACAT", b: "NOVA",  winner: "ACAT", winnerPct: 83, loserPct: 17, ago: "4d ago" },
  { a: "SWRM", b: "CPEP",  winner: "SWRM", winnerPct: 62, loserPct: 38, ago: "5d ago" },
];

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          initial={{ x: "50%", y: "50%", opacity: 1, scale: 1 }}
          animate={{
            x: `${30 + Math.random() * 40}%`,
            y: `${-10 + Math.random() * 110}%`,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.6, ease: "easeOut", delay: i * 0.02 }}
          style={{
            background: i % 3 === 0 ? "#e8b84b" : i % 3 === 1 ? "#a855f7" : "#10b981",
          }}
        />
      ))}
    </div>
  );
}

// ── BATTLE POWER DISPLAY ──────────────────────────────────────────────────────
function BattlePower({ value, color }: { value: number; color: string }) {
  const display = useCountUp(value);
  return (
    <div className="text-center mt-3">
      <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
        Battle Power
      </p>
      <motion.p
        className="font-display text-3xl font-bold"
        style={{ color, textShadow: `0 0 20px ${color}80` }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {display}
      </motion.p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ArenaPage() {
  const countdown = useCountdown(31337); // starts at 8:42:17

  // Vote state
  const [voted, setVoted] = useState<"ldoge" | "pepe2" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ldogeVotes, setLdogeVotes] = useState(12847);
  const [pepe2Votes, setPepe2Votes] = useState(6321);
  const totalVotes = ldogeVotes + pepe2Votes;
  const ldogePct = Math.round((ldogeVotes / totalVotes) * 100);
  const pepe2Pct = 100 - ldogePct;

  const handleVote = useCallback((side: "ldoge" | "pepe2") => {
    if (voted) return;
    setVoted(side);
    setShowConfetti(true);
    if (side === "ldoge") setLdogeVotes(v => v + 1);
    else setPepe2Votes(v => v + 1);
    setTimeout(() => setShowConfetti(false), 1200);
  }, [voted]);

  // AI Analysis
  const [analysisSet, setAnalysisSet] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const paragraphs = analysisSet === 0 ? ANALYSIS_A : ANALYSIS_B;

  const regenerate = async () => {
    if (analysisLoading) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/arena-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenA: "LDOGE", tokenB: "PEPE2" }),
      });
      if (res.ok) {
        // If we get API paragraphs, we can use them; for now toggle mock
      }
    } catch {
      // silent
    }
    await new Promise(r => setTimeout(r, 1800));
    setAnalysisSet(s => (s === 0 ? 1 : 0));
    setAnalysisLoading(false);
  };

  return (
    <div
      className="w-full flex-1 flex flex-col gap-6 pt-2 pb-8"
      style={{ minHeight: 0, color: "#f4f2ff" }}
    >

      {/* ── SECTION 1: HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase mb-2" style={{ color: "#6b6987" }}>
            L·08 Arena · Daily Token Battles
          </p>
          <h1 className="font-display text-4xl font-bold text-white leading-none flex items-center gap-3">
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              ⚔️
            </motion.span>
            Token Fight Club
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)", maxWidth: 440 }}>
            Community voting decides today&apos;s champions. Top token earns a Pump Boost badge.
          </p>
        </div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
          className="rounded-2xl px-5 py-4 flex flex-col items-end gap-1"
          style={{
            background: "rgba(10,8,5,0.97)",
            border: "1px solid rgba(232,184,75,0.28)",
            boxShadow: "0 0 30px rgba(232,184,75,0.08)",
          }}
        >
          <p className="font-mono text-[0.52rem] tracking-[0.35em] uppercase" style={{ color: "#6b6987" }}>
            Next Battle
          </p>
          <p
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: "#e8b84b", textShadow: "0 0 14px rgba(232,184,75,0.5)" }}
          >
            {countdown}
          </p>
        </motion.div>
      </motion.div>

      {/* ── SECTION 2: FEATURED BATTLE ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="rounded-3xl relative overflow-hidden"
        style={{
          background: "rgba(10,8,5,0.97)",
          border: "1px solid rgba(232,184,75,0.22)",
        }}
      >
        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        {/* Ambient glows */}
        <div className="absolute top-1/2 left-12 w-64 h-64 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
          style={{ background: "rgba(232,184,75,0.06)" }} />
        <div className="absolute top-1/2 right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
          style={{ background: "rgba(168,85,247,0.06)" }} />

        <div className="relative z-10 p-6">
          <p className="font-mono text-[0.52rem] tracking-[0.35em] uppercase text-center mb-6" style={{ color: "#6b6987" }}>
            ⚡ Today&apos;s Featured Battle ⚡
          </p>

          {/* VS layout */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

            {/* ── LEFT TOKEN: LDOGE ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
              className="flex flex-col items-center text-center gap-3"
            >
              {/* Avatar */}
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: "radial-gradient(circle at 35% 35%, rgba(232,184,75,0.25), rgba(0,0,0,0.8))",
                  border: "2px solid rgba(232,184,75,0.5)",
                  boxShadow: "0 0 40px rgba(232,184,75,0.4), inset 0 0 20px rgba(232,184,75,0.08)",
                }}
                animate={{ boxShadow: ["0 0 30px rgba(232,184,75,0.3)", "0 0 50px rgba(232,184,75,0.55)", "0 0 30px rgba(232,184,75,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🐕
              </motion.div>

              {/* Name & ticker */}
              <div>
                <p className="font-display text-xl font-bold text-white">LazDoge</p>
                <p className="font-mono text-[0.65rem] tracking-widest" style={{ color: "#e8b84b" }}>$LDOGE</p>
              </div>

              {/* Stats */}
              <div className="w-full rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: "rgba(232,184,75,0.05)", border: "1px solid rgba(232,184,75,0.12)" }}>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>Price</span>
                  <span className="font-mono text-xs text-white">$0.00234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>24h</span>
                  <span className="font-mono text-xs font-bold" style={{ color: "#10b981" }}>+142%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>Volume</span>
                  <span className="font-mono text-xs text-white">$2.8M</span>
                </div>
              </div>

              {/* Battle power */}
              <BattlePower value={847} color="#e8b84b" />

              {/* Tags */}
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="font-mono text-[0.55rem] tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                  🔥 Hot
                </span>
                <span className="font-mono text-[0.55rem] tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                  📈 Trending
                </span>
              </div>
            </motion.div>

            {/* ── CENTER VS ── */}
            <div className="flex flex-col items-center gap-4 min-w-[100px]">
              {/* VS text */}
              <motion.div
                className="font-display text-4xl font-black"
                style={{
                  background: "linear-gradient(135deg, #e8b84b, #ef4444, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 12px rgba(239,68,68,0.4))",
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                VS
              </motion.div>

              {/* Lightning bolt */}
              <motion.div
                animate={{ y: [-4, 4, -4], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap size={28} style={{ color: "#e8b84b", filter: "drop-shadow(0 0 8px rgba(232,184,75,0.8))" }} fill="#e8b84b" />
              </motion.div>

              {/* Vote bar */}
              <div className="w-full flex flex-col gap-2">
                <div className="h-3 rounded-full overflow-hidden flex"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <motion.div
                    className="h-full rounded-l-full"
                    style={{ background: "linear-gradient(90deg, #e8b84b, #d4a332)" }}
                    animate={{ width: `${ldogePct}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                  <motion.div
                    className="h-full rounded-r-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                    animate={{ width: `${pepe2Pct}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[0.5rem]" style={{ color: "#e8b84b" }}>{ldogePct}%</span>
                  <span className="font-mono text-[0.5rem]" style={{ color: "#a855f7" }}>{pepe2Pct}%</span>
                </div>
                <p className="font-mono text-[0.48rem] text-center tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Users size={9} className="inline mr-1" />
                  {(ldogeVotes + pepe2Votes).toLocaleString()} votes cast
                </p>
              </div>
            </div>

            {/* ── RIGHT TOKEN: PEPE2 ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
              className="flex flex-col items-center text-center gap-3"
            >
              {/* Avatar */}
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                style={{
                  background: "radial-gradient(circle at 35% 35%, rgba(168,85,247,0.25), rgba(0,0,0,0.8))",
                  border: "2px solid rgba(168,85,247,0.5)",
                  boxShadow: "0 0 40px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.08)",
                }}
                animate={{ boxShadow: ["0 0 30px rgba(168,85,247,0.3)", "0 0 50px rgba(168,85,247,0.55)", "0 0 30px rgba(168,85,247,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                🐸
              </motion.div>

              {/* Name & ticker */}
              <div>
                <p className="font-display text-xl font-bold text-white">Pepe2</p>
                <p className="font-mono text-[0.65rem] tracking-widest" style={{ color: "#a855f7" }}>$PEPE2</p>
              </div>

              {/* Stats */}
              <div className="w-full rounded-xl p-3 flex flex-col gap-1.5"
                style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)" }}>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>Price</span>
                  <span className="font-mono text-xs text-white">$0.00089</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>24h</span>
                  <span className="font-mono text-xs font-bold" style={{ color: "#10b981" }}>+38%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest" style={{ color: "#6b6987" }}>Volume</span>
                  <span className="font-mono text-xs text-white">$1.1M</span>
                </div>
              </div>

              {/* Battle power */}
              <BattlePower value={621} color="#a855f7" />

              {/* Tags */}
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="font-mono text-[0.55rem] tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
                  💀 Underdog
                </span>
                <span className="font-mono text-[0.55rem] tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
                  🚀 Rising
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── VOTE BUTTONS ── */}
          <div className="mt-8 relative">
            <Confetti active={showConfetti} />
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                onClick={() => handleVote("ldoge")}
                whileHover={!voted ? { scale: 1.04, y: -2 } : {}}
                whileTap={!voted ? { scale: 0.97 } : {}}
                disabled={!!voted}
                className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-mono text-sm font-bold tracking-widest uppercase transition-all"
                style={{
                  background: voted === "ldoge"
                    ? "linear-gradient(135deg, #e8b84b, #d4a332)"
                    : voted
                    ? "rgba(232,184,75,0.08)"
                    : "linear-gradient(135deg, #e8b84b, #c49a28)",
                  color: voted === "ldoge" ? "#000" : voted ? "rgba(232,184,75,0.4)" : "#000",
                  boxShadow: voted === "ldoge"
                    ? "0 0 30px rgba(232,184,75,0.6)"
                    : !voted
                    ? "0 0 20px rgba(232,184,75,0.3)"
                    : "none",
                  border: voted && voted !== "ldoge" ? "1px solid rgba(232,184,75,0.15)" : "none",
                  cursor: voted ? "not-allowed" : "pointer",
                }}
              >
                {voted === "ldoge" ? <Check size={16} /> : <Zap size={16} />}
                {voted === "ldoge" ? "Voted! ✓" : "⚡ Vote LDOGE"}
              </motion.button>

              <motion.button
                onClick={() => handleVote("pepe2")}
                whileHover={!voted ? { scale: 1.04, y: -2 } : {}}
                whileTap={!voted ? { scale: 0.97 } : {}}
                disabled={!!voted}
                className="relative flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-mono text-sm font-bold tracking-widest uppercase transition-all"
                style={{
                  background: voted === "pepe2"
                    ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                    : voted
                    ? "rgba(168,85,247,0.08)"
                    : "linear-gradient(135deg, #a855f7, #7c3aed)",
                  color: voted === "pepe2" ? "#fff" : voted ? "rgba(168,85,247,0.4)" : "#fff",
                  boxShadow: voted === "pepe2"
                    ? "0 0 30px rgba(168,85,247,0.7)"
                    : !voted
                    ? "0 0 20px rgba(168,85,247,0.35)"
                    : "none",
                  border: voted && voted !== "pepe2" ? "1px solid rgba(168,85,247,0.15)" : "none",
                  cursor: voted ? "not-allowed" : "pointer",
                }}
              >
                {voted === "pepe2" ? <Check size={16} /> : <TrendingUp size={16} />}
                {voted === "pepe2" ? "Voted! ✓" : "🌊 Vote PEPE2"}
              </motion.button>
            </div>

            {voted && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center font-mono text-[0.55rem] tracking-widest uppercase mt-4"
                style={{ color: "#6b6987" }}
              >
                Your vote has been counted. Results update live.
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── SECTION 3: AI BATTLE ANALYSIS ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        className="rounded-3xl relative overflow-hidden"
        style={{
          background: "rgba(10,8,5,0.97)",
          border: "1px solid rgba(168,85,247,0.22)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" }}>
                <Brain size={18} style={{ color: "#a855f7" }} />
              </div>
              <div>
                <p className="font-display text-base font-semibold" style={{ color: "#c4b5fd" }}>AI Battle Analysis</p>
                <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color: "#6b6987" }}>
                  Powered by MoonFluxx Arena AI
                </p>
              </div>
            </div>

            <motion.button
              onClick={regenerate}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              disabled={analysisLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[0.58rem] tracking-widest uppercase"
              style={{
                border: "1px solid rgba(168,85,247,0.4)",
                color: "#a855f7",
                background: "rgba(168,85,247,0.08)",
                cursor: analysisLoading ? "wait" : "pointer",
                opacity: analysisLoading ? 0.6 : 1,
              }}
            >
              <motion.div
                animate={analysisLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={analysisLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw size={12} />
              </motion.div>
              {analysisLoading ? "Analyzing…" : "Regenerate Analysis"}
            </motion.button>
          </div>

          {/* Paragraphs */}
          <AnimatePresence mode="wait">
            <motion.div
              key={analysisSet}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col gap-4"
            >
              {paragraphs.map((para, i) => (
                <div
                  key={i}
                  className="pl-4 py-0.5"
                  style={{
                    borderLeft: `3px solid ${
                      i === 0 ? "rgba(232,184,75,0.5)" :
                      i === 1 ? "rgba(168,85,247,0.5)" :
                      "rgba(56,189,248,0.5)"
                    }`,
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,242,255,0.8)" }}>
                    {para}
                  </p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── SECTION 4: BATTLE HISTORY ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={18} style={{ color: "#e8b84b" }} />
          <h2 className="font-display text-lg font-semibold text-white">Battle History</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAST_BATTLES.map((battle, i) => {
            const isWinnerA = battle.winner === battle.a;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.45, ease: EASE }}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  background: "rgba(10,8,5,0.97)",
                  border: "1px solid rgba(232,184,75,0.16)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

                {/* Tokens row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-display text-sm font-bold"
                      style={{ color: isWinnerA ? "#e8b84b" : "rgba(255,255,255,0.4)" }}
                    >
                      ${battle.a}
                    </span>
                    {isWinnerA && (
                      <Crown size={12} style={{ color: "#e8b84b" }} fill="#e8b84b" />
                    )}
                  </div>
                  <span className="font-mono text-[0.5rem]" style={{ color: "rgba(255,255,255,0.25)" }}>VS</span>
                  <div className="flex items-center gap-2">
                    {!isWinnerA && (
                      <Crown size={12} style={{ color: "#e8b84b" }} fill="#e8b84b" />
                    )}
                    <span
                      className="font-display text-sm font-bold"
                      style={{ color: !isWinnerA ? "#e8b84b" : "rgba(255,255,255,0.4)" }}
                    >
                      ${battle.b}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden flex mb-2"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${isWinnerA ? battle.winnerPct : battle.loserPct}%`,
                      background: "linear-gradient(90deg, #e8b84b, #c49a28)",
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${isWinnerA ? battle.loserPct : battle.winnerPct}%`,
                      background: "rgba(168,85,247,0.35)",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[0.5rem] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(232,184,75,0.12)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.25)" }}>
                      👑 {battle.winner} {battle.winnerPct}%
                    </span>
                  </div>
                  <span className="font-mono text-[0.48rem]" style={{ color: "#6b6987" }}>{battle.ago}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── FOOTER BADGE INFO ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: "rgba(232,184,75,0.05)", border: "1px solid rgba(232,184,75,0.12)" }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.3)" }}>
          <Swords size={18} style={{ color: "#e8b84b" }} />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-white">Pump Boost Badge</p>
          <p className="font-mono text-[0.52rem] tracking-widest" style={{ color: "#6b6987" }}>
            The winning token each day receives a Pump Boost badge — displayed on their token card for 24h, driving
            discovery and community momentum.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
