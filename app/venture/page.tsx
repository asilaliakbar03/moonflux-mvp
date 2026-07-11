"use client";

import { motion } from "framer-motion";
import { Check, X, Clock, Users, Flame, Star, Rocket } from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const PROPOSALS = [
  { id: 1, title: "Integrate ZK-Rollups for Launchpad", author: "0xNova", time: "2h ago", category: "Protocol", forPct: 78, forVotes: 9360, againstVotes: 2640, quorum: 12000, status: "Active", endsIn: "2d 14h" },
  { id: 2, title: "Increase Staking APY by 2%", author: "WhaleKing", time: "6h ago", category: "Economics", forPct: 52, forVotes: 5200, againstVotes: 4800, quorum: 10000, status: "Active", endsIn: "4d 3h" },
  { id: 3, title: "Burn 10% Protocol Revenue", author: "DegenDave", time: "3d ago", category: "Economics", forPct: 94, forVotes: 18800, againstVotes: 1200, quorum: 20000, status: "Passed", endsIn: "Ended" },
  { id: 4, title: "Add Solana Mobile Support", author: "CryptoQueen", time: "1d ago", category: "Community", forPct: 61, forVotes: 7320, againstVotes: 4680, quorum: 12000, status: "Active", endsIn: "1d 8h" },
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

  const handleVoteProp = (id: number, side: 'for' | 'against') => {
    setVotedProps(prev => ({ ...prev, [id]: side }));
  };

  const handleVoteProject = (id: number) => {
    setVotedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto w-full pt-8 pb-16">
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold font-display text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <Rocket className="w-8 h-8 text-[#818CF8]" />
            Venture Mode
          </h1>
          <p className="text-[#94A3B8]">Shape the future of MoonFluxx. Vote on proposals and back early-stage projects.</p>
        </div>
        
        <div className="flex p-1 bg-[#161B27] border border-[rgba(99,102,241,0.15)] rounded-xl">
          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'governance'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Governance
          </button>
          <button
            onClick={() => setActiveTab('incubator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'incubator'
                ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8]' 
                : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            Incubator
          </button>
        </div>
      </motion.div>

      {/* ── GOVERNANCE ── */}
      {activeTab === 'governance' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="surface-card p-5">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Total Votes Cast</div>
              <div className="text-3xl font-mono font-bold text-white">124,592</div>
            </div>
            <div className="surface-card p-5">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Active Proposals</div>
              <div className="text-3xl font-mono font-bold text-[#818CF8]">12</div>
            </div>
            <div className="surface-card p-5">
              <div className="text-[#94A3B8] text-sm font-semibold mb-1">Treasury Value</div>
              <div className="text-3xl font-mono font-bold text-[#10B981]">$4.2M</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PROPOSALS.map((prop) => (
              <div key={prop.id} className="surface-card p-6 flex flex-col h-full border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.3)] transition-colors">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${prop.status === 'Active' ? 'border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[#818CF8]' : prop.status === 'Passed' ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[#10B981]' : 'border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.1)] text-[#F43F5E]'}`}>
                        {prop.status}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8]">
                        {prop.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-snug">{prop.title}</h3>
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
                    <span className="text-[#10B981]">{prop.forPct}% FOR</span>
                    <span className="text-[#F43F5E]">{100 - prop.forPct}% AGAINST</span>
                  </div>
                  <div className="h-2 w-full bg-[rgba(244,63,94,0.2)] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#10B981]" style={{ width: `${prop.forPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#475569] mt-2">
                    <span>{prop.forVotes.toLocaleString()} votes</span>
                    <span>{prop.againstVotes.toLocaleString()} votes</span>
                  </div>
                </div>

                {/* Actions */}
                {prop.status === 'Active' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleVoteProp(prop.id, 'for')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors border ${votedProps[prop.id] === 'for' ? 'bg-[rgba(16,185,129,0.15)] border-[#10B981] text-[#10B981]' : 'border-[rgba(16,185,129,0.3)] bg-transparent text-[#10B981] hover:bg-[rgba(16,185,129,0.05)]'}`}
                    >
                      <Check className="w-4 h-4" /> Vote For
                    </button>
                    <button 
                      onClick={() => handleVoteProp(prop.id, 'against')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors border ${votedProps[prop.id] === 'against' ? 'bg-[rgba(244,63,94,0.15)] border-[#F43F5E] text-[#F43F5E]' : 'border-[rgba(244,63,94,0.3)] bg-transparent text-[#F43F5E] hover:bg-[rgba(244,63,94,0.05)]'}`}
                    >
                      <X className="w-4 h-4" /> Vote Against
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── INCUBATOR ── */}
      {activeTab === 'incubator' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
          
          <div className="surface-card p-8 border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.02)] flex flex-col items-center text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">Back Early Stage Projects</h2>
            <p className="text-[#94A3B8] max-w-xl mb-6">Vote for the next big protocol on Solana. Projects that reach 100% funding goal receive a MoonFluxx ecosystem grant and automatic listing.</p>
            <button className="btn-primary">Apply for Incubation</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {INCUBATOR_PROJECTS.map((proj) => (
              <div key={proj.id} className="surface-card p-6 flex flex-col h-full border border-[rgba(99,102,241,0.1)] hover:border-[rgba(99,102,241,0.3)] transition-colors">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{proj.emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                      <div className="text-[#818CF8] font-mono text-xs">{proj.ticker}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${proj.stage === 'Ready' ? 'border-[rgba(16,185,129,0.3)] text-[#10B981]' : proj.stage === 'Growth' ? 'border-[rgba(99,102,241,0.3)] text-[#818CF8]' : 'border-[rgba(245,158,11,0.3)] text-[#F59E0B]'}`}>
                    {proj.stage}
                  </span>
                </div>

                <p className="text-[#94A3B8] text-sm mb-6 flex-1">{proj.desc}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-mono font-bold text-white mb-2">
                    <span>{proj.raised}% Funded</span>
                    <span className="text-[#475569]">{proj.daysLeft} days left</span>
                  </div>
                  <div className="h-2 w-full bg-[#161B27] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366F1]" style={{ width: `${proj.raised}%` }} />
                  </div>
                </div>

                <button 
                  onClick={() => handleVoteProject(proj.id)}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${votedProjects[proj.id] ? 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] border border-[rgba(99,102,241,0.3)]' : 'bg-[#161B27] text-white hover:bg-[#1E2433] border border-transparent'}`}
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
