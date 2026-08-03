"use client";

import { motion } from "framer-motion";
import { TrendingUp, Rocket, Search, ArrowRight, CheckCircle2, Zap, AtSign, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useMoonWallet } from "@/components/WalletProvider";
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/components/ThemeProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { address } = useMoonWallet();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const MOCK_TRENDING = [
    { id:'tok_ai_swarm', name:'AI Swarm', ticker:'$SWRM', icon:'🤖', change:+211.4, price:'$0.00671', category:'AI', color:'#F43F5E', marketCap:2300000, riskScore:5, holders:4821, progress:85, sparkline:[5,8,12,15,14,18,25,32,28,40,55,70,90,85,110] },
    { id:'tok_degen_ape', name:'DegenApe', ticker:'$DAPE', icon:'💎', change:+388.2, price:'$0.00156', category: 'Token', color:'#6366F1', marketCap:970000, riskScore:9, holders:2109, progress:60, sparkline:[2,3,4,5,6,10,15,12,20,30,25,40,60,50,80] },
    { id:'tok_nova_flux', name:'NovaFlux', ticker:'$NVFX', icon:'⚡', change:+67.8, price:'$0.0445', category:'DeFi', color:'#10B981', marketCap:8900000, riskScore:3, holders:11432, progress:100, sparkline:[30,35,38,42,48,52,58,65,70,68,75,80,90,95,100] },
  ];

  const MOCK_LAUNCHES = [
    { id:'tok_luna_doge', name:'Luna Doge', ticker:'$LDOGE', icon:'🐶', creator:'@moondev', timeAgo:'2h ago', progress:73, color:'#F43F5E', change:+142.5, price:'$0.00234', marketCap:1870000, riskScore:3, sparkline:[8,12,19,25,31,44,52,71,65,89,95,120,110,140] },
    { id:'tok_pixel_cat', name:'PixelCat', ticker:'$PCAT', icon:'🐱', creator:'@pixelwiz', timeAgo:'4h ago', progress:31, color:'#94A3B8', change:-5.4, price:'$0.00329', marketCap:1100000, riskScore:6, sparkline:[50,48,45,46,44,42,40,41,39,37,35,33,34,32] },
    { id:'tok_storm_cat', name:'StormCat', ticker:'$STMC', icon:'⚡', creator:'@stormking', timeAgo:'6h ago', progress:18, color:'#F43F5E', change:-23.1, price:'$0.00082', marketCap:440000, riskScore:8, sparkline:[80,75,70,65,60,55,68,72,65,58,50,45,48,42] },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-16 relative overflow-hidden transition-colors">
      
      {/* ── HERO SECTION ── */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col md:flex-row items-center gap-8 md:gap-12 pt-4 md:pt-8 relative z-10"
      >
        <div className="flex-1 flex flex-col gap-6 relative z-10 md:items-center md:text-center md:max-w-3xl md:mx-auto">
          <div className={`inline-flex items-center gap-2 ${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-xl border border-[rgba(99,102,241,0.3)] rounded-full px-4 py-1.5 w-fit shadow-[0_0_15px_rgba(99,102,241,0.15)] md:mx-auto transition-colors`}>
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse shadow-[0_0_10px_#6366F1]" />
            <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">The Multi-Chain Token Launchpad</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-display leading-[1.1] tracking-tight display-safe text-[var(--color-text-primary)] transition-colors">
            Launch & Trade <br/>
            Tokens in <span className="fluxx-text-flow text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] to-[#A5B4FC] text-fluxx-shimmer drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]">60 Seconds</span>
          </h1>
          
          <p className="text-base md:text-xl text-[var(--color-text-secondary)] max-w-xl leading-relaxed mt-3 mb-6 md:mt-4 md:mb-8 md:mx-auto transition-colors">
            AI-powered token launchpad. No code required. Multi-chain ready.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link href="/explore" className="active:scale-[0.98] w-full sm:w-auto px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-[#fff] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <Search className="w-5 h-5" />
              Explore Tokens
            </Link>
            <Link href="/launch" className="active:scale-[0.98] w-full sm:w-auto px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all bg-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.15)] text-[#818CF8] border border-[rgba(99,102,241,0.3)] shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Rocket className="w-5 h-5" />
              Launch a Token
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm text-[var(--color-text-faint)] font-mono font-bold transition-colors">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#06B6D4]" /> No coding required</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#06B6D4]" /> AI-powered</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#06B6D4]" /> Multi-chain</div>
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-2xl rounded-2xl border border-[rgba(99,102,241,0.08)] p-5 sm:p-8 md:p-12 relative z-10 mx-auto w-full transition-colors`}
      >
        <h2 className="text-2xl font-bold font-display mb-8 text-center text-[var(--color-text-primary)] transition-colors">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-[var(--color-text-primary)] transition-colors">1. Discover</h3>
            <p className="text-[var(--color-text-secondary)] text-sm transition-colors">Browse trending tokens with AI-powered insights. Filter by category, risk, and momentum.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-[var(--color-text-primary)] transition-colors">2. Trade</h3>
            <p className="text-[var(--color-text-secondary)] text-sm transition-colors">Buy and sell tokens through the bonding curve. Early buyers get the best prices.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-display text-[var(--color-text-primary)] transition-colors">3. Launch</h3>
            <p className="text-[var(--color-text-secondary)] text-sm transition-colors">Create your own token in 3 steps. AI helps you craft the perfect narrative.</p>
          </div>
        </div>
      </motion.section>
      
      {/* ── STATS BAR ── */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-[rgba(99,102,241,0.08)] py-8 relative z-10 ${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-xl transition-colors`}
      >
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(99,102,241,0.08)] pb-6 md:pb-0">
          <div className="text-3xl font-display font-bold font-mono text-[var(--color-text-primary)] transition-colors">
            <AnimatedCounter value={4.2} prefix="$" suffix="M" decimals={1} />
          </div>
          <div className="text-[var(--color-text-secondary)] text-sm mt-1 flex items-center gap-1.5 transition-colors">24H Volume</div>
        </div>
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[rgba(99,102,241,0.08)] pb-6 md:pb-0">
          <div className="text-3xl font-display font-bold font-mono text-[var(--color-text-primary)] transition-colors">
            <AnimatedCounter value={12847} />
          </div>
          <div className="text-[var(--color-text-secondary)] text-sm mt-1 flex items-center gap-1.5 transition-colors">Active Traders</div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl font-display font-bold font-mono text-[var(--color-text-primary)] transition-colors">
            <AnimatedCounter value={2341} />
          </div>
          <div className="text-[var(--color-text-secondary)] text-sm mt-1 flex items-center gap-1.5 transition-colors">Tokens Launched</div>
        </div>
      </motion.section>



      {/* ── TRENDING NOW ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10"
      >
        <div className="flex items-end mb-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2 text-[var(--color-text-primary)] transition-colors">
            <TrendingUp className="text-[#F43F5E]" /> Trending Now
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TRENDING.map((token, i) => (
            <Link href={`/token/${token.id}`} key={token.id} className={`p-5 group hover:border-[rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 ease-out flex flex-col h-full relative overflow-hidden ${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_50%)]" />
              
              {/* Top */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_15px_rgba(244,63,94,0.2)]" style={{ backgroundColor: `${token.color}20` }}>
                  {token.icon}
                </div>
                <AnimatedCounter 
                  value={Math.abs(token.change)} 
                  prefix={token.change > 0 ? '+' : '-'} 
                  suffix="%" 
                  decimals={1} 
                  className={`px-2.5 py-1 rounded-md text-sm font-mono font-bold border ${token.change >= 0 ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[rgba(244,63,94,0.1)] text-[#F43F5E] border-[rgba(244,63,94,0.3)] shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`} 
                />
              </div>

              {/* Middle */}
              <div className="mb-4 flex-1 relative z-10">
                <h3 className={`text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2 transition-colors ${isDark ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : ''}`}>
                  {token.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[rgba(99,102,241,0.15)] text-[#6366F1] uppercase tracking-wider font-semibold border border-[rgba(99,102,241,0.3)]">{token.category}</span>
                </h3>
                <div className="text-[var(--color-text-secondary)] text-sm font-mono mt-1 transition-colors">{token.ticker}</div>
              </div>

              {/* Market Data */}
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                  <div className={`text-xl font-mono text-[var(--color-text-primary)] font-bold transition-colors ${isDark ? 'drop-shadow-[0_0_8px_rgba(241,245,249,0.3)]' : ''}`}>{token.price}</div>
                  <AnimatedCounter value={token.marketCap / 1000000} prefix="MCap $" suffix="M" decimals={2} className="text-xs text-[var(--color-text-faint)] mt-1 font-mono block transition-colors" />
                </div>
                
                {/* Mini sparkline */}
                <svg viewBox="0 0 80 32" className={`w-[80px] h-[32px] overflow-visible ${token.change >= 0 ? 'drop-shadow-[0_2px_6px_rgba(16,185,129,0.4)]' : 'drop-shadow-[0_2px_6px_rgba(244,63,94,0.4)]'}`}>
                  <path 
                    d={`M0,${32 - (token.sparkline[0]/140)*32} ${token.sparkline.map((val, idx) => `L${(idx / (token.sparkline.length - 1)) * 80},${32 - (val/140)*32}`).join(' ')}`}
                    fill="none" 
                    stroke={token.change < 0 ? '#F43F5E' : '#818CF8'} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>

              {/* Bonding Curve Quick Look */}
              <div className="mb-4 relative z-10">
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-secondary)] mb-1.5 uppercase transition-colors">
                  <span>Curve Progress</span>
                  <span className="text-[#6366F1]">{token.progress}%</span>
                </div>
                <div className={`h-1.5 ${isDark ? 'bg-[#000000]' : 'bg-[#E2E8F0]'} rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)] transition-colors`}>
                  <div className="h-full bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.6)]" style={{ width: `${token.progress}%` }} />
                </div>
              </div>

            </Link>
          ))}
        </div>
      </motion.section>
      
      {/* ── JUST LAUNCHED ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 mt-8"
      >
        <div className="flex items-end mb-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2 text-[var(--color-text-primary)] transition-colors">
            <Zap className="text-[#F59E0B]" /> Just Launched
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_LAUNCHES.map((token) => (
            <Link href={`/token/${token.id}`} key={token.id} className={`p-5 group hover:border-[rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 ease-out flex flex-col h-full relative overflow-hidden ${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_50%)]" />
              
              <div className="flex justify-between items-start relative z-10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_0_15px_rgba(99,102,241,0.2)]" style={{ backgroundColor: `${token.color}20` }}>
                    {token.icon}
                  </div>
                  <div>
                    <div className={`font-bold text-[var(--color-text-primary)] transition-colors ${isDark ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : ''}`}>{token.name}</div>
                    <div className="text-[var(--color-text-secondary)] text-sm font-mono transition-colors">{token.ticker}</div>
                  </div>
                </div>
                <div className="bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.2)] text-[10px] px-2 py-1 rounded-md font-bold uppercase">NEW</div>
              </div>
              
              <div className="text-sm text-[var(--color-text-faint)] flex items-center justify-between relative z-10 mb-6 font-mono transition-colors">
                <span>by <span className="text-[#6366F1]">{token.creator}</span></span>
                <span>{token.timeAgo}</span>
              </div>
              
              <div className="relative z-10 mt-auto">
                <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-secondary)] mb-1.5 uppercase transition-colors">
                  <span>Bonding Curve</span>
                  <span className="text-[#6366F1]">{token.progress}%</span>
                </div>
                <div className={`h-1.5 ${isDark ? 'bg-[#000000]' : 'bg-[#E2E8F0]'} rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)] transition-colors`}>
                  <div className="h-full bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.6)]" style={{ width: `${token.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
      

      
      {/* ── FOOTER ── */}
      <footer className={`mt-4 md:mt-8 p-5 sm:p-8 border border-[rgba(99,102,241,0.08)] ${isDark ? 'bg-[rgba(5,5,16,0.80)]' : 'bg-[rgba(255,255,255,0.80)]'} backdrop-blur-xl shadow-[0_0_30px_rgba(167,139,250,0.20)] rounded-t-3xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--color-text-secondary)] relative z-10 transition-colors`}>
        <div>MoonFluxx © 2025</div>
        <div className="flex items-center gap-6">
          <a href="#" className="fluxx-interactive hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5"><AtSign className="w-4 h-4"/> Twitter</a>
          <a href="#" className="fluxx-interactive hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5"><MessageCircle className="w-4 h-4"/> Discord</a>
          <a href="#" className="fluxx-interactive hover:text-[var(--color-text-primary)] transition-colors">Docs</a>
        </div>
      </footer>
      
    </div>
  );
}
