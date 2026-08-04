"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight, Award, X, ChevronRight, BarChart3, Trophy, Settings, Rocket, Globe } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOKENS } from "@/lib/mock";
import { useTheme } from "@/components/ThemeProvider";

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
      <mark className="bg-[#F59E0B] text-black px-0.5">{text.slice(idx, idx + query.length)}</mark>
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

  const borderColor = isDark ? 'rgba(255,255,255,0.3)' : '#000';
  const borderClass = isDark ? 'border-2 border-[rgba(255,255,255,0.3)]' : 'border-3 border-black';

  // Filter tokens
  const results = query.trim().length > 0
    ? ALL_TOKENS.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.ticker.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : [];

  const recentTokens = RECENT_IDS.map(id => ALL_TOKENS.find(t => t.id === id)).filter(Boolean) as typeof ALL_TOKENS;

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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[300] bg-black/80"
            onClick={() => { onClose(); setQuery(""); }}
          />

          {/* Modal */}
          <motion.div
            key="sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed top-[8vh] left-1/2 z-[301] w-full max-w-2xl -translate-x-1/2 flex flex-col
              font-mono uppercase tracking-wider
              ${isDark ? 'bg-[#050510] border-4 border-[rgba(255,255,255,0.3)] shadow-[8px_8px_0px_0px_#6366F1]' : 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]'}
            `}
            style={{ maxHeight: "80vh" }}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `3px solid ${borderColor}` }}>
              <Search size={18} className={isDark ? 'text-[#6366F1]' : 'text-[#6366F1]'} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="> SEARCH_QUERY..."
                className={`flex-1 bg-transparent border-none outline-none font-mono font-black text-sm uppercase tracking-wider ${isDark ? 'text-white placeholder-[rgba(255,255,255,0.25)]' : 'text-black placeholder-gray-400'}`}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {query && (
                  <button onClick={() => setQuery("")} className={`p-1 ${isDark ? 'text-[rgba(255,255,255,0.4)] hover:text-white' : 'text-gray-400 hover:text-black'}`}>
                    <X size={14} />
                  </button>
                )}
                <kbd className={`font-mono font-black text-[10px] px-2 py-1 ${isDark ? 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] border-2 border-[rgba(255,255,255,0.15)]' : 'bg-gray-100 text-gray-500 border-2 border-gray-300'}`}>
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results area */}
            <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>

              {/* Token results / Recent */}
              <div className="px-3 pt-3">
                <p className={`font-mono font-black text-[10px] tracking-[0.3em] uppercase px-2 mb-2 ${isDark ? 'text-[#06B6D4]' : 'text-blue-600'}`}>
                  [ {showResults ? `${results.length} RESULT${results.length !== 1 ? "S" : ""}` : "RECENT"} ]
                </p>

                {tokenItems.length === 0 && showResults && (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <Search size={24} className={isDark ? 'text-[rgba(255,255,255,0.2)]' : 'text-gray-300'} />
                    <p className={`font-mono font-black text-xs ${isDark ? 'text-[rgba(255,255,255,0.3)]' : 'text-gray-400'}`}>[ NO RESULTS FOR &quot;{query}&quot; ]</p>
                  </div>
                )}

                <div className="flex flex-col gap-1 mb-3">
                  {tokenItems.map((token, i) => {
                    const isSelected = selectedIdx === i;
                    return (
                      <motion.button
                        key={token.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        onClick={() => navigate(`/token/${token.id}`)}
                        onMouseEnter={() => setSelectedIdx(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                          isSelected 
                            ? `${isDark ? 'bg-[#6366F1] text-white border-2 border-[rgba(255,255,255,0.3)]' : 'bg-[#6366F1] text-white border-2 border-black'}`
                            : `${isDark ? 'border-2 border-transparent hover:border-[rgba(255,255,255,0.1)]' : 'border-2 border-transparent hover:border-gray-200'}`
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 flex items-center justify-center text-sm flex-shrink-0 ${borderClass}`}
                          style={{ background: `${token.color}20` }}>
                          {token.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-black text-sm">
                              {highlight(token.name, query)}
                            </span>
                            <span className={`font-mono font-black text-[10px] px-1.5 py-0.5 ${isDark ? 'bg-[rgba(255,255,255,0.08)] text-[#F59E0B] border border-[rgba(255,255,255,0.15)]' : 'bg-gray-100 text-[#6366F1] border border-gray-300'}`}>
                              ${highlight(token.ticker, query)}
                            </span>
                            {token.graduated && (
                              <span className="font-mono font-black text-[9px] px-1.5 py-0.5 bg-[#10B981] text-black flex items-center gap-1">
                                <Award size={8} /> GRAD
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold text-[10px] ${isSelected ? 'text-[rgba(255,255,255,0.7)]' : (isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-gray-500')}`}>${token.price.toFixed(5)}</span>
                            <span className={`font-mono text-[10px] capitalize ${isSelected ? 'text-[rgba(255,255,255,0.5)]' : (isDark ? 'text-[rgba(255,255,255,0.3)]' : 'text-gray-400')}`}>{token.category}</span>
                            {!token.graduated && (
                              <span className="font-mono text-[10px] text-[#F59E0B]">
                                {token.bondingCurveProgress}% BONDING
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Change */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`flex items-center gap-0.5 font-mono font-black text-xs ${token.change24h > 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                            {token.change24h > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {token.change24h > 0 ? "+" : ""}{token.change24h}%
                          </span>
                        </div>

                        {isSelected && <ChevronRight size={14} className="text-white flex-shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-3" style={{ borderTop: `2px solid ${borderColor}` }} />

              {/* Quick Actions */}
              <div className="px-3 pt-3 pb-3">
                <p className={`font-mono font-black text-[10px] tracking-[0.3em] uppercase px-2 mb-2 ${isDark ? 'text-[#F59E0B]' : 'text-orange-600'}`}>
                  [ QUICK ACTIONS ]
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {QUICK_ACTIONS.map((action, i) => {
                    const itemIdx = tokenItems.length + i;
                    const isSelected = selectedIdx === itemIdx;
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.href}
                        onClick={() => navigate(action.href)}
                        onMouseEnter={() => setSelectedIdx(itemIdx)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                          isSelected 
                            ? `${isDark ? 'bg-[rgba(255,255,255,0.05)] border-2 border-[#6366F1]' : 'bg-gray-50 border-2 border-[#6366F1]'}`
                            : `${isDark ? 'border-2 border-transparent' : 'border-2 border-transparent'}`
                        }`}
                      >
                        <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${
                          isSelected 
                            ? 'bg-[#6366F1] text-white' 
                            : `${isDark ? 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]' : 'bg-gray-100 text-gray-500'}`
                        } ${isDark ? 'border-2 border-[rgba(255,255,255,0.1)]' : 'border-2 border-gray-200'}`}>
                          <Icon size={13} />
                        </div>
                        <span className={`flex-1 font-mono font-black text-sm ${isSelected ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-gray-500')}`}>
                          {action.label}
                        </span>
                        <kbd className={`font-mono font-black text-[10px] px-2 py-0.5 flex-shrink-0 ${isDark ? 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] border-2 border-[rgba(255,255,255,0.1)]' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 flex-shrink-0" style={{ borderTop: `3px solid ${borderColor}` }}>
              {[
                { keys: ["↑", "↓"], label: "NAV" },
                { keys: ["↵"], label: "SELECT" },
                { keys: ["ESC"], label: "CLOSE" },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  {keys.map(k => (
                    <kbd key={k} className={`font-mono font-black text-[10px] px-1.5 py-0.5 ${isDark ? 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.15)]' : 'bg-gray-100 text-gray-500 border border-gray-300'}`}>
                      {k}
                    </kbd>
                  ))}
                  <span className={`font-mono font-black text-[10px] ${isDark ? 'text-[rgba(255,255,255,0.3)]' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
