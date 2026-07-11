"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Bot,
  Brain,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  Lightbulb,
  MessageSquare,
  SendHorizonal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const GOLD = "#e8b84b";
const BG_CARD = "rgba(18,14,8,0.92)";
const BG_PANEL = "rgba(10,8,5,0.95)";
const BORDER = "rgba(232,184,75,0.28)";
const SUCCESS = "#10b981";
const DANGER = "#ef4444";
const VIOLET = "#a855f7";
const DIM = "rgba(232,184,75,0.45)";
const INK = "#f0e6cc";

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      {prefix}
      {Math.round(n).toLocaleString()}
      {suffix}
    </span>
  );
}

const PROPOSALS = [
  { id: 1, title: "Integrate ZK-Rollups for Launchpad", author: "0xNova", time: "2h ago", category: "Protocol", forPct: 78, forVotes: 9360, againstVotes: 2640, quorum: 12000, status: "Active", endsIn: "2d 14h" },
  { id: 2, title: "Increase Staking APY by 2%", author: "WhaleKing", time: "6h ago", category: "Economics", forPct: 52, forVotes: 5200, againstVotes: 4800, quorum: 10000, status: "Active", endsIn: "4d 3h" },
  { id: 3, title: "Burn 10% Protocol Revenue", author: "DegenDave", time: "3d ago", category: "Economics", forPct: 94, forVotes: 18800, againstVotes: 1200, quorum: 20000, status: "Passed", endsIn: "Ended" },
  { id: 4, title: "Add Solana Mobile Support", author: "CryptoQueen", time: "1d ago", category: "Community", forPct: 61, forVotes: 7320, againstVotes: 4680, quorum: 12000, status: "Active", endsIn: "1d 8h" },
  { id: 5, title: "Reduce Launch Fee to 0.005 SOL", author: "SolKing", time: "5d ago", category: "Protocol", forPct: 43, forVotes: 4300, againstVotes: 5700, quorum: 10000, status: "Failed", endsIn: "Ended" },
];

const INCUBATOR_PROJECTS = [
  { id: 1, emoji: "🤖", name: "NovAI", ticker: "$NOVAI", stage: "Seed", desc: "AI-powered trading protocol with on-chain model inference and auto-rebalancing vaults.", raised: 42, goal: 100, votes: 1284, daysLeft: 18 },
  { id: 2, emoji: "🌌", name: "CosmicDAO", ticker: "$COSM", stage: "Growth", desc: "Next-gen community governance framework with quadratic voting and reputation staking.", raised: 78, goal: 100, votes: 3740, daysLeft: 9 },
  { id: 3, emoji: "🎮", name: "PixelVault", ticker: "$PXV", stage: "Ready", desc: "Gaming NFT platform bridging Web2 studios with on-chain asset ownership and royalties.", raised: 95, goal: 100, votes: 6021, daysLeft: 3 },
  { id: 4, emoji: "⚡", name: "SolarDEX", ticker: "$SLRX", stage: "Seed", desc: "Decentralized exchange with solar-energy-indexed liquidity pools and green yield incentives.", raised: 31, goal: 100, votes: 892, daysLeft: 24 },
];

const FILTERS = ["All", "Active", "Passed", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

const STAGE_COLORS: Record<string, string> = { Seed: "#e8b84b", Growth: "#10b981", Ready: "#a855f7" };
const STATUS_COLORS: Record<string, string> = { Active: "#e8b84b", Passed: "#10b981", Failed: "#ef4444" };
const CATEGORY_COLORS: Record<string, string> = { Protocol: "#a855f7", Economics: "#e8b84b", Community: "#10b981" };

function StatChip({ icon: Icon, label, value, prefix, suffix, delay }: { icon: LucideIcon; label: string; value: number; prefix?: string; suffix?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}
      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 999, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 10px" }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(232,184,75,0.12)", display: "grid", placeItems: "center" }}>
        <Icon size={13} color={GOLD} />
      </span>
      <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 13, color: INK, fontWeight: 600, fontFamily: "monospace" }}>
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </span>
    </motion.div>
  );
}

function VoteBar({ forPct }: { forPct: number }) {
  return (
    <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${forPct}%` }} transition={{ duration: 0.9, ease: EASE }} style={{ background: SUCCESS, height: "100%" }} />
      <motion.div initial={{ width: 0 }} animate={{ width: `${100 - forPct}%` }} transition={{ duration: 0.9, ease: EASE, delay: 0.05 }} style={{ background: DANGER, height: "100%" }} />
    </div>
  );
}

function ProposalCard({ prop, index, voted, onVote }: { prop: typeof PROPOSALS[0]; index: number; voted: "for" | "against" | null; onVote: (id: number, side: "for" | "against") => void }) {
  const statusColor = STATUS_COLORS[prop.status] ?? GOLD;
  const catColor = CATEGORY_COLORS[prop.category] ?? DIM;
  const isEnded = prop.status !== "Active";
  return (
    <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.07, duration: 0.55, ease: EASE }}
      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 10px", borderRadius: 999, border: `1px solid ${statusColor}55`, background: `${statusColor}18`, color: statusColor, fontWeight: 700 }}>{prop.status}</span>
            <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "2px 9px", borderRadius: 999, border: `1px solid ${catColor}44`, background: `${catColor}14`, color: catColor }}>{prop.category}</span>
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: INK, letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{prop.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace" }}>by {prop.author}</span>
            <Clock size={11} color={DIM} />
            <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace" }}>{prop.time}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, background: "rgba(232,184,75,0.07)", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 12px", fontSize: 11, color: DIM, fontFamily: "monospace", whiteSpace: "nowrap" as const }}>
          <Clock size={11} color={GOLD} />
          {prop.endsIn === "Ended" ? "Ended" : `Ends ${prop.endsIn}`}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <VoteBar forPct={prop.forPct} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontFamily: "monospace" }}>
          <span style={{ color: SUCCESS, fontWeight: 600 }}>{prop.forPct}% FOR</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: DANGER, fontWeight: 600 }}>{100 - prop.forPct}% AGAINST</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: DIM }}>{prop.quorum.toLocaleString()} QUORUM</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(232,184,75,0.35)", fontFamily: "monospace" }}>{prop.forVotes.toLocaleString()} FOR · {prop.againstVotes.toLocaleString()} AGAINST</div>
      </div>
      {!isEnded && (
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }} onClick={() => onVote(prop.id, "for")}
            style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1.5px solid ${voted === "for" ? SUCCESS : `${SUCCESS}55`}`, background: voted === "for" ? `${SUCCESS}22` : "transparent", color: SUCCESS, fontFamily: "monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Check size={13} /> Vote For
          </motion.button>
          <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }} onClick={() => onVote(prop.id, "against")}
            style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1.5px solid ${voted === "against" ? DANGER : `${DANGER}55`}`, background: voted === "against" ? `${DANGER}22` : "transparent", color: DANGER, fontFamily: "monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <X size={13} /> Vote Against
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

function FundingBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: "rgba(232,184,75,0.1)", overflow: "hidden" }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.0, ease: EASE }}
        style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${GOLD}cc, ${GOLD})` }} />
    </div>
  );
}

function IncubatorCard({ proj, index }: { proj: typeof INCUBATOR_PROJECTS[0]; index: number }) {
  const stageColor = STAGE_COLORS[proj.stage] ?? GOLD;
  const pct = Math.round((proj.raised / proj.goal) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08, duration: 0.55, ease: EASE }}
      style={{ background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 30, width: 52, height: 52, borderRadius: 14, background: "rgba(232,184,75,0.08)", border: `1px solid ${BORDER}`, display: "grid", placeItems: "center", flexShrink: 0 }}>{proj.emoji}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: INK }}>{proj.name}</span>
              <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace" }}>{proj.ticker}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "2px 9px", borderRadius: 999, border: `1px solid ${stageColor}44`, background: `${stageColor}14`, color: stageColor, fontWeight: 700, display: "inline-block", marginTop: 4 }}>{proj.stage}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, background: "rgba(232,184,75,0.07)", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 11px", fontSize: 11, color: DIM, fontFamily: "monospace" }}>
          <Clock size={11} color={GOLD} />{proj.daysLeft}d left
        </div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(240,230,204,0.6)", lineHeight: 1.55, margin: 0 }}>{proj.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <FundingBar pct={pct} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: GOLD, fontFamily: "monospace", fontWeight: 700 }}>{pct}% Raised</span>
          <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace" }}>{proj.raised} SOL / {proj.goal} SOL</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: DIM, fontFamily: "monospace" }}>
          <Heart size={12} color={VIOLET} /><span>{proj.votes.toLocaleString()} votes</span>
        </div>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE }}
          style={{ padding: "7px 18px", borderRadius: 999, border: `1.5px solid ${GOLD}`, background: "transparent", color: GOLD, fontFamily: "monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}>
          Support
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── AI Agent types ───────────────────────────────────────────────────────────
type ChatRole = "agent" | "user";
interface ChatMessage { id: number; role: ChatRole; text: string; }
interface AgentAction { type: "Execute" | "Monitor" | "Draft"; description: string; confidence: number; }

const AGENT_STARTER =
  "Treasury Agent online. I have analyzed all 5 governance proposals and identified 2 high-priority actions. The ZK-Rollup integration shows 78% community support — I recommend scheduling execution. The APY increase proposal at 52% is too close to call; I advise waiting 48h for more votes. Ready for your instructions.";

const INITIAL_ACTIONS: AgentAction[] = [
  { type: "Execute",  description: "Schedule ZK-Rollup vote execution",                     confidence: 78 },
  { type: "Monitor",  description: "Watch APY proposal — alert if crosses 60% FOR",          confidence: 94 },
  { type: "Draft",    description: "Draft counter-proposal for reduced launch fee",           confidence: 71 },
];

const ACTION_COLORS: Record<string, string> = { Execute: SUCCESS, Monitor: GOLD, Draft: VIOLET };

const QUICK_CHIPS = [
  "Analyze top proposal",
  "Check treasury health",
  "Simulate vote outcome",
  "Draft new proposal",
];

const TREASURY_METRICS = [
  { label: "Treasury Balance", value: "$4.2M",      delta: "+2.1% this week",       deltaColor: SUCCESS },
  { label: "Protocol Revenue", value: "$48,200/mo", delta: "Generating",            deltaColor: GOLD },
  { label: "Active Proposals", value: "3 of 5",     delta: "In voting",             deltaColor: INK },
  { label: "Burn Rate",        value: "$12,400/mo", delta: "3.9x covered",          deltaColor: "#f59e0b" },
];

function AgentTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState<AgentAction[]>(INITIAL_ACTIONS);
  const [dismissedActions, setDismissedActions] = useState<Set<number>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    setMessages([{ id: nextId.current++, role: "agent", text: AGENT_STARTER }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text: trimmed }]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/treasury-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: { proposals: PROPOSALS, treasury: { balance: 4200000, revenue: 48200, burnRate: 12400 } },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { id: nextId.current++, role: "agent", text: data.response ?? "Agent unavailable." }]);
      if (data.actions && Array.isArray(data.actions)) {
        setActions((prev) => [
          ...data.actions.map((a: AgentAction) => a),
          ...prev,
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: nextId.current++, role: "agent", text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const visibleActions = actions.filter((_, i) => !dismissedActions.has(i));

  return (
    <motion.div key="ai-agent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>

      {/* ── LEFT: Chat ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Chat header */}
        <div style={{ background: BG_CARD, border: `1px solid rgba(168,85,247,0.3)`, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Bot size={18} color={VIOLET} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: INK }}>Treasury Agent</span>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: SUCCESS, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 999, border: `1px solid ${SUCCESS}55`, background: `${SUCCESS}18`, color: SUCCESS, fontWeight: 700 }}>AUTONOMOUS MODE: ON</span>
                </div>
              </div>
            </div>
            <Sparkles size={14} color={VIOLET} />
          </div>
          <p style={{ fontSize: 11, color: "rgba(168,85,247,0.7)", fontFamily: "monospace", margin: 0, letterSpacing: "0.04em" }}>
            Analyzing 5 active proposals · $4.2M treasury · 12,450 members
          </p>
        </div>

        {/* Message history */}
        <div style={{ background: BG_CARD, border: `1px solid rgba(168,85,247,0.22)`, borderRadius: 18, padding: "16px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 340, overflowY: "auto" }}>
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                {m.role === "agent" ? (
                  <div style={{ display: "flex", gap: 8, maxWidth: "90%", alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(168,85,247,0.18)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
                      <Brain size={11} color={VIOLET} />
                    </div>
                    <div style={{ borderLeft: `2px solid rgba(168,85,247,0.5)`, paddingLeft: 10, fontSize: 13, color: INK, fontFamily: "monospace", lineHeight: 1.6 }}>
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: "80%", background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}12)`, border: `1px solid ${GOLD}44`, borderRadius: "14px 14px 4px 14px", padding: "8px 14px", fontSize: 13, color: GOLD, fontFamily: "monospace", lineHeight: 1.55 }}>
                    {m.text}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(168,85,247,0.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Brain size={11} color={VIOLET} />
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", paddingLeft: 12, paddingTop: 6 }}>
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: VIOLET, display: "inline-block" }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: BG_CARD, border: `1px solid rgba(168,85,247,0.28)`, borderRadius: 12, padding: "0 14px", gap: 8 }}>
            <MessageSquare size={13} color="rgba(168,85,247,0.5)" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask the Treasury Agent..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: INK, fontFamily: "monospace", fontSize: 13, padding: "12px 0", caretColor: VIOLET }}
            />
          </div>
          <motion.button whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.2, ease: EASE }}
            onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
            style={{ width: 44, height: 44, borderRadius: 12, background: isLoading || !input.trim() ? "rgba(168,85,247,0.15)" : `linear-gradient(135deg, ${VIOLET}dd, ${VIOLET}99)`, border: `1px solid rgba(168,85,247,0.4)`, display: "grid", placeItems: "center", cursor: isLoading || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0 }}>
            <SendHorizonal size={15} color={isLoading || !input.trim() ? "rgba(168,85,247,0.4)" : "#fff"} />
          </motion.button>
        </div>

        {/* Quick action chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {QUICK_CHIPS.map((chip) => (
            <motion.button key={chip} whileHover={{ y: -1, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}
              onClick={() => sendMessage(chip)}
              style={{ padding: "5px 14px", borderRadius: 999, border: `1px solid rgba(168,85,247,0.3)`, background: "rgba(168,85,247,0.08)", color: "rgba(168,85,247,0.85)", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.05em", cursor: "pointer", fontWeight: 600 }}>
              {chip}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Dashboard panels ──────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Panel 1: Autonomous Actions Queue */}
        <div style={{ background: BG_CARD, border: `1px solid rgba(168,85,247,0.28)`, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <Zap size={16} color={GOLD} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: GOLD, letterSpacing: "0.04em" }}>Agent Actions</span>
            <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 999, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)", color: VIOLET, fontWeight: 700 }}>
              {visibleActions.length} PENDING
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence>
              {actions.map((action, i) => {
                if (dismissedActions.has(i)) return null;
                const acColor = ACTION_COLORS[action.type] ?? VIOLET;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ duration: 0.3, ease: EASE }}
                    style={{ background: BG_PANEL, border: `1px solid ${acColor}33`, borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", padding: "2px 9px", borderRadius: 999, border: `1px solid ${acColor}55`, background: `${acColor}18`, color: acColor, fontWeight: 700 }}>
                        {action.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, color: acColor, fontFamily: "monospace", fontWeight: 700 }}>{action.confidence}%</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(240,230,204,0.75)", fontFamily: "monospace", margin: 0, lineHeight: 1.5 }}>{action.description}</p>
                    {/* Confidence bar */}
                    <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${action.confidence}%` }} transition={{ duration: 0.8, ease: EASE }}
                        style={{ height: "100%", borderRadius: 999, background: acColor }} />
                    </div>
                    <div style={{ display: "flex", gap: 7 }}>
                      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}
                        onClick={() => setDismissedActions((prev) => new Set([...prev, i]))}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${SUCCESS}55`, background: `${SUCCESS}18`, color: SUCCESS, fontFamily: "monospace", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <CheckCircle size={11} /> Approve
                      </motion.button>
                      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}
                        onClick={() => setDismissedActions((prev) => new Set([...prev, i]))}
                        style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1px solid ${DANGER}55`, background: `${DANGER}18`, color: DANGER, fontFamily: "monospace", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <XCircle size={11} /> Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {visibleActions.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "24px 0", color: "rgba(168,85,247,0.4)", fontFamily: "monospace", fontSize: 12 }}>
                All actions resolved ✓
              </motion.div>
            )}
          </div>
        </div>

        {/* Panel 2: Treasury Intelligence */}
        <div style={{ background: BG_CARD, border: `1px solid rgba(168,85,247,0.22)`, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <BarChart3 size={16} color={VIOLET} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: INK, letterSpacing: "0.04em" }}>Treasury Health</span>
            <DollarSign size={13} color={GOLD} style={{ marginLeft: "auto" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {TREASURY_METRICS.map((m) => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: BG_PANEL, borderRadius: 10, border: "1px solid rgba(232,184,75,0.1)" }}>
                <span style={{ fontSize: 11, color: DIM, fontFamily: "monospace", letterSpacing: "0.04em" }}>{m.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: INK, fontFamily: "monospace", fontWeight: 700 }}>{m.value}</span>
                  <span style={{ fontSize: 10, color: m.deltaColor, fontFamily: "monospace" }}>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(168,85,247,0.15)", paddingTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Brain size={13} color={VIOLET} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "rgba(168,85,247,0.75)", fontFamily: "monospace", margin: 0, lineHeight: 1.6 }}>
              Treasury healthy. 14-month runway at current burn. Agent recommends diversifying 20% into yield-bearing positions.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default function VenturePage() {
  const [activeTab, setActiveTab] = useState<"proposals" | "incubator" | "ai-agent">("proposals");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [votedProposals, setVotedProposals] = useState<Map<number, "for" | "against">>(new Map());

  const handleVote = (id: number, side: "for" | "against") => {
    setVotedProposals((prev) => {
      const next = new Map(prev);
      if (next.get(id) === side) { next.delete(id); } else { next.set(id, side); }
      return next;
    });
  };

  const filteredProposals = activeFilter === "All" ? PROPOSALS : PROPOSALS.filter((p) => p.status === activeFilter);
  const tabs = [
    { key: "proposals" as const, label: "Proposals", icon: Lightbulb, badge: null },
    { key: "incubator" as const, label: "Incubator", icon: Zap, badge: null },
    { key: "ai-agent" as const, label: "AI Agent", icon: Bot, badge: "LIVE" },
  ];

  return (
    <div style={{ minHeight: "100%", background: BG_PANEL, padding: "24px 0 48px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }} className="px-4 sm:px-6">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(232,184,75,0.12)", border: `1px solid ${BORDER}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Award size={22} color={GOLD} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: GOLD, letterSpacing: "0.06em", lineHeight: 1.1 }}>VENTURE MODE</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: DIM, letterSpacing: "0.09em", textTransform: "uppercase" as const }}>The Treasury Boardroom · Community Governance</div>
            </div>
          </div>
          <motion.button whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }}
            style={{ padding: "10px 22px", borderRadius: 999, background: `linear-gradient(135deg, ${GOLD}dd, ${GOLD}aa)`, border: "none", color: "#0a0805", fontFamily: "monospace", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, cursor: "pointer", boxShadow: "0 4px 20px rgba(232,184,75,0.22)", display: "flex", alignItems: "center", gap: 7 }}>
            <ChevronRight size={14} /> Create Proposal
          </motion.button>
        </motion.div>

        {/* STAT CHIPS */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
          style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 28 }}>
          <StatChip icon={Users} label="Members" value={12450} delay={0.12} />
          <StatChip icon={TrendingUp} label="Treasury" value={4} prefix="$" suffix=".2M" delay={0.18} />
          <StatChip icon={Target} label="Active Proposals" value={42} delay={0.24} />
        </motion.div>

        {/* TAB BAR */}
        <div style={{ display: "flex", gap: 6, background: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 5, width: "fit-content", marginBottom: 28, flexWrap: "wrap" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isAI = tab.key === "ai-agent";
            return (
              <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2, ease: EASE }}
                style={{ padding: "8px 22px", borderRadius: 10, border: isActive && isAI ? `1.5px solid rgba(168,85,247,0.5)` : "none", background: isActive ? (isAI ? "rgba(168,85,247,0.18)" : GOLD) : "transparent", color: isActive ? (isAI ? VIOLET : "#0a0805") : DIM, fontFamily: "monospace", fontSize: 13, fontWeight: isActive ? 800 : 500, letterSpacing: "0.06em", textTransform: "uppercase" as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "background 0.25s, color 0.25s" }}>
                <Icon size={14} />{tab.label}
                {tab.badge && (
                  <motion.span animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 999, background: isActive ? "rgba(168,85,247,0.25)" : "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.45)", color: VIOLET }}>
                    {tab.badge}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === "proposals" && (
            <motion.div key="proposals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" as const }}>
                {FILTERS.map((f) => {
                  const isActive = activeFilter === f;
                  const col = f === "Active" ? GOLD : f === "Passed" ? SUCCESS : f === "Failed" ? DANGER : DIM;
                  return (
                    <motion.button key={f} onClick={() => setActiveFilter(f)} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.18 }}
                      style={{ padding: "6px 18px", borderRadius: 999, border: `1.5px solid ${isActive ? col : BORDER}`, background: isActive ? `${col}18` : "transparent", color: isActive ? col : DIM, fontFamily: "monospace", fontSize: 12, fontWeight: isActive ? 700 : 500, letterSpacing: "0.07em", cursor: "pointer" }}>
                      {f}
                    </motion.button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <AnimatePresence>
                  {filteredProposals.map((prop, i) => (
                    <ProposalCard key={prop.id} prop={prop} index={i} voted={votedProposals.get(prop.id) ?? null} onVote={handleVote} />
                  ))}
                </AnimatePresence>
                {filteredProposals.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: "center" as const, padding: "48px 0", color: DIM, fontFamily: "monospace", fontSize: 14 }}>
                    No proposals match this filter.
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "incubator" && (
            <motion.div key="incubator" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Bot size={20} color={GOLD} />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: INK, letterSpacing: "0.04em" }}>L·14 Venture Incubator</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(240,230,204,0.55)", fontFamily: "monospace", margin: 0, lineHeight: 1.6 }}>
                  Community-backed projects. Apply for liquidity support, marketing, and dev resources.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
                {INCUBATOR_PROJECTS.map((proj, i) => (
                  <IncubatorCard key={proj.id} proj={proj} index={i} />
                ))}
              </div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
                style={{ background: BG_CARD, border: `1px solid ${GOLD}44`, borderRadius: 20, padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const, boxShadow: "0 0 48px rgba(232,184,75,0.07)" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Star size={18} color={GOLD} />
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: INK }}>Apply for Incubation</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(240,230,204,0.5)", fontFamily: "monospace", margin: 0, lineHeight: 1.6, maxWidth: 440 }}>
                    Have a project that deserves community backing? Submit your pitch and get access to treasury liquidity, our marketing network, and dedicated dev resources from the MoonFlux ecosystem.
                  </p>
                </div>
                <motion.button whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }}
                  style={{ padding: "12px 30px", borderRadius: 999, background: `linear-gradient(135deg, ${GOLD}ee, ${GOLD}aa)`, border: "none", color: "#0a0805", fontFamily: "monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, cursor: "pointer", boxShadow: "0 6px 28px rgba(232,184,75,0.28)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Zap size={15} /> Apply Now
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "ai-agent" && <AgentTab />}
        </AnimatePresence>
      </div>
    </div>
  );
}
