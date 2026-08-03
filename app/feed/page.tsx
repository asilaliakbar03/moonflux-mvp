'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MessageCircle, Share2, Flame, Bot, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import AnimatedCounter from '@/components/AnimatedCounter';

const EASE = [0.16, 1, 0.3, 1] as const;

// Helper to generate unique meme/crypto character images
const getMemeImage = (ticker: string) => {
  const sets = ['set1', 'set2', 'set3', 'set4'];
  const set = sets[ticker.length % 4];
  return `https://robohash.org/${ticker.toLowerCase()}?set=${set}&bgset=bg1&size=400x400`;
};

const MOCK_FEED = [
  {
    id: 'tok_ai_swarm',
    matchScore: 94,
    urgencySignal: 'EXTREME GREED',
    name: 'AI Swarm',
    ticker: 'SWRM',
    explanation: 'MASSIVE INSIDER ACCUMULATION DETECTED. MULTIPLE NEW WALLETS FUNDED FROM BINANCE SWEEPING THE FLOOR.',
    progress: 85,
    marketCap: '2.3M',
    risk: 'HIGH'
  },
  {
    id: 'tok_luna_doge',
    matchScore: 89,
    urgencySignal: 'BULLISH CALL',
    name: 'Luna Doge',
    ticker: 'LDOGE',
    explanation: 'THE BONDING CURVE IS MELTING FACES. LFG!!! EARLY MOMENTUM INDICATORS FLASHING GREEN.',
    progress: 73,
    marketCap: '1.8M',
    risk: 'MED'
  },
  {
    id: 'tok_nova_flux',
    matchScore: 98,
    urgencySignal: 'AI AUDIT CLEAR',
    name: 'NovaFlux',
    ticker: 'NVFX',
    explanation: 'SMART CONTRACT AUDIT COMPLETE. 100% SAFE. LIQUIDITY BURNED. MINT REVOKED. SEND IT HIGHER.',
    progress: 100,
    marketCap: '8.9M',
    risk: 'LOW'
  }
];

function FeedItem({ token, idx, activeIndex }: any) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bBorder = isDark ? "border-[2px] border-[rgba(255,255,255,0.2)]" : "border-3 border-black";
  const bShadow = isDark ? "shadow-[4px_4px_0px_0px_#10B981]" : "shadow-[4px_4px_0px_0px_#000]";
  const bHoverShadow = isDark ? "hover:shadow-[2px_2px_0px_0px_#10B981] hover:translate-x-[2px] hover:translate-y-[2px]" : "hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]";
  const bBg = isDark ? "bg-[#050510]" : "bg-white";
  const bText = isDark ? "text-white" : "text-black";

  return (
    <div className="h-[calc(100vh-80px)] w-full snap-start snap-always relative flex items-end justify-center p-4 sm:p-6 pb-20">
      
      {/* Background with Brutalist Grid */}
      <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#000000]' : 'bg-gray-100'} overflow-hidden`}>
        <div className={`absolute inset-0 ${isDark ? 'opacity-10' : 'opacity-5'} bg-[url('https://grainy-gradients.vercel.app/noise.svg')]`} />
        {/* Abstract shapes for background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10B981] opacity-20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F43F5E] opacity-20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl h-full flex flex-row items-end pb-20 px-4 gap-4 sm:gap-8">
        
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={activeIndex === idx ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex-1 flex flex-col gap-4 min-w-0" // Removed pr-16, added flex-1 and min-w-0
        >
          {/* Top Badges */}
          <div className="flex flex-wrap gap-2">
            <div className={`px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1 ${bBorder} ${isDark ? 'bg-[#10B981] text-black border-[#10B981]' : 'bg-black text-white'} shadow-[2px_2px_0px_0px_#000]`}>
              <Bot size={12} /> AI MATCH: {token.matchScore}%
            </div>
            <div className={`px-2 py-1 text-[10px] font-black uppercase ${bBorder} ${isDark ? 'bg-black text-white' : 'bg-white text-black'} shadow-[2px_2px_0px_0px_#000]`}>
              [{token.urgencySignal}]
            </div>
          </div>

          {/* Token Info Card */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 ${bBg} ${bBorder} ${bShadow}`}>
            <div className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 border-2 ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#1A1A2E]" : "border-black bg-gray-200"} relative`}>
              <img src={getMemeImage(token.ticker)} alt={token.name} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className={`text-2xl sm:text-3xl font-black uppercase truncate ${bText}`}>{token.name}</h2>
              <div className="text-xl font-bold text-[#10B981] uppercase">${token.ticker}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${isDark ? 'border-[rgba(255,255,255,0.2)] text-gray-300' : 'border-black bg-gray-200 text-black'}`}>
                  MC: {token.marketCap}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${isDark ? 'border-[#F43F5E] text-[#F43F5E]' : 'border-black bg-[#F43F5E] text-white'}`}>
                  RISK: {token.risk}
                </span>
              </div>
            </div>
          </div>

          {/* Explanation / Content */}
          <div className={`p-4 ${bBg} ${bBorder} ${bShadow}`}>
            <p className={`font-bold text-sm sm:text-base leading-relaxed uppercase ${bText}`}>
              {token.explanation}
            </p>
          </div>

          {/* Curve Progress & CTA */}
          <div className={`p-4 ${bBg} ${bBorder} ${bShadow} flex flex-col sm:flex-row items-stretch sm:items-center gap-4`}>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>Bonding Curve</span>
                <span className={isDark ? "text-[#10B981]" : "text-black"}>[{token.progress}%]</span>
              </div>
              <div className={`h-3 border-2 ${isDark ? 'border-[rgba(255,255,255,0.2)] bg-black' : 'border-black bg-gray-200'}`}>
                <div className="h-full bg-[#10B981] transition-all duration-700 ease-out" style={{ width: `${token.progress}%` }} />
              </div>
            </div>
            <Link href={`/token/${token.id}`}>
              <button className={`w-full sm:w-auto px-6 py-3 text-sm font-black uppercase transition-all border-2 ${isDark ? 'border-[#10B981] bg-[#10B981] text-black hover:bg-[#050510] hover:text-[#10B981]' : 'border-black bg-black text-white hover:bg-white hover:text-black'} shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]`}>
                TRADE NOW
              </button>
            </Link>
          </div>

        </motion.div>

        {/* Action Bar (Right side vertical) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={activeIndex === idx ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 z-20 shrink-0 pb-4"
        >
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`w-12 h-12 flex items-center justify-center border-2 ${bBg} ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'} shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all`}>
              <Flame className={`w-5 h-5 ${isDark ? 'text-white group-hover:text-[#F59E0B]' : 'text-black group-hover:text-[#F59E0B]'}`} />
            </div>
            <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-black'}`}>142</span>
          </div>

          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`w-12 h-12 flex items-center justify-center border-2 ${bBg} ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'} shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all`}>
              <MessageCircle className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
            </div>
            <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-black'}`}>28</span>
          </div>

          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className={`w-12 h-12 flex items-center justify-center border-2 ${bBg} ${isDark ? 'border-[rgba(255,255,255,0.2)]' : 'border-black'} shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all`}>
              <Share2 className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
            </div>
            <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-black'}`}>Share</span>
          </div>

          <div className="flex flex-col items-center gap-1 group cursor-pointer mt-4">
            <div className={`w-12 h-12 flex items-center justify-center border-2 ${isDark ? 'bg-[#10B981] border-[#10B981] text-black' : 'bg-[#10B981] border-black text-black'} shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all`}>
              <Zap className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-black ${isDark ? 'text-[#10B981]' : 'text-black'}`}>TIP</span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        {idx === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 ${isDark ? 'text-white' : 'text-black'}`}
          >
            <span className="text-[10px] font-black uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: any) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    
    // Add a small threshold (e.g., 10%) to make snapping more robust
    const newIndex = Math.round(scrollPosition / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < MOCK_FEED.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="fixed inset-0 top-[60px] md:top-[72px] lg:pl-[240px] xl:pl-[280px]">
      <div 
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
        onScroll={handleScroll}
      >
        {MOCK_FEED.map((token, idx) => (
          <FeedItem
            key={token.id}
            token={token}
            idx={idx}
            activeIndex={activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
