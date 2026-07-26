'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Share2, Flame, Bot, Bookmark, X } from 'lucide-react';
import Link from 'next/link';

interface FeedToken {
  id: string;
  matchScore: number;
  urgencySignal: string;
  matchReasons: string[];
  explanation: string;
  // Mock UI extra data
  name: string;
  ticker: string;
  videoUrl?: string;
  progress: number;
  marketCap: string;
  risk: string;
}

export default function FeedPage() {
  const [tokens, setTokens] = useState<FeedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [savedTokens, setSavedTokens] = useState<FeedToken[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/personalized-feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        
        const enhanced = data.tokens.map((t: any) => ({
          ...t,
          name: t.id.replace('tok_', '').split('_').map((s:string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          ticker: '$' + t.id.replace('tok_', '').substring(0, 4).toUpperCase(),
          progress: Math.floor(Math.random() * 60) + 40,
          marketCap: (Math.random() * 50 + 10).toFixed(1) + 'k',
          risk: Math.random() > 0.5 ? 'High' : 'Medium'
        }));
        setTokens(enhanced);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activeIndex && index >= 0 && index < tokens.length) {
      setActiveIndex(index);
    }
  };

  const handleSave = (token: FeedToken) => {
    if (!savedTokens.find(t => t.id === token.id)) {
      setSavedTokens([...savedTokens, token]);
    } else {
      setSavedTokens(savedTokens.filter(t => t.id !== token.id));
    }
  };

  const getScoreStyles = (score: number) => {
    if (score > 85) return 'shadow-[0_0_15px_rgba(16,185,129,0.5)] border-[#10B981] text-[#10B981]';
    if (score >= 50) return 'shadow-[0_0_15px_rgba(99,102,241,0.5)] border-[#6366F1] text-[#6366F1]';
    return 'border-[#475569] text-[#475569]';
  };

  const getUrgencyColor = (signal: string) => {
    const s = signal.toLowerCase();
    if (s.includes('high')) return 'text-[#F43F5E]';
    if (s.includes('medium')) return 'text-[#F59E0B]';
    return 'text-[#10B981]';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 h-screen items-center justify-center bg-[#080B12] text-[#6366F1] font-mono">
        <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <span className="animate-pulse">[INITIALIZING FEED...]</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory bg-[#080B12] relative"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

      {/* Top Right Saved Tokens Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setShowSavedModal(true)}
          className="flex items-center gap-2 bg-[#0D1117]/80 backdrop-blur-xl px-4 py-2 rounded-full border border-[rgba(99,102,241,0.3)] text-[#6366F1] hover:bg-[rgba(99,102,241,0.15)] hover:text-[#818CF8] transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Bookmark size={16} />
          <span className="font-mono text-sm font-bold">Saved ({savedTokens.length})</span>
        </button>
      </div>

      {tokens.map((token, idx) => (
        <div key={token.id} className="h-full w-full snap-start snap-always relative flex items-end justify-center p-4 sm:p-8 pb-24">
          
          {/* Cyberpunk Video Background Placeholder */}
          <div className="absolute inset-0 z-0 bg-[#0D1117]">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.3)_0%,rgba(8,11,18,1)_70%)]" />
            <div className="absolute inset-0 border-[1px] border-[rgba(99,102,241,0.1)] m-2 sm:m-4 rounded-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-4xl flex justify-between items-end gap-2 md:gap-6 h-full">
            
            {/* Main Info (Bottom Left) */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={activeIndex === idx ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex-1 max-w-2xl flex flex-col justify-end"
            >
              <div className="inline-flex flex-col gap-2 mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getScoreStyles(token.matchScore)} text-xs font-mono font-bold w-fit bg-[#080B12]/40 backdrop-blur-sm`}>
                  <Bot size={14} /> AI MATCH: {token.matchScore}%
                </div>
                <div className={`text-[10px] uppercase tracking-wider font-bold ml-1 ${getUrgencyColor(token.urgencySignal)}`}>
                  {token.urgencySignal}
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-3">
                {token.name} 
              </h2>
              <div className="text-xl md:text-2xl font-mono text-[#6366F1] font-bold mb-4 md:mb-6">{token.ticker}</div>

              <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-[rgba(99,102,241,0.12)] p-4 md:p-5 rounded-2xl mb-4 md:mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <p className="text-sm md:text-base text-[#F1F5F9] mb-4 leading-relaxed font-medium">
                  {token.explanation}
                </p>
                <div className="flex flex-wrap gap-2">
                  {token.matchReasons.map((r, i) => (
                    <span key={i} className="px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full bg-[rgba(99,102,241,0.1)] text-[#6366F1] border border-[rgba(99,102,241,0.2)]">
                      #{r.replace(/ /g, '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bonding Curve & Actions */}
              <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-[rgba(99,102,241,0.12)] p-4 md:p-5 rounded-2xl flex flex-col xl:flex-row items-stretch xl:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] md:text-xs font-mono text-[#94A3B8] mb-2 uppercase">
                    <span>Bonding Curve</span>
                    <span className="text-[#6366F1]">{token.progress}%</span>
                  </div>
                  <div className="h-2 md:h-2.5 bg-[#080B12] rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)]">
                    <div className="h-full bg-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.8)]" style={{ width: `${token.progress}%` }} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full xl:w-auto">
                  <button 
                    onClick={() => handleSave(token)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-[#080B12]/40 rounded-xl font-bold transition-colors border border-[rgba(99,102,241,0.3)] text-sm md:text-base hover:bg-[rgba(99,102,241,0.15)] hover:border-[#6366F1] ${savedTokens.find(t => t.id === token.id) ? 'text-[#F59E0B]' : 'text-[#6366F1]'}`}
                  >
                    <Bookmark size={18} className={savedTokens.find(t => t.id === token.id) ? "fill-[#F59E0B]" : ""} />
                    {savedTokens.find(t => t.id === token.id) ? "Saved" : "Save"}
                  </button>
                  <Link href={`/token/${token.id}`} className="flex-1 flex items-center justify-center px-4 md:px-6 py-2 md:py-2.5 bg-[#6366F1] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-[#4F46E5] transition-colors text-sm md:text-base">
                    Trade Now
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right Action Bar (TikTok Style) */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={activeIndex === idx ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex flex-col gap-4 md:gap-6 items-center justify-center p-2 rounded-[32px] bg-[#080B12]/60 backdrop-blur-md border border-[rgba(99,102,241,0.12)] pb-4 pt-4 mb-4"
            >
              <button className="flex flex-col items-center gap-1 md:gap-1.5 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[#F1F5F9] group-hover:text-[#818CF8] group-hover:bg-[rgba(99,102,241,0.15)] transition-all border border-transparent group-hover:border-[rgba(99,102,241,0.3)]">
                  <Flame className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#94A3B8] group-hover:text-[#818CF8]">Boost</span>
              </button>
              <button className="flex flex-col items-center gap-1 md:gap-1.5 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[#F1F5F9] group-hover:text-[#818CF8] group-hover:bg-[rgba(99,102,241,0.15)] transition-all border border-transparent group-hover:border-[rgba(99,102,241,0.3)]">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#94A3B8] group-hover:text-[#818CF8]">Chat</span>
              </button>
              <button className="flex flex-col items-center gap-1 md:gap-1.5 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[#F1F5F9] group-hover:text-[#818CF8] group-hover:bg-[rgba(99,102,241,0.15)] transition-all border border-transparent group-hover:border-[rgba(99,102,241,0.3)]">
                  <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#94A3B8] group-hover:text-[#818CF8]">Share</span>
              </button>
            </motion.div>

          </div>

          {/* Scroll Hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#475569] animate-bounce z-10 flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono mb-1 tracking-widest">Scroll</span>
            <ChevronDown size={20} />
          </div>
        </div>
      ))}

      {/* Saved Tokens Modal */}
      <AnimatePresence>
        {showSavedModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#0D1117]/90 backdrop-blur-xl border-l border-[rgba(99,102,241,0.2)] p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="text-[#6366F1]" /> Saved Tokens
                </h3>
                <button 
                  onClick={() => setShowSavedModal(false)}
                  className="p-2 rounded-full text-white hover:text-[#818CF8] hover:bg-[rgba(99,102,241,0.15)] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {savedTokens.length === 0 ? (
                <div className="text-center text-[#94A3B8] mt-20 font-mono text-sm">
                  No saved tokens yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {savedTokens.map((token) => (
                    <div key={token.id} className="bg-[#0D1117]/80 backdrop-blur-xl p-4 rounded-xl border border-[rgba(99,102,241,0.12)]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white">{token.name}</h4>
                          <span className="text-xs font-mono text-[#6366F1]">{token.ticker}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded bg-[#080B12]/60 ${getUrgencyColor(token.urgencySignal)}`}>
                          {token.urgencySignal}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/token/${token.id}`} className="flex-1 text-center py-2 bg-[rgba(99,102,241,0.2)] text-[#818CF8] hover:bg-[rgba(99,102,241,0.3)] rounded-lg text-sm font-bold transition-colors">
                          Trade
                        </Link>
                        <button 
                          onClick={() => setSavedTokens(savedTokens.filter(t => t.id !== token.id))}
                          className="px-3 py-2 border border-[rgba(244,63,94,0.3)] text-[#F43F5E] hover:bg-[rgba(244,63,94,0.1)] rounded-lg transition-colors"
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
