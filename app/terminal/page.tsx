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

  const accentColor = isUp ? "#10B981" : "#F43F5E";
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
        <line key={pct} x1={PAD} x2={W-PAD} y1={H * pct} y2={H * pct} stroke="rgba(99,102,241,0.2)" strokeWidth={2} />
      ))}

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={accentColor} strokeWidth={3} strokeLinecap="square" strokeLinejoin="miter" />

      {/* Price level line */}
      <line x1={0} x2={W} y1={lastY} y2={lastY} stroke={accentColor} strokeOpacity="0.8" strokeDasharray="6 6" strokeWidth={2} />

      {/* Live dot */}
      <rect x={lastX - 5} y={lastY - 5} width={10} height={10} fill={accentColor}>
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* Crosshair */}
      {hover && (
        <>
          <line x1={hover.x} x2={hover.x} y1={0} y2={H} stroke="var(--color-border-subtle, #888)" strokeWidth={2} strokeDasharray="4 4" />
          <line x1={0} x2={W} y1={hover.y} y2={hover.y} stroke="var(--color-border-subtle, #888)" strokeWidth={2} strokeDasharray="4 4" />
          <rect x={hover.x - 5} y={hover.y - 5} width={10} height={10} fill="none" stroke={accentColor} strokeWidth={2} />
          <rect x={hover.x - 2} y={hover.y - 2} width={4} height={4} fill={accentColor} />
          <rect x={hover.x - 40} y={hover.y - 28} width={80} height={24} fill="#050510" stroke={accentColor} strokeWidth={2} />
          <text x={hover.x} y={hover.y - 12} textAnchor="middle" fill={accentColor} fontSize={11} fontFamily="monospace" fontWeight="900">{hover.val.toFixed(6)}</text>
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
    { role: "assistant", content: "[ STATUS: ACTIVE ] ANALYZING $LDOGE. VOLUME SPIKING ON 5M. ACCUMULATION PHASE DETECTED. WHAT'S YOUR PLAY?" },
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

    setCopilotMessages((prev) => [...prev, { role: "user", content: `> ${msg.toUpperCase()}` }]);
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
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: (data.response ?? "ERR: UNABLE TO ANALYZE").toUpperCase() }]);
    } catch {
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: "ERR: CONNECTION FAILURE. RETRY." }]);
    } finally {
      setCopilotLoading(false);
    }
  }, [activeToken, copilotLoading]);

  const MOCK_PRICE = 0.00234;
  const solAmount = parseFloat(amount) || 0;
  const expectedTokens = solAmount > 0 ? (solAmount / MOCK_PRICE) * (1 - parseFloat(slippage) / 100) : 0;

  const borderClass = isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black';
  const shadowClass = isDark ? 'shadow-[4px_4px_0px_0px_#10B981]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowClassPink = isDark ? 'shadow-[4px_4px_0px_0px_#F43F5E]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowClassCyan = isDark ? 'shadow-[4px_4px_0px_0px_#06B6D4]' : 'shadow-[4px_4px_0px_0px_#000]';
  const textClass = isDark ? 'text-white' : 'text-black';
  const bgClass = isDark ? 'bg-black' : 'bg-gray-50';
  const panelBgClass = isDark ? 'bg-[#050510]' : 'bg-white';

  return (
    <div className={`flex flex-col gap-4 pb-24 md:pb-16 pt-4 min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-x-hidden w-full max-w-full px-4 sm:px-6 font-mono font-black uppercase tracking-wider ${bgClass} ${textClass}`}>
      
      {/* ── HEADER BAR ── */}
      <div className={`${panelBgClass} ${borderClass} ${shadowClassCyan} p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 min-w-0`}>
        <div className="flex items-center gap-4">
          <img 
            src={`https://robohash.org/${activeToken.toLowerCase()}?set=set1&bgset=bg1&size=400x400`} 
            alt="token" 
            className={`w-14 h-14 ${borderClass}`}
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl tracking-widest display-safe">[ LUNA DOGE ]</h1>
              <span className={`text-xs text-[#06B6D4] px-2 py-1 ${borderClass}`}>LDOGE / SOL</span>
            </div>
            <div className="text-sm text-[#F59E0B] mt-1">[ ID: 4K3...9PX2 ]</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 min-w-0">
          <div className="text-right">
            <div className="text-xs text-[#6366F1] mb-1">PRICE</div>
            <div className="text-[#10B981] text-xl"><AnimatedCounter value={0.00234} prefix="$" decimals={5} /></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#6366F1] mb-1">24H</div>
            <div className="text-[#10B981] flex items-center gap-1 justify-end text-xl">
              <ArrowUpRight className="w-5 h-5 stroke-[3]" /><AnimatedCounter value={18.4} suffix="%" decimals={1} />
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[#6366F1] mb-1">MCAP</div>
            <div className="text-xl"><AnimatedCounter value={2.34} prefix="$" suffix="M" decimals={2} /></div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-[#6366F1] mb-1">VOL</div>
            <div className="text-xl"><AnimatedCounter value={840} prefix="$" suffix="K" decimals={0} /></div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className={`flex flex-wrap ${isDark ? 'bg-[#050510]' : 'bg-gray-100'} p-1 ${borderClass}`}>
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 text-sm transition-none focus-visible:outline-none ${tf === t ? `bg-[#10B981] text-black ${borderClass}` : `text-current hover:bg-[#6366F1] hover:text-white`}`}
            >
              [ {t} ]
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN — Chart + Intel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Chart */}
          <div className={`${panelBgClass} ${borderClass} ${shadowClass} relative flex-1 min-h-[300px] overflow-hidden`}>
            {/* Pair label */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <span className={`${panelBgClass} text-[#06B6D4] text-xs px-2 py-1 ${borderClass}`}>[ LDOGE/SOL ]</span>
              <span className="text-xs text-[#F59E0B]">15M CHART</span>
            </div>
            <AreaChart />
            {/* Y-axis price scale */}
            <div className={`absolute top-0 right-0 h-full w-[70px] ${panelBgClass} flex flex-col justify-between py-8 px-2 text-xs z-10 border-l-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}`}>
              <span>0.00242</span>
              <span>0.00238</span>
              <span className={`text-[#10B981] bg-[rgba(16,185,129,0.1)] px-1 ${borderClass}`}>--</span>
              <span>0.00230</span>
              <span>0.00226</span>
            </div>
          </div>

          {/* Bottom panels — Order Book + AI Intel */}
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Order Book */}
            <div className={`${panelBgClass} ${borderClass} ${shadowClassPink} p-4 h-[240px] flex flex-col w-full sm:w-1/3`}>
              <div className={`flex justify-between items-center mb-4 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'} pb-2`}>
                <h3 className="text-[#F43F5E] text-sm">ORDER BOOK</h3>
                <span className="text-xs text-[#F59E0B]">[ DEMO ]</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide text-xs" data-lenis-prevent>
                <div className="flex justify-between text-[#6366F1] mb-2 px-1 text-xs">
                  <span>PRICE</span>
                  <span>SIZE</span>
                </div>
                
                {/* Asks */}
                <div className="flex flex-col gap-1 mb-2">
                  {[
                    { price: '0.002841', size: '18,200', depth: 65 },
                    { price: '0.002820', size: '31,500', depth: 85 },
                    { price: '0.002810', size: '12,100', depth: 45 },
                  ].map((ask, i) => (
                    <div key={i} className="flex justify-between px-1 py-1 relative cursor-pointer group">
                      <div className="absolute right-0 top-0 h-full bg-[#F43F5E]/20 border-l-2 border-[#F43F5E] z-0" style={{ width: `${ask.depth}%` }} />
                      <span className="text-[#F43F5E] relative z-10 group-hover:bg-[#F43F5E] group-hover:text-black">[ ASK {ask.price} ]</span>
                      <span className="relative z-10">{ask.size}</span>
                    </div>
                  ))}
                </div>
                
                {/* Spread */}
                <div className={`text-center py-1.5 text-[#06B6D4] my-2 text-xs ${borderClass}`}>
                  SPREAD: 0.000012 (0.43%)
                </div>
                
                {/* Bids */}
                <div className="flex flex-col gap-1 mt-2">
                  {[
                    { price: '0.002798', size: '24,400', depth: 75 },
                    { price: '0.002780', size: '41,200', depth: 100 },
                    { price: '0.002760', size: '19,800', depth: 55 },
                  ].map((bid, i) => (
                    <div key={i} className="flex justify-between px-1 py-1 relative cursor-pointer group">
                      <div className="absolute right-0 top-0 h-full bg-[#10B981]/20 border-l-2 border-[#10B981] z-0" style={{ width: `${bid.depth}%` }} />
                      <span className="text-[#10B981] relative z-10 group-hover:bg-[#10B981] group-hover:text-black">[ BID {bid.price} ]</span>
                      <span className="relative z-10">{bid.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Intel Panel */}
            <div className={`${panelBgClass} ${borderClass} ${shadowClassCyan} p-4 flex-1 h-[240px] flex flex-col gap-4 relative overflow-hidden`}>
              <div className={`flex items-center gap-3 mb-2 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'} pb-2`}>
                <Brain className="w-5 h-5 text-[#06B6D4]" />
                <h3 className="text-[#06B6D4] text-sm">INTEL LAYER</h3>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#10B981] animate-pulse" />
                  <span className="text-xs text-[#10B981]">[ LIVE ]</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Pump Forecast */}
                <div className={`p-3 flex flex-col justify-between ${borderClass} shadow-[2px_2px_0px_0px_#10B981]`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-[#10B981]">PUMP FORECAST</span>
                  </div>
                  <div className="text-2xl text-current">
                    {intel?.pump ? intel.pump.probability : "..."}
                  </div>
                  <div className="text-xs text-[#6366F1] mt-1">{intel?.pump ? intel.pump.target : "CALCULATING..."}</div>
                </div>

                {/* Flash Crash Risk */}
                <div className={`p-3 flex flex-col justify-between ${borderClass} shadow-[2px_2px_0px_0px_#F43F5E]`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[#F43F5E]" />
                    <span className="text-xs text-[#F43F5E]">CRASH RISK</span>
                  </div>
                  <div className="text-2xl text-current">
                    {intel?.crash ? intel.crash.riskLevel : "..."}
                  </div>
                  <div className="text-xs text-[#F59E0B] mt-1">VOLATILITY ACTIVE</div>
                </div>
              </div>

              {/* Narrative Radar */}
              <div className={`p-3 mt-2 ${borderClass}`}>
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-[#F59E0B]" />
                     <span className="text-xs text-[#F59E0B]">NARRATIVE RADAR</span>
                   </div>
                 </div>
                 <div className="text-xs leading-relaxed text-current">
                   {intel?.radar ? intel.radar.summary : "> SCANNING SOCIALS..."}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Trade + Copilot */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 flex-shrink-0 min-h-0">
          
          {/* Trade Panel */}
          <div className={`${panelBgClass} ${borderClass} ${side === 'BUY' ? shadowClass : shadowClassPink} p-4 flex flex-col gap-4`}>
            
            {/* Buy/Sell Toggle */}
            <div className="flex gap-2">
              <button 
                onClick={() => setSide("BUY")}
                className={`flex-1 py-3 text-sm transition-none focus-visible:outline-none ${borderClass} ${side === "BUY" ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-transparent text-current hover:bg-[#10B981]/20'}`}
              >[ BUY ]</button>
              <button 
                onClick={() => setSide("SELL")}
                className={`flex-1 py-3 text-sm transition-none focus-visible:outline-none ${borderClass} ${side === "SELL" ? 'bg-[#F43F5E] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-transparent text-current hover:bg-[#F43F5E]/20'}`}
              >[ SELL ]</button>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-[#6366F1]">AMOUNT (SOL)</label>
                <span className="text-xs text-[#F59E0B]">{connected ? '[ BAL: -- SOL ]' : '[ OFFLINE ]'}</span>
              </div>
              <div className={`flex items-center p-1 ${borderClass} bg-transparent`}>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent p-2 text-current text-lg focus-visible:ring-0 focus-visible:outline-none font-mono font-black"
                />
                <div className="flex gap-1 pr-1">
                  {['25%','50%','MAX'].map(pct => (
                    <button key={pct} onClick={() => setAmount(pct === 'MAX' ? '12.45' : pct === '50%' ? '6.22' : '3.11')} className={`px-2 py-1 text-xs text-current hover:bg-[#06B6D4] hover:text-black transition-none focus-visible:outline-none ${borderClass}`}>[{pct}]</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expected output */}
            <div className={`p-3 text-sm flex justify-between items-center ${borderClass} bg-transparent`}>
              <span className="text-[#06B6D4] text-xs">EXPECTED</span>
              <span className="text-current text-sm">~{expectedTokens.toLocaleString(undefined, {maximumFractionDigits: 0})} LDOGE</span>
            </div>

            {/* Slippage */}
            <div className={`flex justify-between items-center px-3 py-2 ${borderClass} bg-transparent`}>
              <span className="text-xs text-[#6366F1] flex items-center gap-2"><Settings2 className="w-4 h-4"/> SLIPPAGE</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSlippage("0.5")} className={`w-6 h-6 flex items-center justify-center text-current hover:bg-[#6366F1] hover:text-white focus-visible:outline-none ${borderClass}`}>-</button>
                <span className="text-xs text-current w-10 text-center">{slippage}%</span>
                <button onClick={() => setSlippage("2.0")} className={`w-6 h-6 flex items-center justify-center text-current hover:bg-[#6366F1] hover:text-white focus-visible:outline-none ${borderClass}`}>+</button>
              </div>
            </div>

            {/* Execute button */}
            <MagneticButton as="div" strength={0.25} className="w-full mt-2">
              <button 
                onClick={() => {
                  if (!connected) {
                    alert('ERR: CONNECT WALLET');
                  }
                }}
                className={`w-full py-4 text-lg transition-none focus-visible:outline-none ${borderClass} ${side === "BUY" ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#F43F5E] text-black hover:bg-[#E11D48]'} shadow-[4px_4px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`}
              >
                [ EXECUTE {side} ]
              </button>
            </MagneticButton>
            <div className="text-xs text-center text-[#F43F5E] flex items-center justify-center gap-2 mt-2">
              <AlertTriangle className="w-4 h-4" /> [ DEMO MODE ]
            </div>
          </div>

          {/* Trade Copilot Chat */}
          <div className={`${panelBgClass} ${borderClass} ${shadowClassCyan} flex flex-col flex-1 min-h-[240px]`}>
            <div className={`px-4 py-3 flex items-center gap-3 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}`}>
              <Bot className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-sm text-[#06B6D4]">SYS_COPILOT</span>
              <div className="ml-auto w-2 h-2 bg-[#10B981] animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide text-xs" ref={copilotScrollRef} data-lenis-prevent>
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] px-3 py-2 leading-relaxed ${
                    msg.role === 'user' 
                      ? `bg-[#6366F1] text-white ${borderClass} shadow-[2px_2px_0px_0px_#000]` 
                      : `bg-transparent text-current ${borderClass} shadow-[2px_2px_0px_0px_#06B6D4]`
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[90%] px-3 py-2 bg-transparent text-[#06B6D4] flex gap-2 items-center ${borderClass} shadow-[2px_2px_0px_0px_#06B6D4]`}>
                    <span className="w-2 h-2 bg-[#06B6D4] animate-ping" />
                    <span>PROCESSING...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`p-3 border-t-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}`}>
              <div className="flex relative">
                <span className="absolute left-3 top-2.5 text-[#10B981]">{'>'}</span>
                <input 
                  type="text"
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCopilotMessage(copilotInput)}
                  placeholder="ENTER COMMAND..."
                  className={`w-full bg-transparent pl-8 pr-12 py-2.5 text-sm text-current placeholder:text-gray-500 focus-visible:ring-0 focus-visible:outline-none ${borderClass} focus-within:shadow-[2px_2px_0px_0px_#10B981]`}
                />
                <button 
                  onClick={() => sendCopilotMessage(copilotInput)}
                  disabled={!copilotInput.trim() || copilotLoading}
                  className={`absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center text-black bg-[#10B981] disabled:opacity-50 transition-none focus-visible:outline-none hover:bg-[#059669] ${borderClass} !border-2`}
                >
                  <SendHorizonal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
