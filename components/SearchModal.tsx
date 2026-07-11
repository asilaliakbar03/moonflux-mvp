"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight, TrendingUp, Zap, Award, X, Hash, Clock, ChevronRight, Flame, BarChart3, Trophy, Settings, Rocket, Globe } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOKENS } from "@/lib/mock";

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

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(232,184,75,0.35)", color: "#ffe6a3", borderRadius: 2, padding: "0 1px" }}>
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
              background: "rgba(8,6,3,0.99)",
              border: "1px solid rgba(232,184,75,0.3)",
              boxShadow: "0 48px 120px -24px rgba(0,0,0,0.95), 0 0 80px -30px rgba(232,184,75,0.18)",
              maxHeight: "80vh",
            }}
          >
            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/70 to-transparent" />

            {/* Search input row */}
            <div className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: "1px solid rgba(232,184,75,0.1)" }}>
              <Search size={18} style={{ color: "#e8b84b", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tokens, tickers, categories…"
                className="flex-1 bg-transparent border-none outline-none font-body text-base"
                style={{ color: "#f4f2ff" }}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 rounded-lg transition-colors" style={{ color: "#6b6987" }}>
                    <X size={14} />
                  </button>
                )}
                <kbd className="font-mono text-[0.55rem] px-2 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#6b6987" }}>
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results area */}
            <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>

              {/* Token results / Recent */}
              <div className="px-3 pt-3">
                <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase px-2 mb-2" style={{ color: "#35334a" }}>
                  {showResults ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "Recent"}
                </p>

                {tokenItems.length === 0 && showResults && (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <Search size={24} style={{ color: "#35334a" }} />
                    <p className="font-mono text-[0.65rem]" style={{ color: "#35334a" }}>No tokens found for "{query}"</p>
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
                          background: isSelected ? "rgba(232,184,75,0.1)" : "transparent",
                          border: `1px solid ${isSelected ? "rgba(232,184,75,0.25)" : "transparent"}`,
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
                            <span className="font-display text-sm font-semibold text-white">
                              {highlight(token.name, query)}
                            </span>
                            <span className="font-mono text-[0.55rem] px-1.5 py-0.5 rounded" style={{ color: "#e8b84b", background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)" }}>
                              ${highlight(token.ticker, query)}
                            </span>
                            {token.graduated && (
                              <span className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                                <Award size={8} /> Graduated
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[0.6rem]" style={{ color: "#6b6987" }}>${token.price.toFixed(5)}</span>
                            <span className="font-mono text-[0.6rem] capitalize" style={{ color: "#35334a" }}>{token.category}</span>
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

                        {isSelected && <ChevronRight size={14} style={{ color: "#e8b84b", flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px mx-5" style={{ background: "rgba(232,184,75,0.08)" }} />

              {/* Quick Actions */}
              <div className="px-3 pt-3 pb-3">
                <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase px-2 mb-2" style={{ color: "#35334a" }}>
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
                          background: isSelected ? "rgba(232,184,75,0.08)" : "transparent",
                          border: `1px solid ${isSelected ? "rgba(232,184,75,0.2)" : "transparent"}`,
                        }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <Icon size={13} style={{ color: isSelected ? "#e8b84b" : "#6b6987" }} />
                        </div>
                        <span className="flex-1 font-body text-sm" style={{ color: isSelected ? "#f4f2ff" : "#6b6987" }}>
                          {action.label}
                        </span>
                        <kbd className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#35334a" }}>
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(232,184,75,0.08)" }}>
              {[
                { keys: ["↑", "↓"], label: "Navigate" },
                { keys: ["↵"], label: "Select" },
                { keys: ["Esc"], label: "Close" },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {keys.map(k => (
                    <kbd key={k} className="font-mono text-[0.5rem] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#6b6987" }}>
                      {k}
                    </kbd>
                  ))}
                  <span className="font-mono text-[0.5rem]" style={{ color: "#35334a" }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
