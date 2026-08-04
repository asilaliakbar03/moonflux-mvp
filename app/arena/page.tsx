"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Swords, RefreshCw } from "lucide-react";
import MagneticButton from '@/components/MagneticButton';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/components/ThemeProvider';

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

const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const PAST_BATTLES = [
  { date: getPastDate(1), winner: "Luna Doge", icon: "🐶", pct: 71, loser: "WifHat" },
  { date: getPastDate(2), winner: "AI Swarm", icon: "🤖", pct: 58, loser: "CyberPep" },
  { date: getPastDate(3), winner: "PixelCat", icon: "🐱", pct: 83, loser: "NovaFlux" },
  { date: getPastDate(4), winner: "StormCat", icon: "⚡", pct: 62, loser: "Void Inu" },
];

const getAsciiBar = (pct: number, length: number = 10) => {
  const filled = Math.round((pct / 100) * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

export default function ArenaPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const countdown = useCountdown(24137);

  const [voted, setVoted] = useState<'a' | 'b' | null>(null);
  const [confirming, setConfirming] = useState<'a' | 'b' | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [analysisText, setAnalysisText] = useState({
    a: "LUNA DOGE ENTERS THE ARENA BACKED BY EXPLOSIVE SOCIAL VELOCITY. THE DOG META NARRATIVE IS AT PEAK STRENGTH. HOLDER COUNT IS UP THIS WEEK MAKING IT A CLEAR FAVORITE.",
    b: "DEGENAPE FIGHTS BACK WITH CLASSIC UNDERDOG ENERGY. VIRAL POTENTIAL IS HIGH, AND RECENT VOLUME SPIKES SUGGEST WHALE ACCUMULATION. DON'T COUNT IT OUT."
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
      a: "UPDATED ANALYSIS: LUNA DOGE'S ON-CHAIN METRICS ARE EXTRAORDINARY. FORGED FROM SOCIAL MOMENTUM AND VOLUME CONSISTENCY, THE DOG META IS ENTERING EUPHORIC TERRITORY.",
      b: "UPDATED ANALYSIS: DEGENAPE HAS QUIETLY BUILT A WAR CHEST. THREE HISTORICALLY ACCURATE EARLY-MOVER WALLETS LOADED SIGNIFICANT POSITIONS RECENTLY."
    });
    setAnalysisLoading(false);
  };

  const borderClass = isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black';
  const borderHeavyClass = isDark ? 'border-4 border-[rgba(255,255,255,0.2)]' : 'border-4 border-black';
  
  const bgRoot = isDark ? 'bg-[#050510]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500';

  const shadowA = isDark ? 'shadow-[4px_4px_0px_0px_#10B981]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowB = isDark ? 'shadow-[4px_4px_0px_0px_#F43F5E]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowNeutral = isDark ? 'shadow-[4px_4px_0px_0px_#06B6D4]' : 'shadow-[4px_4px_0px_0px_#000]';
  
  const shadowHoverA = isDark ? 'hover:shadow-[6px_6px_0px_0px_#10B981]' : 'hover:shadow-[6px_6px_0px_0px_#000]';
  const shadowHoverB = isDark ? 'hover:shadow-[6px_6px_0px_0px_#F43F5E]' : 'hover:shadow-[6px_6px_0px_0px_#000]';

  return (
    <div className={`min-h-screen ${bgRoot} ${textPrimary} font-mono uppercase tracking-wider selection:bg-[#F59E0B] selection:text-black`}>
      <div className="max-w-6xl mx-auto w-full pt-4 pb-24 md:pb-8 px-4 sm:px-6">
        
        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 tracking-widest leading-none drop-shadow-md">
              TOKEN ARENA
            </h1>
            <p className={`font-bold text-xs sm:text-sm ${isDark ? 'text-[#06B6D4]' : 'text-blue-600'}`}>
              [ DAILY BATTLE. TWO TOKENS. ONE SURVIVOR. ]
            </p>
          </div>
          <div className={`${borderClass} p-2 sm:p-3 bg-[#F59E0B] text-black ${shadowNeutral} transform -rotate-1`}>
            <div className="text-[10px] font-black mb-0.5">[ RESET IN ]</div>
            <div className="text-xl sm:text-2xl font-black tracking-widest">{countdown}</div>
          </div>
        </motion.div>

        {/* ── TODAY'S BATTLE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className={`${borderHeavyClass} p-4 sm:p-5 relative ${isDark ? 'bg-black' : 'bg-gray-50'} ${shadowNeutral} mb-6`}>
            
            <div className="absolute -top-3 -left-3 bg-[#10B981] text-black text-xs font-black px-2 py-1 border-2 border-black z-20">
              [ LIVE DUEL ]
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-4 relative z-10">
              
              {/* Token A Card */}
              <div className={`flex-1 flex flex-col p-4 ${borderClass} ${isDark ? 'bg-[#111]' : 'bg-white'} ${shadowA} relative transition-transform hover:-translate-y-0.5`}>
                <div className="absolute top-1 right-1 text-[10px] font-black text-[#10B981]">[ A ]</div>
                <div className="flex flex-col items-center mb-3 mt-2">
                  <div className={`${borderClass} bg-[#10B981] w-20 h-20 sm:w-24 sm:h-24 mb-2 overflow-hidden`}>
                    <img src={`https://robohash.org/${BATTLE.tokenA.ticker.toLowerCase()}?set=set1&bgset=bg1&size=400x400`} alt="Token A" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                  </div>
                  <h2 className="font-black text-xl sm:text-2xl tracking-widest text-[#10B981]">{BATTLE.tokenA.name}</h2>
                  <span className={`text-sm font-bold ${textMuted}`}>${BATTLE.tokenA.ticker}</span>
                </div>

                <div className="mb-3 w-full text-center">
                  <div className="text-[#10B981] font-black text-base sm:text-lg mb-1">
                    {getAsciiBar(BATTLE.tokenA.pct)} <AnimatedCounter value={BATTLE.tokenA.pct} suffix="%" />
                  </div>
                  <div className={`text-[10px] font-bold ${textMuted}`}>
                    [ <AnimatedCounter value={BATTLE.tokenA.votes} /> VOTES ]
                  </div>
                </div>
                
                <div className="mt-auto">
                  {!voted ? (
                    confirming === 'a' ? (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => handleVote('a')} className={`flex-1 py-3 font-black text-sm bg-[#10B981] text-black ${borderClass} hover:bg-white transition-colors`}>
                          [ CONFIRM ]
                        </button>
                        <button onClick={() => setConfirming(null)} className={`flex-1 py-3 font-black text-sm bg-transparent ${borderClass} hover:bg-[#F43F5E] hover:text-black transition-colors`}>
                          [ CANCEL ]
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirming('a')} className={`w-full py-3 font-black text-base bg-[#10B981] text-black ${borderClass} ${shadowHoverA} transition-all active:translate-y-1 active:shadow-none`}>
                        [ VOTE {BATTLE.tokenA.ticker} ]
                      </button>
                    )
                  ) : voted === 'a' ? (
                    <div className={`w-full py-3 text-center font-black text-base bg-[#10B981] text-black ${borderClass}`}>
                      [ VOTE SECURED ]
                    </div>
                  ) : (
                    <div className={`w-full py-3 text-center font-black text-base ${isDark ? 'bg-[#222] text-[#555]' : 'bg-gray-200 text-gray-400'} ${borderClass}`}>
                      [ LOCKED OUT ]
                    </div>
                  )}
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex items-center justify-center lg:w-12 lg:h-auto shrink-0 z-20 py-2 lg:py-0">
                <div className={`${borderClass} bg-[#F59E0B] text-black w-12 h-12 flex items-center justify-center font-black text-lg transform rotate-12 shadow-[3px_3px_0px_0px_#000]`}>
                  VS
                </div>
              </div>

              {/* Token B Card */}
              <div className={`flex-1 flex flex-col p-4 ${borderClass} ${isDark ? 'bg-[#111]' : 'bg-white'} ${shadowB} relative transition-transform hover:-translate-y-0.5`}>
                <div className="absolute top-1 right-1 text-[10px] font-black text-[#F43F5E]">[ B ]</div>
                <div className="flex flex-col items-center mb-3 mt-2">
                  <div className={`${borderClass} bg-[#F43F5E] w-20 h-20 sm:w-24 sm:h-24 mb-2 overflow-hidden`}>
                    <img src={`https://robohash.org/${BATTLE.tokenB.ticker.toLowerCase()}?set=set1&bgset=bg1&size=400x400`} alt="Token B" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                  </div>
                  <h2 className="font-black text-xl sm:text-2xl tracking-widest text-[#F43F5E]">{BATTLE.tokenB.name}</h2>
                  <span className={`text-sm font-bold ${textMuted}`}>${BATTLE.tokenB.ticker}</span>
                </div>

                <div className="mb-3 w-full text-center">
                  <div className="text-[#F43F5E] font-black text-base sm:text-lg mb-1">
                    {getAsciiBar(BATTLE.tokenB.pct)} <AnimatedCounter value={BATTLE.tokenB.pct} suffix="%" />
                  </div>
                  <div className={`text-[10px] font-bold ${textMuted}`}>
                    [ <AnimatedCounter value={BATTLE.tokenB.votes} /> VOTES ]
                  </div>
                </div>
                
                <div className="mt-auto">
                  {!voted ? (
                    confirming === 'b' ? (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => handleVote('b')} className={`flex-1 py-3 font-black text-sm bg-[#F43F5E] text-black ${borderClass} hover:bg-white transition-colors`}>
                          [ CONFIRM ]
                        </button>
                        <button onClick={() => setConfirming(null)} className={`flex-1 py-3 font-black text-sm bg-transparent ${borderClass} hover:bg-[#10B981] hover:text-black transition-colors`}>
                          [ CANCEL ]
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirming('b')} className={`w-full py-3 font-black text-base bg-[#F43F5E] text-black ${borderClass} ${shadowHoverB} transition-all active:translate-y-1 active:shadow-none`}>
                        [ VOTE {BATTLE.tokenB.ticker} ]
                      </button>
                    )
                  ) : voted === 'b' ? (
                    <div className={`w-full py-3 text-center font-black text-base bg-[#F43F5E] text-black ${borderClass}`}>
                      [ VOTE SECURED ]
                    </div>
                  ) : (
                    <div className={`w-full py-3 text-center font-black text-base ${isDark ? 'bg-[#222] text-[#555]' : 'bg-gray-200 text-gray-400'} ${borderClass}`}>
                      [ LOCKED OUT ]
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Battle Stats Grid */}
            <div className={`mt-4 grid grid-cols-3 gap-3 pt-4 border-t-2 ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'}`}>
              <div className={`${borderClass} p-2 sm:p-3 bg-[#6366F1] text-white flex flex-col`}>
                <span className="text-[10px] font-black mb-1">[ 24H VOL ]</span>
                <div className="flex justify-between items-end mt-auto text-xs sm:text-sm">
                  <span className="font-bold text-[#10B981]">$1.2M</span>
                  <span className="font-bold text-[#F43F5E]">$980K</span>
                </div>
              </div>
              <div className={`${borderClass} p-2 sm:p-3 bg-[#06B6D4] text-black flex flex-col`}>
                <span className="text-[10px] font-black mb-1">[ HOLDERS ]</span>
                <div className="flex justify-between items-end mt-auto text-xs sm:text-sm">
                  <span className="font-bold text-black">+14%</span>
                  <span className="font-bold text-white">+22%</span>
                </div>
              </div>
              <div className={`${borderClass} p-2 sm:p-3 bg-[#F59E0B] text-black flex flex-col`}>
                <span className="text-[10px] font-black mb-1">[ SENTIMENT ]</span>
                <div className="text-sm font-black mt-auto">
                  [██████░░] MAX
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── AI ANALYSIS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <div className={`${borderHeavyClass} ${isDark ? 'bg-black' : 'bg-white'} ${shadowNeutral}`}>
            <button 
              onClick={() => setAnalysisOpen(!analysisOpen)}
              className={`w-full flex justify-between items-center p-6 ${isDark ? 'hover:bg-[#111]' : 'hover:bg-gray-100'} transition-colors`}
            >
              <div className="flex items-center gap-4">
                <Swords className={`w-8 h-8 ${isDark ? 'text-[#06B6D4]' : 'text-blue-600'}`} />
                <span className="font-black text-xl tracking-widest">[ NEURAL ANALYSIS ]</span>
              </div>
              <span className={`font-bold text-lg ${isDark ? 'text-[#F59E0B]' : 'text-orange-500'}`}>
                [{analysisOpen ? ' COLLAPSE ' : ' EXPAND '}]
              </span>
            </button>

            {analysisOpen && (
              <div className={`p-6 pt-0 border-t-4 ${isDark ? 'border-[rgba(255,255,255,0.2)] bg-[#111]' : 'border-black bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  <div className={`${borderClass} p-4 bg-[rgba(16,185,129,0.1)]`}>
                    <h3 className="font-black text-[#10B981] text-lg mb-4 border-b-2 border-[#10B981] pb-2">
                      [ {BATTLE.tokenA.ticker} DATABANK ]
                    </h3>
                    <p className="font-bold text-sm leading-relaxed text-justify">{analysisText.a}</p>
                  </div>
                  <div className={`${borderClass} p-4 bg-[rgba(244,63,94,0.1)]`}>
                    <h3 className="font-black text-[#F43F5E] text-lg mb-4 border-b-2 border-[#F43F5E] pb-2">
                      [ {BATTLE.tokenB.ticker} DATABANK ]
                    </h3>
                    <p className="font-bold text-sm leading-relaxed text-justify">{analysisText.b}</p>
                  </div>
                </div>
                
                <div className="flex justify-start mt-8">
                  <button 
                    onClick={regenerateAnalysis}
                    disabled={analysisLoading}
                    className={`flex items-center gap-3 font-black px-6 py-3 ${borderClass} bg-[#6366F1] text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50`}
                  >
                    <RefreshCw className={`w-5 h-5 ${analysisLoading ? 'animate-spin' : ''}`} />
                    [ {analysisLoading ? "RECALCULATING..." : "REGENERATE ANALYSIS"} ]
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── PAST BATTLES ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-2xl font-black mb-6 tracking-widest drop-shadow-sm">[ ARCHIVED CONFLICTS ]</h3>
          <div className={`${borderHeavyClass} ${isDark ? 'bg-black' : 'bg-white'} ${shadowNeutral}`}>
            {PAST_BATTLES.map((b, i) => (
              <div key={i} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 transition-colors ${
                i !== PAST_BATTLES.length - 1 ? (isDark ? 'border-b-4 border-[rgba(255,255,255,0.2)]' : 'border-b-4 border-black') : ''
              } ${isDark ? 'hover:bg-[#111]' : 'hover:bg-gray-100'}`}>
                <div className="flex items-center gap-6 mb-4 sm:mb-0">
                  <div className={`font-black text-lg w-20 ${isDark ? 'text-[#06B6D4]' : 'text-blue-600'}`}>{b.date}</div>
                  <div className="flex items-center gap-4">
                    <span className={`text-3xl ${borderClass} p-2 bg-[#10B981] leading-none`}>{b.icon}</span>
                    <span className="font-black text-xl">{b.winner}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`text-sm font-bold ${textMuted}`}>[ TERMINATED {b.loser.toUpperCase()} ]</span>
                  <div className={`text-[#10B981] text-lg font-black bg-black ${borderClass} px-4 py-2`}>
                    {b.pct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
