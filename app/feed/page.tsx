'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, Bot, Send, Terminal, MessageSquare, Repeat2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { LineChart, Line, ResponsiveContainer } from "recharts";

const EASE = [0.16, 1, 0.3, 1] as const;

// Helper to convert array of numbers into recharts object format
const formatSparkline = (data: number[]) => data.map((val, i) => ({ x: i, y: val }));

// Helper to generate unique meme/crypto character images
const getMemeImage = (ticker: string) => {
  const sets = ['set1', 'set2', 'set3', 'set4'];
  const set = sets[ticker.length % 4];
  return `https://robohash.org/${ticker.toLowerCase()}?set=${set}&bgset=bg1&size=400x400`;
};

const MOCK_FEED = [
  {
    id: 'msg_1',
    author: 'WHALE_ALERT_BOT',
    handle: '@whale_alert',
    time: '2M AGO',
    tag: '🚨 WHALE ALERT',
    content: 'MASSIVE INSIDER ACCUMULATION DETECTED ON $SWRM. MULTIPLE NEW WALLETS FUNDED FROM BINANCE SWEEPING THE FLOOR.',
    token: { id:'tok_ai_swarm', name:'AI Swarm', ticker:'SWRM', price:0.00671, change24h:211.4, marketCap:2300000, progress:85, sparkline:[5,8,12,15,14,18,25,32,28,40,55,70,90,85,110] },
    stats: { likes: 142, replies: 28, retweets: 56 }
  },
  {
    id: 'msg_2',
    author: 'CYBER_DEGEN',
    handle: '@cyberdegen',
    time: '15M AGO',
    tag: '🚀 BULLISH CALL',
    content: 'JUST APED 50 SOL INTO $LDOGE. THE BONDING CURVE IS MELTING FACES. LFG!!!',
    token: { id:'tok_luna_doge', name:'Luna Doge', ticker:'LDOGE', price:0.00234, change24h:142.5, marketCap:1870000, progress:73, sparkline:[8,12,19,25,31,44,52,71,65,89,95,120,110,140] },
    stats: { likes: 89, replies: 12, retweets: 5 }
  },
  {
    id: 'msg_3',
    author: 'AI_AUDITOR',
    handle: '@ai_auditor',
    time: '1H AGO',
    tag: '🤖 AI AUDIT',
    content: 'SMART CONTRACT AUDIT COMPLETE FOR $NVFX. 100% SAFE. LIQUIDITY BURNED. MINT REVOKED. SEND IT HIGHER.',
    token: { id:'tok_nova_flux', name:'NovaFlux', ticker:'NVFX', price:0.0445, change24h:67.8, marketCap:8900000, progress:100, sparkline:[30,35,38,42,48,52,58,65,70,68,75,80,90,95,100] },
    stats: { likes: 312, replies: 45, retweets: 120 }
  },
  {
    id: 'msg_4',
    author: 'MEME_DISCOVERER',
    handle: '@meme_sniper',
    time: '4H AGO',
    tag: '💎 MEME DISCOVERY',
    content: 'NEW LAUNCH $PCAT LOOKS PROMISING. DEVS ARE DOING A LIVE STREAM RIGHT NOW.',
    token: { id:'tok_pixel_cat', name:'PixelCat', ticker:'PCAT', price:0.00329, change24h:-5.4, marketCap:1100000, progress:31, sparkline:[50,48,45,46,44,42,40,41,39,37,35,33,34,32] },
    stats: { likes: 45, replies: 8, retweets: 2 }
  }
];

export default function FeedPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeFilter, setActiveFilter] = useState('ALL BROADCASTS');
  const [broadcastText, setBroadcastText] = useState('');

  const filters = [
    'ALL BROADCASTS',
    '🚀 BULLISH CALLS',
    '🚨 WHALE ALERTS',
    '🤖 AI INSIGHTS'
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
    <div className="w-full min-h-screen font-mono pb-24 overflow-x-hidden">
      
      {/* ── LIVE MARQUEE TICKER ──────────────────────────────────────────────── */}
      <div className={`w-full overflow-hidden border-b ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#10B981]/20 text-[#10B981]" : "border-black bg-[#10B981] text-black"}`}>
        <div className="flex whitespace-nowrap py-1.5 animate-marquee text-xs font-black tracking-widest uppercase">
           {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4">
                {`> BROADCAST NODE #04 // LIVE ALPHA STREAM // 89% EXTREME GREED SENTIMENT // SYNCED TO SOLANA MAINNET // `}
              </span>
           ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 flex flex-col lg:flex-row gap-6">
        
        {/* ── LEFT: FEED & BROADCAST COMPOSER ───────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* BROADCAST COMPOSER */}
          <div className={`${bBorder} ${bShadow} ${bBg} p-4 flex flex-col gap-4`}>
            <div className={`flex items-center gap-2 font-black uppercase text-xs tracking-widest ${isDark ? "text-[#10B981]" : "text-black"}`}>
              <Terminal className="w-4 h-4" /> BROADCAST_ALPHA.EXE
            </div>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="> TYPE YOUR ALPHA / CALLOUT HERE..."
              className={`w-full h-24 bg-transparent outline-none font-bold uppercase resize-none ${bText} placeholder:text-gray-500`}
            />
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t ${isDark ? "border-[rgba(255,255,255,0.2)]" : "border-black"}`}>
              <div className="flex items-center gap-2">
                <button className={`px-2 py-1 text-[10px] font-black uppercase ${bBorder} hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors`}>[ $TAG_TOKEN ]</button>
                <button className={`px-2 py-1 text-[10px] font-black uppercase ${bBorder} hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors`}>[ 🚀 CALLOUT ]</button>
              </div>
              <button className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase transition-all ${bBorder} ${isDark ? "bg-[#10B981] text-black" : "bg-black text-white"} ${bHoverShadow}`}>
                <Send className="w-4 h-4" /> [ ⚡ PUBLISH BROADCAST ]
              </button>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap gap-2 mb-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-2 text-xs font-black uppercase transition-all ${bBorder} ${
                  activeFilter === f
                    ? isDark ? "bg-[#F59E0B] text-black shadow-[4px_4px_0px_0px_#10B981] translate-x-[-2px] translate-y-[-2px]" : "bg-black text-white shadow-[4px_4px_0px_0px_#10B981] translate-x-[-2px] translate-y-[-2px]"
                    : `${bBg} ${bText} ${bHoverShadow}`
                }`}
              >
                [ {f} ]
              </button>
            ))}
          </div>

          {/* THE FEED */}
          <div className="flex flex-col gap-6 pb-12">
            {MOCK_FEED.map((post, i) => {
              const isPos = post.token.change24h >= 0;
              const sparkColor = isPos ? "#10B981" : "#F43F5E";
              
              let tagColor = "bg-gray-200 text-black";
              if (post.tag.includes('BULLISH')) tagColor = isDark ? "bg-[#10B981] text-black border-[#10B981]" : "bg-[#10B981] text-black";
              if (post.tag.includes('WHALE')) tagColor = isDark ? "bg-[#F43F5E] text-white border-[#F43F5E]" : "bg-[#F43F5E] text-white";
              if (post.tag.includes('AI')) tagColor = isDark ? "bg-[#6366F1] text-white border-[#6366F1]" : "bg-[#6366F1] text-white";
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, ease: EASE }}
                  className={`flex flex-col ${bBorder} ${bShadow} ${bBg}`}
                >
                  {/* Post Header */}
                  <div className={`p-4 flex items-center justify-between border-b ${isDark ? "border-[rgba(255,255,255,0.2)]" : "border-black"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 border ${isDark ? "border-[rgba(255,255,255,0.2)] bg-black" : "border-black bg-gray-200"} relative`}>
                        <img src={getMemeImage(post.handle)} alt={post.author} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] border border-black rounded-full shadow-[1px_1px_0px_0px_#000]" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black uppercase text-sm ${bText}`}>{post.author}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                          <span className={bMuted}>{post.handle}</span>
                          <span className={bMuted}>·</span>
                          <span className={isDark ? "text-[#10B981]" : "text-[#10B981]"}>{post.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-[9px] font-black uppercase border border-black ${tagColor} shadow-[2px_2px_0px_0px_#000]`}>
                      [{post.tag}]
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 flex flex-col gap-4">
                    <p className={`font-bold text-sm leading-relaxed uppercase ${bText}`}>
                      {post.content.split(' ').map((word, wIdx) => {
                        if (word.startsWith('$')) {
                          return <span key={wIdx} className={`inline-block px-1 mx-0.5 ${isDark ? "bg-[#10B981]/20 text-[#10B981]" : "bg-black text-white"}`}>{word}</span>;
                        }
                        return word + ' ';
                      })}
                    </p>
                    
                    {/* Embedded Token Card */}
                    <Link href={`/token/${post.token.id}`} className={`flex border ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#1A1A2E]" : "border-black bg-gray-50"} hover:bg-gray-100 dark:hover:bg-[#151525] transition-colors cursor-pointer group`}>
                      <div className={`w-24 h-24 sm:w-32 sm:h-32 border-r ${isDark ? "border-[rgba(255,255,255,0.2)]" : "border-black"} shrink-0 relative`}>
                        <img src={getMemeImage(post.token.ticker)} alt={post.token.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-70">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formatSparkline(post.token.sparkline)}>
                              <Line type="monotone" dataKey="y" stroke={sparkColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h4 className={`font-black text-sm uppercase truncate ${bText}`}>{post.token.name} <span className={bMuted}>${post.token.ticker}</span></h4>
                          <div className={`text-[10px] font-black px-1 border inline-block mt-1 ${isDark ? "border-[rgba(255,255,255,0.2)] text-white" : "border-black text-black bg-gray-200"}`}>
                            ${formatCompact(post.token.marketCap)} MC
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-gray-500">Curve Progress</span>
                            <span className={`text-[10px] font-black uppercase ${isDark ? "text-[#10B981]" : "text-black"}`}>[{post.token.progress}%]</span>
                          </div>
                          <div className={`px-2 py-1 text-[9px] font-black uppercase border ${isPos ? (isDark ? "border-[#10B981] text-[#10B981]" : "border-black bg-[#10B981] text-black") : (isDark ? "border-[#F43F5E] text-[#F43F5E]" : "border-black bg-[#F43F5E] text-white")}`}>
                            {isPos ? "+" : ""}{post.token.change24h}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Action Bar */}
                  <div className={`flex flex-wrap items-center gap-2 p-2 sm:p-4 border-t ${isDark ? "border-[rgba(255,255,255,0.2)] bg-[#050510]" : "border-black bg-white"}`}>
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase ${bBorder} ${bHoverShadow} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                      <Flame className="w-3 h-3 text-[#F59E0B]" /> [ {post.stats.likes} LFG ]
                    </button>
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase ${bBorder} ${bHoverShadow} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                      <MessageSquare className="w-3 h-3" /> [ {post.stats.replies} REPLIES ]
                    </button>
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase ${bBorder} ${bHoverShadow} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                      <Repeat2 className="w-3 h-3 text-[#10B981]" /> [ {post.stats.retweets} RE-BROADCAST ]
                    </button>
                    <button className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase ${bBorder} ${bHoverShadow} ${isDark ? "bg-[#10B981] text-black" : "bg-[#10B981] text-black"} transition-all`}>
                      <Zap className="w-3 h-3" /> [ TIP 0.05 SOL ]
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR BENTO ────────────────────────────────────────────── */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Sentiment Radar */}
          <div className={`${bBorder} ${bShadow} ${bBg} p-4`}>
            <h3 className={`text-sm font-black uppercase mb-4 ${bText}`}>[ 📡 SENTIMENT RADAR ]</h3>
            <div className={`font-mono text-xs font-bold leading-relaxed ${isDark ? "text-[#10B981]" : "text-black"}`}>
              STATUS: EXTREME GREED<br/>
              BULL/BEAR RATIO: 8.4<br/>
              VOLUME: SURGING (+42%)
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase ${bMuted}`}>[████████░░] 89% GREED</span>
              <div className={`h-2 border ${isDark ? "border-[rgba(255,255,255,0.2)] bg-black" : "border-black bg-gray-200"}`}>
                <div className="h-full bg-[#10B981] w-[89%]" />
              </div>
            </div>
          </div>

          {/* Top Callers */}
          <div className={`${bBorder} ${bShadow} ${bBg} p-4`}>
            <h3 className={`text-sm font-black uppercase mb-4 ${bText}`}>[ 🔥 TOP CALLERS ]</h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'SOL_WHALE', win: '92%' },
                { name: 'DEGEN_KING', win: '88%' },
                { name: 'AI_AUDITOR', win: '95%' }
              ].map((c, idx) => (
                <div key={idx} className={`flex items-center justify-between pb-3 border-b ${idx === 2 ? 'border-transparent pb-0' : isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-gray-500">0{idx+1}</span>
                    <span className={`font-bold text-xs uppercase ${bText}`}>@{c.name}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-1 border ${isDark ? "border-[#10B981] text-[#10B981]" : "border-black bg-[#10B981] text-black"}`}>
                    {c.win} WIN
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Tickers */}
          <div className={`${bBorder} ${bShadow} ${bBg} p-4`}>
            <h3 className={`text-sm font-black uppercase mb-4 ${bText}`}>[ 📈 HOT TICKERS ]</h3>
            <div className="flex flex-wrap gap-2">
              {['$SWRM', '$LDOGE', '$NVFX', '$PCAT', '$CPEP'].map((t, idx) => (
                <span key={idx} className={`px-2 py-1 text-[10px] font-black uppercase border ${isDark ? "border-[rgba(255,255,255,0.2)] hover:bg-[#10B981] hover:text-black hover:border-[#10B981]" : "border-black hover:bg-black hover:text-white"} cursor-pointer transition-colors`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
