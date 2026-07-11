"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Settings2,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bot,
  SendHorizonal,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "rgba(10,8,5,0.97)",
  bgPanel: "rgba(14,11,7,0.98)",
  bgDeep: "rgba(7,5,2,1)",
  border: "rgba(232,184,75,0.22)",
  borderHi: "rgba(232,184,75,0.55)",
  gold: "#e8b84b",
  goldHi: "#f5d98a",
  goldDim: "rgba(232,184,75,0.45)",
  success: "#10b981",
  danger: "#ef4444",
  violet: "#a855f7",
  blue: "#38bdf8",
  orange: "#f97316",
  dim: "rgba(200,185,155,0.5)",
  ink: "rgba(245,237,210,0.92)",
  champagne: "#f7edd3",
};

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

// Cheap deterministic-ish simulated price series
function useSimSeries(count: number) {
  const [tick, setTick] = useState(0);
  const seedRef = useRef(0.00234);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100000), 900);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    let v = 0.0021;
    const pts: number[] = [];
    for (let i = 0; i < count; i++) {
      const wobble =
        Math.sin(i * 0.55 + tick * 0.35) * 0.00012 +
        Math.sin(i * 0.17 + tick * 0.12) * 0.00018;
      v += wobble + 0.0000065;
      pts.push(v);
    }
    seedRef.current = pts[pts.length - 1];
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    return { pts, min, max, last: pts[pts.length - 1] };
  }, [count, tick]);
}

function AreaChart() {
  const W = 800;
  const H = 320;
  const PAD = 8;
  const { pts, min, max, last } = useSimSeries(64);

  const range = max - min || 1;
  const x = (i: number) => PAD + (i / (pts.length - 1)) * (W - PAD * 2);
  const y = (val: number) => PAD + (1 - (val - min) / range) * (H - PAD * 2);

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p).toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M ${x(0).toFixed(1)} ${(H - PAD).toFixed(1)} ` +
    pts.map((p, i) => `L ${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ") +
    ` L ${x(pts.length - 1).toFixed(1)} ${(H - PAD).toFixed(1)} Z`;

  const lastY = y(last);
  const lastX = x(pts.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="mfGoldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d98a" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#e0b64f" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#a9812c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mfGoldLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9812c" />
          <stop offset="50%" stopColor="#f5d98a" />
          <stop offset="100%" stopColor="#f7edd3" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill="url(#mfGoldArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
      <motion.path d={linePath} fill="none" stroke="url(#mfGoldLine)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 6px rgba(224,182,79,0.35))" }} />
      <line x1={0} x2={W} y1={lastY} y2={lastY} stroke="#e0b64f" strokeOpacity="0.35" strokeDasharray="4 6" strokeWidth={1} />
      <circle cx={lastX} cy={lastY} r={4} fill="#f5d98a">
        <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={lastX} cy={lastY} r={2.5} fill="#f7edd3" />
    </svg>
  );
}

// ─── Watchlist data ───────────────────────────────────────────────────────────
const WATCHLIST = [
  { name: "LazDoge",  ticker: "LDOGE", price: "0.00234", chg: "+142.5%", pos: true  },
  { name: "Pepe2",    ticker: "PEPE2", price: "0.00089", chg: "+38.2%",  pos: true  },
  { name: "Bonk",     ticker: "BONK",  price: "0.00017", chg: "+12.7%",  pos: true  },
  { name: "Floki",    ticker: "FLOKI", price: "0.00041", chg: "-4.1%",   pos: false },
  { name: "WifHat",   ticker: "WIF",   price: "1.8240",  chg: "+21.3%",  pos: true  },
  { name: "Myro",     ticker: "MYRO",  price: "0.0521",  chg: "-8.6%",   pos: false },
];

// ─── Narratives data ──────────────────────────────────────────────────────────
const NARRATIVES = [
  { name: "Dog Meta",    score: 94, trend: "+12", color: C.gold,    icon: "🐕", sources: ["X","TG","Reddit"] },
  { name: "Meme Season", score: 88, trend: "+8",  color: C.orange,  icon: "🔥", sources: ["X","TG"] },
  { name: "AI Agents",   score: 76, trend: "+5",  color: C.violet,  icon: "🤖", sources: ["X","Reddit"] },
  { name: "Gaming",      score: 71, trend: "+3",  color: C.blue,    icon: "🎮", sources: ["TG","Reddit"] },
  { name: "RWA",         score: 58, trend: "-2",  color: C.danger,  icon: "🏦", sources: ["X"] },
];

const SIGNALS = [
  { text: "LDOGE trending on X",       time: "2m ago",  color: C.gold    },
  { text: "Dog Meta vol spike +340%",  time: "5m ago",  color: C.orange  },
  { text: "AI Agents breakout signal", time: "11m ago", color: C.violet  },
  { text: "Meme Season sentiment peak",time: "18m ago", color: C.success },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function PulsingRing({ color, size = 72 }: { color: string; size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: `1.5px solid ${color}`, width: size, height: size }}
          animate={{ scale: [1, 1.48 + i * 0.18, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.2, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: `radial-gradient(circle, ${color}22 0%, ${color}08 100%)`,
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 22px ${color}55, inset 0 0 12px ${color}22`,
        }}
      >
        <TrendingUp size={size * 0.24} color={color} />
      </div>
    </div>
  );
}

function ScoreBar({ score, color, delay = 0 }: { score: number; color: string; delay?: number }) {
  return (
    <div className="relative rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.06)", flex: 1 }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 6px ${color}66` }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />
    </div>
  );
}

function SourceBadge({ src }: { src: string }) {
  const colors: Record<string, string> = { X: "#fff", TG: C.blue, Reddit: C.orange };
  return (
    <span
      className="font-mono rounded text-xs"
      style={{
        padding: "2px 6px",
        background: `${colors[src]}18`,
        color: colors[src],
        border: `1px solid ${colors[src]}33`,
        fontSize: "0.65rem",
      }}
    >
      {src}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export default function TerminalPage() {
  const [timeframe, setTimeframe] = useState("15m");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [activeToken, setActiveToken] = useState("LDOGE");
  const [slippage, setSlippage] = useState<"0.5" | "1" | "2" | "5" | "custom">("1");
  const [customSlippage, setCustomSlippage] = useState("");
  const [mevProtection, setMevProtection] = useState(true);
  const [showSlippage, setShowSlippage] = useState(false);

  // ── Trade Copilot state ──
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotChips, setCopilotChips] = useState<string[]>(["Set price alert", "Check volume", "Size my position"]);
  const copilotScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Starter message on mount
    setCopilotMessages([
      {
        role: "assistant",
        content: `Ready. I can analyze $LDOGE, set alerts, or help you size positions. What would you like to know?`,
      },
    ]);
  }, []);

  useEffect(() => {
    if (copilotScrollRef.current) {
      copilotScrollRef.current.scrollTop = copilotScrollRef.current.scrollHeight;
    }
  }, [copilotMessages, copilotLoading]);

  const sendCopilotMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || copilotLoading) return;

    setCopilotMessages((prev) => [...prev, { role: "user", content: msg }]);
    setCopilotInput("");
    setCopilotChips([]);
    setCopilotLoading(true);

    try {
      const res = await fetch("/api/trade-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          tokenContext: { ticker: activeToken, price: "0.00234", change: "+142.5%", volume: "$423K", mcap: "$2.1M" },
        }),
      });
      const data = await res.json();
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "Unable to analyze right now." }]);
      setCopilotChips(data.chips ?? ["Check volume", "Set price alert", "Show indicators"]);
    } catch {
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Try again in a moment." }]);
      setCopilotChips(["Retry", "Check volume", "Set price alert"]);
    } finally {
      setCopilotLoading(false);
    }
  }, [activeToken, copilotLoading]);

  const MOCK_PRICE = 0.000482; // LDOGE price
  const BALANCE = 84.2;
  const solAmount = parseFloat(amount) || 0;
  const slippagePct = slippage === "custom" ? (parseFloat(customSlippage) || 1) : parseFloat(slippage);
  const expectedTokens = solAmount > 0 ? (solAmount / MOCK_PRICE) * (1 - slippagePct / 100) : 0;
  const priceImpact = solAmount < 0.5 ? 0.12 : solAmount < 2 ? 0.8 : solAmount < 5 ? 2.4 : 5.1;
  const impactColor = priceImpact < 1 ? C.success : priceImpact < 3 ? "#f59e0b" : C.danger;

  return (
    <div
      className="flex flex-col"
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: `${C.gold}12`, border: `1px solid ${C.border}` }}
          >
            <BarChart3 size={14} color={C.gold} />
            <span className="font-mono tracking-widest text-xs" style={{ color: C.gold }}>
              LAYER 12 · PRO TERMINAL
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: `${C.violet}12`, border: `1px solid ${C.violet}33` }}
          >
            <Brain size={14} color={C.violet} />
            <span className="font-mono tracking-widest text-xs" style={{ color: C.violet }}>
              L·13 NARRATIVE RADAR · LIVE
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {[Settings2, Maximize2].map((Icon, i) => (
            <button
              key={i}
              className="flex items-center justify-center rounded-lg"
              style={{ width: 34, height: 34, background: C.bgPanel, border: `1px solid ${C.border}` }}
            >
              <Icon size={15} color={C.goldDim} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Main 3-col grid — scrollable on mobile ── */}
      <div className="overflow-x-auto flex-1">
      <div
        className="flex-1 grid gap-3"
        style={{ gridTemplateColumns: "230px 1fr 300px", minHeight: 0, minWidth: 900 }}
      >
        {/* ══ LEFT SIDEBAR — Watchlist ══ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="flex flex-col rounded-xl overflow-hidden"
          style={{ background: C.bgPanel, border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2">
              <Activity size={13} color={C.gold} />
              <span className="font-mono tracking-widest text-xs font-semibold" style={{ color: C.gold }}>
                WATCHLIST
              </span>
            </div>
            <span
              className="font-mono rounded px-2 py-0.5 text-xs"
              style={{ background: `${C.gold}22`, color: C.gold }}
            >
              {WATCHLIST.length}
            </span>
          </div>

          {/* Col headings */}
          <div
            className="flex px-4 py-2 justify-between"
            style={{ borderBottom: `1px solid rgba(232,184,75,0.08)` }}
          >
            <span className="font-mono text-xs" style={{ color: C.dim }}>TOKEN</span>
            <span className="font-mono text-xs" style={{ color: C.dim }}>24H</span>
          </div>

          {/* Token rows */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {WATCHLIST.map((tok, i) => (
              <motion.button
                key={tok.ticker}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.14 + i * 0.06 }}
                onClick={() => setActiveToken(tok.ticker)}
                className="w-full text-left px-4 py-3 flex flex-col gap-1 transition-all"
                style={{
                  background: activeToken === tok.ticker ? `${C.gold}10` : "transparent",
                  borderLeft: activeToken === tok.ticker ? `2px solid ${C.gold}` : "2px solid transparent",
                  borderBottom: `1px solid rgba(232,184,75,0.06)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm" style={{ color: C.ink }}>
                    {tok.ticker}
                  </span>
                  <span
                    className="font-mono flex items-center gap-0.5 text-xs"
                    style={{ color: tok.pos ? C.success : C.danger }}
                  >
                    {tok.pos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {tok.chg}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" style={{ color: C.dim }}>{tok.name}</span>
                  <span className="font-mono text-xs" style={{ color: C.champagne }}>{tok.price}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Add token */}
          <div className="p-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono tracking-wider text-xs transition-all hover:opacity-80"
              style={{ background: `${C.gold}14`, border: `1px solid ${C.border}`, color: C.gold }}
            >
              <Plus size={12} />
              Add Token
            </button>
          </div>
        </motion.div>

        {/* ══ MAIN CHART AREA + COPILOT ══ */}
        <div className="flex flex-col gap-3 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="flex flex-col rounded-xl overflow-hidden"
          style={{ background: C.bgPanel, border: `1px solid ${C.border}` }}
        >
          {/* Token header bar */}
          <div
            className="flex items-center gap-5 px-5 py-3 flex-wrap"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono font-bold tracking-wide text-base"
                style={{ color: C.goldHi, textShadow: `0 0 12px ${C.gold}88` }}
              >
                LDOGE/SOL
              </span>
              <span
                className="font-mono px-2 py-0.5 rounded text-xs"
                style={{ background: `${C.success}18`, color: C.success, border: `1px solid ${C.success}33` }}
              >
                SPOT
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-semibold text-xl" style={{ color: C.champagne }}>0.00234</span>
              <span className="font-mono flex items-center gap-0.5 text-sm" style={{ color: C.success }}>
                <ArrowUpRight size={13} /> +142.5%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs" style={{ color: C.dim }}>Vol</span>
              <span className="font-mono text-sm font-medium" style={{ color: C.ink }}>$423K</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs" style={{ color: C.dim }}>MCap</span>
              <span className="font-mono text-sm font-medium" style={{ color: C.ink }}>$2.1M</span>
            </div>
            <div style={{ flex: 1 }} />
            {/* Timeframe buttons */}
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="font-mono rounded text-xs font-medium transition-all"
                  style={{
                    padding: "4px 10px",
                    ...(tf === timeframe
                      ? {
                          background: `linear-gradient(135deg, #a9812c, ${C.gold}, #f5d98a)`,
                          color: "#0a0805",
                          fontWeight: 700,
                          boxShadow: `0 0 10px ${C.gold}55`,
                        }
                      : { background: "transparent", color: C.dim }),
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div
            className="relative"
            style={{
              flex: "1 1 180px",
              minHeight: 200,
              background: "rgba(7,5,2,0.95)",
              backgroundImage:
                "linear-gradient(rgba(232,184,75,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,184,75,0.03) 1px,transparent 1px)",
              backgroundSize: "40px 32px",
            }}
          >
            <div className="absolute inset-0" style={{ right: 60 }}>
              <AreaChart />
            </div>
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ right: 60, width: 60, background: `linear-gradient(to left, ${C.gold}0a, transparent)` }}
            />
            {/* Price axis */}
            <div
              className="absolute top-0 bottom-0 right-0 flex flex-col justify-between py-3 items-center"
              style={{ width: 60, borderLeft: `1px solid ${C.border}`, background: "rgba(10,8,5,0.8)" }}
            >
              <span className="font-mono text-xs" style={{ color: C.dim }}>0.0028</span>
              <span
                className="font-mono font-semibold rounded px-1.5 py-0.5 text-xs"
                style={{ background: C.gold, color: "#0a0805" }}
              >
                0.00234
              </span>
              <span className="font-mono text-xs" style={{ color: C.dim }}>0.0018</span>
            </div>
          </div>

          {/* Technical indicator badges */}
          <div
            className="flex items-center gap-2.5 px-5 py-2.5 flex-wrap"
            style={{ borderTop: `1px solid ${C.border}`, background: "rgba(10,8,5,0.55)" }}
          >
            <span className="font-mono text-xs font-medium" style={{ color: C.dim }}>INDICATORS</span>
            {[
              { label: "RSI",  val: "68",  tag: "Neutral",    col: C.blue    },
              { label: "MACD", val: "",    tag: "Bullish",    col: C.success },
              { label: "Vol",  val: "",    tag: "High",       col: C.orange  },
              { label: "BB",   val: "",    tag: "Upper Band", col: "#eab308" },
            ].map((ind) => (
              <div
                key={ind.label}
                className="flex items-center gap-1.5 rounded-md"
                style={{
                  padding: "4px 10px",
                  background: `${ind.col}14`,
                  border: `1px solid ${ind.col}33`,
                }}
              >
                <span className="font-mono font-semibold text-xs" style={{ color: ind.col }}>{ind.label}</span>
                {ind.val && <span className="font-mono text-xs" style={{ color: C.ink }}>{ind.val}</span>}
                <span className="font-mono text-xs" style={{ color: `${ind.col}cc` }}>{ind.tag}</span>
              </div>
            ))}
          </div>

          {/* Order Book + Trade Panel row */}
          <div className="flex" style={{ borderTop: `1px solid ${C.border}`, flex: "0 0 auto" }}>
            {/* Order Book */}
            <div className="flex-1 p-4 flex flex-col" style={{ borderRight: `1px solid ${C.border}` }}>
              <div className="flex justify-between mb-3">
                <span className="font-mono text-xs font-semibold" style={{ color: C.dim }}>ORDER BOOK</span>
                <span className="font-mono text-xs font-semibold" style={{ color: C.gold }}>LDOGE/SOL</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs" style={{ color: C.dim }}>PRICE</span>
                <span className="font-mono text-xs" style={{ color: C.dim }}>SIZE</span>
              </div>
              {/* Asks */}
              <div className="flex flex-col gap-1 mb-1">
                {[
                  { p: "0.00238", s: "842K", w: 90 },
                  { p: "0.00237", s: "615K", w: 72 },
                  { p: "0.00236", s: "423K", w: 54 },
                  { p: "0.00235", s: "210K", w: 36 },
                ].map((ask) => (
                  <div key={ask.p} className="flex justify-between relative cursor-pointer py-0.5">
                    <div className="absolute right-0 inset-y-0 rounded-sm" style={{ width: `${ask.w}%`, background: `${C.danger}14` }} />
                    <span className="relative z-10 font-mono text-xs" style={{ color: C.danger }}>{ask.p}</span>
                    <span className="relative z-10 font-mono text-xs" style={{ color: C.ink }}>{ask.s}</span>
                  </div>
                ))}
              </div>
              {/* Spread */}
              <div
                className="text-center rounded font-mono font-semibold text-sm"
                style={{
                  padding: "4px 0",
                  margin: "4px 0",
                  color: C.gold,
                  background: `${C.gold}0e`,
                  border: `1px solid ${C.border}`,
                  textShadow: `0 0 8px ${C.gold}66`,
                }}
              >
                0.00234
                <span className="font-mono ml-2 text-xs" style={{ color: C.dim }}>$1.42</span>
              </div>
              {/* Bids */}
              <div className="flex flex-col gap-1 mt-1">
                {[
                  { p: "0.00233", s: "310K", w: 48 },
                  { p: "0.00232", s: "512K", w: 62 },
                  { p: "0.00231", s: "780K", w: 80 },
                  { p: "0.00230", s: "924K", w: 94 },
                ].map((bid) => (
                  <div key={bid.p} className="flex justify-between relative cursor-pointer py-0.5">
                    <div className="absolute right-0 inset-y-0 rounded-sm" style={{ width: `${bid.w}%`, background: `${C.success}14` }} />
                    <span className="relative z-10 font-mono text-xs" style={{ color: C.success }}>{bid.p}</span>
                    <span className="relative z-10 font-mono text-xs" style={{ color: C.ink }}>{bid.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade Execution */}
            <div className="flex flex-col gap-2 p-4 relative overflow-hidden" style={{ width: 210 }}>
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: side === "BUY"
                    ? `linear-gradient(to top, ${C.success}0c, transparent)`
                    : `linear-gradient(to top, ${C.danger}0c, transparent)`,
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono text-[0.6rem] font-semibold tracking-widest uppercase" style={{ color: C.dim }}>Execute</span>
                <button
                  onClick={() => setShowSlippage(s => !s)}
                  className="font-mono text-[0.55rem] px-2 py-1 rounded-md transition-all flex items-center gap-1"
                  style={{
                    background: showSlippage ? "rgba(232,184,75,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${showSlippage ? "rgba(232,184,75,0.4)" : C.border}`,
                    color: showSlippage ? C.gold : C.dim,
                  }}
                >
                  ⚙ {slippage === "custom" ? customSlippage || "?" : slippage}%
                </button>
              </div>

              {/* Slippage panel */}
              <AnimatePresence>
                {showSlippage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative z-10 rounded-lg p-2.5 overflow-hidden"
                    style={{ background: "rgba(7,5,2,0.95)", border: `1px solid ${C.border}` }}
                  >
                    <p className="font-mono text-[0.5rem] tracking-widest uppercase mb-2" style={{ color: C.dim }}>Slippage Tolerance</p>
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {(["0.5", "1", "2", "5"] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => { setSlippage(s); setCustomSlippage(""); }}
                          className="py-1.5 rounded font-mono text-[0.55rem] transition-all"
                          style={{
                            background: slippage === s ? "rgba(232,184,75,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${slippage === s ? "rgba(232,184,75,0.5)" : C.border}`,
                            color: slippage === s ? C.gold : C.dim,
                          }}
                        >
                          {s}%
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        placeholder="Custom %"
                        value={customSlippage}
                        onChange={e => { setCustomSlippage(e.target.value); setSlippage("custom"); }}
                        className="flex-1 bg-transparent rounded px-2 py-1.5 font-mono text-[0.6rem] outline-none"
                        style={{ border: `1px solid ${slippage === "custom" ? "rgba(232,184,75,0.5)" : C.border}`, color: C.champagne }}
                      />
                      <span className="font-mono text-[0.55rem]" style={{ color: C.dim }}>%</span>
                    </div>
                    {slippagePct > 5 && (
                      <p className="font-mono text-[0.5rem] mt-1.5" style={{ color: C.danger }}>⚠ High slippage — may result in unfavorable trade</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BUY / SELL toggle */}
              <div
                className="flex rounded-lg p-0.5 relative z-10"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}
              >
                {(["BUY","SELL"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className="flex-1 rounded-md font-mono font-bold text-xs transition-all"
                    style={{
                      padding: "7px 0",
                      ...(side === s
                        ? {
                            background: s === "BUY" ? C.success : C.danger,
                            color: "#fff",
                            boxShadow: `0 0 10px ${s === "BUY" ? C.success : C.danger}55`,
                          }
                        : { color: C.dim }),
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div
                className="rounded-lg p-3 relative z-10"
                style={{ background: "rgba(7,5,2,0.8)", border: `1px solid ${C.border}` }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-[0.58rem]" style={{ color: C.dim }}>{side === "BUY" ? "Pay" : `Sell ${activeToken}`}</span>
                  <span className="font-mono text-[0.55rem]" style={{ color: C.dim }}>Bal: {BALANCE} SOL</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent border-none outline-none font-mono w-2/3 text-base"
                    style={{ color: C.champagne }}
                  />
                  <span className="font-mono text-sm font-semibold" style={{ color: C.gold }}>SOL</span>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-1 relative z-10">
                {(["0.1", "0.5", "1", "MAX"] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(q === "MAX" ? String(BALANCE) : q)}
                    className="py-1 rounded font-mono text-[0.52rem] transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.dim }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.gold; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,184,75,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.dim; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Expected output + price impact */}
              {solAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg p-2.5 relative z-10"
                  style={{ background: "rgba(7,5,2,0.8)", border: `1px solid ${C.border}` }}
                >
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[0.52rem]" style={{ color: C.dim }}>Expected out</span>
                    <span className="font-mono text-[0.58rem] font-semibold" style={{ color: C.champagne }}>
                      {expectedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} {activeToken}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[0.52rem]" style={{ color: C.dim }}>Price impact</span>
                    <span className="font-mono text-[0.58rem] font-semibold" style={{ color: impactColor }}>
                      {priceImpact < 0.01 ? "< 0.01" : priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[0.52rem]" style={{ color: C.dim }}>Min received</span>
                    <span className="font-mono text-[0.52rem]" style={{ color: C.dim }}>
                      {(expectedTokens * (1 - slippagePct / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* MEV Protection toggle */}
              <div className="flex items-center justify-between relative z-10 px-1">
                <span className="font-mono text-[0.52rem]" style={{ color: C.dim }}>MEV Protection</span>
                <button
                  onClick={() => setMevProtection(m => !m)}
                  className="relative w-8 h-4 rounded-full p-0.5 flex cursor-pointer transition-all"
                  style={{
                    background: mevProtection ? C.success : "rgba(255,255,255,0.08)",
                    border: `1px solid ${mevProtection ? C.success + "80" : C.border}`,
                  }}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 620, damping: 34 }}
                    className="w-3 h-3 rounded-full"
                    style={{ background: mevProtection ? "#000" : "#6b6987", marginLeft: mevProtection ? "auto" : "0" }}
                  />
                </button>
              </div>

              {/* Execute button */}
              <button
                className="w-full rounded-lg font-mono font-bold tracking-widest uppercase relative z-10 text-xs transition-all"
                style={{
                  padding: "11px 0",
                  background: side === "BUY"
                    ? `linear-gradient(135deg, #059669, ${C.success})`
                    : `linear-gradient(135deg, #dc2626, ${C.danger})`,
                  color: "#fff",
                  boxShadow: side === "BUY"
                    ? `0 0 16px ${C.success}44`
                    : `0 0 16px ${C.danger}44`,
                }}
              >
                {side} {solAmount > 0 ? `${solAmount} SOL` : activeToken}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ══ TRADE COPILOT PANEL ══ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            background: C.bgPanel,
            border: `1px solid rgba(168,85,247,0.28)`,
            boxShadow: `0 0 32px rgba(168,85,247,0.07), inset 0 0 60px rgba(168,85,247,0.03)`,
            maxHeight: 280,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
            style={{
              borderBottom: `1px solid rgba(168,85,247,0.22)`,
              background: `linear-gradient(90deg, rgba(168,85,247,0.12) 0%, transparent 60%)`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-md"
                style={{ width: 24, height: 24, background: `${C.violet}22`, border: `1px solid ${C.violet}44` }}
              >
                <Bot size={13} color={C.violet} />
              </div>
              <span className="font-mono font-bold tracking-widest text-xs" style={{ color: C.violet, textShadow: `0 0 8px ${C.violet}66` }}>
                TRADE COPILOT
              </span>
              <motion.div
                className="rounded-full ml-1"
                style={{ width: 5, height: 5, background: C.violet }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} color={`${C.violet}88`} />
              <span className="font-mono text-xs" style={{ color: `${C.violet}77` }}>claude-3-5-haiku</span>
            </div>
          </div>

          {/* Message area */}
          <div
            ref={copilotScrollRef}
            className="flex flex-col gap-2 overflow-y-auto px-3 py-2.5 flex-1"
            style={{ maxHeight: 160 }}
          >
            <AnimatePresence initial={false}>
              {copilotMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="flex gap-2 max-w-[88%]"
                      style={{
                        borderLeft: `2px solid ${C.violet}`,
                        paddingLeft: 8,
                      }}
                    >
                      <p
                        className="font-mono text-xs leading-relaxed"
                        style={{ color: "rgba(245,237,210,0.88)" }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="rounded-lg px-3 py-1.5 max-w-[78%]"
                      style={{
                        background: `${C.gold}18`,
                        border: `1px solid ${C.gold}33`,
                      }}
                    >
                      <p className="font-mono text-xs" style={{ color: C.gold }}>
                        {msg.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading dots */}
            <AnimatePresence>
              {copilotLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="flex items-center gap-1.5"
                    style={{ borderLeft: `2px solid ${C.violet}`, paddingLeft: 8 }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="rounded-full"
                        style={{ width: 5, height: 5, background: C.violet }}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.1, delay: dot * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggestion chips */}
          <AnimatePresence>
            {copilotChips.length > 0 && !copilotLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-1.5 px-3 pb-2 flex-shrink-0 overflow-x-auto"
                style={{ borderTop: `1px solid rgba(168,85,247,0.12)`, paddingTop: 6 }}
              >
                {copilotChips.map((chip, i) => (
                  <motion.button
                    key={chip}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => sendCopilotMessage(chip)}
                    className="flex-shrink-0 font-mono rounded-full text-xs transition-all"
                    style={{
                      padding: "3px 10px",
                      background: `${C.violet}14`,
                      border: `1px solid ${C.violet}35`,
                      color: C.violet,
                      fontSize: "0.6rem",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${C.violet}28`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${C.violet}66`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${C.violet}14`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${C.violet}35`;
                    }}
                  >
                    {chip}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div
            className="flex items-center gap-2 px-3 pb-3 pt-1 flex-shrink-0"
            style={{ borderTop: `1px solid rgba(168,85,247,0.15)` }}
          >
            <MessageSquare size={13} color={`${C.violet}66`} className="flex-shrink-0" />
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendCopilotMessage(copilotInput); } }}
              placeholder="Ask about LDOGE..."
              disabled={copilotLoading}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs placeholder:opacity-30"
              style={{ color: C.champagne, caretColor: C.violet }}
            />
            <button
              onClick={() => sendCopilotMessage(copilotInput)}
              disabled={copilotLoading || !copilotInput.trim()}
              className="flex items-center justify-center rounded-lg transition-all flex-shrink-0"
              style={{
                width: 28,
                height: 28,
                background: copilotInput.trim() && !copilotLoading ? `${C.violet}33` : "rgba(255,255,255,0.04)",
                border: `1px solid ${copilotInput.trim() && !copilotLoading ? `${C.violet}66` : C.border}`,
                opacity: copilotLoading || !copilotInput.trim() ? 0.45 : 1,
              }}
            >
              <SendHorizonal size={12} color={C.violet} />
            </button>
          </div>
        </motion.div>
        </div>

        {/* ══ RIGHT PANEL — L·13 Narrative Radar ══ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-col rounded-xl overflow-hidden"
          style={{ background: C.bgPanel, border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="flex items-center justify-center rounded-md"
                style={{ width: 26, height: 26, background: `${C.violet}22`, border: `1px solid ${C.violet}44` }}
              >
                <Brain size={14} color={C.violet} />
              </div>
              <span
                className="font-mono font-bold tracking-widest text-sm"
                style={{ color: C.violet, textShadow: `0 0 10px ${C.violet}66` }}
              >
                L·13 NARRATIVE RADAR
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="rounded-full"
                style={{ width: 6, height: 6, background: C.success }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="font-mono text-xs" style={{ color: C.dim }}>
                Live sentiment · X, Telegram, Reddit
              </span>
            </div>
          </div>

          {/* Narrative rows */}
          <div className="flex flex-col p-4 gap-0" style={{ flex: "1 1 0", overflowY: "auto" }}>
            <span className="font-mono mb-3 text-xs font-semibold tracking-widest" style={{ color: C.dim }}>
              ACTIVE NARRATIVES
            </span>
            {NARRATIVES.map((nar, i) => (
              <motion.div
                key={nar.name}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.08 }}
                className="flex flex-col gap-2 py-3"
                style={{ borderBottom: i < NARRATIVES.length - 1 ? `1px solid rgba(232,184,75,0.08)` : "none" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "1.1rem" }}>{nar.icon}</span>
                    <span className="font-mono font-semibold text-sm" style={{ color: C.ink }}>{nar.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-base" style={{ color: nar.color }}>{nar.score}</span>
                    <span
                      className="font-mono flex items-center gap-0.5 text-xs"
                      style={{ color: nar.trend.startsWith("+") ? C.success : C.danger }}
                    >
                      {nar.trend.startsWith("+") ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {nar.trend}
                    </span>
                  </div>
                </div>
                <ScoreBar score={nar.score} color={nar.color} delay={0.38 + i * 0.1} />
                <div className="flex gap-1.5">
                  {nar.sources.map((s) => <SourceBadge key={s} src={s} />)}
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Bull Run Signal */}
          <div
            className="p-4 flex flex-col items-start gap-3"
            style={{
              borderTop: `1px solid ${C.border}`,
              background: `radial-gradient(ellipse at top, ${C.success}08 0%, transparent 70%)`,
            }}
          >
            <div className="flex items-center gap-2">
              <Zap size={13} color={C.gold} />
              <span className="font-mono tracking-widest text-xs font-semibold" style={{ color: C.gold }}>
                AI BULL RUN SIGNAL
              </span>
            </div>
            <div className="flex items-center gap-5 w-full">
              <PulsingRing color={C.success} size={76} />
              <div className="flex flex-col gap-1.5">
                <span
                  className="font-mono font-black tracking-widest text-sm"
                  style={{ color: C.success, textShadow: `0 0 10px ${C.success}88` }}
                >
                  BULL
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-black text-3xl" style={{ color: C.champagne }}>87%</span>
                  <span className="font-mono text-xs" style={{ color: C.dim }}>confidence</span>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-md"
                  style={{
                    padding: "3px 8px",
                    background: `${C.success}14`,
                    border: `1px solid ${C.success}33`,
                  }}
                >
                  <Bot size={11} color={C.success} />
                  <span className="font-mono text-xs" style={{ color: C.success }}>MoonFlux AI · Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent signal feed */}
          <div className="flex flex-col p-4 gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={12} color={C.goldDim} />
              <span className="font-mono text-xs font-semibold tracking-widest" style={{ color: C.dim }}>RECENT SIGNALS</span>
            </div>
            {SIGNALS.map((sig, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1 }}
                className="flex items-center justify-between rounded-md"
                style={{ padding: "6px 10px", background: `${sig.color}0b`, border: `1px solid ${sig.color}22` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{ width: 5, height: 5, background: sig.color, boxShadow: `0 0 4px ${sig.color}` }}
                  />
                  <span className="font-mono text-xs" style={{ color: C.ink }}>{sig.text}</span>
                </div>
                <span className="font-mono flex-shrink-0 text-xs" style={{ color: C.dim }}>{sig.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
