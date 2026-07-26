"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Swords, ChevronDown, RefreshCw } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── COUNTDOWN HOOK ──
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

const BATTLE = {
  tokenA: { id:'tok_luna_doge', name:'Luna Doge', ticker:'LDOGE', icon:'🐶', color:'#10B981', votes:8432, pct:57 },
  tokenB: { id:'tok_degen_ape', name:'DegenApe', ticker:'DAPE', icon:'💎', color:'#F43F5E', votes:6318, pct:43 },
};

const PAST_BATTLES = [
  { date: "Oct 12", winner: "Luna Doge", icon: "🐶", pct: 71, loser: "WifHat" },
  { date: "Oct 11", winner: "AI Swarm", icon: "🤖", pct: 58, loser: "CyberPep" },
  { date: "Oct 10", winner: "PixelCat", icon: "🐱", pct: 83, loser: "NovaFlux" },
  { date: "Oct 09", winner: "StormCat", icon: "⚡", pct: 62, loser: "Void Inu" },
];

export default function ArenaPage() {
  const countdown = useCountdown(24137); // random start

  const [voted, setVoted] = useState<'a' | 'b' | null>(null);
  const [confirming, setConfirming] = useState<'a' | 'b' | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [analysisText, setAnalysisText] = useState({
    a: "Luna Doge enters the arena backed by explosive social velocity. The Dog Meta narrative is at peak strength. Holder count is up this week making it a clear favorite.",
    b: "DegenApe fights back with classic underdog energy. Memetic potential is high, and recent volume spikes suggest whale accumulation. Don't count it out."
  });

  const handleVote = (side: 'a' | 'b') => {
    if (confirming === side) {
      setVoted(side);
      setConfirming(null);
    } else {
      setConfirming(side);
      setTimeout(() => setConfirming(null), 3000);
    }
  };

  const regenerateAnalysis = async () => {
    if (analysisLoading) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/arena-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenA: "LDOGE", tokenB: "DAPE" }),
      });
      if (res.ok) {
        // Mocking a change if api succeeds or fails
      }
    } catch {
      // silent
    }
    
    await new Promise(r => setTimeout(r, 1500));
    setAnalysisText({
      a: "Updated Analysis: Luna Doge's on-chain metrics are extraordinary. Forged from social momentum and volume consistency, the dog meta is entering euphoric territory.",
      b: "Updated Analysis: DegenApe has quietly built a war chest. Three historically accurate early-mover wallets loaded significant positions recently."
    });
    setAnalysisLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pt-8 pb-16">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">Token Arena</h1>
          <p className="text-[#94A3B8]">Daily battle. Two tokens. One winner. You decide.</p>
        </div>
        <div className="bg-[#0D1117] border border-[rgba(99,102,241,0.2)] rounded-xl px-6 py-3 flex flex-col items-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <span className="text-[#94A3B8] text-xs uppercase tracking-wider font-semibold mb-1">Resets in</span>
          <span className="text-2xl font-mono font-bold text-white tracking-widest" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>{countdown}</span>
        </div>
      </motion.div>

      {/* ── TODAY'S BATTLE ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex justify-center mb-4 relative z-10">
          <span className="bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] text-[#818CF8] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            Today's Battle
          </span>
        </div>

        <div className="relative mb-8">
          {/* Dynamic Ambient Lighting */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-[0.12] bg-[#10B981] fluxx-light-leak" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none opacity-[0.12] bg-[#F43F5E] fluxx-light-leak" />
          
          <div className="fluxx-card p-6 md:p-10 relative z-10 bg-[#080B12]/80 backdrop-blur-xl border border-[rgba(99,102,241,0.15)] rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4 relative z-10">
              
              {/* Token A */}
              <div className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl border border-[rgba(16,185,129,0.3)] transition-all hover:border-[#10B981] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-[#0D1117]/50 w-full">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]" style={{ backgroundColor: `${BATTLE.tokenA.color}20`, border: `2px solid ${BATTLE.tokenA.color}40` }}>
                  {BATTLE.tokenA.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{BATTLE.tokenA.name}</h2>
                <span className="text-[#94A3B8] font-mono mb-4">${BATTLE.tokenA.ticker}</span>
                
                <div className="text-4xl font-bold font-mono mb-1" style={{ color: BATTLE.tokenA.color, textShadow: '0 0 10px rgba(16,185,129,0.4)' }}>{BATTLE.tokenA.pct}%</div>
                <div className="text-[#475569] text-sm mb-6">{BATTLE.tokenA.votes.toLocaleString()} votes</div>
                
                {!voted ? (
                  confirming === 'a' ? (
                    <div className="flex gap-2 w-full max-w-[200px]">
                      <button onClick={() => handleVote('a')} className="px-4 py-2 rounded-lg font-medium text-white transition-all flex-1 bg-[#10B981] hover:bg-[#059669]">Confirm</button>
                      <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] flex-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirming('a')} className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#10B981] to-[#059669] text-white active:scale-95 transition-transform w-full max-w-[200px] shadow-[0_4px_15px_rgba(16,185,129,0.4)]">
                      Vote {BATTLE.tokenA.name}
                    </button>
                  )
                ) : voted === 'a' ? (
                  <div className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    ✓ You voted For
                  </div>
                ) : (
                  <div className="px-4 py-2 text-[#475569] font-medium">Voted elsewhere</div>
                )}
              </div>

              {/* VS Badge */}
              <div className="w-16 h-16 rounded-full bg-[#080B12] border-flow flex items-center justify-center shrink-0 z-20 md:my-0 my-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <span className="font-bold font-display text-white text-xl">VS</span>
              </div>

              {/* Token B */}
              <div className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl border border-[rgba(244,63,94,0.3)] transition-all hover:border-[#F43F5E] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] bg-[#0D1117]/50 w-full">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-[0_0_15px_rgba(244,63,94,0.2)]" style={{ backgroundColor: `${BATTLE.tokenB.color}20`, border: `2px solid ${BATTLE.tokenB.color}40` }}>
                  {BATTLE.tokenB.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{BATTLE.tokenB.name}</h2>
                <span className="text-[#94A3B8] font-mono mb-4">${BATTLE.tokenB.ticker}</span>
                
                <div className="text-4xl font-bold font-mono mb-1" style={{ color: BATTLE.tokenB.color, textShadow: '0 0 10px rgba(244,63,94,0.4)' }}>{BATTLE.tokenB.pct}%</div>
                <div className="text-[#475569] text-sm mb-6">{BATTLE.tokenB.votes.toLocaleString()} votes</div>
                
                {!voted ? (
                  confirming === 'b' ? (
                    <div className="flex gap-2 w-full max-w-[200px]">
                      <button onClick={() => handleVote('b')} className="px-4 py-2 rounded-lg font-medium text-white transition-all flex-1 bg-[#F43F5E] hover:bg-[#E11D48]">Confirm</button>
                      <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] flex-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirming('b')} className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white active:scale-95 transition-transform w-full max-w-[200px] shadow-[0_4px_15px_rgba(244,63,94,0.4)]">
                      Vote {BATTLE.tokenB.name}
                    </button>
                  )
                ) : voted === 'b' ? (
                  <div className="bg-[rgba(244,63,94,0.15)] text-[#F43F5E] px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-[rgba(244,63,94,0.3)] shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                    ✓ You voted For
                  </div>
                ) : (
                  <div className="px-4 py-2 text-[#475569] font-medium">Voted elsewhere</div>
                )}
              </div>

            </div>

            {/* Progress Bar */}
            <div className="mt-10 max-w-2xl mx-auto relative z-10">
              <div className="flex justify-center text-xs font-mono text-[#94A3B8] mb-2">
                {BATTLE.tokenA.pct}% vs {BATTLE.tokenB.pct}%
              </div>
              <div className="h-4 w-full bg-[#080B12] rounded-full overflow-hidden flex border border-[rgba(255,255,255,0.05)] shadow-inner">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${BATTLE.tokenA.pct}%` }} transition={{ duration: 1, ease: EASE }}
                  className="h-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                />
                <motion.div 
                  initial={{ width: '100%' }} animate={{ width: `${BATTLE.tokenB.pct}%` }} transition={{ duration: 1, ease: EASE }}
                  className="h-full bg-[#F43F5E] shadow-[0_0_10px_rgba(244,63,94,0.8)]" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── AI ANALYSIS ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
        <button 
          onClick={() => setAnalysisOpen(!analysisOpen)}
          className="w-full flex justify-between items-center bg-[#0D1117] border border-[rgba(99,102,241,0.3)] fluxx-card rounded-xl p-5 hover:bg-[rgba(99,102,241,0.1)] transition-colors shadow-[0_0_15px_rgba(99,102,241,0.1)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg">AI Battle Analysis</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#94A3B8] transition-transform ${analysisOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {analysisOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#080B12] border border-t-0 border-[rgba(99,102,241,0.15)] rounded-b-xl p-6 md:p-8 -mt-2 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="font-bold text-[#10B981] mb-3 flex items-center gap-2">
                      {BATTLE.tokenA.icon} {BATTLE.tokenA.name}
                    </h3>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">{analysisText.a}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F43F5E] mb-3 flex items-center gap-2">
                      {BATTLE.tokenB.icon} {BATTLE.tokenB.name}
                    </h3>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">{analysisText.b}</p>
                  </div>
                </div>
                
                <div className="flex justify-center border-t border-[rgba(99,102,241,0.1)] pt-6">
                  <button 
                    onClick={regenerateAnalysis}
                    disabled={analysisLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#818CF8] border border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.1)] hover:text-white active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${analysisLoading ? 'animate-spin' : ''}`} />
                    {analysisLoading ? "Regenerating..." : "Regenerate Analysis"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── PAST BATTLES ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-xl font-bold text-white mb-4">Recent Results</h3>
        <div className="fluxx-card bg-[#0D1117] border border-[rgba(99,102,241,0.15)] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.05)]">
          {PAST_BATTLES.map((b, i) => (
            <div key={i} className={`flex items-center justify-between p-4 ${i !== PAST_BATTLES.length - 1 ? 'border-b border-[rgba(99,102,241,0.1)]' : ''} odd:bg-[rgba(99,102,241,0.03)] hover:bg-[rgba(99,102,241,0.06)] transition-colors`}>
              <div className="text-[#475569] text-sm w-16">{b.date}</div>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <span className="text-white font-bold block">{b.winner}</span>
                  <span className="text-xs text-[#94A3B8]">Defeated {b.loser}</span>
                </div>
              </div>
              <div className="text-[#10B981] font-mono font-bold bg-[rgba(16,185,129,0.1)] px-3 py-1 rounded">
                {b.pct}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
