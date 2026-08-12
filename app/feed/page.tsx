'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Share2, Flame, Bot, Bookmark, X, Terminal } from 'lucide-react';
import Link from 'next/link';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/components/ThemeProvider';

const getMemeImage = (ticker: string) => {
  const cleanTicker = (ticker || 'token').replace('$', '');
  const sets = ['set1', 'set2', 'set3', 'set4'];
  const set = sets[cleanTicker.length % 4];
  return `https://robohash.org/${cleanTicker.toLowerCase()}?set=${set}&bgset=bg1&size=400x400`;
};

interface FeedToken {
  id: string;
  matchScore: number;
  urgencySignal: string;
  matchReasons: string[];
  explanation: string;
  name: string;
  ticker: string;
  videoUrl?: string;
  progress: number;
  marketCap: string;
  risk: string;
}

function FeedItem({ token, idx, activeIndex, savedTokens, handleSave }: any) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tokenImg = getMemeImage(token.ticker);

  return (
    <div className="h-full w-full max-w-[100vw] overflow-x-hidden snap-start snap-always relative flex items-center justify-center p-4 sm:p-8 pb-20 sm:pb-24 font-mono">
      {/* Cyberpunk Grid Background */}
      <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#050510]' : 'bg-gray-100'}`}>
        <div className={`absolute inset-0 opacity-10 ${isDark ? "bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)]"}`} style={{ backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl h-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 overflow-y-auto scrollbar-hide py-6">
        
        {/* ── LARGE TOKEN ARTWORK CARD ── */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={activeIndex === idx ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, type: "spring" }}
          className="w-full max-w-[340px] sm:max-w-[400px] aspect-square relative shrink-0"
        >
          <div className={`w-full h-full relative overflow-hidden ${isDark ? "border-2 border-[rgba(255,255,255,0.2)] bg-black shadow-[6px_6px_0px_0px_#10B981]" : "border-3 border-black bg-white shadow-[6px_6px_0px_0px_#000]"}`}>
            {/* Big Token Avatar Image */}
            <img 
              src={tokenImg} 
              alt={token.name}
              className="w-full h-full object-cover"
            />

            {/* Badges overlay */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10">
              <div className={`px-2.5 py-1 text-xs font-black uppercase border ${isDark ? "bg-black text-[#10B981] border-[#10B981]" : "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                AI MATCH: {token.matchScore}%
              </div>
              <div className={`px-2.5 py-1 text-xs font-black uppercase border ${isDark ? "bg-red-950/90 text-[#F43F5E] border-[#F43F5E]" : "bg-red-100 text-red-600 border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                {token.urgencySignal || 'HIGH CONVICTION'}
              </div>
            </div>

            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
              <span className={`px-2 py-1 text-xs font-black uppercase border ${isDark ? "bg-black text-white border-white" : "bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                ${token.marketCap || '4.2M'} MC
              </span>
            </div>

            {/* Bottom Title Bar Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-white z-10">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight truncate">{token.name}</h2>
              <div className="text-sm font-bold text-[#818CF8]">{token.ticker}</div>
            </div>
          </div>
        </motion.div>

        {/* ── DETAILS & ACTIONS BOX ── */}
        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={activeIndex === idx ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex-1 w-full max-w-xl flex flex-col gap-4"
        >
          {/* Explanation Card */}
          <div className={`p-5 sm:p-6 ${isDark ? "border-2 border-[rgba(255,255,255,0.2)] bg-[#050510] shadow-[6px_6px_0px_0px_#10B981]" : "border-3 border-black bg-white shadow-[6px_6px_0px_0px_#000]"}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${isDark ? "text-[#10B981]" : "text-[#6366F1]"}`}>
              <Terminal size={14} /> [ AI SIGNAL DIAGNOSTIC ]
            </h3>
            <p className={`text-sm sm:text-base font-bold leading-relaxed mb-4 ${isDark ? "text-gray-200" : "text-black"}`}>
              {token.explanation}
            </p>
            <div className="flex flex-wrap gap-2">
              {(token.matchReasons || []).map((r: string, i: number) => (
                <span key={i} className={`px-2.5 py-1 text-xs font-bold uppercase border ${isDark ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30" : "bg-black text-white border-black"}`}>
                  #{r.replace(/ /g, '')}
                </span>
              ))}
            </div>
          </div>

          {/* Bonding Curve & Action Bar */}
          <div className={`p-5 sm:p-6 ${isDark ? "border-2 border-[rgba(255,255,255,0.2)] bg-[#050510] shadow-[6px_6px_0px_0px_#10B981]" : "border-3 border-black bg-white shadow-[6px_6px_0px_0px_#000]"} flex flex-col gap-4`}>
            <div>
              <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>BONDING CURVE PROGRESS</span>
                <span className="text-[#6366F1]">{token.progress || 78}%</span>
              </div>
              <div className={`h-3 w-full border-2 ${isDark ? "border-[rgba(255,255,255,0.2)] bg-black" : "border-black bg-gray-100"} p-0.5`}>
                <div className="h-full bg-[#10B981]" style={{ width: `${token.progress || 78}%` }} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleSave(token)}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${
                  savedTokens.find((t: any) => t.id === token.id) 
                    ? "bg-[#F59E0B] text-black border-black shadow-[3px_3px_0px_0px_#000]" 
                    : isDark ? "bg-black text-white border-[rgba(255,255,255,0.2)] hover:bg-[#10B981] hover:text-black" : "bg-gray-100 text-black border-black hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_#000]"
                }`}
              >
                <Bookmark size={16} />
                {savedTokens.find((t: any) => t.id === token.id) ? "[ SAVED ]" : "[ SAVE TOKEN ]"}
              </button>
              <Link 
                href={`/token/${token.id}`} 
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black uppercase border-2 ${isDark ? "border-white bg-[#6366F1] text-white shadow-[3px_3px_0px_0px_#10B981]" : "border-black bg-[#6366F1] text-white shadow-[3px_3px_0px_0px_#000]"} hover:bg-[#4F46E5] text-center flex items-center justify-center`}
              >
                [ TRADE NOW ]
              </Link>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce z-10 flex flex-col items-center">
        <span className="text-[10px] uppercase font-black tracking-widest">Scroll</span>
        <ChevronDown size={20} />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tokens, setTokens] = useState<FeedToken[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedTokens, setSavedTokens] = useState<FeedToken[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/trade-copilot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: 'anonymous' }) });
        if (!res.ok) throw new Error('Copilot endpoint failed');
        const data = await res.json();
        
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setTokens(data.recommendations);
        } else {
          throw new Error('Invalid schema from copilot');
        }
      } catch (err) {
        console.warn('Fallback to mock feed', err);
        setTokens([
          { id: 'tok_luna_doge', name: 'Luna Doge', ticker: '$LDOGE', matchScore: 94, urgencySignal: 'High Conviction', matchReasons: ['High Momentum', 'AI Narrative'], explanation: 'Whale wallets accumulated $420k in the last 2 hours following AI agent volume spike.', progress: 78, marketCap: '4.2M', risk: 'Medium' },
          { id: 'tok_cyber_pepe', name: 'Cyber Pepe', ticker: '$CPEPE', matchScore: 88, urgencySignal: 'Medium Signal', matchReasons: ['Breakout Pattern'], explanation: 'Consolidating above 200 EMA with expanding volume on DEX.', progress: 62, marketCap: '1.8M', risk: 'Low' },
          { id: 'tok_ai_swarm', name: 'AI Swarm', ticker: '$SWRM', matchScore: 96, urgencySignal: 'High Conviction', matchReasons: ['Whale Buys', 'Trending AI'], explanation: 'Multi-sig wallet created 15 minutes ago. Trading volume surge +210%.', progress: 95, marketCap: '8.9M', risk: 'Medium' },
          { id: 'tok_neon_cat', name: 'Neon Cat', ticker: '$NCAT', matchScore: 81, urgencySignal: 'Medium Signal', matchReasons: ['Community Growth', 'Meme Velocity'], explanation: 'Discord grew by 3,200 members in 48 hours. Twitter mentions up 540%.', progress: 45, marketCap: '920K', risk: 'Low' },
          { id: 'tok_quantum_ape', name: 'Quantum Ape', ticker: '$QAPE', matchScore: 92, urgencySignal: 'High Conviction', matchReasons: ['Smart Money Inflow', 'Low Float'], explanation: 'Top 10 whale wallet just bought $180k. Only 12% of supply circulating.', progress: 88, marketCap: '6.1M', risk: 'High' },
          { id: 'tok_sol_punk', name: 'Sol Punk', ticker: '$SPUNK', matchScore: 77, urgencySignal: 'Low Signal', matchReasons: ['Steady Growth'], explanation: 'Consistent 5% daily growth for 2 weeks. Strong diamond hand holder base.', progress: 34, marketCap: '510K', risk: 'Low' },
          { id: 'tok_degen_flux', name: 'Degen Flux', ticker: '$DFLUX', matchScore: 90, urgencySignal: 'High Conviction', matchReasons: ['Bonding Curve Rush', 'KOL Mentions'], explanation: 'Bonding curve at 72 SOL. 3 major KOLs tweeted in last hour.', progress: 85, marketCap: '3.7M', risk: 'Medium' },
          { id: 'tok_moon_wif', name: 'Moon Wif Hat', ticker: '$MWIF', matchScore: 85, urgencySignal: 'Medium Signal', matchReasons: ['Viral Meme', 'Exchange Listing'], explanation: 'Trending on CT. Rumored listing on tier-2 CEX within 48 hours.', progress: 71, marketCap: '2.4M', risk: 'Medium' },
          { id: 'tok_based_ai', name: 'Based AI', ticker: '$BSAI', matchScore: 93, urgencySignal: 'High Conviction', matchReasons: ['AI Agent Integration', 'Revenue'], explanation: 'First memecoin with working AI agent generating $2.1k daily revenue.', progress: 91, marketCap: '11.2M', risk: 'Low' },
          { id: 'tok_giga_chad', name: 'Giga Chad', ticker: '$GIGA', matchScore: 79, urgencySignal: 'Medium Signal', matchReasons: ['Cultural Moment', 'Volume Spike'], explanation: 'Viral tweet with 45k likes. DEX volume up 380% in the last 4 hours.', progress: 56, marketCap: '1.5M', risk: 'Medium' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  // Track the original base tokens for reshuffling
  const baseTokensRef = useRef<FeedToken[]>([]);
  
  useEffect(() => {
    if (tokens.length > 0 && baseTokensRef.current.length === 0) {
      baseTokensRef.current = [...tokens];
    }
  }, [tokens]);

  const appendCooldownRef = useRef(false);

  const handleScroll = (e: any) => {
    if (!containerRef.current) return;
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activeIndex && index >= 0 && index < tokens.length) {
      setActiveIndex(index);
    }
    // Infinite scroll: when near the bottom, append more shuffled tokens
    const maxScroll = e.currentTarget.scrollHeight - height;
    if (scrollPos >= maxScroll - height * 2 && tokens.length > 1 && !appendCooldownRef.current) {
      const base = baseTokensRef.current;
      if (base.length === 0) return;
      appendCooldownRef.current = true;
      // Shuffle and append with unique keys
      const batch = Math.floor(tokens.length / base.length);
      const shuffled = [...base]
        .sort(() => Math.random() - 0.5)
        .map(t => ({ ...t, id: `${t.id}_${batch}_${Math.random().toString(36).slice(2, 6)}` }));
      setTokens(prev => [...prev, ...shuffled]);
      // Cooldown: wait 2s before allowing another append
      setTimeout(() => { appendCooldownRef.current = false; }, 2000);
    }
  };

  const handleSave = (token: FeedToken) => {
    if (!savedTokens.find(t => t.id === token.id)) {
      setSavedTokens([...savedTokens, token]);
    } else {
      setSavedTokens(savedTokens.filter(t => t.id !== token.id));
    }
  };

  const getUrgencyColor = (signal: string = '') => {
    const s = (signal || '').toLowerCase();
    if (s.includes('high')) return 'text-[#F43F5E]';
    if (s.includes('medium')) return 'text-[#F59E0B]';
    return 'text-[#10B981]';
  };

  // Handle keyboard navigation (Up / Down arrows) and lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: height, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: -height, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex flex-col gap-4 h-screen w-full items-center justify-center ${isDark ? 'bg-[#000000]' : 'bg-gray-100'} text-[#6366F1] font-mono overflow-x-hidden`}>
        <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin shadow-[0_0_25px_rgba(99,102,241,0.25)]" />
        <span className="animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.25)] font-black">[ INITIALIZING AI FEED... ]</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      data-lenis-prevent
      data-lenis-prevent-touch
      className={`fixed top-[64px] left-0 md:left-[72px] right-0 bottom-16 md:bottom-0 overflow-y-scroll overflow-x-hidden snap-y snap-mandatory ${isDark ? 'bg-[#000000]' : 'bg-gray-100'} z-40 scrollbar-hide font-mono`}
    >
      {/* Top Right Saved Tokens Button */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50">
        <button 
          onClick={() => setShowSavedModal(true)}
          className={`flex items-center gap-2 border-2 px-4 py-2 font-black uppercase text-xs transition-all ${
            isDark 
              ? 'bg-black text-white border-[rgba(255,255,255,0.2)] hover:border-[#10B981]' 
              : 'bg-white text-black border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5'
          }`}
          aria-label="View Saved Tokens"
        >
          <Bookmark size={16} />
          <span>[ SAVED ({savedTokens.length}) ]</span>
        </button>
      </div>

      {tokens.map((token, idx) => (
        <FeedItem
          key={token.id}
          token={token}
          idx={idx}
          activeIndex={activeIndex}
          savedTokens={savedTokens}
          handleSave={handleSave}
        />
      ))}

      {/* Saved Tokens Modal */}
      <AnimatePresence>
        {showSavedModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] ${isDark ? 'bg-black/80' : 'bg-black/40'} backdrop-blur-md flex justify-end font-mono`}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-w-md h-full ${isDark ? 'bg-[#050510] border-l border-[rgba(255,255,255,0.2)]' : 'bg-white border-l-4 border-black'} p-6 overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-500/20">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <Bookmark className="text-[#6366F1]" /> [ SAVED TOKENS ]
                </h3>
                <button 
                  onClick={() => setShowSavedModal(false)}
                  className="p-1.5 border border-black font-black hover:bg-black hover:text-white transition-all"
                  aria-label="Close saved tokens modal"
                >
                  <X size={20} />
                </button>
              </div>

              {savedTokens.length === 0 ? (
                <div className="text-center text-gray-500 mt-20 font-black uppercase text-sm">
                  [ NO SAVED TOKENS YET ]
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {savedTokens.map((token) => (
                    <div key={token.id} className={`p-4 border-2 ${isDark ? 'border-[rgba(255,255,255,0.2)] bg-black' : 'border-black bg-gray-50 shadow-[3px_3px_0px_0px_#000]'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getMemeImage(token.ticker)} 
                            alt={token.name}
                            className="w-12 h-12 border-2 border-black object-cover shrink-0"
                          />
                          <div>
                            <h4 className="text-base font-black uppercase">{token.name}</h4>
                            <span className="text-xs font-bold text-[#6366F1]">{token.ticker}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${isDark ? 'border-white text-white' : 'border-black text-black bg-yellow-300'}`}>
                          {token.urgencySignal}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link 
                          href={`/token/${token.id}`} 
                          className="flex-1 text-center py-2 bg-[#6366F1] text-white border border-black text-xs font-black uppercase"
                        >
                          [ TRADE ]
                        </Link>
                        <button 
                          onClick={() => setSavedTokens(savedTokens.filter(t => t.id !== token.id))}
                          className="px-3 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
