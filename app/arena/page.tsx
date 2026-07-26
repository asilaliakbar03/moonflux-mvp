"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Swords, RefreshCw } from "lucide-react";
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';

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
  tokenB: { id:'tok_degen_ape', name:'DegenApe', ticker:'DAPE', icon:'💎', color:'#EF4444', votes:6318, pct:43 },
};

const PAST_BATTLES = [
  { date: "Oct 12", winner: "Luna Doge", icon: "🐶", pct: 71, loser: "WifHat" },
  { date: "Oct 11", winner: "AI Swarm", icon: "🤖", pct: 58, loser: "CyberPep" },
  { date: "Oct 10", winner: "PixelCat", icon: "🐱", pct: 83, loser: "NovaFlux" },
  { date: "Oct 09", winner: "StormCat", icon: "⚡", pct: 62, loser: "Void Inu" },
];

export default function ArenaPage() {
  const countdown = useCountdown(24137);

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
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-1">Token Arena</h1>
          <p className="text-[#94A3B8] text-sm">Daily battle. Two tokens. One winner. You decide.</p>
        </div>
        <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] rounded-xl px-4 py-2 flex items-center gap-4">
          <span className="text-[#475569] text-xs uppercase tracking-wider font-semibold">Resets in</span>
          <span className="text-lg font-mono font-medium text-[#F1F5F9]">{countdown}</span>
        </div>
      </motion.div>

      {/* ── TODAY'S BATTLE ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }}>
        <div className="mb-8 bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] rounded-xl p-6 md:p-8 relative">
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            
            {/* Token A */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex-1 flex flex-col p-5 rounded-xl border border-[rgba(99,102,241,0.06)] bg-[rgba(0,0,0,0.5)] w-full transition-colors hover:border-[#10B981]/30"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[#10B981]/10 border border-[#10B981]/20">
                    {BATTLE.tokenA.icon}
                  </div>
                  <div>
                    <h2 className="text-[#F1F5F9] font-bold text-lg leading-tight">{BATTLE.tokenA.name}</h2>
                    <span className="text-[#94A3B8] text-sm font-mono">${BATTLE.tokenA.ticker}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#F1F5F9] font-mono text-xl font-medium"><AnimatedCounter value={BATTLE.tokenA.pct} suffix="%" className="font-mono" /></div>
                  <div className="text-[#475569] text-xs"><AnimatedCounter value={BATTLE.tokenA.votes} /> votes</div>
                </div>
              </div>
              
              <MagneticButton as="div" strength={0.25} className="w-full">
                {!voted ? (
                  confirming === 'a' ? (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => handleVote('a')} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all flex-1 bg-[#10B981] hover:bg-[#059669]">Confirm</button>
                      <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg text-sm border border-[rgba(99,102,241,0.06)] text-[#94A3B8] transition-colors hover:bg-[rgba(99,102,241,0.04)] flex-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirming('a')} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#10B981] text-white transition-colors hover:bg-[#059669] w-full">
                      Vote {BATTLE.tokenA.ticker}
                    </button>
                  )
                ) : voted === 'a' ? (
                  <button disabled className="bg-[#10B981]/10 text-[#10B981] px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center border border-[#10B981]/20 w-full opacity-100 cursor-not-allowed">
                    Voted
                  </button>
                ) : (
                  <button disabled className="px-4 py-2 text-[#475569] text-sm font-medium w-full bg-[rgba(0,0,0,0.2)] rounded-lg cursor-not-allowed border border-[rgba(99,102,241,0.06)]">Voted elsewhere</button>
                )}
              </MagneticButton>
            </motion.div>

            {/* VS Badge */}
            <div className="w-10 h-10 rounded-full bg-[#000000] border border-[rgba(99,102,241,0.12)] flex items-center justify-center shrink-0 z-20 md:my-0 my-2 fluxx-breathe">
              <span className="font-medium text-[#94A3B8] text-xs">VS</span>
            </div>

            {/* Token B */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex-1 flex flex-col p-5 rounded-xl border border-[rgba(99,102,241,0.06)] bg-[rgba(0,0,0,0.5)] w-full transition-colors hover:border-[#EF4444]/30"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                    {BATTLE.tokenB.icon}
                  </div>
                  <div>
                    <h2 className="text-[#F1F5F9] font-bold text-lg leading-tight">{BATTLE.tokenB.name}</h2>
                    <span className="text-[#94A3B8] text-sm font-mono">${BATTLE.tokenB.ticker}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#F1F5F9] font-mono text-xl font-medium"><AnimatedCounter value={BATTLE.tokenB.pct} suffix="%" className="font-mono" /></div>
                  <div className="text-[#475569] text-xs"><AnimatedCounter value={BATTLE.tokenB.votes} /> votes</div>
                </div>
              </div>
              
              <MagneticButton as="div" strength={0.25} className="w-full">
                {!voted ? (
                  confirming === 'b' ? (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => handleVote('b')} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all flex-1 bg-[#EF4444] hover:bg-[#DC2626]">Confirm</button>
                      <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg text-sm border border-[rgba(99,102,241,0.06)] text-[#94A3B8] transition-colors hover:bg-[rgba(99,102,241,0.04)] flex-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirming('b')} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#EF4444] text-white transition-colors hover:bg-[#DC2626] w-full">
                      Vote {BATTLE.tokenB.ticker}
                    </button>
                  )
                ) : voted === 'b' ? (
                  <button disabled className="bg-[#EF4444]/10 text-[#EF4444] px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center border border-[#EF4444]/20 w-full opacity-100 cursor-not-allowed">
                    Voted
                  </button>
                ) : (
                  <button disabled className="px-4 py-2 text-[#475569] text-sm font-medium w-full bg-[rgba(0,0,0,0.2)] rounded-lg cursor-not-allowed border border-[rgba(99,102,241,0.06)]">Voted elsewhere</button>
                )}
              </MagneticButton>
            </motion.div>

          </div>

          {/* Progress Bar */}
          <div className="mt-8 max-w-2xl mx-auto relative z-10">
            <div className="h-2 w-full bg-[rgba(0,0,0,0.6)] rounded-full overflow-hidden flex border border-[rgba(99,102,241,0.06)]">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${BATTLE.tokenA.pct}%` }} transition={{ duration: 1, ease: EASE }}
                className="h-full bg-[#10B981]" 
              />
              <motion.div 
                initial={{ width: '100%' }} animate={{ width: `${BATTLE.tokenB.pct}%` }} transition={{ duration: 1, ease: EASE }}
                className="h-full bg-[#EF4444]" 
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── AI ANALYSIS ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className="mb-10">
        <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] rounded-xl overflow-hidden">
          <button 
            onClick={() => setAnalysisOpen(!analysisOpen)}
            className="w-full flex justify-between items-center p-4 hover:bg-[rgba(99,102,241,0.02)] transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="text-[#818CF8]">
                <Swords className="w-4 h-4" />
              </div>
              <span className="font-medium text-[#F1F5F9] text-sm">AI Battle Analysis</span>
            </div>
            <span className="text-xs text-[#94A3B8]">{analysisOpen ? 'Hide' : 'Show'}</span>
          </button>

          {analysisOpen && (
            <div className="p-4 pt-0 border-t border-[rgba(99,102,241,0.06)] bg-[rgba(0,0,0,0.2)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="font-medium text-[#10B981] text-sm mb-2 flex items-center gap-2">
                    {BATTLE.tokenA.icon} {BATTLE.tokenA.name}
                  </h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{analysisText.a}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#EF4444] text-sm mb-2 flex items-center gap-2">
                    {BATTLE.tokenB.icon} {BATTLE.tokenB.name}
                  </h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{analysisText.b}</p>
                </div>
              </div>
              
              <div className="flex justify-start mt-6">
                <button 
                  onClick={regenerateAnalysis}
                  disabled={analysisLoading}
                  className="flex items-center gap-2 text-xs text-[#475569] hover:text-[#94A3B8] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${analysisLoading ? 'animate-spin' : ''}`} />
                  {analysisLoading ? "Regenerating..." : "Regenerate Analysis"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── PAST BATTLES ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.3 }}>
        <h3 className="text-sm font-medium text-[#F1F5F9] mb-4">Recent Results</h3>
        <div className="bg-[rgba(0,0,0,0.4)] border border-[rgba(99,102,241,0.06)] rounded-xl overflow-hidden">
          {PAST_BATTLES.map((b, i) => (
            <div key={i} className={`flex items-center justify-between p-4 ${i !== PAST_BATTLES.length - 1 ? 'border-b border-[rgba(99,102,241,0.06)]' : ''} hover:bg-[rgba(99,102,241,0.04)] transition-colors`}>
              <div className="flex items-center gap-4">
                <div className="text-[#475569] text-sm font-mono w-14">{b.date}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[#F1F5F9] font-medium text-sm">{b.winner}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#475569] hidden sm:block">Defeated {b.loser}</span>
                <div className="text-[#10B981] text-xs font-mono font-medium bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-full">
                  {b.pct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
