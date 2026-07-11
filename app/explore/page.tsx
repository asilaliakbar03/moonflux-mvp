"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Grid3x3, PlayCircle, TrendingUp, Zap, Brain, Flame, Search,
  Heart, Bookmark, Share2, ArrowUpRight, ArrowDownRight,
  ChevronUp, ChevronDown, Shield, Award, Sparkles, RefreshCw,
} from "lucide-react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Mock Tokens ─────────────────────────────────────────────────────────────
const MOCK_TOKENS = [
  { id:"tok_luna_doge", name:"Luna Doge", ticker:"LDOGE", price:0.00234, change24h:142.5, marketCap:1870000, riskScore:3, tag:"For You", category:"meme", graduated:true, lore:"The original moon-dog hybrid. Community-driven with auto-burn and staking rewards. Ascended to full DEX glory.", sparkline:[8,12,19,25,31,44,52,71,65,89,95,120,110,140,160,190,210,200,220,234], color:"#e8b84b" },
  { id:"tok_cyber_pep", name:"CyberPep", ticker:"CPEP", price:0.00891, change24h:78.3, marketCap:3210000, riskScore:4, tag:"Trending", category:"meme", graduated:false, lore:"Pepe went cyberpunk. Neural-enhanced frog lore with on-chain governance and meme vault staking.", sparkline:[20,18,25,30,28,35,42,55,60,58,70,85,90,88,95,110,125,140,135,150], color:"#10b981" },
  { id:"tok_void_inu", name:"Void Inu", ticker:"VINU", price:0.00045, change24h:-12.7, marketCap:890000, riskScore:7, tag:"New", category:"meme", graduated:false, lore:"Born in the void between blocks. The darkest dog token ever conceived. Anti-gravity tokenomics.", sparkline:[100,95,88,80,75,70,68,65,72,69,60,55,52,50,48,45,42,44,43,41], color:"#a855f7" },
  { id:"tok_sol_eagle", name:"Sol Eagle", ticker:"SEGL", price:0.1247, change24h:34.2, marketCap:12500000, riskScore:2, tag:"AI Pick", category:"utility", graduated:true, lore:"Soaring above the memecoin fray. Utility-first eagle protocol with real yield distribution every epoch.", sparkline:[40,42,45,50,55,58,62,70,75,80,85,90,88,95,100,110,120,115,125,135], color:"#e8b84b" },
  { id:"tok_rwa_king", name:"RWA King", ticker:"RWAK", price:2.3401, change24h:18.9, marketCap:45000000, riskScore:1, tag:"For You", category:"rwa", graduated:true, lore:"Real-world assets on-chain. Tokenized real estate, gold, and equities with institutional-grade custody.", sparkline:[60,62,65,68,70,72,75,78,80,82,85,88,90,92,95,98,100,103,106,110], color:"#10b981" },
  { id:"tok_ai_swarm", name:"AI Swarm", ticker:"SWRM", price:0.00671, change24h:211.4, marketCap:2300000, riskScore:5, tag:"Trending", category:"ai", graduated:false, lore:"A swarm of 1000 autonomous agents trading, generating, and defending the treasury in real time.", sparkline:[5,8,12,15,14,18,25,32,28,40,55,70,90,85,110,140,160,180,175,200], color:"#38bdf8" },
  { id:"tok_pixel_cat", name:"PixelCat", ticker:"PCAT", price:0.00329, change24h:-5.4, marketCap:1100000, riskScore:6, tag:"New", category:"gaming", graduated:false, lore:"8-bit cat on a blockchain quest. Earn PCAT by completing pixel dungeons. Nyan protocol activated.", sparkline:[50,48,45,46,44,42,40,41,39,37,35,33,34,32,30,31,29,28,27,25], color:"#f59e0b" },
  { id:"tok_nova_flux", name:"NovaFlux", ticker:"NVFX", price:0.0445, change24h:67.8, marketCap:8900000, riskScore:3, tag:"AI Pick", category:"ai", graduated:true, lore:"Quantum-inspired liquidity engine. Every trade reshapes the gravity well. AI rebalances every 60 seconds.", sparkline:[30,35,38,42,48,52,58,65,70,68,75,80,90,95,100,108,115,120,118,125], color:"#a855f7" },
  { id:"tok_degen_ape", name:"DegenApe", ticker:"DAPE", price:0.00156, change24h:388.2, marketCap:970000, riskScore:9, tag:"Trending", category:"meme", graduated:false, lore:"Full degen mode. No team, no roadmap, only vibes and chart. The purest expression of on-chain chaos.", sparkline:[2,3,4,5,6,10,15,12,20,30,25,40,60,50,80,100,90,120,110,140], color:"#ef4444" },
  { id:"tok_zen_monk", name:"ZenMonk", ticker:"ZNMK", price:0.7823, change24h:9.1, marketCap:22000000, riskScore:2, tag:"For You", category:"utility", graduated:true, lore:"Mindful tokenomics. Zero emission growth model. Holders meditate on immutable yield streams.", sparkline:[70,72,71,74,76,75,78,80,79,82,84,83,86,88,87,90,92,91,94,96], color:"#10b981" },
  { id:"tok_storm_cat", name:"StormCat", ticker:"STMC", price:0.00082, change24h:-23.1, marketCap:440000, riskScore:8, tag:"New", category:"meme", graduated:false, lore:"The cat that rides lightning. Born from a 4chan post and a thunderstorm. Pure volatile electricity.", sparkline:[80,75,70,65,60,55,68,72,65,58,50,45,48,42,38,35,32,30,28,25], color:"#ef4444" },
  { id:"tok_gold_flux", name:"GoldFlux", ticker:"GFLX", price:0.3341, change24h:52.6, marketCap:18700000, riskScore:2, tag:"AI Pick", category:"rwa", graduated:true, lore:"Synthetic gold exposure without custody risk. Real-time oracle feeds. Backed by on-chain proof of reserve.", sparkline:[55,60,62,65,68,70,72,78,82,85,88,92,95,98,100,105,110,115,112,120], color:"#e8b84b" },
];

const NARRATIVES = [
  { label:"Dog Meta", score:94, color:"#e8b84b", pulse:true },
  { label:"Memes", score:88, color:"#ef4444", pulse:true },
  { label:"AI Agents", score:87, color:"#38bdf8", pulse:false },
  { label:"Gaming", score:71, color:"#a855f7", pulse:false },
  { label:"RWA", score:65, color:"#10b981", pulse:false },
];

const FILTERS = [
  { key:"all", label:"All", icon:null },
  { key:"trending", label:"Trending", icon:TrendingUp },
  { key:"new", label:"New", icon:Zap },
  { key:"graduating", label:"Graduating", icon:Award },
  { key:"ai", label:"AI Pick", icon:Brain },
];

function fmtCap(n: number) {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n/1_000).toFixed(0)}K`;
  return `$${n}`;
}
function fmtPrice(n: number) {
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.01) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(6)}`;
}
function riskColor(s: number) { return s <= 3 ? "#10b981" : s <= 6 ? "#f59e0b" : "#ef4444"; }
function riskLabel(s: number) { return s <= 3 ? "Safe" : s <= 6 ? "Mid" : "Degen"; }
function catIcon(c: string) {
  return c==="meme"?"🐸":c==="ai"?"🤖":c==="gaming"?"🎮":c==="rwa"?"🏦":c==="utility"?"⚡":"✦";
}

type Token = typeof MOCK_TOKENS[0];

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height=36, width=80 }: { data:number[]; color:string; height?:number; width?:number }) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx-mn||1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-mn)/rng)*height}`);
  const pl = pts.join(" ");
  const area = `${pts[0].split(",")[0]},${height} ${pl} ${pts[pts.length-1].split(",")[0]},${height}`;
  const gid = `sg${color.replace("#","")}${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow:"visible",display:"block"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`}/>
      <polyline points={pl} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Token Avatar ─────────────────────────────────────────────────────────────
function TokenAvatar({ token, size=44 }: { token:Token; size?:number }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${token.color}cc,${token.color}44)`,border:`2px solid ${token.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size>60?28:size>44?20:15,boxShadow:`0 0 24px -4px ${token.color}66`,flexShrink:0}}>
      {catIcon(token.category)}
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ token, index }: { token:Token; index:number }) {
  const up = token.change24h > 0;
  const rc = riskColor(token.riskScore);
  const tagBg = token.tag==="For You"?"rgba(168,85,247,0.12)":token.tag==="AI Pick"?"rgba(56,189,248,0.12)":"rgba(232,184,75,0.08)";
  const tagColor = token.tag==="For You"?"#a855f7":token.tag==="AI Pick"?"#38bdf8":"#e8b84b";
  const tagBorder = token.tag==="For You"?"rgba(168,85,247,0.25)":token.tag==="AI Pick"?"rgba(56,189,248,0.25)":"rgba(232,184,75,0.2)";
  return (
    <motion.div
      initial={{opacity:0,y:24,scale:0.95}}
      animate={{opacity:1,y:0,scale:1}}
      transition={{duration:0.55,delay:Math.min(index*0.04,0.45),ease:EASE}}
      whileHover={{y:-6,transition:{duration:0.3,ease:EASE}}}
      style={{background:"linear-gradient(160deg,rgba(20,16,10,0.99)0%,rgba(12,10,7,0.99)100%)",border:"1px solid rgba(232,184,75,0.18)",borderRadius:16,padding:"16px",cursor:"pointer",position:"relative",overflow:"hidden",height:"100%",boxSizing:"border-box"}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <TokenAvatar token={token} size={40}/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",fontWeight:600,padding:"2px 7px",borderRadius:999,background:up?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:up?"#10b981":"#ef4444",border:`1px solid ${up?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,display:"flex",alignItems:"center",gap:2}}>
            {up?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}
            {up?"+":""}{token.change24h.toFixed(1)}%
          </div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"2px 6px",borderRadius:999,background:tagBg,color:tagColor,border:`1px solid ${tagBorder}`}}>
            {token.tag==="AI Pick"&&"✦ "}{token.tag==="Trending"&&"🔥 "}{token.tag}
          </div>
        </div>
      </div>
      <div style={{marginBottom:8}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",color:"#f5e6c8",fontWeight:500,lineHeight:1.2}}>{token.name}</div>
        <div style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",letterSpacing:"0.25em",color:"#6b6987",textTransform:"uppercase",marginTop:2}}>{token.ticker}</div>
      </div>
      <div style={{marginBottom:10}}>
        <Sparkline data={token.sparkline} color={up?"#10b981":"#ef4444"} height={32} width={120}/>
      </div>
      <div style={{fontFamily:"var(--font-mono)",fontSize:"0.88rem",color:"#ffffff",fontWeight:600,marginBottom:8}}>{fmtPrice(token.price)}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",color:"#6b6987",letterSpacing:"0.15em",textTransform:"uppercase"}}>MCap</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.72rem",color:"#f5e6c8"}}>{fmtCap(token.marketCap)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:999,background:`${rc}18`,border:`1px solid ${rc}35`}}>
          <Shield size={10} style={{color:rc}}/>
          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:rc,fontWeight:600}}>{riskLabel(token.riskScore)} {token.riskScore}/10</span>
        </div>
      </div>
      <motion.div initial={{scaleX:0}} whileHover={{scaleX:1}} transition={{duration:0.4,ease:EASE}} style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${token.color},transparent)`,transformOrigin:"left"}}/>
    </motion.div>
  );
}

// ─── Feed Card ────────────────────────────────────────────────────────────────
function FeedCard({ token, onLike, liked, bookmarked, onBookmark }: { token:Token; onLike:()=>void; liked:boolean; bookmarked:boolean; onBookmark:()=>void }) {
  const up = token.change24h > 0;
  const rc = riskColor(token.riskScore);
  const actions = [
    { icon:Heart, label:liked?"Liked":"Like", active:liked, color:"#ef4444", onClick:onLike },
    { icon:Bookmark, label:bookmarked?"Saved":"Save", active:bookmarked, color:"#e8b84b", onClick:onBookmark },
    { icon:Share2, label:"Share", active:false, color:"#38bdf8", onClick:()=>{} },
  ] as const;
  return (
    <div style={{display:"flex",gap:16,height:"100%",alignItems:"stretch"}}>
      <div style={{flex:1,background:"linear-gradient(160deg,rgba(20,16,10,0.99)0%,rgba(10,8,5,0.99)100%)",border:`1px solid ${token.color}44`,borderRadius:24,padding:"28px 32px",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:`0 0 80px -30px ${token.color}44`}}>
        <div style={{position:"absolute",top:"-20%",right:"-10%",width:"60%",height:"60%",borderRadius:"50%",background:`radial-gradient(circle,${token.color}18 0%,transparent 70%)`,filter:"blur(40px)",pointerEvents:"none"}}/>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24}}>
            <TokenAvatar token={token} size={80}/>
            <div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"2rem",color:"#f5e6c8",fontWeight:600,lineHeight:1.1}}>{token.name}</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"0.72rem",letterSpacing:"0.3em",color:"#6b6987",textTransform:"uppercase",marginTop:4}}>{token.ticker}</div>
              <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"0.65rem",padding:"3px 10px",borderRadius:999,background:up?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",color:up?"#10b981":"#ef4444",border:`1px solid ${up?"rgba(16,185,129,0.35)":"rgba(239,68,68,0.35)"}`,display:"flex",alignItems:"center",gap:3,fontWeight:700}}>
                  {up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{up?"+":""}{token.change24h.toFixed(1)}% 24h
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:999,background:`${rc}15`,border:`1px solid ${rc}30`}}>
                  <Shield size={11} style={{color:rc}}/>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:"0.65rem",color:rc,fontWeight:600}}>Risk {token.riskScore}/10</span>
                </div>
                {token.graduated&&(
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",padding:"3px 10px",borderRadius:999,background:"rgba(232,184,75,0.1)",color:"#e8b84b",border:"1px solid rgba(232,184,75,0.25)",display:"flex",alignItems:"center",gap:3}}>
                    <Award size={10}/> Graduated
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{fontFamily:"var(--font-body)",fontSize:"0.95rem",color:"#a09880",lineHeight:1.65,marginBottom:24,padding:"16px 20px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
            {token.lore}
          </div>
          <div style={{background:"rgba(0,0,0,0.4)",borderRadius:12,padding:"16px 20px",border:"1px solid rgba(255,255,255,0.06)",marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"#6b6987",letterSpacing:"0.2em",textTransform:"uppercase"}}>Price</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"1.5rem",color:"#ffffff",fontWeight:700}}>{fmtPrice(token.price)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"#6b6987",letterSpacing:"0.2em",textTransform:"uppercase"}}>Market Cap</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"1rem",color:"#f5e6c8",fontWeight:600}}>{fmtCap(token.marketCap)}</div>
              </div>
            </div>
            <Sparkline data={token.sparkline} color={up?"#10b981":"#ef4444"} height={60} width={500}/>
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          <Link href={`/token/${token.id}`} style={{flex:1,textDecoration:"none"}}>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} style={{width:"100%",padding:"14px",borderRadius:12,background:"linear-gradient(135deg,#e8b84b,#a9791f)",color:"#050403",fontFamily:"var(--font-mono)",fontSize:"0.85rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 24px -8px rgba(232,184,75,0.5)"}}>
              <Zap size={14}/> Buy {token.ticker}
            </motion.button>
          </Link>
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} style={{padding:"14px 18px",borderRadius:12,background:"rgba(232,184,75,0.08)",border:"1px solid rgba(232,184,75,0.25)",color:"#e8b84b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <ArrowUpRight size={16}/>
          </motion.button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,justifyContent:"flex-end",paddingBottom:8}}>
        {actions.map(({ icon:Icon, label, active, color, onClick }) => (
          <motion.button key={label} onClick={onClick} whileHover={{scale:1.1}} whileTap={{scale:0.9}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 12px",borderRadius:16,background:active?`${color}22`:"rgba(255,255,255,0.04)",border:`1px solid ${active?color+"44":"rgba(255,255,255,0.08)"}`,cursor:"pointer",color:active?color:"#6b6987",transition:"all 0.2s",minWidth:58}}>
            <Icon size={22} fill={active?color:"transparent"}/>
            <span style={{fontFamily:"var(--font-mono)",fontSize:"0.55rem",letterSpacing:"0.1em"}}>{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Narrative Radar ─────────────────────────────────────────────────────────
function NarrativeRadar() {
  return (
    <div style={{background:"linear-gradient(160deg,rgba(16,13,8,0.99)0%,rgba(10,8,5,0.99)100%)",border:"1px solid rgba(232,184,75,0.22)",borderRadius:20,padding:"20px"}}>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <Brain size={13} style={{color:"#e8b84b"}}/>
          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",letterSpacing:"0.3em",textTransform:"uppercase",color:"#e8b84b"}}>L13 Narrative</span>
        </div>
        <div style={{fontFamily:"var(--font-display)",fontSize:"0.9rem",color:"#f5e6c8",fontWeight:500}}>Radar</div>
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(232,184,75,0.4),transparent)",marginTop:12}}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {NARRATIVES.map((n,i)=>(
          <motion.div key={n.label} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.08,duration:0.5,ease:EASE}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{position:"relative",width:8,height:8,flexShrink:0}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:n.color,boxShadow:`0 0 6px ${n.color}`}}/>
                  {n.pulse&&(
                    <motion.div animate={{scale:[1,2.4,1],opacity:[0.7,0,0.7]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}} style={{position:"absolute",inset:0,borderRadius:"50%",background:n.color}}/>
                  )}
                </div>
                <span style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",color:"#f5e6c8"}}>{n.label}</span>
              </div>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",color:n.color,fontWeight:700}}>{n.score}</span>
            </div>
            <div style={{height:4,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <motion.div initial={{width:0}} animate={{width:`${n.score}%`}} transition={{delay:0.5+i*0.1,duration:0.9,ease:EASE}} style={{height:"100%",borderRadius:999,background:`linear-gradient(90deg,${n.color}88,${n.color})`,boxShadow:`0 0 8px ${n.color}66`}}/>
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:7}}>
        <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}} style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 6px #10b981",flexShrink:0}}/>
        <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",color:"#6b6987",letterSpacing:"0.12em"}}>LIVE · AI-indexed</span>
      </div>
    </div>
  );
}

// ─── AI Pump Forecaster ───────────────────────────────────────────────────────
interface NarrativeForecast {
  name: string;
  confidence: number;
  trend: "Heating Up" | "Stable" | "Cooling" | "PEAK";
  timeframe: "Next 24h" | "Next 3d" | "Next 7d";
  tag: "AI Pick" | "High Risk" | "Watch";
  color: string;
  emoji?: string;
}

const STATIC_FORECASTS: NarrativeForecast[] = [
  { name: "Dog Meta",     confidence: 87, trend: "Heating Up", timeframe: "Next 24h", tag: "AI Pick",  color: "#e8b84b" },
  { name: "AI Agents",   confidence: 79, trend: "Heating Up", timeframe: "Next 3d",  tag: "AI Pick",  color: "#a855f7" },
  { name: "Gaming NFTs", confidence: 64, trend: "Stable",     timeframe: "Next 3d",  tag: "Watch",    color: "#38bdf8" },
  { name: "RWA",         confidence: 41, trend: "Cooling",    timeframe: "Next 7d",  tag: "High Risk", color: "#ef4444" },
  { name: "Meme Season", confidence: 91, trend: "PEAK",       timeframe: "Next 24h", tag: "AI Pick",  color: "#f97316", emoji: "🔥" },
  { name: "DePIN",       confidence: 55, trend: "Heating Up", timeframe: "Next 3d",  tag: "Watch",    color: "#14b8a6" },
];

function trendArrow(trend: NarrativeForecast["trend"]): string {
  if (trend === "Heating Up" || trend === "PEAK") return "↑";
  if (trend === "Cooling") return "↓";
  return "→";
}

function trendColor(trend: NarrativeForecast["trend"]): string {
  if (trend === "PEAK") return "#f97316";
  if (trend === "Heating Up") return "#10b981";
  if (trend === "Cooling") return "#ef4444";
  return "#6b6987";
}

function tagStyle(tag: NarrativeForecast["tag"]): { color: string; bg: string; border: string } {
  if (tag === "AI Pick")   return { color: "#e8b84b", bg: "rgba(232,184,75,0.12)",  border: "rgba(232,184,75,0.3)"  };
  if (tag === "High Risk") return { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   };
  return                          { color: "#38bdf8", bg: "rgba(56,189,248,0.10)",  border: "rgba(56,189,248,0.25)" };
}

function AIPumpForecaster() {
  const [expanded, setExpanded] = useState(false);
  const [forecasts, setForecasts] = useState<NarrativeForecast[]>(STATIC_FORECASTS);

  useEffect(() => {
    if (!expanded) return;
    fetch("/api/pump-forecast")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setForecasts(d); })
      .catch(() => {/* keep static */});
  }, [expanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        background: "rgba(10,8,5,0.95)",
        border: "1px solid rgba(168,85,247,0.25)",
        borderRadius: 20,
        marginBottom: 18,
        overflow: "hidden",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>🔮</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a855f7" }}>
            AI Pump Forecaster
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#6b6987", marginLeft: 8 }}>
            Predictive narrative heatmap
          </span>
        </div>

        {/* Pulse dot */}
        <motion.div
          animate={{ opacity: [1, 0.25, 1], scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", flexShrink: 0 }}
        />

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ color: "#a855f7", flexShrink: 0, display: "flex" }}
        >
          <ChevronDown size={15} />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="forecaster-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 18px 18px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
              {forecasts.map((n, i) => {
                const ts = tagStyle(n.tag);
                const tc = trendColor(n.trend);
                const confidencePct = n.confidence;
                return (
                  <motion.div
                    key={n.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
                    style={{
                      background: "rgba(5,4,3,0.85)",
                      border: `1px solid rgba(255,255,255,0.07)`,
                      borderLeft: `3px solid ${n.color}`,
                      borderRadius: 12,
                      padding: "12px 14px",
                      maxHeight: 130,
                      boxSizing: "border-box",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Name row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 600, color: "#f5e6c8" }}>
                        {n.emoji && <span style={{ marginRight: 4 }}>{n.emoji}</span>}
                        {n.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.48rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: 999,
                          color: ts.color,
                          background: ts.bg,
                          border: `1px solid ${ts.border}`,
                        }}
                      >
                        {n.tag}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.35rem", fontWeight: 700, color: n.color, lineHeight: 1 }}>
                        {confidencePct}%
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: tc, fontWeight: 600 }}>
                        {trendArrow(n.trend)} {n.trend}
                      </span>
                    </div>

                    {/* Heat bar */}
                    <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.07)", marginBottom: 6, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidencePct}%` }}
                        transition={{ duration: 0.9, delay: i * 0.06 + 0.2, ease: EASE }}
                        style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg,${n.color}88,${n.color})`, boxShadow: `0 0 6px ${n.color}66` }}
                      />
                    </div>

                    {/* Timeframe */}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "#6b6987", letterSpacing: "0.08em" }}>
                      {n.timeframe}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [mode, setMode] = useState<"grid"|"feed"|"foryou">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [feedIndex, setFeedIndex] = useState(0);
  const [likes, setLikes] = useState<Record<string,boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string,boolean>>({});
  const [searchFocused, setSearchFocused] = useState(false);
  const [forYouTokens, setForYouTokens] = useState<Array<{id:string;matchScore:number;reason:string}>>([]);
  const [forYouLoading, setForYouLoading] = useState(false);
  const [forYouLoaded, setForYouLoaded] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const wheelCooldown = useRef(false);
  const touchStartY = useRef(0);

  const filtered = MOCK_TOKENS.filter(t => {
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.ticker.toLowerCase().includes(search.toLowerCase());
    const mf = activeFilter==="all" || (activeFilter==="trending"&&t.tag==="Trending") || (activeFilter==="new"&&t.tag==="New") || (activeFilter==="graduating"&&t.graduated) || (activeFilter==="ai"&&t.tag==="AI Pick");
    return ms && mf;
  });

  const currentToken = filtered[feedIndex] ?? filtered[0];

  const navigate = useCallback((dir: "up"|"down") => {
    setFeedIndex(i => dir==="up" ? Math.max(0,i-1) : Math.min(filtered.length-1,i+1));
  }, [filtered.length]);

  const fetchForYou = useCallback(async () => {
    if (forYouLoading) return;
    setForYouLoading(true);
    try {
      const res = await fetch("/api/personalized-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentViews: ["tok_luna_doge", "tok_ai_swarm"] }),
      });
      const data = await res.json();
      setForYouTokens(data.tokens ?? []);
      setForYouLoaded(true);
    } catch {
      setForYouTokens([
        { id: "tok_luna_doge", matchScore: 94, reason: "Matches Dog Meta interest · top momentum token" },
        { id: "tok_ai_swarm", matchScore: 88, reason: "AI narrative aligns with your AI Agents interest" },
        { id: "tok_degen_ape", matchScore: 81, reason: "High momentum (+388%) fits your degen profile" },
        { id: "tok_cyber_pep", matchScore: 76, reason: "Meme momentum play · similar to tokens you viewed" },
        { id: "tok_nova_flux", matchScore: 71, reason: "AI category + graduated status = lower risk match" },
        { id: "tok_gold_flux", matchScore: 65, reason: "RWA exposure diversifies your meme-heavy portfolio" },
      ]);
      setForYouLoaded(true);
    } finally {
      setForYouLoading(false);
    }
  }, [forYouLoading]);

  useEffect(() => {
    if (mode === "foryou" && !forYouLoaded) fetchForYou();
  }, [mode, forYouLoaded, fetchForYou]);

  // ── Keyboard arrows ──
  useEffect(() => {
    if (mode !== "feed") return;
    const h = (e: KeyboardEvent) => {
      if (e.key==="ArrowDown") { e.preventDefault(); navigate("down"); }
      if (e.key==="ArrowUp")   { e.preventDefault(); navigate("up"); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mode, navigate]);

  // ── Mouse wheel + trackpad scroll ──
  useEffect(() => {
    if (mode !== "feed") return;
    let accumulated = 0;
    let locked = false;
    let resetTimer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locked) return;

      accumulated += e.deltaY;

      // Reset accumulator if user pauses (no events for 80ms)
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulated = 0; }, 80);

      // Only fire when accumulated gesture crosses the threshold
      if (Math.abs(accumulated) < 80) return;

      locked = true;
      accumulated = 0;
      clearTimeout(resetTimer);

      if (e.deltaY > 0) navigate("down");
      else navigate("up");

      // Long lock to let the card animation finish before accepting next gesture
      setTimeout(() => { locked = false; }, 950);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(resetTimer);
    };
  }, [mode, navigate]);

  // ── Touch swipe ──
  useEffect(() => {
    if (mode !== "feed") return;
    const el = feedRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50) return;
      if (delta > 0) navigate("down"); else navigate("up");
    };
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    return () => { el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchend", onTouchEnd); };
  }, [mode, navigate]);

  const navItems = [
    { dir:"up" as const, Icon:ChevronUp, disabled:feedIndex===0 },
    { dir:"down" as const, Icon:ChevronDown, disabled:feedIndex===filtered.length-1 },
  ];

  return (
    <div style={{maxWidth:1400,margin:"0 auto"}} className="px-4 xl:px-0">
      {/* ── Header bar ── */}
      <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE}} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:4}}>
          <Flame size={18} style={{color:"#e8b84b"}}/>
          <span style={{fontFamily:"var(--font-display)",fontSize:"1.1rem",fontWeight:600,background:"linear-gradient(90deg,#e8b84b,#ffe6a3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"0.08em"}}>EXPLORE</span>
          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",color:"#6b6987",letterSpacing:"0.2em",textTransform:"uppercase"}}>· {filtered.length} tokens</span>
        </div>

        <div style={{position:"relative",flex:1,minWidth:150}}>
          <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:searchFocused?"#e8b84b":"#6b6987",transition:"color 0.2s"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)} placeholder="Search tokens..." style={{width:"100%",paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${searchFocused?"rgba(232,184,75,0.5)":"rgba(232,184,75,0.15)"}`,borderRadius:999,fontFamily:"var(--font-mono)",fontSize:"0.75rem",color:"#f5e6c8",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box"}}/>
        </div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {FILTERS.map(({key,label,icon:Icon})=>{
            const active = activeFilter===key;
            return (
              <motion.button key={key} onClick={()=>setActiveFilter(key)} whileHover={{scale:1.04}} whileTap={{scale:0.96}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:999,fontFamily:"var(--font-mono)",fontSize:"0.65rem",letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",border:active?"1px solid rgba(232,184,75,0.55)":"1px solid rgba(255,255,255,0.08)",background:active?"linear-gradient(135deg,rgba(232,184,75,0.18),rgba(232,184,75,0.08))":"rgba(255,255,255,0.03)",color:active?"#e8b84b":"#6b6987",transition:"all 0.2s"}}>
                {Icon&&<Icon size={11}/>}{label}
              </motion.button>
            );
          })}
        </div>

        <div style={{flex:1}}/>

        <div style={{display:"flex",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(232,184,75,0.15)",borderRadius:10,padding:3,gap:2}}>
          {([
            { key: "grid" as const, icon: <Grid3x3 size={13}/>, label: "Grid" },
            { key: "feed" as const, icon: <PlayCircle size={13}/>, label: "Feed" },
            { key: "foryou" as const, icon: <Sparkles size={13}/>, label: "For You" },
          ]).map(({ key, icon, label }) => (
            <motion.button
              key={key}
              onClick={() => { setMode(key); setFeedIndex(0); }}
              whileTap={{ scale: 0.94 }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 7,
                background: mode === key ? (key === "foryou" ? "rgba(168,85,247,0.18)" : "rgba(232,184,75,0.18)") : "transparent",
                border: mode === key ? `1px solid ${key === "foryou" ? "rgba(168,85,247,0.5)" : "rgba(232,184,75,0.35)"}` : "1px solid transparent",
                color: mode === key ? (key === "foryou" ? "#a855f7" : "#e8b84b") : "#6b6987",
                cursor: "pointer", fontFamily: "var(--font-mono)",
                fontSize: "0.65rem", letterSpacing: "0.08em", transition: "all 0.2s"
              }}
            >
              {icon}{label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(232,184,75,0.35),transparent)",marginBottom:22}}/>

      {/* ── AI Pump Forecaster ── */}
      <AIPumpForecaster />

      <div style={{display:"flex",gap:20,alignItems:"flex-start"}} className="flex-col xl:flex-row">
        {/* Content */}

        <div style={{flex:1,minWidth:0}}>
          <AnimatePresence mode="wait">
            {mode==="grid" ? (
              <motion.div key="grid" initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.98}} transition={{duration:0.35,ease:EASE}}>
                {filtered.length===0 ? (
                  <div style={{textAlign:"center",padding:"60px 20px",color:"#6b6987"}}>
                    <Brain size={40} style={{margin:"0 auto 12px",opacity:0.4}}/>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:"0.8rem"}}>No tokens match your filter</div>
                  </div>
                ) : (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
                    {filtered.map((token,i) => (
                      <Link key={token.id} href={`/token/${token.id}`} style={{textDecoration:"none",display:"block"}}>
                        <GridCard token={token} index={i}/>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : mode==="feed" ? (
              <motion.div key="feed" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.35,ease:EASE}} style={{position:"relative"}}>
                {/* Scroll/swipe hint */}
                <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:0.8}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10}}>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",letterSpacing:"0.2em",color:"rgba(232,184,75,0.5)",textTransform:"uppercase"}}>Scroll · Swipe · Drag</span>
                  <ChevronUp size={10} style={{color:"rgba(232,184,75,0.4)"}}/>
                  <ChevronDown size={10} style={{color:"rgba(232,184,75,0.4)"}}/>
                </motion.div>
                <div ref={feedRef} style={{height:"calc(100vh - 210px)",minHeight:520,position:"relative",cursor:"grab"}}>
                  <AnimatePresence mode="wait">
                    {currentToken && (
                      <motion.div
                        key={currentToken.id}
                        initial={{opacity:0,y:60}}
                        animate={{opacity:1,y:0}}
                        exit={{opacity:0,y:-60}}
                        transition={{duration:0.45,ease:EASE}}
                        drag="y"
                        dragConstraints={{top:0,bottom:0}}
                        dragElastic={0.18}
                        onDragEnd={(_,info) => {
                          if (info.offset.y < -60) navigate("down");
                          else if (info.offset.y > 60) navigate("up");
                        }}
                        style={{height:"100%",cursor:"grab"}}
                      >
                        <FeedCard token={currentToken} liked={!!likes[currentToken.id]} bookmarked={!!bookmarks[currentToken.id]} onLike={()=>setLikes(p=>({...p,[currentToken.id]:!p[currentToken.id]}))} onBookmark={()=>setBookmarks(p=>({...p,[currentToken.id]:!p[currentToken.id]}))}/>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div style={{position:"absolute",right:-52,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:8}}>
                    {navItems.map(({dir,Icon,disabled}) => (
                      <motion.button key={dir} onClick={()=>navigate(dir)} disabled={disabled} whileHover={!disabled?{scale:1.1}:{}} whileTap={!disabled?{scale:0.9}:{}} style={{width:40,height:40,borderRadius:12,background:disabled?"rgba(255,255,255,0.03)":"rgba(232,184,75,0.12)",border:`1px solid ${disabled?"rgba(255,255,255,0.06)":"rgba(232,184,75,0.3)"}`,color:disabled?"#2a2820":"#e8b84b",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Icon size={18}/>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
                  {filtered.map((t,i) => (
                    <motion.button key={t.id} onClick={()=>setFeedIndex(i)} animate={{width:i===feedIndex?24:6,background:i===feedIndex?"#e8b84b":"rgba(255,255,255,0.12)"}} transition={{duration:0.3,ease:EASE}} style={{height:6,borderRadius:999,border:"none",cursor:"pointer",padding:0}}/>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="foryou" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.35,ease:EASE}}>
                {/* For You Header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,padding:"14px 18px",background:"rgba(10,5,20,0.95)",border:"1px solid rgba(168,85,247,0.3)",borderRadius:16,flexWrap:"wrap",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Sparkles size={16} style={{color:"#a855f7",flexShrink:0}}/>
                    <div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:"0.7rem",fontWeight:700,color:"#a855f7",letterSpacing:"0.1em"}}>Your Personalized Feed</div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:"0.55rem",color:"#6b6987",marginTop:2}}>AI curated · updated every 5 minutes</div>
                    </div>
                    <motion.div animate={{opacity:[1,0.3,1],scale:[1,1.4,1]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}} style={{width:6,height:6,borderRadius:"50%",background:"#a855f7",boxShadow:"0 0 8px #a855f7",flexShrink:0}}/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["🐕 Dog Meta Fan","📈 Momentum Trader","⚡ Early Bird"].map(tag=>(
                        <span key={tag} style={{fontFamily:"var(--font-mono)",fontSize:"0.55rem",padding:"2px 8px",borderRadius:999,background:"rgba(168,85,247,0.12)",border:"1px solid rgba(168,85,247,0.25)",color:"#a855f7"}}>{tag}</span>
                      ))}
                    </div>
                    <motion.button onClick={fetchForYou} whileTap={{scale:0.95}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:"transparent",border:"1px solid rgba(168,85,247,0.35)",color:"#a855f7",cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:"0.6rem"}}>
                      <RefreshCw size={11} style={forYouLoading?{animation:"spin 1s linear infinite"}:{}}/> Refresh
                    </motion.button>
                  </div>
                </div>
                {/* Token Cards */}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {forYouLoading && forYouTokens.length === 0 ? (
                    <div style={{textAlign:"center",padding:"40px",color:"#6b6987",fontFamily:"var(--font-mono)",fontSize:"0.75rem"}}>
                      <Sparkles size={28} style={{margin:"0 auto 10px",display:"block",opacity:0.4,color:"#a855f7"}}/>
                      AI is curating your feed...
                    </div>
                  ) : (
                    forYouTokens.map((item, i) => {
                      const token = MOCK_TOKENS.find(t => t.id === item.id);
                      if (!token) return null;
                      const up = token.change24h > 0;
                      const matchColor = item.matchScore >= 85 ? "#a855f7" : item.matchScore >= 70 ? "#e8b84b" : "#10b981";
                      return (
                        <motion.div
                          key={token.id}
                          initial={{opacity:0,x:-20}}
                          animate={{opacity:1,x:0}}
                          transition={{delay:i*0.07,duration:0.4,ease:EASE}}
                          style={{
                            background:"linear-gradient(135deg,rgba(16,10,30,0.98),rgba(10,8,5,0.98))",
                            border:`1px solid ${matchColor}33`,
                            borderLeft:`3px solid ${matchColor}`,
                            borderRadius:16,
                            padding:"16px 20px",
                            display:"flex",
                            alignItems:"center",
                            gap:16,
                            cursor:"pointer",
                            boxShadow:`0 0 24px -8px ${matchColor}22`,
                            flexWrap:"wrap",
                          }}
                          onClick={() => window.location.href = `/token/${token.id}`}
                        >
                          {/* Rank */}
                          <div style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:`${matchColor}18`,border:`1px solid ${matchColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",fontSize:"0.6rem",fontWeight:700,color:matchColor}}>#{i+1}</div>
                          {/* Avatar */}
                          <div style={{flexShrink:0,width:44,height:44,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${token.color}cc,${token.color}44)`,border:`2px solid ${token.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{catIcon(token.category)}</div>
                          {/* Info */}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.8rem",fontWeight:700,color:"#f5e6c8"}}>{token.name}</span>
                              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"#6b6987"}}>${token.ticker}</span>
                            </div>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"#8a7ab0",marginBottom:6}}>🤖 {item.reason}</div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.7rem",color:"#f5e6c8",fontWeight:600}}>{fmtPrice(token.price)}</span>
                              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",padding:"1px 6px",borderRadius:999,background:up?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:up?"#10b981":"#ef4444",border:`1px solid ${up?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`}}>{up?"+":""}{token.change24h.toFixed(1)}%</span>
                            </div>
                          </div>
                          {/* Match score + sparkline */}
                          <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                            <div style={{fontFamily:"var(--font-mono)",fontSize:"0.65rem",fontWeight:700,color:matchColor}}>{item.matchScore}% match</div>
                            <Sparkline data={token.sparkline} color={token.color} width={70} height={30}/>
                          </div>
                          {/* Action */}
                          <div style={{flexShrink:0}}>
                            <motion.button whileHover={{y:-2}} whileTap={{scale:0.95}} onClick={(e)=>{e.stopPropagation();window.location.href=`/token/${token.id}`;}} style={{padding:"6px 14px",borderRadius:8,background:`${matchColor}18`,border:`1px solid ${matchColor}44`,color:matchColor,cursor:"pointer",fontFamily:"var(--font-mono)",fontSize:"0.6rem",fontWeight:700}}>View →</motion.button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
                {/* AI Taste Profile */}
                <div style={{marginTop:20,padding:"16px 18px",background:"rgba(10,5,20,0.9)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                    <Sparkles size={12} style={{color:"#a855f7"}}/>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",letterSpacing:"0.15em",color:"#a855f7",textTransform:"uppercase" as const}}>AI Taste Profile</span>
                  </div>
                  {([{label:"Meme tokens",pct:68,color:"#e8b84b"},{label:"AI tokens",pct:22,color:"#a855f7"},{label:"Utility",pct:10,color:"#38bdf8"}]).map(({label,pct,color})=>(
                    <div key={label} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",color:"#6b6987"}}>{label}</span>
                        <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",color,fontWeight:600}}>{pct}%</span>
                      </div>
                      <div style={{height:4,borderRadius:999,background:"rgba(255,255,255,0.06)"}}>
                        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:EASE}} style={{height:"100%",borderRadius:999,background:color}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:10,fontFamily:"var(--font-mono)",fontSize:"0.55rem",color:"#4a4560"}}>Based on your on-chain history and viewing patterns</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.6,delay:0.2,ease:EASE}} className="hidden xl:flex flex-col" style={{flexShrink:0,width:230}}>
          <NarrativeRadar/>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.4,ease:EASE}} style={{marginTop:14,background:"linear-gradient(160deg,rgba(16,13,8,0.99)0%,rgba(10,8,5,0.99)100%)",border:"1px solid rgba(232,184,75,0.15)",borderRadius:20,padding:"18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
              <TrendingUp size={13} style={{color:"#10b981"}}/>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",letterSpacing:"0.22em",textTransform:"uppercase",color:"#10b981"}}>Market Pulse</span>
            </div>
            {([
              { label:"Total Tokens", value:`${MOCK_TOKENS.length}`, color:undefined },
              { label:"Graduated", value:`${MOCK_TOKENS.filter(t=>t.graduated).length}`, color:undefined },
              { label:"Avg 24h", value:`+${(MOCK_TOKENS.reduce((a,t)=>a+t.change24h,0)/MOCK_TOKENS.length).toFixed(1)}%`, color:"#10b981" },
              { label:"Top Gainer", value:"DAPE +388%", color:"#e8b84b" },
            ] as {label:string;value:string;color:string|undefined}[]).map(({label,value,color}) => (
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",color:"#6b6987"}}>{label}</span>
                <span style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",color:color??"#f5e6c8",fontWeight:600}}>{value}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
