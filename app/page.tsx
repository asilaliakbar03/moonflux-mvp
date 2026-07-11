"use client";

import { motion } from "framer-motion";
import { TrendingUp, Rocket, Search, ArrowRight, CheckCircle2, Zap, AtSign, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useMoonWallet } from "@/components/WalletProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { address } = useMoonWallet();

  const MOCK_TRENDING = [
    { id:'tok_ai_swarm', name:'AI Swarm', ticker:'$SWRM', icon:'🤖', change:+211.4, price:'$0.00671', category:'AI', color:'#6366F1' },
    { id:'tok_degen_ape', name:'DegenApe', ticker:'$DAPE', icon:'💎', change:+388.2, price:'$0.00156', category:'Meme', color:'#F43F5E' },
    { id:'tok_nova_flux', name:'NovaFlux', ticker:'$NVFX', icon:'⚡', change:+67.8, price:'$0.0445', category:'DeFi', color:'#10B981' },
  ];

  const MOCK_LAUNCHES = [
    { id:'tok_luna_doge', name:'Luna Doge', ticker:'$LDOGE', icon:'🐶', creator:'@moondev', timeAgo:'2h ago', progress:73 },
    { id:'tok_pixel_cat', name:'PixelCat', ticker:'$PCAT', icon:'🐱', creator:'@pixelwiz', timeAgo:'4h ago', progress:31 },
    { id:'tok_storm_cat', name:'StormCat', ticker:'$STMC', icon:'⚡', creator:'@stormking', timeAgo:'6h ago', progress:18 },
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
          <div className="inline-flex items-center gap-2 bg-[#161B27] border border-[rgba(99,102,241,0.2)] rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">The memecoin launchpad on Solana</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] tracking-tight">
            Discover & Launch <br/>
            Tokens That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] to-[#4F46E5]">Move</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#94A3B8] max-w-xl leading-relaxed">
            Find the next 100x before it pumps. Launch your own token in minutes with AI assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link href="/explore" className="w-full sm:w-auto px-8 py-3.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Search className="w-5 h-5" />
              Explore Tokens
            </Link>
            <Link href="/launch" className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.3)] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Rocket className="w-5 h-5" />
              Launch a Token
            </Link>
          </div>
          
          <div className="flex items-center gap-6 mt-4 text-sm text-[#94A3B8] font-medium">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> No coding required</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> AI-powered</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Solana-native</div>
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
            <TrendingUp className="text-[#6366F1]" /> Trending Now
          </h2>
          <Link href="/explore" className="text-[#818CF8] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_TRENDING.map((token) => (
            <Link href={`/token/${token.id}`} key={token.id} className="surface-card p-5 group hover:border-[rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${token.color}20` }}>
                  {token.icon}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {token.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.1)] text-[#818CF8] uppercase tracking-wider">{token.category}</span>
                  </div>
                  <div className="text-[#94A3B8] text-sm font-mono mt-0.5">{token.ticker}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium">{token.price}</div>
                <div className={`text-sm font-mono font-semibold ${token.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {token.change > 0 ? '+' : ''}{token.change}%
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
            <Zap className="text-[#F59E0B]" /> Just Launched
          </h2>
          <Link href="/explore" className="text-[#818CF8] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_LAUNCHES.map((token) => (
            <Link href={`/token/${token.id}`} key={token.id} className="surface-card p-5 group hover:border-[rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(241,245,249,0.05)] flex items-center justify-center text-xl">
                    {token.icon}
                  </div>
                  <div>
                    <div className="font-bold">{token.name}</div>
                    <div className="text-[#94A3B8] text-sm font-mono">{token.ticker}</div>
                  </div>
                </div>
                <div className="bg-[rgba(16,185,129,0.15)] text-[#10B981] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">NEW</div>
              </div>
              
              <div className="text-sm text-[#94A3B8] flex items-center justify-between">
                <span>by {token.creator}</span>
                <span>{token.timeAgo}</span>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#94A3B8]">Bonding Curve</span>
                  <span className="font-mono text-[#818CF8]">{token.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#161B27] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${token.progress}%` }} />
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
