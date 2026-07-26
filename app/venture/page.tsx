"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, Users, Flame, Star, Rocket, Circle } from "lucide-react";
import { useState, useMemo } from "react";
import AnimatedCounter from '@/components/AnimatedCounter';
import MagneticButton from '@/components/MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;

const PROPOSALS = [
  { id: 1, title: "Integrate ZK-Rollups for Launchpad", author: "0xNova", time: "2h ago", category: "Protocol", forPct: 78, forVotes: 9360, againstVotes: 2640, quorum: 12000, status: "Active", endsIn: "2d 14h" },
  { id: 2, title: "Increase Staking APY by 2%", author: "WhaleKing", time: "6h ago", category: "Economics", forPct: 52, forVotes: 5200, againstVotes: 4800, quorum: 10000, status: "Active", endsIn: "4d 3h" },
  { id: 3, title: "Burn 10% Protocol Revenue", author: "DegenDave", time: "3d ago", category: "Economics", forPct: 94, forVotes: 18800, againstVotes: 1200, quorum: 20000, status: "Passed", endsIn: "Ended" },
  { id: 4, title: "Add Multi-Chain Mobile Support", author: "CryptoQueen", time: "1d ago", category: "Community", forPct: 61, forVotes: 7320, againstVotes: 4680, quorum: 12000, status: "Active", endsIn: "1d 8h" },
];

const INCUBATOR_PROJECTS = [
  { id: 1, emoji: "🤖", name: "NovAI", ticker: "$NOVAI", stage: "Seed", desc: "AI-powered trading protocol with on-chain model inference.", raised: 42, goal: 100, votes: 1284, daysLeft: 18 },
  { id: 2, emoji: "🌌", name: "CosmicDAO", ticker: "$COSM", stage: "Growth", desc: "Next-gen community governance framework with quadratic voting.", raised: 78, goal: 100, votes: 3740, daysLeft: 9 },
  { id: 3, emoji: "🎮", name: "PixelVault", ticker: "$PXV", stage: "Ready", desc: "Gaming NFT platform bridging Web2 studios with on-chain assets.", raised: 95, goal: 100, votes: 6021, daysLeft: 3 },
];

export default function VenturePage() {
  const [activeTab, setActiveTab] = useState<'governance' | 'incubator'>('governance');
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

  return (
    <div className="max-w-5xl mx-auto w-full pt-8 pb-16">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold font-display text-white mb-2 flex items-center justify-center md:justify-start gap-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
            <Rocket className="w-8 h-8 text-[#6366F1]" />
            Venture Mode
          </h1>
          <p className="text-[#94A3B8]">Shape the future of MoonFluxx. Vote on proposals and back early-stage projects.</p>
        </div>
        
        <div className="flex p-1 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.25)]">
          <MagneticButton
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'governance'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Governance
          </MagneticButton>
          <MagneticButton
            onClick={() => setActiveTab('incubator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'incubator'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Incubator
          </MagneticButton>
        </div>
      </motion.div>

      {/* ── GOVERNANCE ── */}
      {activeTab === 'governance' && (
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-5 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.05)]">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Total Votes Cast</div>
              <div className="text-3xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"><AnimatedCounter value={totalVotes} /></div>
            </div>
            <div className="p-5 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.05)]">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Active Proposals</div>
              <div className="text-3xl font-mono font-bold text-[#6366F1] drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]"><AnimatedCounter value={activeProposals} /></div>
            </div>
            <div className="p-5 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.05)]">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Treasury Value</div>
              <div className="text-3xl font-mono font-bold text-[#10B981] drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]"><AnimatedCounter value={4.2} prefix="$" suffix="M" decimals={1} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROPOSALS.map((prop) => (
              <div key={prop.id} 
                onMouseMove={(e) => handleMouseMove(e, prop.id, setPropTilts)}
                onMouseLeave={() => handleMouseLeave(prop.id, setPropTilts)}
                style={{ transform: `perspective(800px) rotateX(${propTilts[prop.id]?.x || 0}deg) rotateY(${propTilts[prop.id]?.y || 0}deg)` }}
                className="p-6 flex flex-col h-full transition-all duration-300 ease-out bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl hover:border-[rgba(99,102,241,0.30)] hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]"
              >
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                        prop.status === 'Active' ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] border-[rgba(99,102,241,0.15)] shadow-[0_0_10px_rgba(99,102,241,0.2)]' :
                        prop.status === 'Passed' ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[rgba(16,185,129,0.15)] shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                        'bg-[rgba(244,63,94,0.15)] text-[#F43F5E] border-[rgba(244,63,94,0.15)] shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                      }`}>
                        {prop.status}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                        prop.category === 'Protocol' ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] border-[rgba(99,102,241,0.15)]' :
                        prop.category === 'Economics' ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[rgba(245,158,11,0.15)]' :
                        'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[rgba(16,185,129,0.15)]'
                      }`}>
                        {prop.category}
                      </span>
                    </div>
                    <h3 className="display-safe text-xl font-bold text-white leading-snug drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{prop.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#475569] mb-6">
                  <span>by {prop.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {prop.endsIn === 'Ended' ? 'Ended' : `Ends in ${prop.endsIn}`}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6 mt-auto">
                  <div className="flex justify-between text-sm font-bold font-mono mb-2">
                    <span className="text-[#10B981] drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">{prop.forPct}% FOR</span>
                    <span className="text-[#F43F5E] drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]">{100 - prop.forPct}% AGAINST</span>
                  </div>
                  <div className="h-2 w-full bg-[#000000]/60 rounded-full overflow-hidden flex border border-[rgba(255,255,255,0.05)]">
                    <div className="h-full transition-all duration-700 ease-out bg-[rgba(16,185,129,0.8)] shadow-[2px_0_8px_rgba(16,185,129,0.6)]" style={{ width: `${prop.forPct}%` }} />
                    <div className="h-full transition-all duration-700 ease-out bg-[rgba(244,63,94,0.8)] shadow-[-2px_0_8px_rgba(244,63,94,0.6)]" style={{ width: `${100 - prop.forPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#475569] mt-2">
                    <span>{prop.forVotes.toLocaleString()} votes</span>
                    <span>{prop.againstVotes.toLocaleString()} votes</span>
                  </div>
                </div>

                {/* Actions */}
                {prop.status === 'Active' && (
                  <div className="flex gap-3">
                    <MagneticButton as="div" strength={0.25} className="flex-1 flex">
                      <button 
                        onClick={() => handleVoteProp(prop.id, 'for')}
                        disabled={!!votedProps[prop.id]}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none border ${
                          votedProps[prop.id] === 'for' 
                            ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                            : 'bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 hover:from-[#10B981]/20 hover:to-[#059669]/20 border-[rgba(16,185,129,0.3)] text-[#10B981]'
                        }`}
                      >
                        <Check className="w-4 h-4" /> Vote For
                      </button>
                    </MagneticButton>
                    <MagneticButton as="div" strength={0.25} className="flex-1 flex">
                      <button 
                        onClick={() => handleVoteProp(prop.id, 'against')}
                        disabled={!!votedProps[prop.id]}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none border ${
                          votedProps[prop.id] === 'against' 
                            ? 'bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white border-transparent shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                            : 'bg-gradient-to-r from-[#F43F5E]/10 to-[#E11D48]/10 hover:from-[#F43F5E]/20 hover:to-[#E11D48]/20 border-[rgba(244,63,94,0.3)] text-[#F43F5E]'
                        }`}
                      >
                        <X className="w-4 h-4" /> Vote Against
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
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} className="flex flex-col gap-6">
          
          <div className="p-8 bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl flex flex-col items-center text-center mb-4 relative overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.8),transparent_60%)]" />
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Back Early Stage Projects</h2>
            <p className="text-[#94A3B8] max-w-xl mb-6 relative z-10">Vote for the next big protocol across chains. Projects that reach 100% funding goal receive a MoonFluxx ecosystem grant and automatic listing.</p>
            <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] rounded-lg font-bold px-6 py-2 transition-all relative z-10 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">Apply for Incubation</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {INCUBATOR_PROJECTS.map((proj) => (
              <div key={proj.id} 
                onMouseMove={(e) => handleMouseMove(e, proj.id, setIncTilts)}
                onMouseLeave={() => handleMouseLeave(proj.id, setIncTilts)}
                style={{ transform: `perspective(800px) rotateX(${incTilts[proj.id]?.x || 0}deg) rotateY(${incTilts[proj.id]?.y || 0}deg)` }}
                className="p-6 flex flex-col h-full transition-all duration-300 ease-out bg-[rgba(5,5,16,0.80)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl hover:border-[rgba(99,102,241,0.30)] hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]"
              >
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{proj.emoji}</div>
                    <div>
                      <h3 className="display-safe text-lg font-bold text-white">{proj.name}</h3>
                      <div className="text-[#6366F1] font-mono text-xs">{proj.ticker}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1.5 border backdrop-blur-md ${
                    proj.stage === 'Ready' ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.15)] shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                    proj.stage === 'Growth' ? 'text-[#818CF8] bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.15)] shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 
                    'text-[#F59E0B] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.15)] shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  }`}>
                    <Circle className="w-1.5 h-1.5 fill-current" />
                    {proj.stage}
                  </span>
                </div>

                <p className="text-[#94A3B8] text-sm mb-6 flex-1">{proj.desc}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-mono font-bold text-white mb-2">
                    <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{proj.raised}% Funded</span>
                    <span className="text-[#475569]">{proj.daysLeft} days left</span>
                  </div>
                  <div className="h-2 w-full bg-[#000000]/60 rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                    <div className="h-full relative w-full transition-all duration-700 ease-out" style={{ width: `${proj.raised}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#818CF8]" />
                      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,1)_50%,rgba(255,255,255,1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripe_1s_linear_infinite]" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleVoteProject(proj.id)}
                  disabled={!!votedProjects[proj.id]}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none ${
                    votedProjects[proj.id] 
                      ? 'bg-[rgba(99,102,241,0.2)] text-[#818CF8] border border-[rgba(99,102,241,0.3)]' 
                      : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  {votedProjects[proj.id] ? 'Backed!' : 'Back Project'}
                </button>

              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}
