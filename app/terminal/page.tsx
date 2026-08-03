"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Brain, Bot, SendHorizonal, ArrowUpRight, ArrowDownRight, Settings2, AlertTriangle, TrendingUp, Activity, Volume2, Zap } from "lucide-react";
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useMoonWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

/* ── Simulated live price series ── */
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

/* ── Crosshair-enabled area chart ── */
function AreaChart() {
  const W = 800;
  const H = 320;
  const PAD = 8;
  const { pts, min, max, last } = useSimSeries(64);
  const [hover, setHover] = useState<{x:number,y:number,val:number}|null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const range = max - min || 1;
  const xPos = (i: number) => PAD + (i / (pts.length - 1)) * (W - PAD * 2);
  const yPos = (val: number) => PAD + (1 - (val - min) / range) * (H - PAD * 2);

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(p).toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M ${xPos(0).toFixed(1)} ${(H - PAD).toFixed(1)} ` +
    pts.map((p, i) => `L ${xPos(i).toFixed(1)} ${yPos(p).toFixed(1)}`).join(" ") +
    ` L ${xPos(pts.length - 1).toFixed(1)} ${(H - PAD).toFixed(1)} Z`;

  const lastY = yPos(last);
  const lastX = xPos(pts.length - 1);
  const isUp = last > pts[0];

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((mx - PAD) / (W - PAD * 2)) * (pts.length - 1));
    if (idx >= 0 && idx < pts.length) {
      setHover({ x: xPos(idx), y: yPos(pts[idx]), val: pts[idx] });
    }
  }, [pts, W, H]);

  const accentColor = isUp ? "#10B981" : "#EF4444";
  const gradientId = isUp ? "areaGreen" : "areaRed";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.20" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(pct => (
        <line key={pct} x1={PAD} x2={W-PAD} y1={H * pct} y2={H * pct} stroke="rgba(99,102,241,0.06)" strokeWidth={1} />
      ))}

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={accentColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Price level line */}
      <line x1={0} x2={W} y1={lastY} y2={lastY} stroke={accentColor} strokeOpacity="0.25" strokeDasharray="4 6" strokeWidth={1} />

      {/* Live dot */}
      <circle cx={lastX} cy={lastY} r={3} fill={accentColor}>
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Crosshair */}
      {hover && (
        <>
          <line x1={hover.x} x2={hover.x} y1={0} y2={H} stroke="var(--color-border-subtle)" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={0} x2={W} y1={hover.y} y2={hover.y} stroke="var(--color-border-subtle)" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={hover.x} cy={hover.y} r={4} fill="none" stroke={accentColor} strokeWidth={1.5} />
          <circle cx={hover.x} cy={hover.y} r={2} fill={accentColor} />
          <rect x={hover.x - 32} y={hover.y - 20} width={64} height={16} rx={4} fill="var(--color-surface-elevated)" stroke="rgba(99,102,241,0.2)" strokeWidth={1} />
          <text x={hover.x} y={hover.y - 9} textAnchor="middle" fill="var(--color-text-primary)" fontSize={9} fontFamily="monospace">{hover.val.toFixed(6)}</text>
        </>
      )}
    </svg>
  );
}

export default function TerminalPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { connected } = useMoonWallet();
  const [activeToken] = useState("LDOGE");
  const [tf, setTf] = useState("15m");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("1.0");

  // Chat state
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<{role:string, content:string}[]>([
    { role: "assistant", content: "Analyzing $LDOGE. Volume spiking on the 5m — looks like accumulation phase. What's your play?" },
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const copilotScrollRef = useRef<HTMLDivElement>(null);

  // AI Data State
  const [intel, setIntel] = useState<any>(null);

  useEffect(() => {
    async function loadIntel() {
      try {
        const [pumpRes, crashRes, radarRes] = await Promise.all([
          fetch("/api/pump-forecast").then(r => r.json()),
          fetch("/api/flash-crash").then(r => r.json()),
          fetch("/api/narrative-radar").then(r => r.json()),
        ]);
        setIntel({ pump: pumpRes, crash: crashRes, radar: radarRes });
      } catch (e) {
        console.error("Failed to load AI Intel", e);
      }
    }
    loadIntel();
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
    setCopilotLoading(true);

    try {
      const res = await fetch("/api/trade-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          tokenContext: { 
            ticker: activeToken, 
            price: 0.00234, 
            change24h: 142.5, 
            volume24h: 423000, 
            marketCap: 2100000 
          },
        }),
      });
      const data = await res.json();
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "Unable to analyze right now." }]);
    } catch {
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Try again in a moment." }]);
    } finally {
      setCopilotLoading(false);
    }
  }, [activeToken, copilotLoading]);

  const MOCK_PRICE = 0.00234;
  const solAmount = parseFloat(amount) || 0;
  const expectedTokens = solAmount > 0 ? (solAmount / MOCK_PRICE) * (1 - parseFloat(slippage) / 100) : 0;

  return (
    <div className="flex flex-col gap-3 pb-24 md:pb-16 pt-2 min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-x-hidden w-full max-w-full px-2 sm:px-4">
      
      {/* ── HEADER BAR ── */}
      <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center text-xl">
            🐶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary display-safe">Luna Doge</h1>
              <span className="text-[10px] font-mono text-[#818CF8] bg-[rgba(99,102,241,0.08)] px-2 py-0.5 rounded border border-[rgba(99,102,241,0.15)]">LDOGE / SOL</span>
            </div>
            <div className="text-xs text-text-muted font-mono mt-0.5">4k3...9px2</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 min-w-0">
          <div className="text-right">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Price</div>
            <div className="text-[#10B981] font-mono font-bold text-lg"><AnimatedCounter value={0.00234} prefix="$" decimals={5} /></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">24h</div>
            <div className="text-[#10B981] font-mono font-bold flex items-center gap-1 justify-end">
              <ArrowUpRight className="w-3.5 h-3.5" /><AnimatedCounter value={18.4} suffix="%" decimals={1} />
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">MCap</div>
            <div className="text-text-primary font-mono font-bold"><AnimatedCounter value={2.34} prefix="$" suffix="M" decimals={2} /></div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">Vol</div>
            <div className="text-text-primary font-mono font-bold"><AnimatedCounter value={840} prefix="$" suffix="K" decimals={0} /></div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap bg-[var(--glass-panel)] rounded-lg p-0.5 border border-[rgba(99,102,241,0.08)]">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${tf === t ? 'bg-[rgba(99,102,241,0.12)] text-[#818CF8] shadow-[0_0_8px_rgba(99,102,241,0.15)]' : 'text-text-muted hover:text-text-secondary'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        
        {/* LEFT COLUMN — Chart + Intel */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          
          {/* Chart */}
          <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl relative flex-1 min-h-[300px] overflow-hidden">
            {/* Pair label */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="bg-[var(--color-surface-elevated)] backdrop-blur-sm text-text-secondary text-[10px] px-2 py-1 rounded font-mono border border-[rgba(99,102,241,0.08)]">LDOGE/SOL</span>
              <span className="text-[10px] text-text-faint font-mono">15m</span>
            </div>
            <AreaChart />
            {/* Y-axis price scale */}
            <div className="absolute top-0 right-0 h-full w-[52px] bg-[var(--glass-panel)] backdrop-blur-sm flex flex-col justify-between py-8 px-1.5 text-[9px] text-text-muted font-mono z-10 border-l border-[rgba(99,102,241,0.04)]">
              <span>0.00242</span>
              <span>0.00238</span>
              <span className="text-[#10B981] bg-[rgba(16,185,129,0.1)] px-1 rounded">--</span>
              <span>0.00230</span>
              <span>0.00226</span>
            </div>
          </div>

          {/* Bottom panels — Order Book + AI Intel */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Order Book */}
            <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl p-4 h-[220px] flex flex-col w-full sm:w-1/3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-text-primary font-bold text-xs uppercase tracking-wider">Order Book</h3>
                <span className="text-[9px] text-text-faint font-mono">DEMO</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide text-[11px] font-mono" data-lenis-prevent>
                <div className="flex justify-between text-text-muted mb-2 px-1 text-[9px] uppercase tracking-wider">
                  <span>Price</span>
                  <span>Size</span>
                </div>
                
                {/* Asks */}
                <div className="flex flex-col gap-0.5 mb-1.5">
                  {[
                    { price: '0.002841', size: '18,200', depth: 65 },
                    { price: '0.002820', size: '31,500', depth: 85 },
                    { price: '0.002810', size: '12,100', depth: 45 },
                  ].map((ask, i) => (
                    <div key={i} className="flex justify-between px-1 py-0.5 hover:bg-[rgba(239,68,68,0.06)] rounded relative cursor-pointer transition-colors">
                      <div className="absolute right-0 top-0 h-full bg-[rgba(239,68,68,0.06)] z-0 rounded-r" style={{ width: `${ask.depth}%` }} />
                      <span className="text-[#EF4444] relative z-10">{ask.price}</span>
                      <span className="text-text-muted relative z-10">{ask.size}</span>
                    </div>
                  ))}
                </div>
                
                {/* Spread */}
                <div className="text-center py-1 bg-[rgba(99,102,241,0.04)] rounded text-[#818CF8] my-1 text-[10px] border border-[rgba(99,102,241,0.06)]">
                  Spread: 0.000012 (0.43%)
                </div>
                
                {/* Bids */}
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {[
                    { price: '0.002798', size: '24,400', depth: 75 },
                    { price: '0.002780', size: '41,200', depth: 100 },
                    { price: '0.002760', size: '19,800', depth: 55 },
                  ].map((bid, i) => (
                    <div key={i} className="flex justify-between px-1 py-0.5 hover:bg-[rgba(16,185,129,0.06)] rounded relative cursor-pointer transition-colors">
                      <div className="absolute right-0 top-0 h-full bg-[rgba(16,185,129,0.06)] z-0 rounded-r" style={{ width: `${bid.depth}%` }} />
                      <span className="text-[#10B981] relative z-10">{bid.price}</span>
                      <span className="text-text-muted relative z-10">{bid.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Intel Panel */}
            <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl p-4 flex-1 h-[220px] flex flex-col gap-3 relative overflow-hidden fluxx-float-slow">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-[rgba(99,102,241,0.1)] flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-[#818CF8]" />
                </div>
                <h3 className="text-text-primary font-bold text-xs uppercase tracking-wider">Intel Layer</h3>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse fluxx-breathe" />
                  <span className="text-[9px] text-text-muted font-mono uppercase">Live</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                {/* Pump Forecast */}
                <div className="bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.08)] rounded-lg p-3 flex flex-col justify-between fluxx-hover-shimmer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                    <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Pump Forecast</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary font-mono">
                    {intel?.pump ? intel.pump.probability : "..."}
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">{intel?.pump ? intel.pump.target : "Calculating..."}</div>
                </div>

                {/* Flash Crash Risk */}
                <div className="bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.08)] rounded-lg p-3 flex flex-col justify-between fluxx-hover-shimmer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-[#EF4444]" />
                    <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Crash Risk</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary font-mono">
                    {intel?.crash ? intel.crash.riskLevel : "..."}
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">Volatility active</div>
                </div>
              </div>

              {/* Narrative Radar */}
              <div className="bg-[rgba(99,102,241,0.04)] border border-[rgba(99,102,241,0.06)] rounded-lg p-2.5">
                 <div className="flex justify-between items-center mb-1">
                   <div className="flex items-center gap-1.5">
                     <Zap className="w-3 h-3 text-[#818CF8]" />
                     <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider">Narrative</span>
                   </div>
                 </div>
                 <div className="text-[11px] text-text-secondary leading-relaxed">
                   {intel?.radar ? intel.radar.summary : "Scanning socials..."}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Trade + Copilot */}
        <div className="w-full lg:w-[320px] flex flex-col gap-3 flex-shrink-0 min-h-0">
          
          {/* Trade Panel */}
          <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl p-4 flex flex-col gap-3.5">
            
            {/* Buy/Sell Toggle */}
            <div className="flex bg-[var(--glass-panel)] rounded-lg p-0.5 border border-[rgba(99,102,241,0.06)]">
              <button 
                onClick={() => setSide("BUY")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${side === "BUY" ? 'bg-[#10B981] text-[#FFFFFF] shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-text-muted hover:text-text-secondary'}`}
              >BUY</button>
              <button 
                onClick={() => setSide("SELL")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${side === "SELL" ? 'bg-[#EF4444] text-[#FFFFFF] shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'text-text-muted hover:text-text-secondary'}`}
              >SELL</button>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">Amount (SOL)</label>
                <span className="text-[10px] text-text-muted font-mono">{connected ? 'Bal: -- SOL' : 'Connect Wallet'}</span>
              </div>
              <div className="bg-[var(--glass-panel)] border border-[rgba(99,102,241,0.08)] rounded-lg p-1 flex items-center focus-within:border-[rgba(99,102,241,0.25)] focus-within:shadow-[0_0_12px_rgba(99,102,241,0.08)] transition-all">
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent p-2 text-text-primary font-mono text-sm focus-visible:ring-0 focus-visible:outline-none"
                />
                <div className="flex gap-1 pr-1">
                  {['25%','50%','MAX'].map(pct => (
                    <button key={pct} onClick={() => setAmount(pct === 'MAX' ? '12.45' : pct === '50%' ? '6.22' : '3.11')} className="px-2 py-1 bg-[rgba(99,102,241,0.06)] text-[10px] text-[#818CF8] border border-[rgba(99,102,241,0.1)] rounded hover:bg-[rgba(99,102,241,0.12)] transition-colors font-mono font-bold focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">{pct}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected output */}
            <div className="bg-[rgba(99,102,241,0.04)] border border-[rgba(99,102,241,0.06)] rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-text-muted text-xs">You receive</span>
              <span className="text-text-primary font-mono font-bold text-sm">~{expectedTokens.toLocaleString(undefined, {maximumFractionDigits: 0})} LDOGE</span>
            </div>

            {/* Slippage */}
            <div className="flex justify-between items-center bg-[var(--color-surface-1)] border border-[rgba(99,102,241,0.04)] rounded-lg px-3 py-2">
              <span className="text-xs text-text-muted flex items-center gap-1"><Settings2 className="w-3 h-3"/> Slippage</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSlippage("0.5")} className="w-5 h-5 flex items-center justify-center bg-[rgba(99,102,241,0.08)] text-[#818CF8] rounded text-xs border border-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.15)] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">-</button>
                <span className="text-xs font-mono text-text-primary w-7 text-center">{slippage}%</span>
                <button onClick={() => setSlippage("2.0")} className="w-5 h-5 flex items-center justify-center bg-[rgba(99,102,241,0.08)] text-[#818CF8] rounded text-xs border border-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.15)] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">+</button>
              </div>
            </div>

            {/* Execute button */}
            <MagneticButton as="div" strength={0.25} className="w-full">
              <button 
                onClick={() => {
                  if (!connected) {
                    alert('Connect wallet to trade');
                  }
                }}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${side === "BUY" ? 'bg-[#10B981] text-[#FFFFFF] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-[#EF4444] text-[#FFFFFF] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
              >
                {side} LDOGE
              </button>
            </MagneticButton>
            <div className="text-[9px] text-center text-text-faint flex items-center justify-center gap-1 font-mono">
              <AlertTriangle className="w-2.5 h-2.5" /> Demo mode · Trading involves risk
            </div>
          </div>

          {/* Trade Copilot Chat */}
          <div className="bg-[var(--glass-panel)] backdrop-blur-xl border border-[rgba(99,102,241,0.06)] rounded-xl flex flex-col flex-1 min-h-[200px]">
            <div className="px-3 py-2.5 border-b border-[rgba(99,102,241,0.06)] flex items-center gap-2 fluxx-hover-shimmer">
              <div className="w-5 h-5 rounded-md bg-[rgba(99,102,241,0.1)] flex items-center justify-center">
                <Bot className="w-3 h-3 text-[#818CF8]" />
              </div>
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider">Copilot</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide text-[13px]" ref={copilotScrollRef} data-lenis-prevent>
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[rgba(99,102,241,0.12)] text-[#FFFFFF] rounded-tr-sm border border-[rgba(99,102,241,0.15)]' 
                      : 'bg-[var(--glass-panel)] text-text-secondary rounded-tl-sm border border-[rgba(99,102,241,0.06)]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-3 py-2 rounded-xl bg-[var(--glass-panel)] text-[#818CF8] rounded-tl-sm flex gap-1.5 items-center border border-[rgba(99,102,241,0.06)]">
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-[rgba(99,102,241,0.06)]">
              <div className="bg-[var(--glass-panel)] border border-[rgba(99,102,241,0.08)] rounded-lg p-0.5 flex focus-within:border-[rgba(99,102,241,0.2)] transition-all">
                <input 
                  type="text"
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCopilotMessage(copilotInput)}
                  placeholder="Ask about this trade..."
                  className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-faint focus-visible:ring-0 focus-visible:outline-none"
                />
                <button 
                  onClick={() => sendCopilotMessage(copilotInput)}
                  disabled={!copilotInput.trim() || copilotLoading}
                  className="w-7 flex items-center justify-center text-[#818CF8] hover:text-[#A5B4FC] disabled:opacity-30 transition-colors active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none"
                >
                  <SendHorizonal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
