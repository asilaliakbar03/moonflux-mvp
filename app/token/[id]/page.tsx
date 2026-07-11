'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Copy, Check, Bell,
  ExternalLink, Share2, Shield, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Globe, AtSign,
  MessageCircle, AlertTriangle, Rocket
} from 'lucide-react';
import { useMoonWallet } from '@/components/WalletProvider';
import { simulateBuy, simulateSell, BN } from '@/lib/program';
import { useSOLPrice } from '@/lib/useSOLPrice';

const GOLD = '#e8b84b';
const BG   = 'rgba(10,8,5,0.98)';
const PANEL = 'rgba(14,11,7,0.97)';
const BORDER = 'rgba(232,184,75,0.22)';
const SUCCESS = '#10b981';
const DANGER  = '#ef4444';
const VIOLET  = '#a855f7';
const BLUE    = '#38bdf8';
const EASE = [0.16, 1, 0.3, 1] as const;

const TOTAL_SUPPLY = 1_000_000_000;
const GRAD_SOL    = 85;

function shortAddr(addr: string, start = 4, end = 4): string {
  if (addr.length <= start + end + 3) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

function fmtNum(n: number, decimals = 2): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
}

function fmtPrice(p: number): string {
  if (p >= 1) return `$${p.toFixed(4)}`;
  if (p >= 0.01) return `$${p.toFixed(6)}`;
  return `$${p.toFixed(8)}`;
}

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
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

interface CurveState {
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;
  complete: boolean;
  createdAt: number;
  holders: number;
  volume24h: number;
  riskScore: number;
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

interface PriceAlert {
  id: string;
  direction: 'above' | 'below';
  price: number;
  createdAt: number;
}

function loadAlerts(mint: string): PriceAlert[] {
  try {
    const raw = localStorage.getItem(`mf_alerts_${mint}`);
    return raw ? (JSON.parse(raw) as PriceAlert[]) : [];
  } catch { return []; }
}

function saveAlerts(mint: string, alerts: PriceAlert[]) {
  try { localStorage.setItem(`mf_alerts_${mint}`, JSON.stringify(alerts)); } catch {}
}

function AreaChart({ data, color = GOLD }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 100, H = 100, pad = 4;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - pad - ((v - min) / range) * (H - pad * 2);
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const firstX = toX(0), lastX = toX(data.length - 1);
  const firstY = toY(data[0]), lastY = toY(data[data.length - 1]);
  const areaPath = `M${firstX},${firstY} ${data.map((v, i) => `L${toX(i)},${toY(v)}`).join(' ')} L${lastX},${H} L${firstX},${H} Z`;
  const gradId = `ag${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill={`url(#${gradId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      <motion.circle cx={lastX} cy={lastY} r="2.5" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, duration: 0.3 }} />
    </svg>
  );
}

function StatRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '0.63rem', color: '#6b6987', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: valueColor ?? '#f4f2ff' }}>{value}</span>
    </div>
  );
}

export default function TokenPage() {
  const params = useParams();
  const mintAddress = typeof params?.id === 'string' ? params.id : 'DemoMintAddress123456789';

  const { price: solUSD } = useSOLPrice();
  const effectiveSolUSD = solUSD > 0 ? solUSD : 148;

  const { connected } = useMoonWallet();

  const [curve, setCurve] = useState<CurveState | null>(null);
  const [dexPair, setDexPair] = useState<{ priceUsd: number; volume24h: number; priceChange24h: number } | null>(null);

  const [timeframe, setTimeframe] = useState<'1H' | '6H' | '1D' | '1W'>('1D');
  const [chartData, setChartData] = useState<number[]>([]);
  const chartIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const tradeIdxRef = useRef(0);

  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [inputVal, setInputVal] = useState('');
  const [slippage, setSlippage] = useState<0.5 | 1 | 2 | 'custom'>(1);
  const [customSlippage, setCustomSlippage] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const [copied, setCopied] = useState(false);

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertDir, setAlertDir] = useState<'above' | 'below'>('above');
  const [alertPrice, setAlertPrice] = useState('');
  const alertsLoaded = useRef(false);

  const ticker     = mintAddress.slice(0, 4).toUpperCase();
  const tokenName  = `${ticker} Token`;

  const curveData  = curve ?? buildMockCurveState(mintAddress);
  const progress   = Math.min((curveData.realSolReserves / GRAD_SOL) * 100, 100);
  const isComplete = curveData.complete;

  const basePrice  = dexPair?.priceUsd ?? priceFromReserves(curveData.virtualSolReserves, curveData.virtualTokenReserves, effectiveSolUSD);
  const change24h  = dexPair?.priceChange24h ?? (seededRng(mintAddress + 'chg')() * 40 - 10);
  const marketCap  = basePrice * TOTAL_SUPPLY;
  const circulating = TOTAL_SUPPLY - curveData.realTokenReserves;

  const riskScore  = curveData.riskScore;
  const riskColor  = riskScore < 40 ? SUCCESS : riskScore < 70 ? '#f59e0b' : DANGER;
  const riskLabel  = riskScore < 40 ? 'LOW' : riskScore < 70 ? 'MEDIUM' : 'HIGH';

  const slippageBps = slippage === 'custom' ? Math.floor(parseFloat(customSlippage || '1') * 100) : Math.floor((slippage as number) * 100);
  const amountNum   = parseFloat(inputVal) || 0;

  let outputPreview = 0;
  let priceImpact   = 0;
  let feeSol        = 0;
  let minReceived   = 0;

  if (amountNum > 0 && curveData.virtualSolReserves > 0 && curveData.virtualTokenReserves > 0) {
    try {
      if (tab === 'buy') {
        const lamports  = Math.floor(amountNum * 1e9);
        const vSol      = new BN(Math.floor(curveData.virtualSolReserves));
        const vTok      = new BN(Math.floor(curveData.virtualTokenReserves));
        const result    = simulateBuy(vSol, vTok, new BN(lamports), slippageBps);
        outputPreview   = result.tokensOut.toNumber() / 1e6;
        priceImpact     = result.priceImpact;
        feeSol          = result.fee.toNumber() / 1e9;
        minReceived     = outputPreview * (1 - (slippage as number) / 100);
      } else {
        const tokenUnits = Math.floor(amountNum * 1e6);
        const vSol       = new BN(Math.floor(curveData.virtualSolReserves));
        const vTok       = new BN(Math.floor(curveData.virtualTokenReserves));
        const result     = simulateSell(vSol, vTok, new BN(tokenUnits), slippageBps);
        outputPreview    = result.solOut.toNumber() / 1e9;
        priceImpact      = result.priceImpact;
        feeSol           = result.fee.toNumber() / 1e9;
        minReceived      = outputPreview * (1 - (slippage as number) / 100);
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
        const data = await res.json() as { pairs?: Array<{ priceUsd?: string; volume?: { h24?: number }; priceChange?: { h24?: number } }> };
        const pair = data?.pairs?.[0];
        if (pair) {
          setDexPair({
            priceUsd: parseFloat(pair.priceUsd ?? '0'),
            volume24h: pair.volume?.h24 ?? 0,
            priceChange24h: pair.priceChange?.h24 ?? 0,
          });
        }
      } catch { /* ignore */ }
      setCurve(buildMockCurveState(mintAddress));
    }
    load();
  }, [mintAddress]);

  useEffect(() => {
    const n: Record<string, number> = { '1H': 60, '6H': 72, '1D': 96, '1W': 84 };
    setChartData(genChartData(mintAddress + timeframe, n[timeframe], basePrice || 0.0001));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAddress, timeframe]);

  useEffect(() => {
    if (chartIntervalRef.current) clearInterval(chartIntervalRef.current);
    chartIntervalRef.current = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const last  = prev[prev.length - 1];
        const delta = (Math.random() - 0.48) * last * 0.015;
        return [...prev.slice(1), Math.max(last + delta, last * 0.01)];
      });
    }, 3000);
    return () => { if (chartIntervalRef.current) clearInterval(chartIntervalRef.current); };
  }, [timeframe]);

  useEffect(() => {
    setTrades(genInitialTrades(mintAddress));
    tradeIdxRef.current = 0;
  }, [mintAddress]);

  useEffect(() => {
    const id = setInterval(() => {
      tradeIdxRef.current += 1;
      const idx = tradeIdxRef.current;
      setTrades(prev => [genTrade(mintAddress, idx), ...prev].slice(0, 20));
    }, 8000);
    return () => clearInterval(id);
  }, [mintAddress]);

  useEffect(() => {
    if (!alertsLoaded.current) {
      setAlerts(loadAlerts(mintAddress));
      alertsLoaded.current = true;
    }
  }, [mintAddress]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleExecute = useCallback(async () => {
    if (!connected || !amountNum) return;
    setIsExecuting(true);
    await new Promise<void>(r => setTimeout(r, 1400));
    setIsExecuting(false);
    setInputVal('');
  }, [connected, amountNum]);

  const addAlert = useCallback(() => {
    const p = parseFloat(alertPrice);
    if (isNaN(p) || p <= 0) return;
    const next: PriceAlert[] = [...alerts, { id: `a-${Date.now()}`, direction: alertDir, price: p, createdAt: Date.now() }];
    setAlerts(next);
    saveAlerts(mintAddress, next);
    setAlertPrice('');
  }, [alertPrice, alertDir, alerts, mintAddress]);

  const removeAlert = useCallback((id: string) => {
    const next = alerts.filter(a => a.id !== id);
    setAlerts(next);
    saveAlerts(mintAddress, next);
  }, [alerts, mintAddress]);

  const chartMax = chartData.length > 0 ? Math.max(...chartData) : 0;
  const vol24hDisplay = dexPair?.volume24h ?? curveData.volume24h;

  const panelStyle = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 20,
    padding: '20px 24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  const shimmer = (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(232,184,75,0.38),transparent)' }} />
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '0 0 80px 0' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 16px 0' }}>

        {/* ═══════════ A) TOKEN HEADER ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{ ...panelStyle, marginBottom: 16 }}
        >
          {shimmer}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'rgba(232,184,75,0.22)', filter: 'blur(12px)' }} />
                <div style={{ position: 'relative', width: 60, height: 60, borderRadius: '50%', background: 'rgba(28,20,6,0.97)', border: `2px solid ${GOLD}`, boxShadow: `0 0 24px rgba(232,184,75,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 24, fontWeight: 700, color: GOLD }}>
                  {mintAddress[0]?.toUpperCase() ?? '?'}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#f4f2ff', margin: 0 }}>{tokenName}</h1>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, color: GOLD, background: 'rgba(232,184,75,0.12)', border: `1px solid rgba(232,184,75,0.35)`, borderRadius: 6, padding: '2px 8px' }}>${ticker}</span>
                  {isComplete ? (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: GOLD, background: 'rgba(232,184,75,0.1)', border: `1px solid rgba(232,184,75,0.4)`, borderRadius: 99, padding: '2px 10px' }}>🎓 GRADUATED</span>
                  ) : (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: SUCCESS, background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.35)`, borderRadius: 99, padding: '2px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <motion.span style={{ width: 6, height: 6, borderRadius: '50%', background: SUCCESS, display: 'inline-block', boxShadow: `0 0 6px ${SUCCESS}` }} animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{fmtPrice(basePrice)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600, color: change24h >= 0 ? SUCCESS : DANGER }}>
                    {change24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', color: '#6b6987', textTransform: 'uppercase' }}>CA:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.63rem', color: '#a9a8c0' }}>{shortAddr(mintAddress, 6, 6)}</span>
                    <button onClick={() => handleCopy(mintAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: copied ? SUCCESS : '#6b6987', transition: 'color 0.2s' }}>
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.58rem', color: '#6b6987', textTransform: 'uppercase' }}>Launch:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.63rem', color: '#a9a8c0' }}>{timeAgo(curveData.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); }} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6987' }}>
                <Share2 size={15} />
              </button>
              <a href={`https://solscan.io/token/${mintAddress}`} target="_blank" rel="noopener noreferrer" style={{ height: 38, borderRadius: 99, padding: '0 14px', background: 'rgba(232,184,75,0.08)', border: `1px solid rgba(232,184,75,0.35)`, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: GOLD, textDecoration: 'none' }}>
                <ExternalLink size={12} /> Solscan
              </a>
            </div>
          </div>
        </motion.div>

        {/* Main 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="tp-grid">
          <style>{`
            @media(min-width:1024px){.tp-grid{grid-template-columns:1fr 380px!important}.tp-sticky{position:sticky;top:80px;align-self:start}}
          `}</style>

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ─── B) BONDING CURVE ─────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease: EASE }} style={panelStyle}>
              {shimmer}
              {isComplete ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(16,185,129,0.08)', border: `1px solid rgba(16,185,129,0.4)`, borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
                  <h3 style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: SUCCESS, margin: '0 0 8px' }}>Graduated to Raydium!</h3>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#10b981aa', margin: '0 0 16px' }}>This token completed the bonding curve and is now live on Raydium DEX.</p>
                  <a href={`https://dexscreener.com/solana/${mintAddress}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.4)`, fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', color: SUCCESS, textDecoration: 'none', letterSpacing: '0.06em' }}>
                    <ExternalLink size={12} /> View on DexScreener
                  </a>
                </motion.div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={14} color={GOLD} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a9791f' }}>Bonding Curve Progress</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: GOLD }}>{progress.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', border: `1px solid rgba(232,184,75,0.15)` }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }} style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${GOLD}cc,${GOLD})`, boxShadow: `0 0 16px rgba(232,184,75,0.5)` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: GOLD, fontWeight: 600 }}>{curveData.realSolReserves.toFixed(2)} SOL raised</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b6987' }}>{GRAD_SOL} SOL target</span>
                  </div>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4a4862', marginTop: 8, textAlign: 'center', letterSpacing: '0.04em' }}>🚀 Graduates to Raydium at {GRAD_SOL} SOL</p>
                </>
              )}
            </motion.div>

            {/* ─── C) PRICE CHART ───────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: EASE }} style={panelStyle}>
              {shimmer}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BarChart3 size={14} color={GOLD} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a9791f' }}>Price Action</span>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: SUCCESS, background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 99, padding: '2px 8px' }}>● LIVE</motion.span>
                </div>
                <div style={{ display: 'flex', gap: 2, padding: 4, background: 'rgba(5,4,3,0.8)', border: `1px solid rgba(232,184,75,0.15)`, borderRadius: 10 }}>
                  {(['1H','6H','1D','1W'] as const).map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)} style={{ fontFamily: 'monospace', fontSize: '0.65rem', padding: '4px 10px', borderRadius: 7, border: 'none', background: timeframe === tf ? 'rgba(232,184,75,0.2)' : 'transparent', color: timeframe === tf ? GOLD : '#6b6987', cursor: 'pointer', transition: 'all 0.2s', boxShadow: timeframe === tf ? `0 0 8px rgba(232,184,75,0.15)` : 'none' }}>{tf}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
                {[
                  { label: 'Current', val: fmtPrice(basePrice), color: '#f4f2ff' },
                  { label: 'ATH', val: fmtPrice(chartMax), color: SUCCESS },
                  { label: '24h Vol', val: vol24hDisplay > 100 ? `$${fmtNum(vol24hDisplay)}` : `${vol24hDisplay.toFixed(1)} SOL`, color: BLUE },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.56rem', color: '#6b6987', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 200, position: 'relative' }}>
                {chartData.length > 0 ? <AreaChart data={chartData} color={change24h >= 0 ? SUCCESS : DANGER} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#35334a' }}>Loading chart…</span></div>}
              </div>
            </motion.div>

            {/* ─── D) TRADE HISTORY ─────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15, ease: EASE }} style={panelStyle}>
              {shimmer}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Activity size={14} color={SUCCESS} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0d8a61' }}>Recent Trades</span>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 7, height: 7, borderRadius: '50%', background: SUCCESS, boxShadow: `0 0 8px ${SUCCESS}`, display: 'inline-block', marginLeft: 2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 70px', gap: 8, padding: '6px 10px', marginBottom: 6 }}>
                {['Type','Wallet','Tokens','SOL','Time'].map(h => (
                  <span key={h} style={{ fontFamily: 'monospace', fontSize: '0.55rem', textTransform: 'uppercase', color: '#35334a', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 320, overflowY: 'auto' }}>
                <AnimatePresence initial={false}>
                  {trades.map(trade => (
                    <motion.div key={trade.id} layout initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, height: 0, margin: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 70px', gap: 8, padding: '8px 10px', borderRadius: 10, background: trade.type === 'buy' ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: `1px solid ${trade.type === 'buy' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)'}`, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: trade.type === 'buy' ? SUCCESS : DANGER, background: trade.type === 'buy' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${trade.type === 'buy' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 5, padding: '2px 6px', display: 'inline-block', textAlign: 'center' }}>{trade.type}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#a9a8c0' }}>{trade.wallet}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#f4f2ff' }}>{fmtNum(trade.tokens, 0)}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: GOLD }}>{trade.sol.toFixed(3)}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#35334a' }}>{timeAgo(trade.ts)}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ═══════════ RIGHT COLUMN ═══════════ */}
          <div className="tp-sticky" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ─── E) BUY / SELL PANEL ─────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.08, ease: EASE }} style={panelStyle}>
              {shimmer}
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 18, padding: 4, background: 'rgba(5,4,3,0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                {(['buy','sell'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setInputVal(''); }} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? (t === 'buy' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'transparent', color: tab === t ? (t === 'buy' ? SUCCESS : DANGER) : '#35334a', boxShadow: tab === t ? `0 0 16px ${t === 'buy' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}` : 'none' }}>
                    {t === 'buy' ? '↑ BUY' : '↓ SELL'}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase', color: '#6b6987', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{tab === 'buy' ? 'SOL Amount' : `${ticker} Amount`}</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder={tab === 'buy' ? '0.0 SOL' : '0 tokens'} style={{ width: '100%', padding: '12px 56px 12px 14px', background: 'rgba(5,4,3,0.8)', border: `1px solid rgba(232,184,75,0.2)`, borderRadius: 12, fontFamily: 'monospace', fontSize: '0.95rem', color: '#f4f2ff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(232,184,75,0.5)'; }} onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(232,184,75,0.2)'; }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, color: tab === 'buy' ? GOLD : VIOLET }}>{tab === 'buy' ? 'SOL' : ticker}</span>
                </div>
              </div>

              {/* Slippage */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase', color: '#6b6987', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Slippage</label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {([0.5, 1, 2] as const).map(s => (
                    <button key={s} onClick={() => setSlippage(s)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid`, fontFamily: 'monospace', fontSize: '0.65rem', cursor: 'pointer', transition: 'all 0.2s', background: slippage === s ? 'rgba(232,184,75,0.15)' : 'rgba(5,4,3,0.7)', borderColor: slippage === s ? 'rgba(232,184,75,0.5)' : 'rgba(255,255,255,0.08)', color: slippage === s ? GOLD : '#6b6987' }}>{s}%</button>
                  ))}
                  <input type="number" placeholder="%" value={slippage === 'custom' ? customSlippage : ''} onChange={e => { setSlippage('custom'); setCustomSlippage(e.target.value); }} onFocus={() => setSlippage('custom')} style={{ flex: 1, padding: '6px 6px', background: slippage === 'custom' ? 'rgba(232,184,75,0.1)' : 'rgba(5,4,3,0.7)', border: `1px solid ${slippage === 'custom' ? 'rgba(232,184,75,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, fontFamily: 'monospace', fontSize: '0.65rem', color: slippage === 'custom' ? GOLD : '#6b6987', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
              </div>

              {/* Output preview */}
              <AnimatePresence>
                {amountNum > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '12px 14px', borderRadius: 12, marginBottom: 14, background: 'rgba(5,4,3,0.9)', border: `1px solid rgba(232,184,75,0.15)` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#6b6987' }}>You receive</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: tab === 'buy' ? SUCCESS : GOLD }}>
                        {tab === 'buy' ? `${fmtNum(outputPreview, 0)} ${ticker}` : `${outputPreview.toFixed(4)} SOL`}
                      </span>
                    </div>
                    {priceImpact > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, marginBottom: 8, background: priceImpact > 5 ? 'rgba(239,68,68,0.1)' : priceImpact > 2 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.06)', border: `1px solid ${priceImpact > 5 ? 'rgba(239,68,68,0.3)' : priceImpact > 2 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.2)'}` }}>
                        {priceImpact > 2 && <AlertTriangle size={10} color={priceImpact > 5 ? DANGER : '#f59e0b'} />}
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: priceImpact > 5 ? DANGER : priceImpact > 2 ? '#f59e0b' : SUCCESS }}>Price impact: {priceImpact.toFixed(2)}%</span>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                      {[
                        { label: 'Per token', value: fmtPrice(tab === 'buy' ? (amountNum / (outputPreview || 1)) * effectiveSolUSD : 0) },
                        { label: 'Fee (1%)', value: `${feeSol.toFixed(4)} SOL` },
                        { label: 'Min recv', value: tab === 'buy' ? fmtNum(minReceived, 0) : `${minReceived.toFixed(4)} SOL` },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.5rem', color: '#35334a', marginBottom: 2, textTransform: 'uppercase' }}>{s.label}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#a9a8c0' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Execute button */}
              <div style={{ position: 'relative' }}>
                <motion.button
                  onClick={handleExecute}
                  disabled={!connected || isExecuting || !amountNum}
                  whileHover={connected && !!amountNum && !isExecuting ? { scale: 1.02 } : {}}
                  whileTap={connected && !!amountNum && !isExecuting ? { scale: 0.98 } : {}}
                  style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: connected && !!amountNum && !isExecuting ? 'pointer' : 'not-allowed', background: tab === 'buy' ? 'linear-gradient(135deg,rgba(16,185,129,0.9),rgba(5,150,100,0.9))' : 'linear-gradient(135deg,rgba(239,68,68,0.9),rgba(180,30,30,0.9))', color: '#fff', boxShadow: tab === 'buy' ? `0 4px 24px rgba(16,185,129,0.3)` : `0 4px 24px rgba(239,68,68,0.25)`, opacity: !connected || !amountNum ? 0.5 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {isExecuting ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />Confirming…</>
                  ) : (
                    <>{tab === 'buy' ? '↑ Buy' : '↓ Sell'} {ticker}</>
                  )}
                </motion.button>
                <AnimatePresence>
                  {!connected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(10,8,5,0.88)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid rgba(232,184,75,0.2)` }}>
                      <Shield size={18} color={GOLD} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: GOLD, fontWeight: 700 }}>Connect Wallet to Trade</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ─── F) TOKEN STATS ───────────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.12, ease: EASE }} style={panelStyle}>
              {shimmer}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <BarChart3 size={13} color={GOLD} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a9791f' }}>Token Stats</span>
              </div>
              <StatRow label="Market Cap" value={`$${fmtNum(marketCap)}`} valueColor={GOLD} />
              <StatRow label="Total Supply" value="1,000,000,000" />
              <StatRow label="Circulating" value={fmtNum(circulating, 0)} />
              <StatRow label="Holders" value={String(curveData.holders)} />
              <StatRow label="Volume 24h" value={`${curveData.volume24h.toFixed(1)} SOL`} valueColor={BLUE} />
              <StatRow label="Liquidity" value={`${curveData.realSolReserves.toFixed(2)} SOL`} />
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(5,4,3,0.8)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={12} color={riskColor} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', textTransform: 'uppercase', color: '#6b6987', letterSpacing: '0.06em' }}>AI Risk Score</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, color: riskColor, background: `${riskColor}18`, border: `1px solid ${riskColor}40`, borderRadius: 99, padding: '2px 8px' }}>{riskScore}/100 · {riskLabel}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} transition={{ duration: 1.2, ease: EASE, delay: 0.4 }} style={{ height: '100%', borderRadius: 99, background: riskColor, boxShadow: `0 0 8px ${riskColor}60` }} />
                </div>
              </div>
            </motion.div>

            {/* ─── G) PRICE ALERTS ──────────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.16, ease: EASE }} style={panelStyle}>
              {shimmer}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <Bell size={13} color={GOLD} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a9791f' }}>Set Price Alert</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['above','below'] as const).map(d => (
                  <label key={d} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 10px', borderRadius: 10, background: alertDir === d ? 'rgba(232,184,75,0.08)' : 'rgba(5,4,3,0.6)', border: `1px solid ${alertDir === d ? 'rgba(232,184,75,0.4)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s' }}>
                    <input type="radio" value={d} checked={alertDir === d} onChange={() => setAlertDir(d)} style={{ accentColor: GOLD, margin: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: alertDir === d ? GOLD : '#6b6987', textTransform: 'capitalize' }}>{d === 'above' ? '▲' : '▼'} {d}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: alerts.length > 0 ? 12 : 0 }}>
                <input type="number" placeholder="Price in USD" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addAlert(); }} style={{ flex: 1, padding: '9px 12px', background: 'rgba(5,4,3,0.8)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 10, fontFamily: 'monospace', fontSize: '0.78rem', color: '#f4f2ff', outline: 'none' }} />
                <button onClick={addAlert} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid rgba(232,184,75,0.5)`, background: 'rgba(232,184,75,0.15)', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: GOLD, cursor: 'pointer', letterSpacing: '0.06em', transition: 'all 0.2s' }}>Set</button>
              </div>
              <AnimatePresence>
                {alerts.map(alert => (
                  <motion.div key={alert.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, marginTop: 6, background: 'rgba(5,4,3,0.7)', border: `1px solid rgba(232,184,75,0.15)` }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.63rem', color: '#a9a8c0' }}>
                        {alert.direction === 'above' ? '▲' : '▼'} Alert {alert.direction} <span style={{ color: alert.direction === 'above' ? SUCCESS : DANGER }}>${alert.price.toFixed(6)}</span>
                      </span>
                      <button onClick={() => removeAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#35334a', padding: '0 4px', lineHeight: 1, fontSize: 16, transition: 'color 0.2s' }} onMouseEnter={e => { (e.target as HTMLElement).style.color = DANGER; }} onMouseLeave={e => { (e.target as HTMLElement).style.color = '#35334a'; }}>×</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ─── H) TOKEN LINKS ───────────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.2, ease: EASE }} style={panelStyle}>
              {shimmer}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <Globe size={13} color={GOLD} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a9791f' }}>Links</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { icon: <Globe size={13} />, label: 'Website', href: '#', color: BLUE },
                  { icon: <AtSign size={13} />, label: 'Twitter / X', href: `https://twitter.com/search?q=${ticker}`, color: BLUE },
                  { icon: <MessageCircle size={13} />, label: 'Telegram', href: '#', color: BLUE },
                  { icon: <ExternalLink size={13} />, label: 'View on Solscan', href: `https://solscan.io/token/${mintAddress}`, color: GOLD },
                  ...(isComplete ? [{ icon: <ExternalLink size={13} />, label: 'View on DexScreener', href: `https://dexscreener.com/solana/${mintAddress}`, color: SUCCESS }] : []),
                ].map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'rgba(5,4,3,0.7)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.68rem', color: link.color, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,184,75,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,184,75,0.25)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(5,4,3,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                    {link.icon}{link.label}
                    <ArrowUpRight size={11} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </a>
                ))}
                <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(232,184,75,0.06)', border: `1px solid rgba(232,184,75,0.2)`, fontFamily: 'monospace', fontSize: '0.68rem', color: GOLD, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Share2 size={13} />Share Token
                  <Rocket size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}