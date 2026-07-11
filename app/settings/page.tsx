"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, Bell, Palette, Globe, ChevronRight,
  DollarSign, TrendingUp, Zap, Copy, Share2, AtSign,
  RefreshCw, Wallet, Check, Key, BarChart3,
  Plus, Trash2, AlertTriangle, BellRing, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { ALL_TOKENS } from "@/lib/mock";
import { useToast } from "@/components/ToastProvider";
import { useMoonWallet } from "@/components/WalletProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── COUNT-UP ANIMATION ────────────────────────────────────────────────────────
function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{prefix}{decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()}{suffix}</span>;
}

// ── LIVE REVENUE TICKER ───────────────────────────────────────────────────────
function LiveRevenueTicker() {
  const [total, setTotal] = useState(1247.82);
  const [flash, setFlash] = useState(false);
  const [lastAdd, setLastAdd] = useState("+$0.07");

  useEffect(() => {
    const id = setInterval(() => {
      const add = +(Math.random() * 0.12 + 0.02).toFixed(2);
      setTotal(prev => +(prev + add).toFixed(2));
      setLastAdd(`+$${add.toFixed(2)}`);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "rgba(5,20,10,0.9)", border: "1px solid rgba(16,185,129,0.35)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
          />
          <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#10b981" }}>Live Revenue Stream</span>
        </div>
        <span className="font-mono text-[0.5rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>0.25% of every trade</span>
      </div>
      <div className="flex items-baseline gap-3 mb-1">
        <motion.span
          className="font-display text-3xl"
          animate={{ color: flash ? "#10b981" : "#e8b84b" }}
          transition={{ duration: 0.3 }}
        >
          ${total.toFixed(2)}
        </motion.span>
        <AnimatePresence mode="wait">
          <motion.span
            key={lastAdd}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-sm"
            style={{ color: "#10b981" }}
          >
            {lastAdd}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="font-mono text-[0.55rem]" style={{ color: "#6b6987" }}>Total lifetime creator earnings · Updating in real-time</p>
    </div>
  );
}

// ── TOKEN REVENUE BARS ────────────────────────────────────────────────────────
const TOKEN_REVENUE = [
  { name: "Luna Doge", ticker: "LDOGE", amount: 892, color: "#e8b84b" },
  { name: "AstroCat", ticker: "ACAT", amount: 287, color: "#38bdf8" },
  { name: "NovaDoge", ticker: "NOVA", amount: 68, color: "#a855f7" },
];

// ── SETTINGS SECTIONS ─────────────────────────────────────────────────────────
type Item =
  | { label: string; value: string; type: "value" }
  | { label: string; value: boolean; type: "toggle" }
  | { label: string; value: string; type: "select" }
  | { label: string; type: "action"; actionLabel: string };

type Section = { title: string; icon: typeof Shield; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Wallet & Security", icon: Shield,
    items: [
      { label: "Connected Wallet", value: "0x71C...9711", type: "value" },
      { label: "Auto-Approve Transactions", value: false, type: "toggle" },
      { label: "Export Private Key", type: "action", actionLabel: "Export" },
      { label: "Disconnect Wallet", type: "action", actionLabel: "Disconnect" },
    ],
  },
  {
    title: "Trading Preferences", icon: Globe,
    items: [
      { label: "Default Slippage", value: "1.0%", type: "select" },
      { label: "Max MEV Protection", value: true, type: "toggle" },
      { label: "Priority Fee Level", value: "High (0.005 SOL)", type: "select" },
    ],
  },
  {
    title: "Notifications", icon: Bell,
    items: [
      { label: "Price Alerts", value: true, type: "toggle" },
      { label: "New Launches (AI Match)", value: true, type: "toggle" },
      { label: "Governance Proposals", value: false, type: "toggle" },
    ],
  },
  {
    title: "Display", icon: Palette,
    items: [
      { label: "Theme", value: "Obsidian Gold", type: "select" },
      { label: "Chart Type", value: "Candles", type: "select" },
      { label: "Performance Animations", value: true, type: "toggle" },
    ],
  },
];

// ── PRICE ALERT TYPES ──────────────────────────────────────────────────────
interface PriceAlert {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenTicker: string;
  tokenIcon: string;
  condition: "above" | "below";
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  triggered?: boolean;
}

const SEED_ALERTS: PriceAlert[] = [
  { id: "a1", tokenId: "tok_luna_doge", tokenName: "Luna Doge",  tokenTicker: "LDOGE", tokenIcon: "🐕", condition: "above", targetPrice: 0.00055, currentPrice: 0.000482, active: true },
  { id: "a2", tokenId: "tok_cyber_pep", tokenName: "Cyber Pepe", tokenTicker: "CPEP",  tokenIcon: "🐸", condition: "above", targetPrice: 0.00090, currentPrice: 0.000791, active: true },
  { id: "a3", tokenId: "tok_ai_swarm",  tokenName: "AI Swarm",   tokenTicker: "SWRM",  tokenIcon: "🤖", condition: "below", targetPrice: 0.00300, currentPrice: 0.003341, active: false, triggered: true },
];

// ── PRICE ALERT MANAGER COMPONENT ───────────────────────────────────────
function PriceAlertManager({ showToast }: { showToast: (msg: string, t: "success" | "error") => void }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(SEED_ALERTS);
  const [showForm, setShowForm] = useState(false);
  const [formToken, setFormToken] = useState(ALL_TOKENS[0].id);
  const [formCond, setFormCond] = useState<"above" | "below">("above");
  const [formPrice, setFormPrice] = useState("");

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast("Alert deleted", "success");
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const addAlert = () => {
    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) { showToast("Enter a valid target price", "error"); return; }
    const token = ALL_TOKENS.find(t => t.id === formToken);
    if (!token) return;
    const newAlert: PriceAlert = {
      id: `a-${Date.now()}`,
      tokenId: token.id,
      tokenName: token.name,
      tokenTicker: token.ticker,
      tokenIcon: token.icon,
      condition: formCond,
      targetPrice: price,
      currentPrice: token.price,
      active: true,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setFormPrice("");
    setShowForm(false);
    showToast(`Alert set for $${token.ticker}`, "success");
  };

  const selectedToken = ALL_TOKENS.find(t => t.id === formToken);
  const activeCount = alerts.filter(a => a.active).length;

  return (
    <motion.div
      key="alerts"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col gap-4 flex-1"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)" }}>
            <BellRing size={15} style={{ color: "#e8b84b" }} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-white">Price Alerts</h2>
            <p className="font-mono text-[0.55rem]" style={{ color: "#6b6987" }}>{activeCount} active · notified via bell icon</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[0.62rem] tracking-widest uppercase transition-all"
          style={{ background: showForm ? "rgba(232,184,75,0.2)" : "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.35)", color: "#e8b84b" }}
        >
          <Plus size={12} />
          New Alert
        </button>
      </div>

      {/* Add alert form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rounded-3xl p-5 overflow-hidden"
            style={{ background: "rgba(10,8,5,0.98)", border: "1px solid rgba(232,184,75,0.3)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />
            <p className="font-mono text-[0.58rem] tracking-widest uppercase mb-4" style={{ color: "#a9791f" }}>Create Alert</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Token picker */}
              <div>
                <label className="font-mono text-[0.52rem] uppercase tracking-widest mb-1.5 block" style={{ color: "#6b6987" }}>Token</label>
                <select
                  value={formToken}
                  onChange={e => setFormToken(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-mono text-[0.72rem] outline-none appearance-none"
                  style={{ background: "rgba(5,4,3,0.9)", border: "1px solid rgba(232,184,75,0.2)", color: "#f4f2ff" }}
                >
                  {ALL_TOKENS.map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.ticker} — {t.name}</option>
                  ))}
                </select>
              </div>
              {/* Condition */}
              <div>
                <label className="font-mono text-[0.52rem] uppercase tracking-widest mb-1.5 block" style={{ color: "#6b6987" }}>Condition</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(232,184,75,0.2)" }}>
                  {(["above", "below"] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setFormCond(c)}
                      className="flex-1 py-2.5 font-mono text-[0.65rem] tracking-widest uppercase transition-all"
                      style={{
                        background: formCond === c
                          ? c === "above" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"
                          : "rgba(5,4,3,0.9)",
                        color: formCond === c
                          ? c === "above" ? "#10b981" : "#ef4444"
                          : "#6b6987",
                      }}
                    >
                      {c === "above" ? "▲ Above" : "▼ Below"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Target price */}
              <div>
                <label className="font-mono text-[0.52rem] uppercase tracking-widest mb-1.5 block" style={{ color: "#6b6987" }}>
                  Target Price {selectedToken && <span style={{ color: "#35334a" }}>(now ${selectedToken.price.toFixed(6)})</span>}
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-mono text-[0.72rem] outline-none"
                  style={{ background: "rgba(5,4,3,0.9)", border: "1px solid rgba(232,184,75,0.2)", color: "#f4f2ff" }}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl font-mono text-[0.6rem] uppercase tracking-widest transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#6b6987" }}>
                Cancel
              </button>
              <button onClick={addAlert} className="px-5 py-2 rounded-xl font-mono text-[0.6rem] uppercase tracking-widest transition-all"
                style={{ background: "rgba(232,184,75,0.2)", border: "1px solid rgba(232,184,75,0.4)", color: "#e8b84b" }}>
                Create Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert cards */}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 gap-3 rounded-3xl"
              style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.12)" }}
            >
              <BellRing size={28} style={{ color: "#35334a" }} />
              <p className="font-mono text-[0.65rem]" style={{ color: "#35334a" }}>No alerts set</p>
              <button onClick={() => setShowForm(true)} className="font-mono text-[0.6rem] uppercase tracking-widest px-4 py-2 rounded-xl transition-all mt-1"
                style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.25)", color: "#e8b84b" }}>
                + Create your first alert
              </button>
            </motion.div>
          )}
          {alerts.map((alert) => {
            const dist = ((alert.targetPrice - alert.currentPrice) / alert.currentPrice * 100);
            const isAbove = alert.condition === "above";
            const condColor = isAbove ? "#10b981" : "#ef4444";
            const progress = isAbove
              ? Math.min(100, (alert.currentPrice / alert.targetPrice) * 100)
              : Math.min(100, (alert.targetPrice / alert.currentPrice) * 100);
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="rounded-3xl p-5 relative overflow-hidden"
                style={{
                  background: alert.triggered ? "rgba(239,68,68,0.05)" : "rgba(10,8,5,0.95)",
                  border: `1px solid ${alert.triggered ? "rgba(239,68,68,0.3)" : alert.active ? "rgba(232,184,75,0.2)" : "rgba(255,255,255,0.07)"}`,
                  opacity: alert.active ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Token info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.15)" }}>
                      {alert.tokenIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-display text-sm font-semibold text-white">{alert.tokenName}</span>
                        <span className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded" style={{ color: "#e8b84b", background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)" }}>
                          ${alert.tokenTicker}
                        </span>
                        {alert.triggered && (
                          <span className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                            <AlertTriangle size={8} /> TRIGGERED
                          </span>
                        )}
                        {alert.active && !alert.triggered && (
                          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
                            className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.8)" }} />
                        )}
                      </div>
                      <p className="font-mono text-[0.58rem]" style={{ color: "#6b6987" }}>
                        Alert when price goes {isAbove ? "above" : "below"}
                        <span style={{ color: condColor }}> ${alert.targetPrice.toFixed(6)}</span>
                        <span style={{ color: "#35334a" }}> (now ${alert.currentPrice.toFixed(6)})</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p className="font-mono text-[0.55rem] mb-0.5" style={{ color: dist > 0 ? "#10b981" : "#ef4444" }}>
                        {dist > 0 ? "+" : ""}{dist.toFixed(1)}% away
                      </p>
                      <p className="font-mono text-[0.5rem]" style={{ color: "#35334a" }}>to target</p>
                    </div>
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="relative w-9 h-[18px] rounded-full p-0.5 flex cursor-pointer transition-all"
                      style={{ background: alert.active ? "#e8b84b" : "rgba(255,255,255,0.08)", border: `1px solid ${alert.active ? "rgba(232,184,75,0.6)" : "rgba(255,255,255,0.12)"}` }}
                    >
                      <motion.span layout transition={{ type: "spring", stiffness: 620, damping: 34 }}
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ background: alert.active ? "#000" : "#6b6987", marginLeft: alert.active ? "auto" : "0" }} />
                    </button>
                    <button onClick={() => deleteAlert(alert.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}>
                      <Trash2 size={12} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>

                {/* Progress bar to target */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: EASE }}
                    style={{ background: `linear-gradient(90deg, ${condColor}60, ${condColor})` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[0.48rem]" style={{ color: "#35334a" }}>Current</span>
                  <span className="font-mono text-[0.48rem]" style={{ color: "#35334a" }}>{Math.round(progress)}% to target</span>
                  <span className="font-mono text-[0.48rem]" style={{ color: condColor }}>Target</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { showToast } = useToast();
  const { disconnect } = useMoonWallet();
  const [activeTab, setActiveTab] = useState<"settings" | "economy" | "api" | "alerts">("settings");
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    SECTIONS.forEach(s => s.items.forEach(it => {
      if (it.type === "toggle") seed[`${s.title}::${it.label}`] = it.value;
    }));
    return seed;
  });
  const [autoPayout, setAutoPayout] = useState(true);
  const [copied, setCopied] = useState(false);

  const flip = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  const maxRevenue = Math.max(...TOKEN_REVENUE.map(t => t.amount));

  const handleCopyRef = () => {
    navigator.clipboard.writeText("https://moonfluxx.io/ref/NOVA-X42");
    setCopied(true);
    showToast("Referral link copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: "settings", icon: Settings,  label: "Settings" },
    { id: "economy",  icon: DollarSign, label: "Creator Economy" },
    { id: "alerts",   icon: BellRing,   label: "Alerts" },
    { id: "api",      icon: Key,        label: "API Keys" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto flex-1 flex flex-col pt-2 pb-4 gap-4 w-full px-4 lg:px-0">

      {/* ── COMPACT HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(28,20,6,0.9)", border: "1px solid rgba(232,184,75,0.5)" }}>
            <Settings size={14} style={{ color: "#e8b84b" }} />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-[0.1em] font-medium text-gold-liquid leading-none">PREFERENCES</h1>
            <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color: "#6b6987" }}>System Control Panel</p>
          </div>
        </div>
      </motion.div>

      {/* ── TAB BAR ── */}
      <div className="flex flex-wrap gap-1 p-1 rounded-2xl" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.2)" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-[0.62rem] tracking-widest uppercase transition-all"
            style={{
              background: activeTab === tab.id ? "rgba(232,184,75,0.12)" : "transparent",
              color: activeTab === tab.id ? "#e8b84b" : "#6b6987",
              border: activeTab === tab.id ? "1px solid rgba(232,184,75,0.3)" : "1px solid transparent",
            }}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1"
          >
            {SECTIONS.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.5, ease: EASE }}
                className="rounded-3xl p-5 flex flex-col"
                style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/30 to-transparent" />
                <h2 className="font-mono text-[0.62rem] tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: "#a9791f" }}>
                  <section.icon size={12} style={{ color: "#e8b84b" }} />
                  {section.title}
                </h2>
                <div className="flex flex-col gap-0">
                  {section.items.map((item, i) => {
                    const key = item.type === "toggle" ? `${section.title}::${item.label}` : "";
                    const on = key ? toggles[key] : false;
                    return (
                      <div key={i} className="flex justify-between items-center py-3.5"
                        style={{ borderTop: i > 0 ? "1px solid rgba(232,184,75,0.1)" : "none" }}>
                        <span className="font-mono text-[0.62rem] tracking-wider uppercase" style={{ color: "#8a8099" }}>{item.label}</span>
                        {item.type === "value" && (
                          <span className="font-mono text-xs" style={{ color: "#f4f2ff" }}>{item.value}</span>
                        )}
                        {item.type === "toggle" && (
                          <button
                            role="switch" aria-checked={on}
                            onClick={() => flip(key)}
                            className="relative w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-all duration-300"
                            style={{ background: on ? "#e8b84b" : "rgba(255,255,255,0.08)", border: `1px solid ${on ? "rgba(232,184,75,0.6)" : "rgba(255,255,255,0.12)"}` }}
                          >
                            <motion.span
                              layout
                              transition={{ type: "spring", stiffness: 620, damping: 34 }}
                              className="w-4 h-4 rounded-full"
                              style={{ background: on ? "#000" : "#6b6987", marginLeft: on ? "auto" : "0" }}
                            />
                          </button>
                        )}
                        {item.type === "select" && (
                          <button className="flex items-center gap-1.5 font-mono text-xs transition-colors"
                            style={{ color: "#f4f2ff" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#f4f2ff")}>
                            {item.value}
                            <ChevronRight size={11} style={{ color: "#6b6987" }} />
                          </button>
                        )}
                        {item.type === "action" && (
                          <button
                            className="font-mono text-[0.6rem] tracking-widest uppercase px-3 py-1 rounded-full transition-all"
                            style={{
                              border: item.actionLabel === "Disconnect"
                                ? "1px solid rgba(239,68,68,0.4)"
                                : "1px solid rgba(232,184,75,0.35)",
                              color: item.actionLabel === "Disconnect" ? "#ef4444" : "#e8b84b",
                              background: item.actionLabel === "Disconnect"
                                ? "rgba(239,68,68,0.08)"
                                : "rgba(232,184,75,0.08)",
                            }}
                            onClick={() => {
                              if (item.actionLabel === "Disconnect") {
                                disconnect();
                                showToast("Wallet disconnected", "success");
                              }
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = item.actionLabel === "Disconnect"
                                ? "rgba(239,68,68,0.16)"
                                : "rgba(232,184,75,0.15)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = item.actionLabel === "Disconnect"
                                ? "rgba(239,68,68,0.08)"
                                : "rgba(232,184,75,0.08)";
                            }}
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── L5: CREATOR ECONOMY TAB ── */}
        {activeTab === "economy" && (
          <motion.div
            key="economy"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Top stat strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Earned", value: 1247.82, color: "#e8b84b", icon: DollarSign, prefix: "$", decimals: 2 },
                { label: "This Month", value: 342.15, color: "#10b981", icon: TrendingUp, prefix: "$", decimals: 2 },
                { label: "Pending Payout", value: 89.40, color: "#f59e0b", icon: RefreshCw, prefix: "$", decimals: 2 },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                    className="rounded-2xl p-4 relative overflow-hidden"
                    style={{ background: "rgba(10,8,5,0.95)", border: `1px solid ${s.color}30` }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} style={{ color: s.color }} />
                      <span className="font-mono text-[0.52rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>{s.label}</span>
                    </div>
                    <p className="font-display text-xl" style={{ color: s.color }}>
                      <CountUp value={s.value} prefix={s.prefix} decimals={s.decimals} />
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 flex-1">

              {/* Left: Revenue stream + token bars + source breakdown */}
              <div className="flex flex-col gap-4">
                {/* Live ticker */}
                <LiveRevenueTicker />

                {/* Revenue by token */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={13} style={{ color: "#e8b84b" }} />
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>Revenue by Token</span>
                  </div>
                  <div className="space-y-3">
                    {TOKEN_REVENUE.map((t, i) => (
                      <motion.div key={t.ticker} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[0.62rem]" style={{ color: "#f4f2ff" }}>{t.name} <span style={{ color: "#6b6987" }}>${t.ticker}</span></span>
                          <span className="font-mono text-[0.62rem]" style={{ color: t.color }}>${t.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(t.amount / maxRevenue) * 100}%` }}
                            transition={{ duration: 1, ease: EASE, delay: 0.4 + i * 0.1 }}
                            style={{ background: t.color, boxShadow: `0 0 8px ${t.color}60` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Revenue source breakdown */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}>
                  <span className="font-mono text-[0.58rem] tracking-widest uppercase block mb-4" style={{ color: "#a9791f" }}>Revenue Sources</span>
                  <div className="space-y-2.5">
                    {[
                      { label: "Trading Fees", pct: 78, color: "#e8b84b" },
                      { label: "Launch Fees", pct: 15, color: "#38bdf8" },
                      { label: "Referrals", pct: 7, color: "#a855f7" },
                    ].map((s, i) => (
                      <div key={s.label}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[0.58rem]" style={{ color: "#8a8099" }}>{s.label}</span>
                          <span className="font-mono text-[0.58rem]" style={{ color: s.color }}>{s.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 1, ease: EASE, delay: 0.5 + i * 0.1 }}
                            style={{ background: s.color, boxShadow: `0 0 6px ${s.color}50` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Payout settings + Referral */}
              <div className="flex flex-col gap-4">
                {/* Payout settings */}
                <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={13} style={{ color: "#e8b84b" }} />
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>Payout Settings</span>
                  </div>
                  {[
                    { label: "Destination", value: "0x71C...9711" },
                    { label: "Threshold", value: "10 SOL" },
                    { label: "Next Payout", value: "~3 days" },
                  ].map((r, i) => (
                    <div key={r.label} className="flex justify-between py-2.5"
                      style={{ borderTop: i > 0 ? "1px solid rgba(232,184,75,0.1)" : "none" }}>
                      <span className="font-mono text-[0.58rem] uppercase tracking-wider" style={{ color: "#6b6987" }}>{r.label}</span>
                      <span className="font-mono text-xs" style={{ color: "#f4f2ff" }}>{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2.5" style={{ borderTop: "1px solid rgba(232,184,75,0.1)" }}>
                    <span className="font-mono text-[0.58rem] uppercase tracking-wider" style={{ color: "#6b6987" }}>Auto-Payout</span>
                    <button
                      role="switch" aria-checked={autoPayout}
                      onClick={() => setAutoPayout(!autoPayout)}
                      className="relative w-10 h-5 rounded-full p-0.5 flex cursor-pointer transition-all duration-300"
                      style={{ background: autoPayout ? "#e8b84b" : "rgba(255,255,255,0.08)", border: `1px solid ${autoPayout ? "rgba(232,184,75,0.6)" : "rgba(255,255,255,0.12)"}` }}
                    >
                      <motion.span layout transition={{ type: "spring", stiffness: 620, damping: 34 }}
                        className="w-4 h-4 rounded-full"
                        style={{ background: autoPayout ? "#000" : "#6b6987", marginLeft: autoPayout ? "auto" : "0" }}
                      />
                    </button>
                  </div>
                  {/* Claim Now CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(232,184,75,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showToast("$89.40 claimed successfully! 🎉", "success")}
                    className="w-full py-3.5 rounded-xl font-display uppercase tracking-widest text-sm font-semibold mt-1"
                    style={{ background: "linear-gradient(135deg, #a9791f, #e8b84b, #ffe6a3)", color: "#000", boxShadow: "0 0 20px rgba(232,184,75,0.25)" }}
                  >
                    Claim $89.40 Now
                  </motion.button>
                </div>

                {/* Referral program */}
                <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(168,85,247,0.25)" }}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                  <div className="flex items-center gap-2 mb-1">
                    <AtSign size={13} style={{ color: "#a855f7" }} />
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: "#a855f7" }}>Referral Program</span>
                  </div>

                  {/* Ref code */}
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)" }}>
                    <span className="flex-1 font-mono text-sm" style={{ color: "#f4f2ff" }}>NOVA-X42</span>
                    <button onClick={handleCopyRef} className="transition-all" style={{ color: copied ? "#10b981" : "#a855f7" }}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Referred Traders", value: "23", color: "#a855f7" },
                      { label: "Ref Earnings", value: "$127.40", color: "#10b981" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(5,4,3,0.7)", border: "1px solid rgba(168,85,247,0.15)" }}>
                        <p className="font-mono text-[0.5rem] uppercase tracking-widest mb-0.5" style={{ color: "#6b6987" }}>{s.label}</p>
                        <p className="font-mono text-sm font-semibold" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {[
                      { label: "Share on X", color: "#1DA1F2", icon: AtSign },
                      { label: "Telegram", color: "#2AABEE", icon: Share2 },
                    ].map(s => {
                      const Icon = s.icon;
                      return (
                        <button key={s.label} onClick={() => showToast(`Sharing on ${s.label.replace("Share on ", "")}...`, "success")}
                          className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 font-mono text-[0.58rem] tracking-widest uppercase transition-all"
                          style={{ border: `1px solid ${s.color}40`, color: s.color, background: `${s.color}10` }}
                          onMouseEnter={e => (e.currentTarget.style.background = `${s.color}20`)}
                          onMouseLeave={e => (e.currentTarget.style.background = `${s.color}10`)}>
                          <Icon size={11} /> {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PRICE ALERTS TAB ── */}
        {activeTab === "alerts" && (
          <PriceAlertManager showToast={showToast} />
        )}

        {/* ── API KEYS TAB ── */}
        {activeTab === "api" && (
          <motion.div
            key="api"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(10,8,5,0.95)", border: "1px solid rgba(232,184,75,0.22)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Key size={14} style={{ color: "#e8b84b" }} />
                <span className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#a9791f" }}>API Keys</span>
              </div>
              {[
                { name: "Production API Key", key: "mf_live_••••••••••••••••••••4a7f", status: "Active", color: "#10b981" },
                { name: "Webhook Secret", key: "whsec_••••••••••••••••••••9k2m", status: "Active", color: "#10b981" },
              ].map((k, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}>
                  <div>
                    <p className="font-mono text-[0.62rem] mb-0.5" style={{ color: "#f4f2ff" }}>{k.name}</p>
                    <p className="font-mono text-[0.55rem]" style={{ color: "#6b6987" }}>{k.key}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[0.52rem] px-2 py-0.5 rounded-full" style={{ color: k.color, background: `${k.color}15`, border: `1px solid ${k.color}40` }}>{k.status}</span>
                    <button onClick={() => showToast("Key copied!", "success")}><Copy size={13} style={{ color: "#6b6987" }} /></button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => showToast("New API key generated!", "success")}
                className="self-start font-mono text-[0.6rem] tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-1.5 transition-all"
                style={{ border: "1px solid rgba(232,184,75,0.35)", color: "#e8b84b", background: "rgba(232,184,75,0.08)" }}
              >
                <Zap size={11} /> Generate New Key
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
