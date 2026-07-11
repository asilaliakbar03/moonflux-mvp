"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Brain, Bot, SendHorizonal, ArrowUpRight, ArrowDownRight, Settings2, BarChart3, AlertTriangle } from "lucide-react";

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
        <linearGradient id="mfIndigoArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05D5FA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#05D5FA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#mfIndigoArea)" />
      <path d={linePath} fill="none" stroke="#05D5FA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={0} x2={W} y1={lastY} y2={lastY} stroke="#05D5FA" strokeOpacity="0.35" strokeDasharray="4 6" strokeWidth={1} />
      <circle cx={lastX} cy={lastY} r={4} fill="#05D5FA">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default function TerminalPage() {
  const [activeToken] = useState("LDOGE");
  const [tf, setTf] = useState("15m");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("1.0");

  // Chat state
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<{role:string, content:string}[]>([
    { role: "assistant", content: "I'm analyzing $LDOGE. Volume is spiking on the 5m chart. Ready when you are." },
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
    <div className="flex flex-col gap-4 pb-16 pt-4 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* ── HEADER ── */}
      <div className="surface-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_left,rgba(255,42,109,0.8),transparent_50%)]" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,42,109,0.2)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,42,109,0.2)]">
            🐶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Luna Doge</h1>
              <span className="badge-indigo bg-[rgba(5,213,250,0.15)] text-[#05D5FA] border-[#05D5FA]">LDOGE / SOL</span>
            </div>
            <div className="text-sm text-[#C8A2C8] font-mono mt-0.5">mint: 4k3...9px2</div>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-[#8B6A8B] text-xs uppercase mb-0.5 font-semibold">Price</div>
              <div className="text-[#39FF14] font-mono font-bold text-lg drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">$0.00234</div>
            </div>
            <div>
              <div className="text-[#8B6A8B] text-xs uppercase mb-0.5 font-semibold">24h Change</div>
              <div className="text-[#39FF14] font-mono font-bold">+142.5%</div>
            </div>
            <div>
              <div className="text-[#8B6A8B] text-xs uppercase mb-0.5 font-semibold">Market Cap</div>
              <div className="text-white font-mono font-bold">$1.87M</div>
            </div>
            <div>
              <div className="text-[#8B6A8B] text-xs uppercase mb-0.5 font-semibold">Volume</div>
              <div className="text-white font-mono font-bold">$423K</div>
            </div>
          </div>
        </div>

        <div className="flex bg-[#120721] rounded-lg p-1 border border-[rgba(5,213,250,0.2)] relative z-10">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-bold font-mono transition-all ${tf === t ? 'bg-[rgba(5,213,250,0.15)] text-[#05D5FA] shadow-[0_0_10px_rgba(5,213,250,0.2)]' : 'text-[#8B6A8B] hover:text-[#C8A2C8]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2 COLUMN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          
          {/* Chart */}
          <div className="surface-card relative flex-1 min-h-[300px] overflow-hidden group border border-[rgba(5,213,250,0.2)]">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_bottom,rgba(5,213,250,0.8),transparent_70%)]" />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="bg-[#1C0B33] border border-[rgba(5,213,250,0.2)] text-[#05D5FA] text-xs px-2 py-1 rounded font-mono shadow-[0_0_10px_rgba(5,213,250,0.2)]">LDOGE / SOL</span>
              <span className="bg-[rgba(255,42,109,0.1)] border border-[rgba(255,42,109,0.2)] text-[#FF2A6D] text-xs px-2 py-1 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">DEMO DATA</span>
            </div>
            <AreaChart />
            <div className="absolute top-0 right-0 h-full w-[60px] border-l border-[rgba(5,213,250,0.1)] bg-[#120721] bg-opacity-90 flex flex-col justify-between py-8 px-2 text-[10px] text-[#8B6A8B] font-mono z-10 backdrop-blur-sm">
              <span>0.00242</span>
              <span>0.00238</span>
              <span className="text-[#05D5FA] bg-[rgba(5,213,250,0.15)] px-1 rounded shadow-[0_0_5px_rgba(5,213,250,0.3)]">0.00234</span>
              <span>0.00230</span>
              <span>0.00226</span>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Order Book */}
            <div className="surface-card p-4 h-[220px] flex flex-col w-1/3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold text-sm">Order Book</h3>
                <span className="badge-muted text-[10px]">Demo Data</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide text-xs font-mono">
                <div className="flex justify-between text-[#8B6A8B] mb-2 px-1">
                  <span>Price</span>
                  <span>Size</span>
                </div>
                
                {/* Asks */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(255,42,109,0.15)] z-0 rounded-r" style={{ width: '65%' }} />
                    <span className="text-[#FF2A6D] relative z-10">0.002841</span>
                    <span className="text-[#C8A2C8] relative z-10">18,200</span>
                  </div>
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(255,42,109,0.15)] z-0 rounded-r" style={{ width: '85%' }} />
                    <span className="text-[#FF2A6D] relative z-10">0.002820</span>
                    <span className="text-[#C8A2C8] relative z-10">31,500</span>
                  </div>
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(255,42,109,0.15)] z-0 rounded-r" style={{ width: '45%' }} />
                    <span className="text-[#FF2A6D] relative z-10">0.002810</span>
                    <span className="text-[#C8A2C8] relative z-10">12,100</span>
                  </div>
                </div>
                
                <div className="text-center py-1.5 bg-[#1C0B33] rounded text-[#05D5FA] my-1 border border-[rgba(5,213,250,0.2)] shadow-[0_0_5px_rgba(5,213,250,0.1)]">
                  Spread: 0.000012 (0.43%)
                </div>
                
                {/* Bids */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(57,255,20,0.15)] z-0 rounded-r" style={{ width: '75%' }} />
                    <span className="text-[#39FF14] relative z-10">0.002798</span>
                    <span className="text-[#C8A2C8] relative z-10">24,400</span>
                  </div>
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(57,255,20,0.15)] z-0 rounded-r" style={{ width: '100%' }} />
                    <span className="text-[#39FF14] relative z-10">0.002780</span>
                    <span className="text-[#C8A2C8] relative z-10">41,200</span>
                  </div>
                  <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.05)] rounded relative group">
                    <div className="absolute right-0 top-0 h-full bg-[rgba(57,255,20,0.15)] z-0 rounded-r" style={{ width: '55%' }} />
                    <span className="text-[#39FF14] relative z-10">0.002760</span>
                    <span className="text-[#C8A2C8] relative z-10">19,800</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Intel Panel */}
            <div className="surface-glass p-4 flex-1 h-[220px] flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,rgba(57,255,20,0.6),transparent_60%)]" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Brain className="w-5 h-5 text-[#39FF14]" />
                <h3 className="text-white font-bold text-sm drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">AI Intel Layer</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {/* Pump Forecast */}
                <div className="bg-[#120721] p-3 rounded-lg border border-[rgba(5,213,250,0.2)] shadow-[0_0_10px_rgba(5,213,250,0.1)]">
                  <div className="text-[10px] text-[#05D5FA] font-mono uppercase mb-1">Pump Forecast</div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    {intel?.pump ? intel.pump.probability : "..."}
                    <ArrowUpRight className="w-4 h-4 text-[#39FF14]" />
                  </div>
                  <div className="text-xs text-[#8B6A8B] mt-1">{intel?.pump ? intel.pump.target : "Loading..."}</div>
                </div>

                {/* Flash Crash Risk */}
                <div className="bg-[#120721] p-3 rounded-lg border border-[rgba(255,42,109,0.2)] shadow-[0_0_10px_rgba(255,42,109,0.1)]">
                  <div className="text-[10px] text-[#FF2A6D] font-mono uppercase mb-1">Crash Risk</div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    {intel?.crash ? intel.crash.riskLevel : "..."}
                    <ArrowDownRight className="w-4 h-4 text-[#FF2A6D]" />
                  </div>
                  <div className="text-xs text-[#8B6A8B] mt-1">Volatility active</div>
                </div>
              </div>

              {/* Narrative Radar */}
              <div className="bg-[#1C0B33] p-3 rounded-lg border border-[rgba(57,255,20,0.2)] shadow-[0_0_10px_rgba(57,255,20,0.1)] mt-auto relative z-10">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] text-[#39FF14] font-mono uppercase">Narrative Radar</span>
                   <span className="badge-success text-[8px] bg-[rgba(57,255,20,0.15)] text-[#39FF14]">LIVE</span>
                 </div>
                 <div className="text-xs text-[#F8F0FF]">
                   {intel?.radar ? intel.radar.summary : "Scanning socials..."}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 flex-shrink-0 min-h-0">
          
          {/* Trade Panel */}
          <div className="surface-panel p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.8),transparent_50%)]" />
            <div className="flex bg-[#120721] rounded-lg p-1 border border-[rgba(255,42,109,0.2)] relative z-10">
              <button 
                onClick={() => setSide("BUY")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${side === "BUY" ? 'bg-gradient-to-r from-[#39FF14] to-[#25A110] text-[#0B0414] shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'text-[#8B6A8B] hover:text-white'}`}
              >BUY</button>
              <button 
                onClick={() => setSide("SELL")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${side === "SELL" ? 'bg-gradient-to-r from-[#FF2A6D] to-[#B30637] text-white shadow-[0_0_10px_rgba(255,42,109,0.5)]' : 'text-[#8B6A8B] hover:text-white'}`}
              >SELL</button>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm text-[#C8A2C8] font-semibold">Amount (SOL)</label>
                <span className="text-xs text-[#05D5FA] font-mono shadow-[0_0_5px_rgba(5,213,250,0.2)]">Bal: 12.45 SOL</span>
              </div>
              <div className="bg-[#120721] border border-[rgba(255,42,109,0.2)] rounded-lg p-1 flex items-center focus-within:border-[rgba(255,42,109,0.6)] focus-within:shadow-[0_0_10px_rgba(255,42,109,0.2)] transition-all">
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent p-2 text-white font-mono focus:outline-none"
                />
                <div className="flex gap-1 pr-1">
                  {['25%','50%','100%'].map(pct => (
                    <button key={pct} onClick={() => setAmount(pct === '100%' ? '12.45' : pct === '50%' ? '6.22' : '3.11')} className="px-2 py-1 bg-[#1C0B33] text-xs text-[#05D5FA] border border-[rgba(5,213,250,0.2)] rounded hover:bg-[rgba(5,213,250,0.1)] transition-colors font-mono">{pct}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[rgba(5,213,250,0.05)] border border-[rgba(5,213,250,0.2)] rounded-lg p-3 text-sm flex justify-between items-center relative z-10">
              <span className="text-[#C8A2C8]">You receive</span>
              <span className="text-white font-mono font-bold">~{expectedTokens.toLocaleString(undefined, {maximumFractionDigits: 0})} LDOGE</span>
            </div>

            <div className="flex justify-between items-center bg-[#120721] border border-[rgba(255,42,109,0.15)] rounded-lg px-3 py-2 relative z-10">
              <span className="text-sm text-[#8B6A8B] flex items-center gap-1"><Settings2 className="w-3.5 h-3.5"/> Slippage</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSlippage("0.5")} className="w-6 h-6 flex items-center justify-center bg-[#1C0B33] text-[#05D5FA] rounded border border-[rgba(5,213,250,0.2)] hover:bg-[rgba(5,213,250,0.1)]">-</button>
                <span className="text-sm font-mono text-white w-8 text-center">{slippage}%</span>
                <button onClick={() => setSlippage("2.0")} className="w-6 h-6 flex items-center justify-center bg-[#1C0B33] text-[#05D5FA] rounded border border-[rgba(5,213,250,0.2)] hover:bg-[rgba(5,213,250,0.1)]">+</button>
              </div>
            </div>

            <button className={`relative z-10 w-full py-3 rounded-lg font-bold text-white text-base transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] ${side === "BUY" ? 'bg-gradient-to-r from-[#39FF14] to-[#25A110] text-[#0B0414] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]' : 'bg-gradient-to-r from-[#FF2A6D] to-[#B30637] hover:shadow-[0_0_20px_rgba(255,42,109,0.6)]'}`}>
              {side} LDOGE
            </button>
            <div className="text-[10px] text-center text-[#475569] flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Trading involves risk. Demo mode active.
            </div>
          </div>

          {/* Trade Copilot */}
          <div className="surface-glass flex flex-col flex-1 min-h-[220px]">
            <div className="p-3 border-b border-[rgba(5,213,250,0.2)] flex items-center gap-2 bg-[rgba(5,213,250,0.05)]">
              <div className="w-6 h-6 rounded bg-[rgba(5,213,250,0.15)] flex items-center justify-center text-[#05D5FA] shadow-[0_0_10px_rgba(5,213,250,0.2)]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Trade Copilot</span>
              <span className="badge-indigo text-[10px] ml-auto">AI</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide text-sm" ref={copilotScrollRef}>
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-[linear-gradient(135deg,#FF2A6D,#E61E5B)] text-white rounded-tr-sm shadow-[0_0_10px_rgba(255,42,109,0.3)]' : 'bg-[#120721] border border-[rgba(5,213,250,0.2)] text-[#F8F0FF] rounded-tl-sm shadow-[0_0_10px_rgba(5,213,250,0.1)]'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-2.5 rounded-xl bg-[#120721] border border-[rgba(5,213,250,0.2)] text-[#05D5FA] rounded-tl-sm flex gap-1 items-center shadow-[0_0_10px_rgba(5,213,250,0.1)]">
                    <span className="w-1.5 h-1.5 bg-[#05D5FA] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#05D5FA] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                    <span className="w-1.5 h-1.5 bg-[#05D5FA] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-[rgba(5,213,250,0.2)]">
              <div className="bg-[#120721] border border-[rgba(255,42,109,0.3)] rounded-lg p-1 flex shadow-[0_0_10px_rgba(255,42,109,0.1)] focus-within:shadow-[0_0_15px_rgba(255,42,109,0.3)] transition-all">
                <input 
                  type="text"
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCopilotMessage(copilotInput)}
                  placeholder="Ask about this trade..."
                  className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-[#8B6A8B] focus:outline-none"
                />
                <button 
                  onClick={() => sendCopilotMessage(copilotInput)}
                  disabled={!copilotInput.trim() || copilotLoading}
                  className="w-8 flex items-center justify-center text-[#FF2A6D] hover:text-[#FF5C97] disabled:opacity-50 transition-colors drop-shadow-[0_0_5px_currentColor]"
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
