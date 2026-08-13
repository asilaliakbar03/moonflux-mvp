"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, Users, Flame, Star, Rocket, Circle, Activity } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import AnimatedCounter from '@/components/AnimatedCounter';
import MagneticButton from '@/components/MagneticButton';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/ToastProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

const PROPOSALS = [
  { id: 1, title: "INTEGRATE ZK-ROLLUPS FOR LAUNCHPAD", author: "0xNova", time: "2h ago", category: "Protocol", forPct: 78, forVotes: 9360, againstVotes: 2640, quorum: 12000, status: "Active", endsIn: "2d 14h" },
  { id: 2, title: "INCREASE STAKING APY BY 2%", author: "WhaleKing", time: "6h ago", category: "Economics", forPct: 52, forVotes: 5200, againstVotes: 4800, quorum: 10000, status: "Active", endsIn: "4d 3h" },
  { id: 3, title: "BURN 10% PROTOCOL REVENUE", author: "DegenDave", time: "3d ago", category: "Economics", forPct: 94, forVotes: 18800, againstVotes: 1200, quorum: 20000, status: "Passed", endsIn: "Ended" },
  { id: 4, title: "ADD MULTI-CHAIN MOBILE SUPPORT", author: "CryptoQueen", time: "1d ago", category: "Community", forPct: 61, forVotes: 7320, againstVotes: 4680, quorum: 12000, status: "Active", endsIn: "1d 8h" },
];

const INCUBATOR_PROJECTS = [
  { id: 1, emoji: "🤖", name: "NovAI", ticker: "$NOVAI", stage: "Seed", desc: "AI-POWERED TRADING PROTOCOL WITH ON-CHAIN MODEL INFERENCE.", raised: 42, goal: 100, votes: 1284, daysLeft: 18 },
  { id: 2, emoji: "🌌", name: "CosmicDAO", ticker: "$COSM", stage: "Growth", desc: "NEXT-GEN COMMUNITY GOVERNANCE FRAMEWORK WITH QUADRATIC VOTING.", raised: 78, goal: 100, votes: 3740, daysLeft: 9 },
  { id: 3, emoji: "🎮", name: "PixelVault", ticker: "$PXV", stage: "Ready", desc: "GAMING NFT PLATFORM BRIDGING WEB2 STUDIOS WITH ON-CHAIN ASSETS.", raised: 95, goal: 100, votes: 6021, daysLeft: 3 },
];

const getAsciiBar = (pct: number, length: number = 12) => {
  const filled = Math.round((pct / 100) * length);
  const empty = length - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
};

export default function VenturePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'governance' | 'incubator' | 'feed'>('governance');
  const [votedProps, setVotedProps] = useState<Record<number, 'for' | 'against'>>({});
  const [votedProjects, setVotedProjects] = useState<Record<number, boolean>>({});

  const [propTilts, setPropTilts] = useState<Record<number, {x: number, y: number}>>({});
  const [incTilts, setIncTilts] = useState<Record<number, {x: number, y: number}>>({});

  const totalVotes = useMemo(() => PROPOSALS.reduce((acc, p) => acc + p.forVotes + p.againstVotes, 0), []);
  const activeProposals = useMemo(() => PROPOSALS.filter(p => p.status === 'Active').length, []);

  const handleVoteProp = (id: number, side: 'for' | 'against') => {
    setVotedProps(prev => ({ ...prev, [id]: side }));
  };

  const handleVoteProject = (id: number) => {
    setVotedProjects(prev => ({ ...prev, [id]: true }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: number, setter: React.Dispatch<React.SetStateAction<Record<number, {x: number, y: number}>>>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setter(prev => ({ ...prev, [id]: { x: -y / 20, y: x / 20 } }));
  };

  const handleMouseLeave = (id: number, setter: React.Dispatch<React.SetStateAction<Record<number, {x: number, y: number}>>>) => {
    setter(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));
  };

  const borderClass = isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black';
  const borderHeavyClass = isDark ? 'border-4 border-[rgba(255,255,255,0.2)]' : 'border-4 border-black';
  const bgRoot = isDark ? 'bg-[#050510]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500';
  const shadowPrimary = isDark ? 'shadow-[4px_4px_0px_0px_#6366F1]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowGreen = isDark ? 'shadow-[4px_4px_0px_0px_#10B981]' : 'shadow-[4px_4px_0px_0px_#000]';
  const shadowCyan = isDark ? 'shadow-[4px_4px_0px_0px_#06B6D4]' : 'shadow-[4px_4px_0px_0px_#000]';

  return (
    <div className={`min-h-screen ${bgRoot} ${textPrimary} font-mono uppercase tracking-wider selection:bg-[#6366F1] selection:text-white`}>
      <div className="max-w-6xl mx-auto w-full pt-8 pb-24 md:pb-16 px-4 sm:px-6">
      
        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Rocket className="w-10 h-10 text-[#6366F1]" />
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-widest leading-none drop-shadow-md">
                VENTURE<br/>MODE
              </h1>
            </div>
            <p className={`font-bold text-sm sm:text-base ${isDark ? 'text-[#06B6D4]' : 'text-blue-600'}`}>
              [ SHAPE THE FUTURE. VOTE ON PROPOSALS. BACK EARLY-STAGE PROJECTS. ]
            </p>
          </div>
          
          {/* Tab Switches */}
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('governance')}
              className={`px-6 py-4 font-black text-lg ${borderHeavyClass} transition-all ${
                activeTab === 'governance'
                  ? 'bg-[#6366F1] text-white shadow-[4px_4px_0px_0px_#000]'
                  : `${isDark ? 'bg-black text-[rgba(255,255,255,0.4)]' : 'bg-gray-100 text-gray-400'} hover:bg-[#6366F1] hover:text-white`
              }`}
            >
              [ --GOVERNANCE ]
            </button>
            <button
              onClick={() => setActiveTab('incubator')}
              className={`px-6 py-4 font-black text-lg ${borderHeavyClass} transition-all ${
                activeTab === 'incubator'
                  ? 'bg-[#F59E0B] text-black shadow-[4px_4px_0px_0px_#000]'
                  : `${isDark ? 'bg-black text-[rgba(255,255,255,0.4)]' : 'bg-gray-100 text-gray-400'} hover:bg-[#F59E0B] hover:text-black`
              }`}
            >
              [ --INCUBATOR ]
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-4 font-black text-lg ${borderHeavyClass} transition-all ${
                activeTab === 'feed'
                  ? 'bg-[#10B981] text-black shadow-[4px_4px_0px_0px_#000]'
                  : `${isDark ? 'bg-black text-[rgba(255,255,255,0.4)]' : 'bg-gray-100 text-gray-400'} hover:bg-[#10B981] hover:text-black`
              }`}
            >
              [ --LIVE FEED ]
            </button>
          </div>
        </motion.div>

        {/* ── GOVERNANCE ── */}
        {activeTab === 'governance' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${borderHeavyClass} p-6 ${isDark ? 'bg-black' : 'bg-gray-50'} ${shadowPrimary}`}>
                <div className={`text-xs font-black mb-2 ${textMuted}`}>[ TOTAL VOTES CAST ]</div>
                <div className="text-4xl font-black text-[#6366F1]"><AnimatedCounter value={totalVotes} /></div>
              </div>
              <div className={`${borderHeavyClass} p-6 bg-[#6366F1] text-white ${isDark ? 'shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]' : 'shadow-[4px_4px_0px_0px_#000]'}`}>
                <div className="text-xs font-black mb-2 text-white/60">[ ACTIVE PROPOSALS ]</div>
                <div className="text-4xl font-black"><AnimatedCounter value={activeProposals} /></div>
              </div>
              <div className={`${borderHeavyClass} p-6 ${isDark ? 'bg-black' : 'bg-gray-50'} ${shadowGreen}`}>
                <div className={`text-xs font-black mb-2 ${textMuted}`}>[ TREASURY VALUE ]</div>
                <div className="text-4xl font-black text-[#10B981]"><AnimatedCounter value={4.2} prefix="$" suffix="M" decimals={1} /></div>
              </div>
            </div>

            {/* Proposals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PROPOSALS.map((prop) => (
                <div key={prop.id} 
                  onMouseMove={(e) => handleMouseMove(e, prop.id, setPropTilts)}
                  onMouseLeave={() => handleMouseLeave(prop.id, setPropTilts)}
                  style={{ transform: `perspective(800px) rotateX(${propTilts[prop.id]?.x || 0}deg) rotateY(${propTilts[prop.id]?.y || 0}deg)` }}
                  className={`p-6 flex flex-col h-full transition-all duration-300 ease-out ${borderHeavyClass} ${isDark ? 'bg-[#111] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} ${shadowPrimary} relative`}
                >
                  
                  {/* Status & Category Tags */}
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <span className={`text-xs font-black px-3 py-1 ${borderClass} ${
                      prop.status === 'Active' ? 'bg-[#6366F1] text-white' :
                      prop.status === 'Passed' ? 'bg-[#10B981] text-black' :
                      'bg-[#F43F5E] text-white'
                    }`}>
                      [ {prop.status.toUpperCase()} ]
                    </span>
                    <span className={`text-xs font-black px-3 py-1 ${borderClass} ${
                      prop.category === 'Protocol' ? 'bg-[#06B6D4] text-black' :
                      prop.category === 'Economics' ? 'bg-[#F59E0B] text-black' :
                      'bg-[#10B981] text-black'
                    }`}>
                      [ {prop.category.toUpperCase()} ]
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-xl leading-snug mb-4 tracking-wider">{prop.title}</h3>

                  {/* Meta */}
                  <div className={`flex items-center gap-4 text-xs font-black mb-6 ${textMuted}`}>
                    <span>BY {prop.author.toUpperCase()}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {prop.endsIn === 'Ended' ? '[ ENDED ]' : `[ ENDS: ${prop.endsIn} ]`}
                    </div>
                  </div>

                  {/* ASCII Progress Bar */}
                  <div className="mb-6 mt-auto">
                    <div className="flex justify-between text-sm font-black mb-3">
                      <span className="text-[#10B981]">{getAsciiBar(prop.forPct)} {prop.forPct}% FOR</span>
                      <span className="text-[#F43F5E]">{100 - prop.forPct}% AGAINST</span>
                    </div>
                    <div className={`h-4 w-full ${isDark ? 'bg-[#222]' : 'bg-gray-200'} flex overflow-hidden ${borderClass}`}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${prop.forPct}%` }} transition={{ duration: 1, ease: EASE }}
                        className="h-full bg-[#10B981]" 
                      />
                      <motion.div 
                        initial={{ width: '100%' }} animate={{ width: `${100 - prop.forPct}%` }} transition={{ duration: 1, ease: EASE }}
                        className="h-full bg-[#F43F5E]" 
                      />
                    </div>
                    <div className={`flex justify-between text-xs font-black mt-2 ${textMuted}`}>
                      <span>[ {prop.forVotes.toLocaleString()} VOTES ]</span>
                      <span>[ {prop.againstVotes.toLocaleString()} VOTES ]</span>
                    </div>
                  </div>

                  {/* Vote Actions */}
                  {prop.status === 'Active' && (
                    <div className="flex gap-4">
                      <MagneticButton as="div" strength={0.25} className="flex-1 flex">
                        <button 
                          onClick={() => handleVoteProp(prop.id, 'for')}
                          disabled={!!votedProps[prop.id]}
                          className={`w-full flex items-center justify-center gap-2 py-4 font-black text-base transition-all active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${borderClass} ${
                            votedProps[prop.id] === 'for' 
                              ? 'bg-[#10B981] text-black' 
                              : `${isDark ? 'bg-transparent text-[#10B981] hover:bg-[#10B981] hover:text-black' : 'bg-white text-green-700 hover:bg-[#10B981] hover:text-black'}`
                          }`}
                        >
                          <Check className="w-5 h-5" /> [ VOTE FOR ]
                        </button>
                      </MagneticButton>
                      <MagneticButton as="div" strength={0.25} className="flex-1 flex">
                        <button 
                          onClick={() => handleVoteProp(prop.id, 'against')}
                          disabled={!!votedProps[prop.id]}
                          className={`w-full flex items-center justify-center gap-2 py-4 font-black text-base transition-all active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${borderClass} ${
                            votedProps[prop.id] === 'against' 
                              ? 'bg-[#F43F5E] text-black' 
                              : `${isDark ? 'bg-transparent text-[#F43F5E] hover:bg-[#F43F5E] hover:text-black' : 'bg-white text-red-700 hover:bg-[#F43F5E] hover:text-black'}`
                          }`}
                        >
                          <X className="w-5 h-5" /> [ VOTE AGAINST ]
                        </button>
                      </MagneticButton>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── INCUBATOR ── */}
        {activeTab === 'incubator' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
            
            {/* Hero Banner */}
            <div className={`${borderHeavyClass} p-8 sm:p-10 bg-[#6366F1] text-white relative overflow-hidden ${isDark ? 'shadow-[6px_6px_0px_0px_#F59E0B]' : 'shadow-[6px_6px_0px_0px_#000]'}`}>
              <div className="absolute top-3 right-3 text-xs font-black bg-[#F59E0B] text-black px-3 py-1 border-2 border-black">
                [ LIVE ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-widest">BACK EARLY STAGE PROJECTS</h2>
              <p className="font-bold text-white/70 max-w-2xl mb-8 text-sm sm:text-base normal-case">
                VOTE FOR THE NEXT BIG PROTOCOL ACROSS CHAINS. PROJECTS THAT REACH 100% FUNDING GOAL RECEIVE A MOONFLUXX ECOSYSTEM GRANT AND AUTOMATIC LISTING.
              </p>
              <button 
                onClick={() => showToast('Applications opening soon — stay tuned!', 'info')} 
                className={`bg-[#F59E0B] text-black font-black text-lg px-8 py-4 ${borderClass} hover:bg-white transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]`}
              >
                [ APPLY FOR INCUBATION ]
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {INCUBATOR_PROJECTS.map((proj) => (
                <div key={proj.id} 
                  onMouseMove={(e) => handleMouseMove(e, proj.id, setIncTilts)}
                  onMouseLeave={() => handleMouseLeave(proj.id, setIncTilts)}
                  style={{ transform: `perspective(800px) rotateX(${incTilts[proj.id]?.x || 0}deg) rotateY(${incTilts[proj.id]?.y || 0}deg)` }}
                  className={`p-6 flex flex-col h-full transition-all duration-300 ease-out ${borderHeavyClass} ${isDark ? 'bg-[#111] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'} ${shadowCyan} relative`}
                >
                  
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl ${borderClass} p-3 ${isDark ? 'bg-black' : 'bg-gray-100'} leading-none`}>{proj.emoji}</div>
                      <div>
                        <h3 className="font-black text-xl tracking-wider">{proj.name}</h3>
                        <div className="text-[#6366F1] font-black text-sm">{proj.ticker}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 ${borderClass} ${
                      proj.stage === 'Ready' ? 'bg-[#10B981] text-black' : 
                      proj.stage === 'Growth' ? 'bg-[#6366F1] text-white' : 
                      'bg-[#F59E0B] text-black'
                    }`}>
                      [ {proj.stage.toUpperCase()} ]
                    </span>
                  </div>

                  {/* Description */}
                  <p className={`font-bold text-sm mb-6 flex-1 ${textMuted}`}>{proj.desc}</p>

                  {/* Funding Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-black mb-3">
                      <span className="text-[#6366F1]">{getAsciiBar(proj.raised)} {proj.raised}%</span>
                      <span className={`${textMuted}`}>[ {proj.daysLeft}D LEFT ]</span>
                    </div>
                    <div className={`h-4 w-full ${isDark ? 'bg-[#222]' : 'bg-gray-200'} overflow-hidden ${borderClass}`}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${proj.raised}%` }} 
                        transition={{ duration: 1.2, ease: EASE }}
                        className="h-full bg-[#6366F1] relative"
                      />
                    </div>
                    <div className={`text-xs font-black mt-2 ${textMuted}`}>
                      [ {proj.votes.toLocaleString()} BACKERS ]
                    </div>
                  </div>

                  {/* Back Button */}
                  <button 
                    onClick={() => handleVoteProject(proj.id)}
                    disabled={!!votedProjects[proj.id]}
                    className={`w-full py-4 font-black text-lg transition-all flex items-center justify-center gap-3 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${borderClass} ${
                      votedProjects[proj.id] 
                        ? `${isDark ? 'bg-[#222] text-[#6366F1]' : 'bg-gray-200 text-indigo-600'}` 
                        : 'bg-[#F59E0B] text-black hover:bg-white'
                    } ${isDark ? 'shadow-[4px_4px_0px_0px_#6366F1]' : 'shadow-[4px_4px_0px_0px_#000]'}`}
                  >
                    <Flame className="w-5 h-5" />
                    [ {votedProjects[proj.id] ? 'BACKED!' : 'BACK PROJECT'} ]
                  </button>

                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── LIVE FEED ── */}
        {activeTab === 'feed' && (
          <FeedTab isDark={isDark} borderClass={borderClass} shadowPrimary={shadowPrimary} textMuted={textMuted} borderHeavyClass={borderHeavyClass} />
        )}

      </div>
    </div>
  );
}

function FeedTab({ isDark, borderClass, shadowPrimary, textMuted, borderHeavyClass }: { isDark: boolean; borderClass: string; shadowPrimary: string; textMuted: string; borderHeavyClass: string }) {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        // Fetch recent tokens
        const tokensRes = await fetch('/api/explore-tokens?limit=10');
        const tokensData = tokensRes.ok ? await tokensRes.json() : { tokens: [] };
        
        // Build feed items from tokens (launches)
        const launches = (tokensData.tokens || []).map((t: any) => ({
          type: 'launch',
          icon: '🚀',
          title: `${t.name} ($${t.ticker}) LAUNCHED`,
          detail: t.description?.slice(0, 60) || 'New token on MoonFluxx',
          time: t.created_at ? new Date(t.created_at).toLocaleString() : '',
          color: '#10B981',
          mint: t.mint_address,
        }));

        setFeedItems(launches.length > 0 ? launches : [
          { type: 'launch', icon: '🚀', title: 'MOONFLUX PLATFORM LIVE', detail: 'The future of fair-launch tokens', time: 'NOW', color: '#10B981' },
          { type: 'system', icon: '⚡', title: 'BONDING CURVES ACTIVE', detail: 'Real on-chain trading is live', time: 'NOW', color: '#6366F1' },
          { type: 'system', icon: '💬', title: 'DISCUSSIONS ENABLED', detail: 'Comment on any token page', time: 'NOW', color: '#F59E0B' },
        ]);
      } catch {
        setFeedItems([
          { type: 'system', icon: '⚡', title: 'PLATFORM ONLINE', detail: 'Connect wallet to participate', time: 'NOW', color: '#6366F1' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
      <div className={`${borderHeavyClass} p-6 ${isDark ? 'bg-black' : 'bg-gray-50'} ${shadowPrimary}`}>
        <div className="flex items-center gap-3 mb-1">
          <Activity className="w-5 h-5 text-[#10B981]" />
          <span className="text-xs font-black tracking-widest" style={{ color: '#10B981' }}>// PLATFORM ACTIVITY</span>
        </div>
        <div className={`text-xs ${textMuted} font-bold`}>REAL-TIME FEED OF LAUNCHES, TRADES, AND COMMUNITY ACTIVITY</div>
      </div>

      {loading ? (
        <div className={`${borderHeavyClass} p-12 text-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <div className={`text-sm font-black ${textMuted} animate-pulse`}>LOADING FEED...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${borderClass} p-5 ${isDark ? 'bg-[#0A0A1A]' : 'bg-white'} ${shadowPrimary} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-black text-sm" style={{ color: item.color }}>{item.title}</span>
                    <span className={`text-[10px] font-bold shrink-0 ${textMuted}`}>{item.time}</span>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${textMuted}`}>{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
