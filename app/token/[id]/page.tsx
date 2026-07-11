'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  Copy, Check, Bell,
  ExternalLink, Share2, Shield, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Globe, AtSign,
  MessageCircle, AlertTriangle, Rocket, ArrowRight
} from 'lucide-react';
import { useMoonWallet } from '@/components/WalletProvider';
import { simulateBuy, simulateSell } from '@/lib/program';
import { useSOLPrice } from '@/lib/useSOLPrice';

const EASE = [0.16, 1, 0.3, 1] as const;
const TOTAL_SUPPLY = 1_000_000_000;
const GRAD_SOL = 85;

function shortAddr(addr: string, start = 4, end = 4): string {
  if (addr.length <= start + end + 3) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

function fmtNum(n: number, decimals = 2): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
}

function fmtPrice(p: number): string {
  if (p >= 1) return `$${p.toFixed(4)}`;
  if (p >= 0.01) return `$${p.toFixed(6)}`;
  return `$${p.toFixed(8)}`;
}

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function () {
    h ^= h >>> 13; h ^= h << 17; h ^= h >>> 5;
    return (h >>> 0) / 4294967296;
  };
}

function genChartData(mint: string, n: number, basePrice: number): number[] {
  const rng = seededRng(mint);
  const pts: number[] = [basePrice];
  for (let i = 1; i < n; i++) {
    const delta = (rng() - 0.46) * pts[i - 1] * 0.04;
    pts.push(Math.max(pts[i - 1] + delta, basePrice * 0.1));
  }
  return pts;
}

function buildMockCurveState(mint: string) {
  const rng = seededRng(mint + 'curve');
  const realSolReserves = 2 + rng() * 78;
  const progress = realSolReserves / GRAD_SOL;
  const realTokenReserves = TOTAL_SUPPLY * (1 - progress * 0.7);
  const virtualSolReserves = 30 + realSolReserves;
  const virtualTokenReserves = realTokenReserves + 200_000_000;
  const hoursAgo = 1 + rng() * 47;
  return {
    virtualSolReserves: Math.floor(virtualSolReserves * 1e9),
    virtualTokenReserves: Math.floor(virtualTokenReserves * 1e6),
    realSolReserves,
    realTokenReserves: Math.floor(realTokenReserves),
    complete: realSolReserves >= GRAD_SOL,
    createdAt: Date.now() - hoursAgo * 3_600_000,
    holders: Math.floor(47 + rng() * 265),
    volume24h: 0.5 + rng() * 40,
    riskScore: Math.floor(5 + rng() * 60),
  };
}

function priceFromReserves(vSol: number, vToken: number, solUsd: number): number {
  if (vToken === 0) return 0;
  const solPerToken = vSol / 1e9 / (vToken / 1e6);
  return solPerToken * solUsd;
}

const WALLETS = ['7xKX...sU9f','3Fmb...kT2m','Gm4n...tJ8r','9zKp...rL5a','HqRs...mN1p','4wBc...xV7k','QpZr...bW3j','KmYn...dX6e'];

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  wallet: string;
  tokens: number;
  sol: number;
  ts: number;
}

function genInitialTrades(mint: string): Trade[] {
  const rng = seededRng(mint + 'trades');
  return Array.from({ length: 8 }, (_, i) => ({
    id: `t${i}`,
    type: (rng() > 0.38 ? 'buy' : 'sell') as 'buy' | 'sell',
    wallet: WALLETS[i % WALLETS.length],
    tokens: Math.floor(10_000 + rng() * 2_000_000),
    sol: 0.05 + rng() * 8,
    ts: Date.now() - (8 - i) * 45_000 - rng() * 30_000,
  }));
}

function genTrade(mint: string, idx: number): Trade {
  const rng = seededRng(mint + String(idx) + String(Date.now()));
  return {
    id: `live-${Date.now()}-${idx}`,
    type: (rng() > 0.4 ? 'buy' : 'sell') as 'buy' | 'sell',
    wallet: WALLETS[Math.floor(rng() * WALLETS.length)],
    tokens: Math.floor(10_000 + rng() * 1_500_000),
    sol: 0.05 + rng() * 6,
    ts: Date.now(),
  };
}

export default function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const mintAddress = unwrappedParams.id;
  const { connected } = useMoonWallet();
  const { price: solUsd } = useSOLPrice();

  const [curveData, setCurveData] = useState(() => buildMockCurveState(mintAddress));
  const [trades, setTrades] = useState<Trade[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Trade Panel State
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [inputVal, setInputVal] = useState('');
  const [slippage, setSlippage] = useState<number | 'custom'>(1);
  const [customSlippage, setCustomSlippage] = useState('5');
  const [isExecuting, setIsExecuting] = useState(false);

  // Derivations
  const tokenName = `Project ${mintAddress.slice(0, 4)}`;
  const ticker = `$PRJ${mintAddress.slice(0, 2).toUpperCase()}`;
  const basePrice = priceFromReserves(curveData.virtualSolReserves, curveData.virtualTokenReserves, solUsd);
  const isComplete = curveData.complete;
  const progress = Math.min(100, (curveData.realSolReserves / GRAD_SOL) * 100);
  
  useEffect(() => {
    setTrades(genInitialTrades(mintAddress));
    setChartData(genChartData(mintAddress, 40, basePrice));
    
    // Live updates
    let counter = 0;
    const t = setInterval(() => {
      counter++;
      if (counter % 3 === 0) {
        setTrades(prev => [genTrade(mintAddress, counter), ...prev].slice(0, 20));
      }
      setChartData(prev => {
        const rng = seededRng(mintAddress + String(counter));
        const last = prev[prev.length - 1];
        const next = Math.max(last + (rng() - 0.48) * last * 0.05, basePrice * 0.1);
        return [...prev.slice(1), next];
      });
    }, 2000);
    return () => clearInterval(t);
  }, [mintAddress, basePrice]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    const amt = parseFloat(inputVal);
    if (!amt || isNaN(amt) || !connected) return;
    
    setIsExecuting(true);
    try {
      await new Promise(r => setTimeout(r, 1400));
      setInputVal('');
      // Show success
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  // Previews
  const amountNum = parseFloat(inputVal) || 0;
  const effectiveSolUSD = solUsd;
  let outputPreview = 0;
  if (tab === 'buy' && amountNum > 0) {
    const virtualSol = curveData.virtualSolReserves / 1e9;
    const virtualToken = curveData.virtualTokenReserves / 1e6;
    const k = virtualSol * virtualToken;
    const newVirtualSol = virtualSol + amountNum;
    const newVirtualToken = k / newVirtualSol;
    outputPreview = virtualToken - newVirtualToken;
  } else if (tab === 'sell' && amountNum > 0) {
    const virtualSol = curveData.virtualSolReserves / 1e9;
    const virtualToken = curveData.virtualTokenReserves / 1e6;
    const k = virtualSol * virtualToken;
    const newVirtualToken = virtualToken + amountNum;
    const newVirtualSol = k / newVirtualToken;
    outputPreview = virtualSol - newVirtualSol;
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full pt-4 pb-16 px-4">
      
      {/* ── HEADER CARD ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-3xl font-bold text-[#818CF8]">
            {mintAddress[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{tokenName}</h1>
              <span className="bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded font-mono text-sm">{ticker}</span>
              {isComplete ? (
                <span className="bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded font-mono text-xs uppercase font-bold tracking-wider">🎓 Graduated</span>
              ) : (
                <span className="bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.3)] px-2 py-0.5 rounded font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" /> Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#94A3B8] font-mono">
              <div className="flex items-center gap-2">
                CA: <span className="text-white">{shortAddr(mintAddress, 6, 6)}</span>
                <button onClick={handleCopy} className="text-[#818CF8] hover:text-white transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div>Launched {timeAgo(curveData.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-3xl font-bold font-mono text-white">{fmtPrice(basePrice)}</div>
          <div className="text-[#10B981] font-mono text-sm flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> +14.2% (24h)
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* ── LEFT COL ── */}
        <div className="flex flex-col gap-6">
          
          {/* Chart Placeholder (simplified for this rewrite to keep it clean) */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-6 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-[#818CF8] font-bold uppercase tracking-wider text-sm">
                <BarChart3 className="w-4 h-4" /> Price Chart
              </div>
              <div className="flex gap-2">
                {['15M', '1H', '4H', '1D'].map(tf => (
                  <button key={tf} className="px-3 py-1 bg-[#161B27] text-[#94A3B8] hover:text-white rounded text-xs font-bold font-mono transition-colors">
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 border border-[rgba(99,102,241,0.1)] rounded-xl flex items-center justify-center bg-[#0D1117] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(99,102,241,0.05)] to-transparent" />
              
              {/* Very basic SVG chart visualization for demo */}
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-[#6366F1] stroke-current stroke-[0.5]" fill="none">
                <path d={`M 0 30 ${chartData.map((d, i) => `L ${i * (100 / chartData.length)} ${35 - (d / basePrice) * 15}`).join(' ')}`} />
              </svg>
              
              <span className="text-[#475569] font-mono text-xs z-10 group-hover:text-white transition-colors">Live Chart Rendering Active</span>
            </div>
          </motion.div>

          {/* Trade History */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card overflow-hidden">
            <div className="p-4 border-b border-[rgba(99,102,241,0.1)] bg-[#161B27] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#818CF8]" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Recent Trades</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0D1117] border-b border-[rgba(99,102,241,0.1)] shadow-sm">
                  <tr className="text-[#475569] font-mono text-xs uppercase">
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Wallet</th>
                    <th className="p-3 font-semibold">Tokens</th>
                    <th className="p-3 font-semibold">SOL</th>
                    <th className="p-3 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {trades.map(trade => (
                      <motion.tr 
                        key={trade.id} 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="border-b border-[rgba(99,102,241,0.03)] hover:bg-[rgba(99,102,241,0.02)]"
                      >
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${trade.type === 'buy' ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]' : 'bg-[rgba(244,63,94,0.1)] text-[#F43F5E]'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sm text-[#94A3B8]">{trade.wallet}</td>
                        <td className="p-3 font-mono text-sm text-white">{fmtNum(trade.tokens, 0)}</td>
                        <td className="p-3 font-mono text-sm text-[#818CF8]">{trade.sol.toFixed(2)}</td>
                        <td className="p-3 font-mono text-xs text-[#475569] text-right">{timeAgo(trade.ts)}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT COL ── */}
        <div className="flex flex-col gap-6">
          
          {/* Buy/Sell Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="surface-panel p-5">
            
            <div className="flex bg-[#161B27] p-1 rounded-lg mb-6 border border-[rgba(99,102,241,0.1)]">
              <button 
                onClick={() => { setTab('buy'); setInputVal(''); }}
                className={`flex-1 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-colors ${tab === 'buy' ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981]' : 'text-[#475569] hover:text-white'}`}
              >
                Buy
              </button>
              <button 
                onClick={() => { setTab('sell'); setInputVal(''); }}
                className={`flex-1 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-colors ${tab === 'sell' ? 'bg-[rgba(244,63,94,0.15)] text-[#F43F5E]' : 'text-[#475569] hover:text-white'}`}
              >
                Sell
              </button>
            </div>

            <div className="mb-6 relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full bg-[#0D1117] border border-[rgba(99,102,241,0.2)] focus:border-[#6366F1] rounded-xl p-4 text-2xl font-mono text-white outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#818CF8]">
                {tab === 'buy' ? 'SOL' : ticker}
              </span>
            </div>

            <div className="flex gap-2 mb-6">
              {[0.5, 1, 3].map(s => (
                <button 
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`flex-1 py-1.5 rounded font-mono text-xs border transition-colors ${slippage === s ? 'bg-[rgba(99,102,241,0.1)] border-[#6366F1] text-[#818CF8]' : 'bg-[#161B27] border-transparent text-[#94A3B8] hover:border-[rgba(99,102,241,0.3)]'}`}
                >
                  {s}%
                </button>
              ))}
            </div>

            {amountNum > 0 && (
              <div className="bg-[#161B27] border border-[rgba(99,102,241,0.1)] rounded-lg p-3 mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#94A3B8]">You Receive</span>
                  <span className={`font-mono font-bold ${tab === 'buy' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    {tab === 'buy' ? `${fmtNum(outputPreview, 0)} ${ticker}` : `${outputPreview.toFixed(4)} SOL`}
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={handleExecute}
              disabled={!connected || isExecuting || amountNum <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                !connected || amountNum <= 0 
                  ? 'bg-[#1E2433] text-[#475569] cursor-not-allowed' 
                  : tab === 'buy' 
                    ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              }`}
            >
              {!connected ? 'Connect Wallet' : isExecuting ? 'Confirming...' : `Quick ${tab === 'buy' ? 'Buy' : 'Sell'}`}
            </button>

          </motion.div>

          {/* Bonding Curve Progress */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="surface-card p-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Bonding Curve</h3>
            {isComplete ? (
              <div className="text-center p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg">
                <span className="text-2xl mb-2 block">🎓</span>
                <h4 className="text-[#10B981] font-bold mb-1">Curve Completed</h4>
                <p className="text-xs text-[#10B981] opacity-80">Liquidity deployed to Raydium</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-[#94A3B8]">Progress to Raydium</span>
                  <span className="text-lg font-mono font-bold text-[#818CF8]">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-[#161B27] rounded-full overflow-hidden border border-[rgba(99,102,241,0.1)] mb-3">
                  <div className="h-full bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#475569]">
                  <span>{curveData.realSolReserves.toFixed(2)} SOL</span>
                  <span>{GRAD_SOL} SOL</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Token Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="surface-card p-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Stats & Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#94A3B8]">Holders</span>
                <span className="font-mono text-sm text-white">{curveData.holders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#94A3B8]">24h Volume</span>
                <span className="font-mono text-sm text-[#818CF8]">{curveData.volume24h.toFixed(1)} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#94A3B8]">Liquidity</span>
                <span className="font-mono text-sm text-white">{curveData.realSolReserves.toFixed(2)} SOL</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[rgba(99,102,241,0.1)]">
              <div className="flex gap-2">
                <a href="#" className="flex-1 py-2 bg-[#161B27] hover:bg-[#1E2433] rounded-lg border border-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#94A3B8] transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="flex-1 py-2 bg-[#161B27] hover:bg-[#1E2433] rounded-lg border border-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#94A3B8] transition-colors">
                  <AtSign className="w-4 h-4" />
                </a>
                <a href="#" className="flex-1 py-2 bg-[#161B27] hover:bg-[#1E2433] rounded-lg border border-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#94A3B8] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}