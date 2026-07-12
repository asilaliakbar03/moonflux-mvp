"use client";

import { motion } from "framer-motion";
import { TrendingUp, Rocket, Search, ArrowRight, CheckCircle2, Zap, AtSign, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useMoonWallet } from "@/components/WalletProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { address } = useMoonWallet();

  const MOCK_TRENDING = [
    { id:'tok_ai_swarm', name:'AI Swarm', ticker:'$SWRM', icon:'🤖', change:+211.4, price:'$0.00671', category:'AI', color:'#FF2A6D', marketCap:2300000, riskScore:5, holders:4821, progress:85, sparkline:[5,8,12,15,14,18,25,32,28,40,55,70,90,85,110] },
    { id:'tok_degen_ape', name:'DegenApe', ticker:'$DAPE', icon:'💎', change:+388.2, price:'$0.00156', category:'Meme', color:'#05D5FA', marketCap:970000, riskScore:9, holders:2109, progress:60, sparkline:[2,3,4,5,6,10,15,12,20,30,25,40,60,50,80] },
    { id:'tok_nova_flux', name:'NovaFlux', ticker:'$NVFX', icon:'⚡', change:+67.8, price:'$0.0445', category:'DeFi', color:'#39FF14', marketCap:8900000, riskScore:3, holders:11432, progress:100, sparkline:[30,35,38,42,48,52,58,65,70,68,75,80,90,95,100] },
  ];

  const MOCK_LAUNCHES = [
    { id:'tok_luna_doge', name:'Luna Doge', ticker:'$LDOGE', icon:'🐶', creator:'@moondev', timeAgo:'2h ago', progress:73, color:'#FF2A6D', change:+142.5, price:'$0.00234', marketCap:1870000, riskScore:3, sparkline:[8,12,19,25,31,44,52,71,65,89,95,120,110,140] },
    { id:'tok_pixel_cat', name:'PixelCat', ticker:'$PCAT', icon:'🐱', creator:'@pixelwiz', timeAgo:'4h ago', progress:31, color:'#C8A2C8', change:-5.4, price:'$0.00329', marketCap:1100000, riskScore:6, sparkline:[50,48,45,46,44,42,40,41,39,37,35,33,34,32] },
    { id:'tok_storm_cat', name:'StormCat', ticker:'$STMC', icon:'⚡', creator:'@stormking', timeAgo:'6h ago', progress:18, color:'#FF2A6D', change:-23.1, price:'$0.00082', marketCap:440000, riskScore:8, sparkline:[80,75,70,65,60,55,68,72,65,58,50,45,48,42] },
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* ── HERO SECTION ── */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col md:flex-row items-center gap-12 pt-8"
      >
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-[#120721] border border-[rgba(255,42,109,0.3)] rounded-full px-4 py-1.5 w-fit shadow-[0_0_15px_rgba(255,42,109,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#FF2A6D] animate-pulse shadow-[0_0_10px_#FF2A6D]" />
            <span className="text-xs font-bold text-[#F8F0FF] uppercase tracking-wider">The memecoin launchpad on Solana</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-[1.1] tracking-tight">
            Discover & Launch <br/>
            Tokens That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A6D] to-[#05D5FA] drop-shadow-[0_0_10px_rgba(255,42,109,0.3)]">Move</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#C8A2C8] max-w-xl leading-relaxed">
            Find the next 100x before it pumps. Launch your own token in minutes with AI assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link href="/explore" className="w-full sm:w-auto px-8 py-3.5 btn-primary font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Search className="w-5 h-5" />
              Explore Tokens
            </Link>
            <Link href="/launch" className="w-full sm:w-auto px-8 py-3.5 btn-ghost font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Rocket className="w-5 h-5" />
              Launch a Token
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm text-[#8B6A8B] font-mono font-bold">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> No coding required</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> AI-powered</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Solana-native</div>
          </div>
        </div>
        
        <div className="hidden md:flex flex-1 justify-end perspective-[1000px]">
          <motion.div 
            animate={{ y: [-10, 10, -10], rotateX: [2, -2, 2], rotateY: [-2, 2, -2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="surface-panel p-6 w-full max-w-[320px] shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366F1] opacity-20 blur-[60px]" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(99,102,241,0.2)] flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <div className="font-bold text-lg">AI Swarm</div>
                  <div className="text-[#94A3B8] text-sm font-mono">$SWRM</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#10B981] font-mono font-bold">+211%</div>
                <div className="text-xs text-[#94A3B8] uppercase mt-0.5">Trending</div>
              </div>
            </div>
            
            <svg viewBox="0 0 100 30" className="w-full h-[60px] overflow-visible relative z-10">
              <path d="M0,25 L10,22 L20,24 L30,15 L40,18 L50,8 L60,12 L70,5 L80,2 L90,6 L100,0" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
      </motion.section>
      
      {/* ── STATS BAR ── */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-[rgba(99,102,241,0.15)] py-8"
      >
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(99,102,241,0.15)] pb-6 md:pb-0">
          <div className="text-3xl font-display font-bold font-mono">$142M</div>
          <div className="text-[#94A3B8] text-sm mt-1">24H Volume</div>
        </div>
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(99,102,241,0.15)] pb-6 md:pb-0">
          <div className="text-3xl font-display font-bold font-mono">12.4K</div>
          <div className="text-[#94A3B8] text-sm mt-1">Active Traders This Month</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl font-display font-bold font-mono">847</div>
          <div className="text-[#94A3B8] text-sm mt-1">Tokens Launched Total</div>
        </div>
      </motion.section>
      
      {/* ── TRENDING NOW ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
      >
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <TrendingUp className="text-[#FF2A6D]" /> Trending Now
          </h2>
          <Link href="/explore" className="text-[#05D5FA] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TRENDING.map((token, i) => (
            <Link href={`/token/${token.id}`} key={token.id} className="surface-glass p-5 group hover:border-[#05D5FA] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(5,213,250,0.2)] transition-all flex flex-col h-full relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(5,213,250,0.8),transparent_50%)]" />
              
              {/* Top */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_15px_rgba(255,42,109,0.2)]" style={{ backgroundColor: `${token.color}20` }}>
                  {token.icon}
                </div>
                <div className={`px-2.5 py-1 rounded-md text-sm font-mono font-bold border ${token.change >= 0 ? 'bg-[rgba(57,255,20,0.1)] text-[#39FF14] border-[rgba(57,255,20,0.3)] shadow-[0_0_10px_rgba(57,255,20,0.2)]' : 'bg-[rgba(255,42,109,0.1)] text-[#FF2A6D] border-[rgba(255,42,109,0.3)] shadow-[0_0_10px_rgba(255,42,109,0.2)]'}`}>
                  {token.change > 0 ? '+' : ''}{token.change}%
                </div>
              </div>

              {/* Middle */}
              <div className="mb-4 flex-1 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  {token.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[rgba(5,213,250,0.15)] text-[#05D5FA] uppercase tracking-wider font-semibold border border-[rgba(5,213,250,0.3)]">{token.category}</span>
                </h3>
                <div className="text-[#C8A2C8] text-sm font-mono mt-1">{token.ticker}</div>
              </div>

              {/* Market Data */}
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                  <div className="text-xl font-mono text-[#F8F0FF] font-bold drop-shadow-[0_0_8px_rgba(248,240,255,0.3)]">{token.price}</div>
                  <div className="text-xs text-[#8B6A8B] mt-1 font-mono">MCap ${(token.marketCap / 1000000).toFixed(2)}M</div>
                </div>
                
                {/* Mini sparkline */}
                <svg viewBox="0 0 80 32" className="w-[80px] h-[32px] overflow-visible drop-shadow-[0_0_5px_currentColor]">
                  <path 
                    d={`M0,${32 - (token.sparkline[0]/140)*32} ${token.sparkline.map((val, idx) => `L${(idx / (token.sparkline.length - 1)) * 80},${32 - (val/140)*32}`).join(' ')}`}
                    fill="none" 
                    stroke={token.change >= 0 ? '#39FF14' : '#FF2A6D'} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>

              {/* Bonding Curve Quick Look */}
              <div className="mb-4 relative z-10">
                <div className="flex justify-between text-[10px] font-mono text-[#C8A2C8] mb-1.5 uppercase">
                  <span>Curve Progress</span>
                  <span className="text-[#05D5FA]">{token.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#0B0414] rounded-full overflow-hidden border border-[rgba(5,213,250,0.2)]">
                  <div className="h-full bg-[#05D5FA] shadow-[0_0_10px_rgba(5,213,250,0.8)]" style={{ width: `${token.progress}%` }} />
                </div>
              </div>

            </Link>
          ))}
        </div>
      </motion.section>
      
      {/* ── JUST LAUNCHED ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
      >
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Zap className="text-[#FFEA00]" /> Just Launched
          </h2>
          <Link href="/explore" className="text-[#05D5FA] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_LAUNCHES.map((token) => (
            <Link href={`/token/${token.id}`} key={token.id} className="surface-glass p-5 group hover:border-[#FF2A6D] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,42,109,0.2)] transition-all flex flex-col h-full relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,42,109,0.8),transparent_50%)]" />
              
              <div className="flex justify-between items-start relative z-10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_15px_rgba(255,42,109,0.2)]" style={{ backgroundColor: `${token.color}20` }}>
                    {token.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{token.name}</div>
                    <div className="text-[#C8A2C8] text-sm font-mono">{token.ticker}</div>
                  </div>
                </div>
                <div className="bg-[rgba(57,255,20,0.15)] text-[#39FF14] border border-[rgba(57,255,20,0.3)] shadow-[0_0_10px_rgba(57,255,20,0.2)] text-[10px] px-2 py-1 rounded-md font-bold uppercase">NEW</div>
              </div>
              
              <div className="text-sm text-[#8B6A8B] flex items-center justify-between relative z-10 mb-6 font-mono">
                <span>by <span className="text-[#05D5FA]">{token.creator}</span></span>
                <span>{token.timeAgo}</span>
              </div>
              
              <div className="relative z-10 mt-auto">
                <div className="flex justify-between text-[10px] font-mono text-[#C8A2C8] mb-1.5 uppercase">
                  <span>Bonding Curve</span>
                  <span className="text-[#39FF14]">{token.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#0B0414] rounded-full overflow-hidden border border-[rgba(57,255,20,0.2)]">
                  <div className="h-full bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.8)]" style={{ width: `${token.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
      
      {/* ── HOW IT WORKS ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        className="mt-8 bg-[#0D1117] rounded-2xl border border-[rgba(99,102,241,0.15)] p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold font-display mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display">1. Discover</h3>
            <p className="text-[#94A3B8] text-sm">Browse trending tokens with AI-powered insights. Filter by category, risk, and momentum.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display">2. Trade</h3>
            <p className="text-[#94A3B8] text-sm">Buy and sell tokens through the bonding curve. Early buyers get the best prices.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display">3. Launch</h3>
            <p className="text-[#94A3B8] text-sm">Create your own token in 3 steps. AI helps you craft the perfect narrative.</p>
          </div>
        </div>
      </motion.section>
      
      {/* ── FOOTER ── */}
      <footer className="mt-8 pt-8 border-t border-[rgba(99,102,241,0.15)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#94A3B8]">
        <div>MoonFluxx © 2025</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><AtSign className="w-4 h-4"/> Twitter</a>
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><MessageCircle className="w-4 h-4"/> Discord</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
      </footer>
      
    </div>
  );
}
