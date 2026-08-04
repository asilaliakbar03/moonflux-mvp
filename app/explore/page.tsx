"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useTheme } from '@/components/ThemeProvider';
import { Search, TrendingUp, Zap, Brain, Rocket, ChevronDown, Radio } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";

const EASE = [0.16, 1, 0.3, 1] as const;

// Helper to convert array of numbers into recharts object format
const formatSparkline = (data: number[]) => data.map((val, i) => ({ x: i, y: val }));

// Helper to generate unique meme/crypto character images
const getMemeImage = (ticker: string) => {
  const sets = ['set1', 'set2', 'set3', 'set4'];
  const set = sets[ticker.length % 4];
  return `https://robohash.org/${ticker.toLowerCase()}?set=${set}&bgset=bg1&size=400x400`;
};

const TOKENS = [
  { id:'tok_ai_swarm', name:'AI Swarm', ticker:'SWRM', price:0.00671, change24h:211.4, marketCap:2300000, holders:4821, tag:'🔥 ABOUT TO GRADUATE', category:'ai', color:'#F43F5E', sparkline:formatSparkline([5,8,12,15,14,18,25,32,28,40,55,70,90,85,110]), progress: 95, creator: 'cyberpunk_dev', timeAgo: '2h', isLive: true },
  { id:'tok_degen_ape', name:'DegenApe', ticker:'DAPE', price:0.00156, change24h:388.2, marketCap:970000, holders:2109, tag:'⚡ NEW LAUNCHES', category:'token', color:'#6366F1', sparkline:formatSparkline([2,3,4,5,6,10,15,12,20,30,25,40,60,50,80]), progress: 60, creator: 'ape_lord', timeAgo: '15m', isLive: false },
  { id:'tok_nova_flux', name:'NovaFlux', ticker:'NVFX', price:0.0445, change24h:67.8, marketCap:8900000, holders:11432, tag:'🎓 GRADUATED', category:'ai', color:'#10B981', sparkline:formatSparkline([30,35,38,42,48,52,58,65,70,68,75,80,90,95,100]), progress: 100, creator: 'nova_team', timeAgo: '1d', isLive: false },
  { id:'tok_luna_doge', name:'Luna Doge', ticker:'LDOGE', price:0.00234, change24h:142.5, marketCap:1870000, holders:8341, tag:'⚡ NEW LAUNCHES', category:'token', color:'#F59E0B', sparkline:formatSparkline([8,12,19,25,31,44,52,71,65,89,95,120,110,140]), progress: 75, creator: 'doge_father', timeAgo: '4h', isLive: true },
  { id:'tok_rwa_king', name:'RWA King', ticker:'RWAK', price:2.3401, change24h:18.9, marketCap:45000000, holders:23450, tag:'🎓 GRADUATED', category:'rwa', color:'#6366F1', sparkline:formatSparkline([60,62,65,68,70,72,75,78,80,82,85,88,90,92]), progress: 100, creator: 'real_world_assets', timeAgo: '1w', isLive: false },
  { id:'tok_gold_flux', name:'GoldFlux', ticker:'GFLX', price:0.3341, change24h:52.6, marketCap:18700000, holders:15230, tag:'🔥 ABOUT TO GRADUATE', category:'defi', color:'#F59E0B', sparkline:formatSparkline([55,60,62,65,68,70,72,78,82,85,88,92,95,98]), progress: 99, creator: 'gold_digger', timeAgo: '5h', isLive: true },
  { id:'tok_pixel_cat', name:'PixelCat', ticker:'PCAT', price:0.00329, change24h:-5.4, marketCap:1100000, holders:3201, tag:'⚡ NEW LAUNCHES', category:'gaming', color:'#8B5CF6', sparkline:formatSparkline([50,48,45,46,44,42,40,41,39,37,35,33,34,32]), progress: 40, creator: 'meow_master', timeAgo: '1h', isLive: false },
  { id:'tok_void_inu', name:'Void Inu', ticker:'VINU', price:0.00045, change24h:-12.7, marketCap:890000, holders:1876, tag:'⚡ NEW LAUNCHES', category:'token', color:'#475569', sparkline:formatSparkline([100,95,88,80,75,70,68,65,72,69,60,55,52,50]), progress: 25, creator: 'void_walker', timeAgo: '30m', isLive: false },
  { id:'tok_sol_eagle', name:'Sol Eagle', ticker:'SEGL', price:0.1247, change24h:34.2, marketCap:12500000, holders:9870, tag:'🎓 GRADUATED', category:'defi', color:'#10B981', sparkline:formatSparkline([40,42,45,50,55,58,62,70,75,80,85,90,88,95]), progress: 100, creator: 'eagle_eye', timeAgo: '2d', isLive: false },
  { id:'tok_storm_cat', name:'StormCat', ticker:'STMC', price:0.00082, change24h:-23.1, marketCap:440000, holders:987, tag:'⚡ NEW LAUNCHES', category:'token', color:'#F43F5E', sparkline:formatSparkline([80,75,70,65,60,55,68,72,65,58,50,45,48,42]), progress: 15, creator: 'storm_bringer', timeAgo: '10m', isLive: false },
  { id:'tok_zen_monk', name:'ZenMonk', ticker:'ZNMK', price:0.7823, change24h:9.1, marketCap:22000000, holders:18760, tag:'🔥 ABOUT TO GRADUATE', category:'defi', color:'#10B981', sparkline:formatSparkline([70,72,71,74,76,75,78,80,79,82,84,83,86,88]), progress: 95, creator: 'zen_master', timeAgo: '8h', isLive: false },
  { id:'tok_cyber_pep', name:'CyberPep', ticker:'CPEP', price:0.00891, change24h:78.3, marketCap:3210000, holders:6543, tag:'🔥 ABOUT TO GRADUATE', category:'token', color:'#6366F1', sparkline:formatSparkline([20,18,25,30,28,35,42,55,60,58,70,85,90,88]), progress: 80, creator: 'pepe_lord', timeAgo: '6h', isLive: true },
];

const SORT_OPTIONS = ['MCAP 🔻', 'VOLUME 📊', 'CHANGE %', 'NEWEST ⚡'];

export default function ExplorePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [activeFilter, setActiveFilter] = useState('ALL TOKENS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('MCAP 🔻');
  const [sortOpen, setSortOpen] = useState(false);
  const [showCount, setShowCount] = useState(20);

  const filters = [
    'ALL TOKENS',
    '🔥 ABOUT TO GRADUATE',
    '🎓 GRADUATED',
    '🔴 LIVE STREAMS',
    '⚡ NEW LAUNCHES'
  ];

  const [liveTokens, setLiveTokens] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const { data, error } = await supabase
          .from('tokens')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (data && data.length > 0) {
          const mapped = data.map((dbToken: any) => ({
            id: dbToken.mint_address || dbToken.id,
            name: dbToken.name,
            ticker: dbToken.ticker,
            created_at: dbToken.created_at || new Date().toISOString(),
            price: 0,
            change24h: 0,
            marketCap: Math.floor(Math.random() * 500000) + 10000,
            holders: Math.floor(Math.random() * 1000),
            tag: Number(dbToken.bonding_curve_progress) >= 100 ? '🎓 GRADUATED' : Number(dbToken.bonding_curve_progress) > 80 ? '🔥 ABOUT TO GRADUATE' : '⚡ NEW LAUNCHES',
            category: dbToken.category || 'token',
            color: '#10B981',
            sparkline: formatSparkline([10, 15, 12, 18, 22, 25, 20, 30, 35, 40, 38, 45, 50]),
            progress: Number(dbToken.bonding_curve_progress) || 5,
            creator: dbToken.creator_address ? `${dbToken.creator_address.slice(0,4)}...` : 'anon',
            timeAgo: 'Just now',
            isLive: Math.random() > 0.8
          }));
          setLiveTokens(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch live tokens from Supabase", err);
      }
    }
    fetchTokens();
  }, []);

  const filteredTokens = useMemo(() => {
    let result = [...liveTokens, ...TOKENS];
    
    if (activeFilter !== 'ALL TOKENS') {
      if (activeFilter === '🔴 LIVE STREAMS') {
        result = result.filter(t => t.isLive);
      } else {
        result = result.filter(t => t.tag === activeFilter);
      }
    }
    
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(lowerQ) || t.ticker.toLowerCase().includes(lowerQ));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'MCAP 🔻') return b.marketCap - a.marketCap;
      if (sortBy === 'VOLUME 📊') return Math.abs(b.change24h) - Math.abs(a.change24h);
      if (sortBy === 'CHANGE %') return b.change24h - a.change24h;
      if (sortBy === 'NEWEST ⚡') return 0; // In real app, sort by timestamp
      return 0;
    });

    return result;
  }, [activeFilter, searchQuery, sortBy, liveTokens]);

  const displayedTokens = filteredTokens.slice(0, showCount);

  // Brutalist styling variables
  const bBorder = isDark ? "border-2 border-[rgba(255,255,255,0.2)]" : "border-3 border-black";
  const bShadow = isDark ? "shadow-[4px_4px_0px_0px_#10B981]" : "shadow-[4px_4px_0px_0px_#000]";
  const bHoverShadow = isDark ? "hover:shadow-[2px_2px_0px_0px_#10B981] hover:translate-x-[2px] hover:translate-y-[2px]" : "hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]";
  const bBg = isDark ? "bg-[#050510]" : "bg-white";
  const bText = isDark ? "text-white" : "text-black";
  const bMuted = isDark ? "text-gray-400" : "text-gray-600";

  // Helper to format large numbers
  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="w-full min-h-screen font-mono pb-24">
      
      {/* ── LIVE MARQUEE TICKER ──────────────────────────────────────────────── */}
      <div className={`w-full overflow-hidden border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#10B981]/20 text-[#10B981]" : "border-black bg-[#10B981] text-black"}`}>
        <div className="flex whitespace-nowrap py-2 animate-marquee text-xs sm:text-sm font-black tracking-widest uppercase">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4">
                {`> 🚨 LMEOW GRADUATED TO RAYDIUM // 💸 12.4 SOL BUY ON $LDOGE // 🚀 ASTROCAT HIT 85% BONDING CURVE // `}
              </span>
           ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        
        {/* ── FILTERS & SORT BAR ──────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(f => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-2 text-xs font-black uppercase transition-all ${bBorder} ${
                    active
                      ? isDark ? "bg-[#F59E0B] text-black shadow-[4px_4px_0px_0px_#10B981] -translate-x-0.5 -translate-y-0.5" : "bg-black text-white shadow-[4px_4px_0px_0px_#10B981] -translate-x-0.5 -translate-y-0.5"
                      : `${bBg} ${bText} ${bHoverShadow}`
                  }`}
                >
                  [ {f} ]
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase shrink-0 cursor-pointer ${bBorder} ${bBg} ${bText} ${bHoverShadow} transition-all`}
            >
              [ SORT: {sortBy} ▾ ]
            </button>
            {sortOpen && (
              <div className={`absolute right-0 top-full mt-1 z-50 flex flex-col min-w-[180px] ${bBorder} ${bBg} shadow-[4px_4px_0px_0px_#6366F1]`}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setSortOpen(false); }}
                    className={`px-4 py-2 text-xs font-black uppercase text-left transition-all ${
                      sortBy === opt 
                        ? (isDark ? 'bg-[#6366F1] text-white' : 'bg-black text-white')
                        : `${bText} ${isDark ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-gray-100'}`
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PUMP.FUN-STYLE TOKEN GRID ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {displayedTokens.map((t, i) => {
            const isPos = t.change24h >= 0;
            const sparkColor = isPos ? "#10B981" : "#F43F5E";

            return (
              <Link href={`/token/${t.id}`} key={`${t.id}-${i}`}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, ease: EASE }}
                  className={`group relative flex flex-col h-full overflow-hidden ${bBorder} ${bShadow} ${bBg} transition-all ${bHoverShadow} hover:-translate-y-1 cursor-pointer`}
                >
                  
                  {/* Artwork Header */}
                  <div className={`relative w-full aspect-square border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#1A1A2E]" : "border-black bg-gray-200"}`}>
                    {/* Unique artwork image generated via robohash based on ticker string */}
                    <img 
                      src={getMemeImage(t.ticker)} 
                      alt={t.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    
                    {/* Live Badge */}
                    {t.isLive && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[9px] font-black tracking-widest uppercase border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 z-10 animate-pulse">
                        <Radio className="w-3 h-3" /> LIVE
                      </div>
                    )}
                    
                    {/* Curve Progress Tag */}
                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-black uppercase border z-10 ${isDark ? "bg-black/80 text-[#10B981] border-[#10B981]" : "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                      [{t.progress}% CURVE]
                    </div>

                    {/* Sparkline Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={t.sparkline}>
                          <Line type="monotone" dataKey="y" stroke={sparkColor} strokeWidth={3} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Token Meta & Footer */}
                  <div className="p-3 flex flex-col flex-1 justify-between gap-3 relative z-30">
                    
                    {/* Title & MCAP */}
                    <div>
                      <h3 className={`font-black text-sm uppercase leading-tight truncate ${bText}`}>{t.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold ${isDark ? "text-[#818CF8]" : "text-[#6366F1]"}`}>${t.ticker}</span>
                        <span className={`text-[10px] font-black px-1 border ${isDark ? "border-[rgba(255,255,255,0.2)] text-white" : "border-black text-black bg-gray-100"}`}>
                          ${formatCompact(t.marketCap)} MC
                        </span>
                      </div>
                    </div>

                    {/* Creator / Time */}
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border ${isDark ? "border-[rgba(255,255,255,0.2)]" : "border-black"} overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#F43F5E] shrink-0`} />
                      <div className="flex items-center gap-1 min-w-0 text-[10px] font-bold">
                        <span className={`truncate ${bMuted}`}>{t.creator}</span>
                        <span className={isDark ? "text-gray-600" : "text-gray-400"}>·</span>
                        <span className={isDark ? "text-[#10B981]" : "text-[#10B981]"}>{t.timeAgo}</span>
                      </div>
                    </div>

                    {/* Quick Buy Hover Button */}
                    <div className={`absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-40 px-3 py-2 text-center font-black text-xs uppercase ${bBorder} ${isDark ? "bg-[#10B981] text-black" : "bg-[#10B981] text-black"}`}>
                      [ QUICK BUY 0.1 SOL ]
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        {displayedTokens.length === 0 && (
          <div className="w-full py-20 text-center font-black uppercase text-2xl text-gray-400">
            [ NO TOKENS FOUND IN DATABASE ]
          </div>
        )}

      </div>
    </div>
  );
}
