"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight, TrendingUp, Zap, Award, X, Hash, Clock, ChevronRight, Flame, BarChart3, Trophy, Settings, Rocket, Globe } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOKENS } from "@/lib/mock";
import { useTheme } from "@/components/ThemeProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// Quick-action shortcuts
const QUICK_ACTIONS = [
  { label: "Explore Feed",    icon: Globe,    href: "/explore",     shortcut: "E" },
  { label: "Launch Token",    icon: Rocket,   href: "/launch",      shortcut: "L" },
  { label: "Pro Terminal",    icon: BarChart3, href: "/terminal",    shortcut: "T" },
  { label: "Leaderboard",    icon: Trophy,   href: "/leaderboard", shortcut: "R" },
  { label: "Settings",        icon: Settings, href: "/settings",    shortcut: "S" },
];

const RECENT_IDS = ["tok_luna_doge", "tok_cyber_pep", "tok_ai_swarm"];

function highlight(text: string, query: string, isDark: boolean) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: isDark ? "rgba(232,184,75,0.35)" : "rgba(99,102,241,0.2)", color: isDark ? "#ffe6a3" : "var(--color-text-primary)", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter tokens by name or ticker
  const results = query.trim().length > 0
    ? ALL_TOKENS.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.ticker.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : [];

  const recentTokens = RECENT_IDS.map(id => ALL_TOKENS.find(t => t.id === id)).filter(Boolean) as typeof ALL_TOKENS;

  // Total navigable items = results (or recent) + quick actions
  const showResults = query.trim().length > 0;
  const tokenItems = showResults ? results : recentTokens;
  const totalItems = tokenItems.length + QUICK_ACTIONS.length;

  const navigate = useCallback((href: string) => {
    onClose();
    setQuery("");
    setSelectedIdx(0);
    router.push(href);
  }, [onClose, router]);

  const selectCurrent = useCallback(() => {
    if (selectedIdx < tokenItems.length) {
      const token = tokenItems[selectedIdx];
      if (token) navigate(`/token/${token.id}`);
    } else {
      const action = QUICK_ACTIONS[selectedIdx - tokenItems.length];
      if (action) navigate(action.href);
    }
  }, [selectedIdx, tokenItems, navigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, totalItems - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); selectCurrent(); }
      if (e.key === "Escape")    { onClose(); setQuery(""); setSelectedIdx(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, totalItems, selectCurrent, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 60); setSelectedIdx(0); }
    else { setQuery(""); }
  }, [open]);

  // Reset selection when query changes
  useEffect(() => { setSelectedIdx(0); }, [query]);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); if (!open) onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md"
            onClick={() => { onClose(); setQuery(""); }}
          />

          {/* Modal */}
          <motion.div
            key="sm"
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed top-[10vh] left-1/2 z-[301] w-full max-w-2xl -translate-x-1/2 flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: isDark ? "rgba(8,6,3,0.99)" : "rgba(255,255,255,0.98)",
              border: `1px solid ${isDark ? "rgba(232,184,75,0.3)" : "rgba(99,102,241,0.15)"}`,
              boxShadow: isDark 
                ? "0 48px 120px -24px rgba(0,0,0,0.95), 0 0 80px -30px rgba(232,184,75,0.18)"
                : "0 48px 120px -24px rgba(0,0,0,0.1), 0 0 80px -30px rgba(99,102,241,0.1)",
              maxHeight: "80vh",
            }}
          >
            {/* Top line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? "via-mf-gold/70" : "via-indigo-500/50"} to-transparent`} />

            {/* Search input row */}
            <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${isDark ? "rgba(232,184,75,0.1)" : "rgba(99,102,241,0.1)"}` }}>
              <Search size={18} style={{ color: isDark ? "#e8b84b" : "rgba(99,102,241,1)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tokens, tickers, categories…"
                className="flex-1 bg-transparent border-none outline-none font-body text-base"
                style={{ color: "var(--color-text-primary)" }}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 rounded-lg transition-colors" style={{ color: "var(--color-text-secondary)" }}>
                    <X size={14} />
                  </button>
                )}
                <kbd className="font-mono text-[0.55rem] px-2 py-1 rounded-md" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`, color: "var(--color-text-secondary)" }}>
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results area */}
            <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>

              {/* Token results / Recent */}
              <div className="px-3 pt-3">
                <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase px-2 mb-2" style={{ color: "var(--color-text-faint)" }}>
                  {showResults ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "Recent"}
                </p>

                {tokenItems.length === 0 && showResults && (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <Search size={24} style={{ color: "var(--color-text-faint)" }} />
                    <p className="font-mono text-[0.65rem]" style={{ color: "var(--color-text-faint)" }}>No tokens found for "{query}"</p>
                  </div>
                )}

                <div className="flex flex-col gap-0.5 mb-3">
                  {tokenItems.map((token, i) => {
                    const isSelected = selectedIdx === i;
                    return (
                      <motion.button
                        key={token.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
                        onClick={() => navigate(`/token/${token.id}`)}
                        onMouseEnter={() => setSelectedIdx(i)}
                        className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? (isDark ? "rgba(232,184,75,0.06)" : "rgba(99,102,241,0.06)") : "transparent",
                          border: `1px solid ${isSelected ? (isDark ? "rgba(232,184,75,0.25)" : "rgba(99,102,241,0.2)") : "transparent"}`,
                        }}
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${token.color}15`, border: `1px solid ${token.color}30` }}>
                          {token.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-display text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                              {highlight(token.name, query, isDark)}
                            </span>
                            <span className="font-mono text-[0.55rem] px-1.5 py-0.5 rounded" style={{ color: isDark ? "#e8b84b" : "rgba(99,102,241,1)", background: isDark ? "rgba(232,184,75,0.1)" : "rgba(99,102,241,0.1)", border: `1px solid ${isDark ? "rgba(232,184,75,0.2)" : "rgba(99,102,241,0.2)"}` }}>
                              ${highlight(token.ticker, query, isDark)}
                            </span>
                            {token.graduated && (
                              <span className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                                <Award size={8} /> Graduated
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[0.6rem]" style={{ color: "var(--color-text-secondary)" }}>${token.price.toFixed(5)}</span>
                            <span className="font-mono text-[0.6rem] capitalize" style={{ color: "var(--color-text-faint)" }}>{token.category}</span>
                            {!token.graduated && (
                              <span className="font-mono text-[0.55rem]" style={{ color: "#a9791f" }}>
                                {token.bondingCurveProgress}% bonding
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Change */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="flex items-center gap-0.5 font-mono text-[0.65rem] font-semibold" style={{ color: token.change24h > 0 ? "#10b981" : "#ef4444" }}>
                            {token.change24h > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {token.change24h > 0 ? "+" : ""}{token.change24h}%
                          </span>
                        </div>

                        {isSelected && <ChevronRight size={14} style={{ color: isDark ? "#e8b84b" : "rgba(99,102,241,1)", flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px mx-5" style={{ background: isDark ? "rgba(232,184,75,0.08)" : "rgba(99,102,241,0.08)" }} />

              {/* Quick Actions */}
              <div className="px-3 pt-3 pb-3">
                <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase px-2 mb-2" style={{ color: "var(--color-text-faint)" }}>
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 gap-0.5">
                  {QUICK_ACTIONS.map((action, i) => {
                    const itemIdx = tokenItems.length + i;
                    const isSelected = selectedIdx === itemIdx;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.href}
                        onClick={() => navigate(action.href)}
                        onMouseEnter={() => setSelectedIdx(itemIdx)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? (isDark ? "rgba(232,184,75,0.08)" : "rgba(99,102,241,0.06)") : "transparent",
                          border: `1px solid ${isSelected ? (isDark ? "rgba(232,184,75,0.2)" : "rgba(99,102,241,0.2)") : "transparent"}`,
                        }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}` }}>
                          <Icon size={13} style={{ color: isSelected ? (isDark ? "#e8b84b" : "rgba(99,102,241,1)") : "var(--color-text-secondary)" }} />
                        </div>
                        <span className="flex-1 font-body text-sm" style={{ color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                          {action.label}
                        </span>
                        <kbd className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: "var(--color-text-faint)" }}>
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-5 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${isDark ? "rgba(232,184,75,0.08)" : "rgba(99,102,241,0.1)"}` }}>
              {[
                { keys: ["↑", "↓"], label: "Navigate" },
                { keys: ["↵"], label: "Select" },
                { keys: ["Esc"], label: "Close" },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {keys.map(k => (
                    <kbd key={k} className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded"
                      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: "var(--color-text-secondary)" }}>
                      {k}
                    </kbd>
                  ))}
                  <span className="font-mono text-[0.5rem]" style={{ color: "var(--color-text-faint)" }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
