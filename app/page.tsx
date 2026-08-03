"use client";

import { motion } from "framer-motion";
import { TrendingUp, Rocket, Search, Zap, AtSign, MessageCircle, Terminal, Radio } from "lucide-react";
import Link from "next/link";
import { useMoonWallet } from "@/components/WalletProvider";
import AnimatedCounter from '@/components/AnimatedCounter';
import { useTheme } from '@/components/ThemeProvider';
import { LineChart, Line, ResponsiveContainer } from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

// Helper to convert array of numbers into recharts object format
const formatSparkline = (data: number[]) => data.map((val, i) => ({ x: i, y: val }));

export default function HomePage() {
  const { address } = useMoonWallet();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const MOCK_TRENDING = [
    { id:'tok_ai_swarm', name:'AI Swarm', ticker:'SWRM', change:+211.4, price:'$0.00671', category:'AI', color:'#F43F5E', marketCap:2300000, riskScore:5, holders:4821, progress:85, sparkline:[5,8,12,15,14,18,25,32,28,40,55,70,90,85,110], isLive: true },
    { id:'tok_degen_ape', name:'DegenApe', ticker:'DAPE', change:+388.2, price:'$0.00156', category: 'TOKEN', color:'#6366F1', marketCap:970000, riskScore:9, holders:2109, progress:60, sparkline:[2,3,4,5,6,10,15,12,20,30,25,40,60,50,80], isLive: false },
    { id:'tok_nova_flux', name:'NovaFlux', ticker:'NVFX', change:+67.8, price:'$0.0445', category:'DEFI', color:'#10B981', marketCap:8900000, riskScore:3, holders:11432, progress:100, sparkline:[30,35,38,42,48,52,58,65,70,68,75,80,90,95,100], isLive: false },
    { id:'tok_rwa_king', name:'RWA King', ticker:'RWAK', change:+18.9, price:'$2.34', category:'RWA', color:'#8B5CF6', marketCap:45000000, riskScore:1, holders:23450, progress:100, sparkline:[60,62,65,68,70,72,75,78,80,82,85,88,90,92], isLive: true },
  ];

  const MOCK_LAUNCHES = [
    { id:'tok_luna_doge', name:'Luna Doge', ticker:'LDOGE', creator:'@moondev', timeAgo:'2H AGO', progress:73, color:'#F59E0B', change:+142.5, price:'$0.00234', marketCap:1870000, riskScore:3, sparkline:[8,12,19,25,31,44,52,71,65,89,95,120,110,140] },
    { id:'tok_pixel_cat', name:'PixelCat', ticker:'PCAT', creator:'@pixelwiz', timeAgo:'4H AGO', progress:31, color:'#8B5CF6', change:-5.4, price:'$0.00329', marketCap:1100000, riskScore:6, sparkline:[50,48,45,46,44,42,40,41,39,37,35,33,34,32] },
    { id:'tok_storm_cat', name:'StormCat', ticker:'STMC', creator:'@stormking', timeAgo:'6H AGO', progress:18, color:'#F43F5E', change:-23.1, price:'$0.00082', marketCap:440000, riskScore:8, sparkline:[80,75,70,65,60,55,68,72,65,58,50,45,48,42] },
    { id:'tok_void_inu', name:'Void Inu', ticker:'VINU', creator:'@void_walker', timeAgo:'30M AGO', progress:25, color:'#475569', change:-12.7, price:'$0.00045', marketCap:890000, riskScore:7, sparkline:[100,95,88,80,75,70,68,65,72,69,60,55,52,50] },
  ];

  // Brutalist styling variables
  const bBorder = isDark ? "border-2 border-[rgba(255,255,255,0.2)]" : "border-3 border-black";
  const bShadow = isDark ? "shadow-[4px_4px_0px_0px_#10B981]" : "shadow-[4px_4px_0px_0px_#000]";
  const bHoverShadow = isDark ? "hover:shadow-[2px_2px_0px_0px_#10B981] hover:translate-x-[2px] hover:translate-y-[2px]" : "hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]";
  const bBg = isDark ? "bg-[#050510]" : "bg-white";
  const bText = isDark ? "text-white" : "text-black";
  const bMuted = isDark ? "text-gray-400" : "text-gray-600";

  const formatCompact = (num: number) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

  return (
    <div className="w-full font-mono pb-24 overflow-x-hidden">
      
      {/* ── LIVE MARQUEE TICKER ──────────────────────────────────────────────── */}
      <div className={`w-full overflow-hidden border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#10B981]/20 text-[#10B981]" : "border-black bg-[#10B981] text-black"}`}>
        <div className="flex whitespace-nowrap py-1.5 animate-marquee text-xs font-black tracking-widest uppercase">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4">
                {`> MOONFLUXX V1.0 // 🚀 ASTROCAT HIT 85% BONDING CURVE // 💸 12.4 SOL BUY ON $LDOGE // `}
              </span>
           ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">

        {/* ── HERO SECTION ── */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className={`mt-6 mb-12 flex flex-col items-center justify-center text-center p-8 sm:p-16 ${bBorder} ${bShadow} ${bBg} relative overflow-hidden`}
        >
          {/* Grid background pattern */}
          <div className={`absolute inset-0 opacity-10 pointer-events-none ${isDark ? "bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)]"}`} style={{ backgroundSize: '40px 40px' }} />

          <div className={`inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-black tracking-widest uppercase border ${isDark ? "bg-[#10B981] text-black border-[#10B981]" : "bg-black text-white border-black"} relative z-10`}>
            <Terminal className="w-4 h-4" /> MULTI-CHAIN LAUNCHPAD
          </div>
          
          <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-6 relative z-10 ${bText}`}>
            LAUNCH & TRADE<br/>
            <span className="text-[#6366F1]">IN 60 SECONDS</span>
          </h1>
          
          <p className={`text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider mb-8 max-w-2xl relative z-10 ${bMuted}`}>
            {">"} AI-POWERED TOKEN LAUNCHPAD.<br/>
            {">"} NO CODE REQUIRED. MULTI-CHAIN READY.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative z-10">
            <Link href="/explore" className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase transition-all ${bBorder} ${isDark ? "bg-[#10B981] text-black hover:bg-[#059669]" : "bg-[#10B981] text-black hover:bg-black hover:text-[#10B981]"} shadow-[4px_4px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366F1]`}>
              <Search className="w-5 h-5" /> [ EXPLORE TOKENS ]
            </Link>
            <Link href="/launch" className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-black text-sm uppercase transition-all ${bBorder} ${isDark ? "bg-black text-white hover:bg-[#6366F1]" : "bg-white text-black hover:bg-black hover:text-white"} ${bHoverShadow}`}>
              <Rocket className="w-5 h-5" /> [ LAUNCH TOKEN ]
            </Link>
          </div>
        </motion.section>

        {/* ── STATS BAR ── */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className={`grid grid-cols-1 md:grid-cols-3 gap-0 border-y ${isDark ? "border-[rgba(255,255,255,0.2)]" : "border-black"} mb-12`}
        >
          <div className={`flex flex-col items-center justify-center py-8 border-b md:border-b-0 md:border-r ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#050510]" : "border-black bg-gray-100"}`}>
            <div className={`text-4xl font-black ${bText}`}>$4.2M</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${bMuted} mt-2`}>24H VOLUME</div>
          </div>
          <div className={`flex flex-col items-center justify-center py-8 border-b md:border-b-0 md:border-r ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#0A0A1A]" : "border-black bg-white"}`}>
            <div className={`text-4xl font-black ${bText}`}>12,847</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${bMuted} mt-2`}>ACTIVE TRADERS</div>
          </div>
          <div className={`flex flex-col items-center justify-center py-8 ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#050510]" : "border-black bg-gray-100"}`}>
            <div className={`text-4xl font-black ${bText}`}>2,341</div>
            <div className={`text-xs font-bold uppercase tracking-widest ${bMuted} mt-2`}>TOKENS LAUNCHED</div>
          </div>
        </motion.section>

        {/* ── TRENDING NOW ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6 border-b pb-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }}>
            <h2 className={`text-2xl font-black uppercase flex items-center gap-2 ${bText}`}>
              <TrendingUp className="text-[#F43F5E] w-6 h-6" /> [ TRENDING NOW ]
            </h2>
            <Link href="/explore" className={`text-xs font-bold uppercase ${isDark ? "text-[#10B981] hover:text-white" : "text-[#6366F1] hover:text-black"} transition-colors`}>
              VIEW ALL {">"}
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {MOCK_TRENDING.map((t, i) => {
              const isPos = t.change >= 0;
              const sparkColor = isPos ? "#10B981" : "#F43F5E";

              return (
                <Link href={`/token/${t.id}`} key={t.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, ease: EASE }}
                    className={`group flex flex-col h-full overflow-hidden ${bBorder} ${bShadow} ${bBg} transition-all ${bHoverShadow} hover:-translate-y-1 cursor-pointer`}
                  >
                    {/* Artwork Header */}
                    <div className={`relative w-full aspect-square border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-black" : "border-black bg-gray-200"}`}>
                      <img 
                        src={`https://picsum.photos/seed/${t.ticker.toLowerCase()}/400/400`} 
                        alt={t.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-300"
                      />
                      {t.isLive && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[9px] font-black tracking-widest uppercase border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 z-10 animate-pulse">
                          <Radio className="w-3 h-3" /> LIVE
                        </div>
                      )}
                      <div className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-black uppercase border z-10 ${isDark ? "bg-black/80 text-[#10B981] border-[#10B981]" : "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                        [{t.progress}% CURVE]
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatSparkline(t.sparkline)}>
                            <Line type="monotone" dataKey="y" stroke={sparkColor} strokeWidth={3} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Token Meta */}
                    <div className="p-3 flex flex-col justify-between gap-2 relative z-30">
                      <div>
                        <h3 className={`font-black text-sm uppercase leading-tight truncate ${bText}`}>{t.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold ${isDark ? "text-[#818CF8]" : "text-[#6366F1]"}`}>{t.ticker}</span>
                          <span className={`text-[10px] font-black px-1 border ${isDark ? "border-[rgba(255,255,255,0.2)] text-white" : "border-black text-black bg-gray-100"}`}>
                            ${formatCompact(t.marketCap)} MC
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className={`text-lg font-black ${bText}`}>{t.price}</div>
                        <div className={`text-[10px] font-black px-1 py-0.5 border ${isPos ? (isDark ? "border-[#10B981] text-[#10B981]" : "border-black bg-[#10B981] text-black") : (isDark ? "border-[#F43F5E] text-[#F43F5E]" : "border-black bg-[#F43F5E] text-white")}`}>
                          {isPos ? "+" : ""}{t.change}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── JUST LAUNCHED ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6 border-b pb-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }}>
            <h2 className={`text-2xl font-black uppercase flex items-center gap-2 ${bText}`}>
              <Zap className="text-[#F59E0B] w-6 h-6" /> [ JUST LAUNCHED ]
            </h2>
            <Link href="/explore" className={`text-xs font-bold uppercase ${isDark ? "text-[#10B981] hover:text-white" : "text-[#6366F1] hover:text-black"} transition-colors`}>
              VIEW ALL {">"}
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {MOCK_LAUNCHES.map((t, i) => {
              const isPos = t.change >= 0;
              const sparkColor = isPos ? "#10B981" : "#F43F5E";

              return (
                <Link href={`/token/${t.id}`} key={t.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, ease: EASE }}
                    className={`group flex flex-col h-full overflow-hidden ${bBorder} ${bShadow} ${bBg} transition-all ${bHoverShadow} hover:-translate-y-1 cursor-pointer`}
                  >
                    <div className={`relative w-full aspect-square border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-black" : "border-black bg-gray-200"}`}>
                      <img 
                        src={`https://picsum.photos/seed/${t.ticker.toLowerCase()}/400/400`} 
                        alt={t.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-300"
                      />
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-black uppercase border z-10 ${isDark ? "bg-black text-[#10B981] border-[#10B981]" : "bg-[#10B981] text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                        NEW
                      </div>
                      <div className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-black uppercase border z-10 ${isDark ? "bg-black/80 text-[#F59E0B] border-[#F59E0B]" : "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                        [{t.progress}% CURVE]
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 z-20 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatSparkline(t.sparkline)}>
                            <Line type="monotone" dataKey="y" stroke={sparkColor} strokeWidth={3} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col justify-between gap-2 relative z-30">
                      <div>
                        <h3 className={`font-black text-sm uppercase leading-tight truncate ${bText}`}>{t.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold ${isDark ? "text-[#818CF8]" : "text-[#6366F1]"}`}>{t.ticker}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <div className={`text-[9px] font-bold uppercase truncate ${bMuted}`}>{t.creator}</div>
                        <div className={`text-[9px] font-bold uppercase ${isDark ? "text-[#10B981]" : "text-[#10B981]"}`}>{t.timeAgo}</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
      
      {/* ── FOOTER ── */}
      <footer className={`border-t ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#050510]" : "border-black bg-black text-white"} mt-20 p-8 sm:p-12`}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-black text-xl tracking-tighter">MOONFLUXX_V1.0</div>
          <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
            <a href="#" className={`flex items-center gap-2 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-300 hover:text-white"} transition-colors`}><AtSign className="w-4 h-4"/> TWITTER</a>
            <a href="#" className={`flex items-center gap-2 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-300 hover:text-white"} transition-colors`}><MessageCircle className="w-4 h-4"/> DISCORD</a>
            <a href="#" className={`flex items-center gap-2 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-300 hover:text-white"} transition-colors`}>DOCS</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
