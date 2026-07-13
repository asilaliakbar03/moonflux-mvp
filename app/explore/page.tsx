"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Search, TrendingUp, Zap, Brain, Rocket, Users } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

// Helper to convert array of numbers into recharts object format
const formatSparkline = (data: number[]) => data.map((val, i) => ({ x: i, y: val }));

const TOKENS = [
  { id:'tok_ai_swarm', name:'AI Swarm', ticker:'SWRM', icon:'🤖', price:0.00671, change24h:211.4, marketCap:2300000, holders:4821, riskScore:5, tag:'Trending', category:'ai', color:'#F43F5E', sparkline:formatSparkline([5,8,12,15,14,18,25,32,28,40,55,70,90,85,110]), progress: 85, volume: 1400 },
  { id:'tok_degen_ape', name:'DegenApe', ticker:'DAPE', icon:'💎', price:0.00156, change24h:388.2, marketCap:970000, holders:2109, riskScore:9, tag:'Trending', category:'meme', color:'#6366F1', sparkline:formatSparkline([2,3,4,5,6,10,15,12,20,30,25,40,60,50,80]), progress: 60, volume: 890 },
  { id:'tok_nova_flux', name:'NovaFlux', ticker:'NVFX', icon:'⚡', price:0.0445, change24h:67.8, marketCap:8900000, holders:11432, riskScore:3, tag:'AI Pick', category:'ai', color:'#10B981', sparkline:formatSparkline([30,35,38,42,48,52,58,65,70,68,75,80,90,95,100]), progress: 100, volume: 3200 },
  { id:'tok_luna_doge', name:'Luna Doge', ticker:'LDOGE', icon:'🐶', price:0.00234, change24h:142.5, marketCap:1870000, holders:8341, riskScore:3, tag:'New', category:'meme', color:'#F59E0B', sparkline:formatSparkline([8,12,19,25,31,44,52,71,65,89,95,120,110,140]), progress: 75, volume: 560 },
  { id:'tok_rwa_king', name:'RWA King', ticker:'RWAK', icon:'🏦', price:2.3401, change24h:18.9, marketCap:45000000, holders:23450, riskScore:1, tag:'AI Pick', category:'rwa', color:'#6366F1', sparkline:formatSparkline([60,62,65,68,70,72,75,78,80,82,85,88,90,92]), progress: 100, volume: 12500 },
  { id:'tok_gold_flux', name:'GoldFlux', ticker:'GFLX', icon:'✨', price:0.3341, change24h:52.6, marketCap:18700000, holders:15230, riskScore:2, tag:'Graduating', category:'defi', color:'#F59E0B', sparkline:formatSparkline([55,60,62,65,68,70,72,78,82,85,88,92,95,98]), progress: 99, volume: 4500 },
  { id:'tok_pixel_cat', name:'PixelCat', ticker:'PCAT', icon:'🐱', price:0.00329, change24h:-5.4, marketCap:1100000, holders:3201, riskScore:6, tag:'New', category:'gaming', color:'#8B5CF6', sparkline:formatSparkline([50,48,45,46,44,42,40,41,39,37,35,33,34,32]), progress: 40, volume: 120 },
  { id:'tok_void_inu', name:'Void Inu', ticker:'VINU', icon:'🖤', price:0.00045, change24h:-12.7, marketCap:890000, holders:1876, riskScore:7, tag:'New', category:'meme', color:'#475569', sparkline:formatSparkline([100,95,88,80,75,70,68,65,72,69,60,55,52,50]), progress: 25, volume: 80 },
  { id:'tok_sol_eagle', name:'Sol Eagle', ticker:'SEGL', icon:'🦅', price:0.1247, change24h:34.2, marketCap:12500000, holders:9870, riskScore:2, tag:'AI Pick', category:'defi', color:'#10B981', sparkline:formatSparkline([40,42,45,50,55,58,62,70,75,80,85,90,88,95]), progress: 100, volume: 6700 },
  { id:'tok_storm_cat', name:'StormCat', ticker:'STMC', icon:'⚡', price:0.00082, change24h:-23.1, marketCap:440000, holders:987, riskScore:8, tag:'New', category:'meme', color:'#F43F5E', sparkline:formatSparkline([80,75,70,65,60,55,68,72,65,58,50,45,48,42]), progress: 15, volume: 30 },
  { id:'tok_zen_monk', name:'ZenMonk', ticker:'ZNMK', icon:'🧘', price:0.7823, change24h:9.1, marketCap:22000000, holders:18760, riskScore:2, tag:'Graduating', category:'defi', color:'#10B981', sparkline:formatSparkline([70,72,71,74,76,75,78,80,79,82,84,83,86,88]), progress: 95, volume: 3100 },
  { id:'tok_cyber_pep', name:'CyberPep', ticker:'CPEP', icon:'🐸', price:0.00891, change24h:78.3, marketCap:3210000, holders:6543, riskScore:4, tag:'Trending', category:'meme', color:'#6366F1', sparkline:formatSparkline([20,18,25,30,28,35,42,55,60,58,70,85,90,88]), progress: 80, volume: 1500 },
];

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Price Change');
  const [showCount, setShowCount] = useState(12);

  const filters = [
    { name: 'All', icon: null },
    { name: 'Trending', icon: TrendingUp },
    { name: 'New', icon: Zap },
    { name: 'AI Pick', icon: Brain },
    { name: 'Graduating', icon: Rocket },
  ];

  const filteredTokens = useMemo(() => {
    let result = TOKENS;
    if (activeFilter !== 'All') {
      result = result.filter(t => t.tag === activeFilter);
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(lowerQ) || t.ticker.toLowerCase().includes(lowerQ));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'Price Change') return b.change24h - a.change24h;
      if (sortBy === 'Market Cap') return b.marketCap - a.marketCap;
      // Newest (just use mock data order)
      return 0;
    });

    return result;
  }, [activeFilter, searchQuery, sortBy]);

  const displayedTokens = filteredTokens.slice(0, showCount);

  return (
    <div className="flex flex-col gap-8 pb-16 pt-4">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-white mb-2">Explore Tokens</h1>
          <p className="text-[#94A3B8]">Discover the next wave. Filter by what moves you.</p>
        </div>
        <div className="relative w-full md:w-auto md:min-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(99,102,241,0.5)] focus:ring-1 focus:ring-[#6366F1] transition-all"
          />
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => {
          const isActive = activeFilter === filter.name;
          return (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                isActive 
                  ? 'bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                  : 'bg-[rgba(99,102,241,0.05)] text-[#94A3B8] border border-[rgba(99,102,241,0.15)] hover:bg-[rgba(99,102,241,0.1)] hover:text-white'
              }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.name}
            </button>
          );
        })}
      </div>

      {/* ── SORT ROW ── */}
      <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
        <div className="text-sm font-semibold text-[#818CF8]">
          {filteredTokens.length} tokens
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#94A3B8] hidden sm:inline">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[#6366F1] cursor-pointer hover:border-[#6366F1] transition-colors"
          >
            <option>Price Change</option>
            <option>Market Cap</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedTokens.map((token, i) => (
          <Link href={`/token/${token.id}`} key={token.id}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
              className="surface-card p-5 hover:border-[rgba(99,102,241,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.8),transparent_50%)] group-hover:opacity-[0.08] transition-opacity duration-500" />

              {/* Top */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.05)] shadow-md" style={{ backgroundColor: `${token.color}15` }}>
                  {token.icon}
                </div>
                <div className={`px-2.5 py-1 rounded-md text-sm font-mono font-bold border ${token.change24h >= 0 ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-[rgba(244,63,94,0.1)] text-[#F43F5E] border-[rgba(244,63,94,0.3)] shadow-[0_0_10px_rgba(244,63,94,0.1)]'}`}>
                  {token.change24h > 0 ? '+' : ''}{token.change24h}%
                </div>
              </div>

              {/* Middle */}
              <div className="mb-4 flex-1 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
                  {token.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[rgba(99,102,241,0.1)] text-[#818CF8] uppercase tracking-wider font-semibold border border-[rgba(99,102,241,0.2)]">{token.category}</span>
                </h3>
                <div className="text-[#94A3B8] text-sm font-mono mt-1">${token.ticker}</div>
              </div>

              {/* Market Data & Sparkline */}
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                  <div className="text-xl font-mono text-white font-bold">${token.price}</div>
                  <div className="text-xs text-[#64748B] mt-1 font-mono">MCap ${(token.marketCap / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-[#64748B] font-mono mt-0.5">Vol ${token.volume}</div>
                </div>
                
                {/* Recharts Mini Sparkline */}
                <div className="w-[80px] h-[40px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={token.sparkline}>
                      <Line 
                        type="monotone" 
                        dataKey="y" 
                        stroke={token.change24h >= 0 ? '#10B981' : '#F43F5E'} 
                        strokeWidth={2} 
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bonding Curve Quick Look */}
              <div className="mb-4 relative z-10">
                <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] mb-1.5 uppercase">
                  <span>Curve Progress</span>
                  <span className="text-[#818CF8] font-bold">{token.progress}%</span>
                </div>
                <div className="h-1.5 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                  <div className="h-full bg-[#6366F1] shadow-[0_0_10px_#6366F1]" style={{ width: `${token.progress}%` }} />
                </div>
              </div>

              <div className="h-px w-full bg-[rgba(255,255,255,0.05)] mb-3 relative z-10" />

              {/* Footer info */}
              <div className="flex justify-between items-center text-xs text-[#94A3B8] relative z-10 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${token.riskScore <= 3 ? 'bg-[#10B981]' : token.riskScore <= 6 ? 'bg-[#F59E0B]' : 'bg-[#F43F5E]'}`} />
                  AI Risk: {token.riskScore}/10
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  {token.holders.toLocaleString()}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
