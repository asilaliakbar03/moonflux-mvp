'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Rocket, BarChart3, AlertTriangle, MessageCircle, Heart, Share2, Flame, Bot } from 'lucide-react';
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
        
        // Enhance API data with some visual mock data for the UI
        const enhanced = data.tokens.map((t: any, i: number) => ({
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0414] text-[#05D5FA] font-mono animate-pulse">
        [INITIALIZING NEON FEED...]
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory bg-[#0B0414] relative"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />

      {tokens.map((token, idx) => (
        <div key={token.id} className="h-full w-full snap-start snap-always relative flex items-center justify-center p-4">
          
          {/* Cyberpunk Video Background Placeholder */}
          <div className="absolute inset-0 z-0 bg-[#120721]">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,42,109,0.3)_0%,rgba(11,4,20,1)_70%)]" />
            <div className="absolute inset-0 border-[1px] border-[rgba(5,213,250,0.1)] m-2 rounded-2xl" />
          </div>

          <div className="relative z-10 w-full max-w-md h-full max-h-[800px] flex flex-col justify-end pb-20">
            
            {/* Top AI Match Badge */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={activeIndex === idx ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="absolute top-4 left-4 right-16 z-20"
            >
              <div className="surface-glass p-3 inline-flex flex-col gap-1 border-l-2 border-l-[#05D5FA]">
                <div className="flex items-center gap-2 text-[#05D5FA] text-xs font-mono font-bold">
                  <Bot size={14} /> AI MATCH: {token.matchScore}%
                </div>
                <div className="text-[10px] text-[#C8A2C8] uppercase tracking-wider">
                  {token.urgencySignal}
                </div>
              </div>
            </motion.div>

            {/* Right Action Bar */}
            <div className="absolute right-4 bottom-28 flex flex-col gap-6 z-20">
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center text-[#F8F0FF] group-hover:text-[#FF2A6D] transition-colors shadow-[0_0_15px_rgba(255,42,109,0.2)]">
                  <Flame size={24} />
                </div>
                <span className="text-xs font-bold text-[#C8A2C8] group-hover:text-[#FF2A6D]">Boost</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center text-[#F8F0FF] group-hover:text-[#05D5FA] transition-colors">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-bold text-[#C8A2C8]">Chat</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full surface-glass flex items-center justify-center text-[#F8F0FF] transition-colors">
                  <Share2 size={24} />
                </div>
                <span className="text-xs font-bold text-[#C8A2C8]">Share</span>
              </button>
            </div>

            {/* Bottom Info Panel */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={activeIndex === idx ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.1, type: "spring" }}
              className="pr-20 z-20"
            >
              <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,42,109,0.5)] flex items-center gap-3">
                {token.name} 
              </h2>
              <div className="text-xl font-mono text-[#05D5FA] font-bold mb-4">{token.ticker}</div>

              <div className="surface-glass p-4 mb-4">
                <p className="text-sm text-[#F8F0FF] mb-3 leading-relaxed">
                  {token.explanation}
                </p>
                <div className="flex flex-wrap gap-2">
                  {token.matchReasons.map((r, i) => (
                    <span key={i} className="badge-indigo bg-[rgba(5,213,250,0.1)] text-[#05D5FA] border-[#05D5FA]">
                      #{r.replace(/ /g, '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bonding Curve Quick Look */}
              <div className="surface-glass p-4">
                <div className="flex justify-between text-xs font-mono text-[#C8A2C8] mb-2 uppercase">
                  <span>Bonding Curve</span>
                  <span className="text-[#39FF14]">{token.progress}%</span>
                </div>
                <div className="h-2 bg-[#0B0414] rounded-full overflow-hidden border border-[rgba(57,255,20,0.2)] mb-4">
                  <div className="h-full bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.8)]" style={{ width: `${token.progress}%` }} />
                </div>
                
                <div className="flex gap-3">
                  <Link href={`/token/${token.id}`} className="flex-1 btn-primary text-center">
                    Trade Now
                  </Link>
                  <button className="px-4 py-2 surface-glass rounded-lg font-bold text-[#FF2A6D] hover:bg-[rgba(255,42,109,0.1)] transition-colors border border-[#FF2A6D]">
                    Skip
                  </button>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Scroll Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#8B6A8B] animate-bounce z-10 flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono mb-1 tracking-widest">Scroll</span>
            <ChevronDown size={20} />
          </div>

        </div>
      ))}
    </div>
  );
}
