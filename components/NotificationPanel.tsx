"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bell, TrendingUp, Zap, Award, Flame, DollarSign,
  Trophy, ArrowUpRight, ArrowDownRight, Users, Rocket,
  CheckCheck, Filter
} from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type NotifType = "price" | "launch" | "graduation" | "whale" | "revenue" | "rank" | "social";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  token?: string;
  change?: number;
  urgent?: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  {
    id: "n1", type: "graduation", title: "🎓 Token Graduated!", urgent: true,
    body: "CPEP has hit 100% bonding curve and migrated to Raydium.", time: "2m ago",
    read: false, token: "CPEP",
  },
  {
    id: "n2", type: "price", title: "📈 Price Alert Triggered",
    body: "LDOGE is up +68% in the last hour. Your target of +50% was hit.", time: "8m ago",
    read: false, token: "LDOGE", change: 68,
  },
  {
    id: "n3", type: "whale", title: "🐋 Whale Activity Detected", urgent: true,
    body: "A wallet bought 5.1 SOL of SWRM — largest buy in 24h.", time: "15m ago",
    read: false, token: "SWRM",
  },
  {
    id: "n4", type: "launch", title: "🚀 New Token Launched",
    body: "StormCat (STMC) just launched by StormAnon. Risk score: 8/10.", time: "34m ago",
    read: false, token: "STMC",
  },
  {
    id: "n5", type: "revenue", title: "💰 Revenue Payout Ready",
    body: "You've accumulated 10.2 SOL in creator fees. Claim now.", time: "1h ago",
    read: false,
  },
  {
    id: "n6", type: "rank", title: "🏆 Leaderboard Rank Up",
    body: "You moved from #42 to #31 on the weekly PnL leaderboard.", time: "2h ago",
    read: true,
  },
  {
    id: "n7", type: "price", title: "📉 Price Alert Triggered",
    body: "VINU dropped -18% below your stop-loss threshold.", time: "3h ago",
    read: true, token: "VINU", change: -18,
  },
  {
    id: "n8", type: "social", title: "💬 New Comment on LDOGE",
    body: "@whaleking replied to your post: 'This is the one 💎'", time: "4h ago",
    read: true, token: "LDOGE",
  },
  {
    id: "n9", type: "launch", title: "🚀 Token You Follow Launched",
    body: "FluxLabs launched NovaFlux (NVFX) — creator score 95/100.", time: "6h ago",
    read: true, token: "NVFX",
  },
  {
    id: "n10", type: "graduation", title: "🎓 Graduation Incoming",
    body: "AI Swarm (SWRM) is at 58% bonding curve — est. graduation in 2 days.", time: "8h ago",
    read: true, token: "SWRM",
  },
];

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  graduation: { icon: Award,       color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  price:       { icon: TrendingUp,  color: "#e8b84b", bg: "rgba(232,184,75,0.1)"  },
  whale:       { icon: Zap,         color: "#a855f7", bg: "rgba(168,85,247,0.1)"  },
  launch:      { icon: Rocket,      color: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
  revenue:     { icon: DollarSign,  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  rank:        { icon: Trophy,      color: "#e8b84b", bg: "rgba(232,184,75,0.1)"  },
  social:      { icon: Users,       color: "#6b6987", bg: "rgba(107,105,135,0.1)" },
};

const FILTERS = ["All", "Price", "Launch", "Whale", "Revenue"] as const;
type Filter = typeof FILTERS[number];

function filterMatch(n: Notification, f: Filter): boolean {
  if (f === "All") return true;
  const map: Record<Filter, NotifType[]> = {
    All: [],
    Price: ["price"],
    Launch: ["launch", "graduation"],
    Whale: ["whale"],
    Revenue: ["revenue", "rank"],
  };
  return map[f].includes(n.type);
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const unread = notifs.filter(n => !n.read).length;
  const filtered = notifs.filter(n => filterMatch(n, activeFilter));

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifs(ns => ns.filter(n => n.id !== id));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="nb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[190]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="np"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="fixed top-[76px] right-4 z-[191] w-[380px] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: "rgba(8,6,3,0.98)",
              border: "1px solid rgba(232,184,75,0.28)",
              boxShadow: "0 32px 80px -16px rgba(0,0,0,0.9), 0 0 40px -20px rgba(232,184,75,0.12)",
              maxHeight: "calc(100vh - 100px)",
            }}
          >
            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)" }}>
                  <Bell size={15} style={{ color: "#e8b84b" }} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">Notifications</h3>
                  {unread > 0 && (
                    <p className="font-mono text-[0.55rem]" style={{ color: "#e8b84b" }}>{unread} unread</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[0.55rem] tracking-wide transition-all"
                    style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.2)", color: "#e8b84b" }}>
                    <CheckCheck size={11} /> Mark all read
                  </button>
                )}
                <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X size={13} style={{ color: "#6b6987" }} />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-5 pb-3 flex-shrink-0">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="font-mono text-[0.55rem] tracking-widest uppercase px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: activeFilter === f ? "rgba(232,184,75,0.15)" : "transparent",
                    color: activeFilter === f ? "#e8b84b" : "#6b6987",
                    border: activeFilter === f ? "1px solid rgba(232,184,75,0.3)" : "1px solid transparent",
                  }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px mx-5 mb-1 flex-shrink-0" style={{ background: "rgba(232,184,75,0.1)" }} />

            {/* Notification list */}
            <div className="overflow-y-auto flex-1 px-3 py-2" style={{ scrollbarWidth: "none" }}>
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Bell size={28} style={{ color: "#35334a" }} />
                    <p className="font-mono text-[0.62rem]" style={{ color: "#35334a" }}>No notifications</p>
                  </div>
                ) : (
                  filtered.map((n, i) => {
                    const meta = TYPE_META[n.type];
                    const Icon = meta.icon as React.FC<{ size?: number; style?: React.CSSProperties }>;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.28, ease: EASE, delay: i * 0.03 }}
                        onClick={() => markRead(n.id)}
                        className="relative flex gap-3 p-3 rounded-2xl mb-1.5 cursor-pointer group transition-all"
                        style={{
                          background: n.read ? "transparent" : "rgba(232,184,75,0.04)",
                          border: `1px solid ${n.read ? "transparent" : "rgba(232,184,75,0.12)"}`,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? "transparent" : "rgba(232,184,75,0.04)"; }}
                      >
                        {/* Unread dot */}
                        {!n.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{ background: "#e8b84b", boxShadow: "0 0 6px rgba(232,184,75,0.8)" }} />
                        )}

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}>
                          <Icon size={16} style={{ color: meta.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <p className="font-display text-[0.72rem] font-semibold text-white leading-snug">{n.title}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {n.urgent && (
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={11} style={{ color: "#6b6987" }} />
                              </button>
                            </div>
                          </div>
                          <p className="font-mono text-[0.58rem] leading-relaxed mb-1.5" style={{ color: "#6b6987" }}>{n.body}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[0.52rem]" style={{ color: "#35334a" }}>{n.time}</span>
                            {n.token && (
                              <span className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30` }}>
                                ${n.token}
                              </span>
                            )}
                            {n.change !== undefined && (
                              <span className="flex items-center gap-0.5 font-mono text-[0.52rem]" style={{ color: n.change > 0 ? "#10b981" : "#ef4444" }}>
                                {n.change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {n.change > 0 ? "+" : ""}{n.change}%
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(232,184,75,0.08)" }}>
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-full font-mono text-[0.6rem] tracking-widest uppercase py-2 rounded-xl transition-all"
                style={{ color: "#6b6987", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                View All Activity
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
