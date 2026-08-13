'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, use } from 'react';
import AnimatedCounter from '@/components/AnimatedCounter';
import Link from 'next/link';
import {
  Copy, Check, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Globe, AtSign,
  MessageCircle, PieChart as PieChartIcon
} from 'lucide-react';
import { useMoonWallet } from '@/components/WalletProvider';
import { useSOLPrice } from '@/lib/useSOLPrice';
import { useTheme } from '@/components/ThemeProvider';
import { useTokenTrade } from '@/hooks/useTokenTrade';
import { useToast } from '@/components/ToastProvider';
import { 
  LineChart, Line, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { connected } = useMoonWallet();
  const { price: solUsd } = useSOLPrice();
  const { buyTokens, sellTokens, isTrading, error: tradeError, txSignature, clearError, clearTx } = useTokenTrade();
  const { showToast } = useToast();

  const [curveData, setCurveData] = useState(() => buildMockCurveState(mintAddress));
  const [trades, setTrades] = useState<Trade[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  // Dynamic 24h change seeded from mint address
  const change24h = (() => {
    const rng = seededRng(mintAddress + '24h');
    const val = (rng() - 0.35) * 60; // slightly biased positive, range roughly -21 to +39
    return parseFloat(val.toFixed(1));
  })();
  const isPositive24h = change24h >= 0;
  
  // Trade Panel State
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [inputVal, setInputVal] = useState('');
  const [slippage, setSlippage] = useState<number | 'custom'>(1);

  const [dbToken, setDbToken] = useState<any>(null);

  // Derivations
  const tokenName = dbToken ? dbToken.name : `Project ${mintAddress.slice(0, 4)}`;
  const ticker = dbToken ? `$${dbToken.ticker}` : `$PRJ${mintAddress.slice(0, 2).toUpperCase()}`;
  const basePrice = priceFromReserves(curveData.virtualSolReserves, curveData.virtualTokenReserves, solUsd);
  const isComplete = curveData.complete;
  const progress = Math.min(100, (curveData.realSolReserves / GRAD_SOL) * 100);
  
  useEffect(() => {
    async function fetchDbToken() {
      try {
        const { data } = await supabase
          .from('tokens')
          .select('*')
          .eq('mint_address', mintAddress)
          .single();
        if (data) {
          setDbToken(data);
        }
      } catch (err) {
        console.warn("Could not fetch token from DB:", err);
      }
    }
    fetchDbToken();

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
    
    const slippageBps = typeof slippage === 'number' ? slippage * 100 : 100; // Convert % to bps
    
    let signature: string | null = null;
    
    if (tab === 'buy') {
      signature = await buyTokens(mintAddress, amt, slippageBps, {
        virtualSolReserves: curveData.virtualSolReserves,
        virtualTokenReserves: curveData.virtualTokenReserves,
      });
    } else {
      signature = await sellTokens(mintAddress, amt, slippageBps, {
        virtualSolReserves: curveData.virtualSolReserves,
        virtualTokenReserves: curveData.virtualTokenReserves,
      });
    }
    
    if (signature) {
      setInputVal('');
      showToast(
        `${tab === 'buy' ? 'Bought' : 'Sold'} successfully! Tx: ${signature.slice(0, 8)}...`,
        'success'
      );
      // Add the trade to the local feed
      setTrades(prev => [{
        id: `real-${Date.now()}`,
        type: tab,
        wallet: 'You',
        tokens: tab === 'buy' ? Math.floor(outputPreview) : Math.floor(amt),
        sol: tab === 'buy' ? amt : outputPreview,
        ts: Date.now(),
      }, ...prev].slice(0, 20));
    } else if (tradeError) {
      showToast(tradeError, 'error');
    }
  };

  // Previews
  const amountNum = parseFloat(inputVal) || 0;
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

  const rechartsData = chartData.map((val, i) => ({ time: i, price: val }));

  const bBorder = isDark ? 'border-2 border-[rgba(255,255,255,0.15)]' : 'border-3 border-black';
  const bShadow = isDark ? 'shadow-[4px_4px_0px_0px_#6366F1]' : 'shadow-[4px_4px_0px_0px_#000]';
  const bBg = isDark ? 'bg-[#050510]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`max-w-[1400px] mx-auto w-full pt-2 sm:pt-4 pb-24 md:pb-16 px-2 sm:px-4 font-mono uppercase ${textPrimary}`}>
      
      {/* ── HEADER CARD ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} className={`${bBg} ${bBorder} ${bShadow} p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6`}>
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 ${bBorder} ${bShadow} overflow-hidden`}>
            <img src={dbToken?.image_url || `https://robohash.org/${mintAddress}?set=set1&size=128x128`} alt={tokenName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold">{tokenName}</h1>
              <span className={`bg-[#6366F1] text-white px-2 py-0.5 ${bBorder} font-bold text-sm`}>{ticker}</span>
              {isComplete ? (
                <span className={`bg-[#10B981] text-white px-2 py-0.5 ${bBorder} text-xs font-bold tracking-wider`}>[ GRADUATED ]</span>
              ) : (
                <span className={`bg-transparent text-[#10B981] px-2 py-0.5 ${bBorder} text-xs font-bold tracking-wider flex items-center gap-2`}>
                  <span className={`w-2 h-2 bg-[#10B981] ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} border-2`} /> LIVE
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 sm:gap-4 text-xs sm:text-sm ${textMuted} flex-wrap font-bold`}>
              <div className="flex items-center gap-2">
                CA: <span className={textPrimary}>{shortAddr(mintAddress, 6, 6)}</span>
                <button onClick={handleCopy} className="text-[#6366F1] hover:text-current transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div>LAUNCHED {timeAgo(curveData.createdAt).toUpperCase()}</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl sm:text-3xl font-bold">{fmtPrice(basePrice)}</div>
          <div className={`${isPositive24h ? 'text-[#10B981]' : 'text-[#F43F5E]'} text-sm flex items-center gap-1 font-bold`}>
            {isPositive24h ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />} {isPositive24h ? '+' : ''}{change24h}% (24H)
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* ── LEFT COL ── */}
        <div className="flex flex-col gap-6">
          
          {/* Interactive Recharts Price Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} className={`${bBg} ${bBorder} ${bShadow} p-3 sm:p-6 h-[280px] sm:h-[400px] flex flex-col`}>
            <div className={`flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-2 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} pb-4`}>
              <div className="flex items-center gap-2 font-bold tracking-wider text-sm text-[#6366F1]">
                <BarChart3 className="w-4 h-4" /> [ PRICE CHART ]
              </div>
              <div className="flex gap-2">
                {['15M', '1H', '4H', '1D'].map(tf => (
                  <button key={tf} className={`px-3 py-2 ${bBg} text-xs font-bold transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${bBorder} ${bShadow}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={`flex-1 ${bBorder} flex items-center justify-center relative p-2 group`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rechartsData}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: isDark ? '#050510' : '#ffffff', border: isDark ? '2px solid rgba(255,255,255,0.15)' : '3px solid black', borderRadius: '0px', boxShadow: isDark ? '4px 4px 0px 0px #6366F1' : '4px 4px 0px 0px #000' }}
                    itemStyle={{ color: '#6366F1', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(6)}`, 'PRICE']}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#6366F1" 
                    strokeWidth={3} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <span className={`absolute bottom-4 left-4 ${textMuted} text-xs z-10 group-hover:${textPrimary} transition-colors pointer-events-none font-bold`}>[ LIVE RECHARTS RENDER ]</span>
            </div>
          </motion.div>

          {/* Trade History */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className={`${bBg} ${bBorder} ${bShadow}`}>
            <div className={`p-4 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} flex items-center gap-2`}>
              <Activity className="w-4 h-4 text-[#6366F1]" />
              <h3 className="font-bold text-sm tracking-wider text-[#6366F1]">[ RECENT TRADES ]</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`sticky top-0 ${bBg} border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} z-10`}>
                  <tr className={`${textMuted} text-xs`}>
                    <th className="p-3 font-semibold">TYPE</th>
                    <th className="p-3 font-semibold">WALLET</th>
                    <th className="p-3 font-semibold">TOKENS</th>
                    <th className="p-3 font-semibold">SOL</th>
                    <th className="p-3 font-semibold text-right">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {trades.map(trade => (
                      <motion.tr 
                        key={trade.id} 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className={`border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} hover:bg-gray-100 hover:text-black transition-colors ${isDark ? 'hover:bg-gray-800 hover:text-white' : ''}`}
                      >
                        <td className="p-3">
                          <span className={`px-2 py-0.5 ${trade.type === 'buy' ? 'bg-[#10B981] text-white' : 'bg-[#F43F5E] text-white'} ${bBorder} text-[10px] font-bold`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className={`p-3 text-sm font-bold ${textMuted}`}>{trade.wallet}</td>
                        <td className="p-3 text-sm font-bold">{fmtNum(trade.tokens, 0)}</td>
                        <td className="p-3 text-sm text-[#6366F1] font-bold">{trade.sol.toFixed(2)}</td>
                        <td className={`p-3 text-xs font-bold ${textMuted} text-right`}>{timeAgo(trade.ts).toUpperCase()}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Tokenomics Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.3 }} className={`${bBg} ${bBorder} ${bShadow} p-6 mt-2 mb-8 md:mb-0`}>
            <div className={`flex items-center gap-2 mb-6 border-b-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} pb-4`}>
              <PieChartIcon className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="font-bold text-sm tracking-wider text-[#F59E0B]">[ TOKENOMICS BREAKDOWN ]</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Bonding Curve', value: 80, color: '#6366F1' },
                        { name: 'Dev Allocation', value: 20, color: '#10B981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={85}
                      paddingAngle={0}
                      dataKey="value"
                      stroke={isDark ? 'rgba(255,255,255,0.15)' : 'black'}
                      strokeWidth={2}
                    >
                      {
                        [
                          { name: 'Bonding Curve', value: 80, color: '#6366F1' },
                          { name: 'Dev Allocation', value: 20, color: '#10B981' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: isDark ? '#050510' : '#ffffff', border: isDark ? '2px solid rgba(255,255,255,0.15)' : '3px solid black', borderRadius: '0px', boxShadow: isDark ? '4px 4px 0px 0px #6366F1' : '4px 4px 0px 0px #000' }}
                      itemStyle={{ fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}
                      formatter={(value: any) => [`${value}%`, 'ALLOCATION']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3 font-bold">
                <div className={`flex justify-between items-center ${bBg} p-4 ${bBorder} ${bShadow}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 bg-[#6366F1] ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} border-2`} />
                    <span className="text-sm">BONDING CURVE POOL</span>
                  </div>
                  <span className="text-[#6366F1]">80%</span>
                </div>
                <div className={`flex justify-between items-center ${bBg} p-4 ${bBorder} ${bShadow}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 bg-[#10B981] ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} border-2`} />
                    <span className="text-sm">DEV ALLOCATION</span>
                  </div>
                  <span className="text-[#10B981]">20%</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT COL ── */}
        <div className="flex flex-col gap-6">
          
          {/* Buy/Sell Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.1 }} className={`${bBg} ${bBorder} ${bShadow} p-5`}>
            
            <div className={`flex mb-6 ${bBorder}`}>
              <button 
                onClick={() => { setTab('buy'); setInputVal(''); }}
                className={`flex-1 py-2 font-bold text-sm transition-colors border-r-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'} ${tab === 'buy' ? 'bg-[#10B981] text-white' : 'bg-transparent text-gray-500 hover:text-current'}`}
              >
                BUY
              </button>
              <button 
                onClick={() => { setTab('sell'); setInputVal(''); }}
                className={`flex-1 py-2 font-bold text-sm transition-colors ${tab === 'sell' ? 'bg-[#F43F5E] text-white' : 'bg-transparent text-gray-500 hover:text-current'}`}
              >
                SELL
              </button>
            </div>

            <div className="mb-6 relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className={`w-full bg-transparent ${bBorder} p-4 text-2xl font-bold outline-none transition-all focus:border-[#6366F1] placeholder:text-gray-500`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#6366F1]">
                {tab === 'buy' ? 'SOL' : ticker.replace('$', '')}
              </span>
            </div>

            <div className="flex gap-2 mb-6">
              {[0.5, 1, 3].map(s => (
                <button 
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`flex-1 py-1.5 text-xs font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${bBorder} ${s === slippage ? 'bg-[#6366F1] text-white ' + bShadow : 'bg-transparent ' + bShadow}`}
                >
                  {s}%
                </button>
              ))}
            </div>

            {amountNum > 0 && (
              <div className={`p-3 mb-6 ${bBorder}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${textMuted}`}>YOU RECEIVE</span>
                  <span className={`font-bold ${tab === 'buy' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                    {tab === 'buy' ? `${fmtNum(outputPreview, 0)} ${ticker.replace('$', '')}` : `${outputPreview.toFixed(4)} SOL`}
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={handleExecute}
              disabled={!connected || isTrading || amountNum <= 0}
              className={`w-full py-4 font-bold text-lg transition-all ${bBorder} ${bShadow} active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                !connected || amountNum <= 0 
                  ? 'bg-gray-500 text-white cursor-not-allowed opacity-50' 
                  : tab === 'buy' 
                    ? 'bg-[#10B981] hover:bg-[#059669] text-white' 
                    : 'bg-[#F43F5E] hover:bg-[#E11D48] text-white'
              }`}
            >
              {!connected ? 'CONNECT WALLET' : isTrading ? 'CONFIRMING TX...' : `QUICK ${tab === 'buy' ? 'BUY' : 'SELL'}`}
            </button>
          </motion.div>

          {/* Bonding Curve Progress */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.15 }} className={`${bBg} ${bBorder} ${bShadow} p-5`}>
            <h3 className="font-bold text-sm tracking-wider mb-4">[ BONDING CURVE ]</h3>
            {isComplete ? (
              <div className={`text-center p-4 bg-[#10B981] text-white ${bBorder}`}>
                <span className="text-2xl mb-2 block">🎓</span>
                <h4 className="font-bold mb-1">CURVE COMPLETED</h4>
                <p className="text-xs">LIQUIDITY DEPLOYED TO RAYDIUM</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-xs font-bold ${textMuted}`}>PROGRESS TO RAYDIUM</span>
                  <span className="text-lg font-bold text-[#6366F1]">{progress.toFixed(1)}%</span>
                </div>
                <div className={`h-8 bg-transparent ${bBorder} mb-3 relative overflow-hidden flex items-center`}>
                  <div className="absolute left-0 top-0 bottom-0 bg-[#6366F1] transition-all duration-700 ease-out" style={{ width: `${progress}%`, borderRight: isDark ? '2px solid rgba(255,255,255,0.15)' : '3px solid black' }} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-white z-10 pointer-events-none">[ {progress.toFixed(1)}% ]</span>
                </div>
                <div className={`flex justify-between text-[10px] font-bold ${textMuted}`}>
                  <span>{curveData.realSolReserves.toFixed(2)} SOL</span>
                  <span>{GRAD_SOL} SOL</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Token Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: 0.2 }} className={`${bBg} ${bBorder} ${bShadow} p-5`}>
            <h3 className="font-bold text-sm tracking-wider mb-4">[ STATS & INFO ]</h3>
            <div className="space-y-3 font-bold">
              <div className={`flex justify-between items-center p-2 ${bBorder}`}>
                <span className={`text-xs ${textMuted}`}>HOLDERS</span>
                <span className="text-sm">{curveData.holders}</span>
              </div>
              <div className={`flex justify-between items-center p-2 ${bBorder}`}>
                <span className={`text-xs ${textMuted}`}>24H VOLUME</span>
                <span className="text-sm text-[#6366F1]">{curveData.volume24h.toFixed(1)} SOL</span>
              </div>
              <div className={`flex justify-between items-center p-2 ${bBorder}`}>
                <span className={`text-xs ${textMuted}`}>LIQUIDITY</span>
                <span className="text-sm">{curveData.realSolReserves.toFixed(2)} SOL</span>
              </div>
            </div>

            <div className={`mt-6 pt-6 border-t-2 ${isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black'}`}>
              <div className={`text-center text-sm font-bold ${textMuted}`}>
                [ NO LINKS AVAILABLE ]
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}