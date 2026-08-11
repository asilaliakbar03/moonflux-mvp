'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/ToastProvider';
import { ShieldAlert, User, Droplets, Target, Activity, Share2, Search } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'founder' | 'whale' | 'project' | 'community';
  score: number;
  wallet: string;
  metadata: {
    projectsLaunched: number;
    followers: number;
  };
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

export default function ReputationGraphPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'founder' | 'whale' | 'project' | 'community'>('all');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const borderClass = `border-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'}`;
  const textClass = isDark ? 'text-white' : 'text-black';
  const bgClass = isDark ? 'bg-[#050510]' : 'bg-white';
  const shadowClass = isDark ? 'shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]' : 'shadow-[4px_4px_0px_0px_#000]';

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/reputation');
        if (!res.ok) throw new Error('Failed to fetch graph data');
        const data = await res.json();
        setNodes(data.nodes);
        setEdges(data.edges);
      } catch (error) {
        showToast('Error loading graph data', 'error');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [showToast]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'founder': return '#F59E0B'; // Gold
      case 'whale': return '#0EA5E9'; // Blue
      case 'project': return '#10B981'; // Green
      case 'community': return '#6366F1'; // Purple
      default: return '#9CA3AF';
    }
  };

  const filteredNodes = nodes.filter(n => filter === 'all' || n.type === filter);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  // Simulated node positions in a circle layout
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    const radius = 250;
    const centerX = 400;
    const centerY = 300;
    
    filteredNodes.forEach((node, i) => {
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      // Add a bit of randomness to make it look organic
      const r = radius * (0.8 + Math.random() * 0.4);
      positions[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    });
    return positions;
  }, [filteredNodes]);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const getNodeConnectionsCount = (nodeId: string) => {
    return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
  };

  return (
    <div className={`min-h-screen p-8 font-mono ${bgClass} flex flex-col`}>
      <header className="mb-6">
        <h1 className={`text-4xl md:text-5xl font-black mb-2 uppercase tracking-wider ${textClass}`}>[ REPUTATION GRAPH ]</h1>
        <p className="text-[#6366F1] font-bold text-lg uppercase tracking-wide">See the Ecosystem. Trust the Network.</p>
      </header>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'founder', 'whale', 'project', 'community'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f as any); setSelectedNode(null); }}
            className={`px-4 py-2 text-sm font-bold uppercase whitespace-nowrap ${borderClass} ${filter === f ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : `${bgClass} ${textClass}`}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Graph Canvas Container */}
        <div className={`flex-1 relative ${borderClass} ${shadowClass} overflow-hidden ${bgClass} min-h-[500px]`}>
          {loading ? (
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-xl animate-pulse ${textClass}`}>
              ANALYZING ON-CHAIN RELATIONSHIPS...
            </div>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Edges */}
              {filteredEdges.map((edge, i) => {
                const sourcePos = nodePositions[edge.source];
                const targetPos = nodePositions[edge.target];
                if (!sourcePos || !targetPos) return null;
                
                const isSelectedEdge = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
                
                return (
                  <line
                    key={i}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={isSelectedEdge ? (isDark ? 'white' : 'black') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}
                    strokeWidth={isSelectedEdge ? 2 : 1}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map(node => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      r={isSelected ? 18 : 12}
                      fill={getNodeColor(node.type)}
                      stroke={isDark ? '#000' : '#FFF'}
                      strokeWidth={2}
                      filter={isSelected ? 'url(#glow)' : ''}
                    />
                    <text
                      y={25}
                      textAnchor="middle"
                      fill={textClass}
                      fontSize={10}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className={`font-mono ${isDark ? 'fill-white' : 'fill-black'}`}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
          
          <div className={`absolute bottom-4 left-4 p-4 ${borderClass} bg-black/80 text-white backdrop-blur-sm text-xs space-y-2`}>
            <div className="font-bold mb-2">LEGEND</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div> Founders</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div> Whales</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10B981]"></div> Projects</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6366F1]"></div> Communities</div>
          </div>
        </div>

        {/* Selected Node Details Sidebar */}
        <div className={`w-full lg:w-80 flex flex-col gap-4 transition-all duration-300`}>
          {selectedNode ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 flex-1 ${borderClass} ${shadowClass} ${bgClass}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs font-bold uppercase text-white rounded`} style={{ backgroundColor: getNodeColor(selectedNode.type) }}>
                  {selectedNode.type}
                </span>
                <span className={`text-xl font-bold ${textClass}`}>{selectedNode.score}/100</span>
              </div>
              
              <h2 className={`text-2xl font-black mb-2 truncate ${textClass}`}>{selectedNode.label}</h2>
              <div className="text-gray-500 text-sm mb-6 font-mono truncate">{selectedNode.wallet}</div>

              <div className="space-y-4">
                <div className={`p-3 ${borderClass} bg-black/5 dark:bg-white/5`}>
                  <div className="text-xs text-gray-500 mb-1 uppercase">Projects Launched</div>
                  <div className={`text-lg font-bold ${textClass}`}>{selectedNode.metadata.projectsLaunched}</div>
                </div>
                
                <div className={`p-3 ${borderClass} bg-black/5 dark:bg-white/5`}>
                  <div className="text-xs text-gray-500 mb-1 uppercase">Connections</div>
                  <div className={`text-lg font-bold ${textClass}`}>{getNodeConnectionsCount(selectedNode.id)} nodes</div>
                </div>
                
                <div className={`p-3 ${borderClass} bg-black/5 dark:bg-white/5`}>
                  <div className="text-xs text-gray-500 mb-1 uppercase">Followers</div>
                  <div className={`text-lg font-bold ${textClass}`}>{selectedNode.metadata.followers.toLocaleString()}</div>
                </div>
              </div>

              <button className={`mt-8 w-full py-3 uppercase font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${borderClass} ${shadowClass} bg-[#0EA5E9] text-white`}>
                Deep Scan Address
              </button>
            </motion.div>
          ) : (
            <div className={`p-6 flex-1 flex flex-col items-center justify-center text-center ${borderClass} ${shadowClass} ${bgClass}`}>
              <Search className={`w-12 h-12 mb-4 text-gray-400`} />
              <p className={`text-gray-500 font-bold uppercase`}>Select a node in the graph to view intelligence data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
