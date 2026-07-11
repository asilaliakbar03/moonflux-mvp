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
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#mfIndigoArea)" />
      <path d={linePath} fill="none" stroke="#818CF8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={0} x2={W} y1={lastY} y2={lastY} stroke="#818CF8" strokeOpacity="0.35" strokeDasharray="4 6" strokeWidth={1} />
      <circle cx={lastX} cy={lastY} r={4} fill="#818CF8">
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
          tokenContext: { ticker: activeToken, price: "0.00234", change: "+142.5%", volume: "$423K", mcap: "$2.1M" },
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
      <div className="bg-[#161B27] border border-[rgba(99,102,241,0.15)] rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-lg">🐶</div>
            <div>
              <div className="font-bold text-white text-base leading-none mb-1">Luna Doge</div>
              <div className="text-[#94A3B8] font-mono text-xs">$LDOGE</div>
            </div>
            <ArrowDownRight className="w-4 h-4 ml-2 text-[#475569]" />
          </div>
          
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <div>
              <div className="text-[#475569] text-xs uppercase mb-0.5 font-semibold">Price</div>
              <div className="text-[#10B981] font-mono font-bold">${MOCK_PRICE}</div>
            </div>
            <div>
              <div className="text-[#475569] text-xs uppercase mb-0.5 font-semibold">24H Change</div>
              <div className="text-[#10B981] font-mono font-bold">+142.5%</div>
            </div>
            <div>
              <div className="text-[#475569] text-xs uppercase mb-0.5 font-semibold">Market Cap</div>
              <div className="text-white font-mono font-bold">$1.87M</div>
            </div>
            <div>
              <div className="text-[#475569] text-xs uppercase mb-0.5 font-semibold">Volume</div>
              <div className="text-white font-mono font-bold">$423K</div>
            </div>
          </div>
        </div>

        <div className="flex bg-[#080B12] rounded-lg p-1 border border-[rgba(99,102,241,0.15)]">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tf === t ? 'bg-[rgba(99,102,241,0.2)] text-[#818CF8]' : 'text-[#94A3B8] hover:text-white'}`}
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
          <div className="bg-[#0D1117] border border-[rgba(99,102,241,0.1)] rounded-xl relative flex-1 min-h-[300px] overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="bg-[#161B27] border border-[rgba(99,102,241,0.15)] text-[#94A3B8] text-xs px-2 py-1 rounded font-mono">LDOGE / SOL</span>
              <span className="bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] text-[#F43F5E] text-xs px-2 py-1 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">DEMO DATA</span>
            </div>
            <AreaChart />
            <div className="absolute top-0 right-0 h-full w-[60px] border-l border-[rgba(99,102,241,0.05)] bg-[#0D1117] bg-opacity-80 flex flex-col justify-between py-8 px-2 text-[10px] text-[#475569] font-mono z-10">
              <span>0.00242</span>
              <span>0.00238</span>
              <span className="text-[#818CF8] bg-[rgba(99,102,241,0.1)] px-1 rounded">0.00234</span>
              <span>0.00230</span>
              <span>0.00226</span>
            </div>
          </div>

          {/* Order Book */}
          <div className="bg-[#0D1117] border border-[rgba(99,102,241,0.1)] rounded-xl p-4 h-[220px] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm">Order Book</h3>
              <span className="badge-muted text-[10px]">Demo Data</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide text-xs font-mono">
              <div className="flex justify-between text-[#475569] mb-2 px-1">
                <span>Price (SOL)</span>
                <span>Size (LDOGE)</span>
              </div>
              
              {/* Asks */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(244,63,94,0.1)] z-0 rounded-r" style={{ width: '65%' }} />
                  <span className="text-[#F43F5E] relative z-10">0.002841</span>
                  <span className="text-[#94A3B8] relative z-10">18,200</span>
                </div>
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(244,63,94,0.1)] z-0 rounded-r" style={{ width: '85%' }} />
                  <span className="text-[#F43F5E] relative z-10">0.002820</span>
                  <span className="text-[#94A3B8] relative z-10">31,500</span>
                </div>
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(244,63,94,0.1)] z-0 rounded-r" style={{ width: '45%' }} />
                  <span className="text-[#F43F5E] relative z-10">0.002810</span>
                  <span className="text-[#94A3B8] relative z-10">12,100</span>
                </div>
              </div>
              
              <div className="text-center py-1.5 bg-[#161B27] rounded text-[#818CF8] my-1 border border-[rgba(99,102,241,0.1)]">
                Spread: 0.000012 (0.43%)
              </div>
              
              {/* Bids */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(16,185,129,0.1)] z-0 rounded-r" style={{ width: '75%' }} />
                  <span className="text-[#10B981] relative z-10">0.002798</span>
                  <span className="text-[#94A3B8] relative z-10">24,400</span>
                </div>
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(16,185,129,0.1)] z-0 rounded-r" style={{ width: '100%' }} />
                  <span className="text-[#10B981] relative z-10">0.002780</span>
                  <span className="text-[#94A3B8] relative z-10">41,200</span>
                </div>
                <div className="flex justify-between px-1 hover:bg-[rgba(255,255,255,0.02)] rounded relative group">
                  <div className="absolute right-0 top-0 h-full bg-[rgba(16,185,129,0.1)] z-0 rounded-r" style={{ width: '55%' }} />
                  <span className="text-[#10B981] relative z-10">0.002760</span>
                  <span className="text-[#94A3B8] relative z-10">19,800</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 flex-shrink-0 min-h-0">
          
          {/* Trade Panel */}
          <div className="bg-[#161B27] border border-[rgba(99,102,241,0.15)] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex bg-[#080B12] rounded-lg p-1 border border-[rgba(99,102,241,0.15)]">
              <button 
                onClick={() => setSide("BUY")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${side === "BUY" ? 'bg-[#10B981] text-white' : 'text-[#94A3B8] hover:text-white'}`}
              >BUY</button>
              <button 
                onClick={() => setSide("SELL")}
                className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${side === "SELL" ? 'bg-[#F43F5E] text-white' : 'text-[#94A3B8] hover:text-white'}`}
              >SELL</button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm text-[#94A3B8] font-semibold">Amount (SOL)</label>
                <span className="text-xs text-[#475569] font-mono">Bal: 12.45 SOL</span>
              </div>
              <div className="bg-[#080B12] border border-[rgba(99,102,241,0.15)] rounded-lg p-1 flex items-center focus-within:border-[rgba(99,102,241,0.4)] transition-colors">
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent p-2 text-white font-mono focus:outline-none"
                />
                <div className="flex gap-1 pr-1">
                  {['25%','50%','100%'].map(pct => (
                    <button key={pct} onClick={() => setAmount(pct === '100%' ? '12.45' : pct === '50%' ? '6.22' : '3.11')} className="px-2 py-1 bg-[#161B27] text-xs text-[#818CF8] rounded hover:bg-[rgba(99,102,241,0.1)] transition-colors font-mono">{pct}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.1)] rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-[#94A3B8]">You receive</span>
              <span className="text-white font-mono font-bold">~{expectedTokens.toLocaleString(undefined, {maximumFractionDigits: 0})} LDOGE</span>
            </div>

            <div className="flex justify-between items-center bg-[#080B12] border border-[rgba(99,102,241,0.1)] rounded-lg px-3 py-2">
              <span className="text-sm text-[#94A3B8] flex items-center gap-1"><Settings2 className="w-3.5 h-3.5"/> Slippage</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSlippage("0.5")} className="w-6 h-6 flex items-center justify-center bg-[#161B27] text-[#94A3B8] rounded hover:text-white">-</button>
                <span className="text-sm font-mono text-white w-8 text-center">{slippage}%</span>
                <button onClick={() => setSlippage("2.0")} className="w-6 h-6 flex items-center justify-center bg-[#161B27] text-[#94A3B8] rounded hover:text-white">+</button>
              </div>
            </div>

            <button className={`w-full py-3 rounded-lg font-bold text-white text-base transition-colors ${side === "BUY" ? 'bg-[#10B981] hover:bg-[#059669]' : 'bg-[#F43F5E] hover:bg-[#E11D48]'}`}>
              {side} LDOGE
            </button>
            <div className="text-[10px] text-center text-[#475569] flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Trading involves risk. Demo mode active.
            </div>
          </div>

          {/* Trade Copilot */}
          <div className="bg-[#0D1117] border border-[rgba(99,102,241,0.1)] rounded-xl flex flex-col flex-1 min-h-[220px]">
            <div className="p-3 border-b border-[rgba(99,102,241,0.1)] flex items-center gap-2 bg-[rgba(99,102,241,0.02)]">
              <div className="w-6 h-6 rounded bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#818CF8]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-white">Trade Copilot</span>
              <span className="badge-indigo text-[10px] ml-auto">AI</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide text-sm" ref={copilotScrollRef}>
              {copilotMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-[#6366F1] text-white rounded-tr-sm' : 'bg-[#161B27] border border-[rgba(99,102,241,0.15)] text-[#F1F5F9] rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-2.5 rounded-xl bg-[#161B27] border border-[rgba(99,102,241,0.15)] text-[#818CF8] rounded-tl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                    <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-[rgba(99,102,241,0.1)]">
              <div className="bg-[#161B27] border border-[rgba(99,102,241,0.2)] rounded-lg p-1 flex">
                <input 
                  type="text"
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCopilotMessage(copilotInput)}
                  placeholder="Ask about this trade..."
                  className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-[#475569] focus:outline-none"
                />
                <button 
                  onClick={() => sendCopilotMessage(copilotInput)}
                  disabled={!copilotInput.trim() || copilotLoading}
                  className="w-8 flex items-center justify-center text-[#818CF8] hover:text-white disabled:opacity-50 transition-colors"
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
