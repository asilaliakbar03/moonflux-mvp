"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Wallet, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMoonWallet } from "@/components/WalletProvider";
import { WalletModal } from "@/components/WalletModal";
import { NotificationPanel } from "@/components/NotificationPanel";
import { SearchModal } from "@/components/SearchModal";

/** Fetches real SOL/USD price from Jupiter every 15s */
const SOL_MINT = "So11111111111111111111111111111111111111112";
function useLivePrice() {
  const [price, setPrice] = useState(231.4);
  const [up, setUp] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`https://price.jup.ag/v4/price?ids=${SOL_MINT}`);
        if (!res.ok) return;
        const data = await res.json();
        const next = data?.data?.[SOL_MINT]?.price;
        if (next && !cancelled) {
          setPrice(prev => { setUp(next >= prev); return next; });
        }
      } catch { /* use last known price */ }
    }
    poll(); // immediate first fetch
    const id = setInterval(poll, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  return { price, up };
}

function shortenAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function TopBar() {
  const { price, up } = useLivePrice();
  const { connected, address, balance } = useMoonWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const UNREAD_COUNT = 0;

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        {/* gradient hairline under the bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />

        <div className="h-20 px-6 flex items-center justify-between backdrop-blur-[2px]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 pointer-events-auto group">
            <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-visible">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_68%_40%,#5a4416_0%,#241a06_45%,#000_78%)] [mask-image:linear-gradient(90deg,#000_50%,transparent_50%)] border border-mf-line-gold" />
              <div className="absolute w-[1.5px] h-[130%]" style={{ background: "linear-gradient(180deg,transparent,#e8b84b,#fffef6,#e8b84b,transparent)", boxShadow: "0 0 14px 2px rgba(232,184,75,0.75)" }} />
              <div className="absolute h-[1.5px] w-[130%]" style={{ background: "linear-gradient(90deg,transparent,#e8b84b,#fffef6,#e8b84b,transparent)", boxShadow: "0 0 14px 2px rgba(232,184,75,0.75)" }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-[-3px] border border-mf-gold/30 rounded-full border-t-transparent border-l-transparent"
              />
            </div>
            <span className="font-display font-medium text-lg tracking-[0.2em] uppercase text-white group-hover:text-gold transition-colors">
              MoonFluxx<sup className="text-[0.45em] font-light tracking-normal opacity-50">®</sup>
            </span>
            <span className="hidden xl:inline-block ml-2 px-2 py-0.5 rounded-sm border border-mf-line-gold font-mono text-[0.55rem] tracking-[0.3em] text-mf-gold-deep uppercase">
              Beta
            </span>
          </Link>

          {/* Global Search — click to open modal */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-mf-gold-deep/30 via-mf-gold/25 to-mf-gold-hi/25 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <button
                onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
                className="relative flex items-center bg-mf-obsidian/80 backdrop-blur-md border border-mf-line-gold rounded-full px-4 py-2 w-[420px] transition-all group-hover:border-mf-gold/50 text-left"
              >
                <Search size={15} className="text-mf-dim mr-3 shrink-0" />
                <span className="text-sm text-mf-dimmer font-body flex-1">Search tokens, creators, or paste address…</span>
                <div className="px-2 py-0.5 rounded bg-mf-bg-hover border border-mf-line text-[0.6rem] font-mono text-mf-dim shrink-0">
                  ⌘K
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* live SOL price */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-mf-obsidian/70 backdrop-blur-md border border-mf-line-gold font-mono text-[0.65rem] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-mf-success animate-blink shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-mf-dim">SOL</span>
              <span className={up ? "text-mf-success" : "text-mf-danger"}>${price.toFixed(2)}</span>
            </div>

            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2.5 rounded-full bg-mf-obsidian/80 backdrop-blur-md border transition-colors text-mf-gold-deep hover:text-gold"
              style={{ borderColor: notifOpen ? "rgba(232,184,75,0.6)" : "rgba(232,184,75,0.25)" }}
            >
              <Bell size={17} />
              {UNREAD_COUNT > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-mono text-[0.45rem] font-bold text-black bg-mf-gold shadow-[0_0_8px_rgba(232,184,75,0.9)]">
                  {UNREAD_COUNT}
                </span>
              )}
            </button>

            {/* Wallet button — switches state based on connection */}
            <AnimatePresence mode="wait">
              {connected && address ? (
                <motion.button
                  key="connected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs tracking-wider transition-all"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#10b981",
                    boxShadow: "0 0 20px rgba(16,185,129,0.1)"
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-mf-success shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  <span className="font-mono text-[0.65rem]">{shortenAddr(address)}</span>
                  <span className="text-mf-dim">·</span>
                  <span className="font-mono text-[0.65rem] text-mf-gold">{balance.toFixed(2)} SOL</span>
                  <ChevronDown size={12} className="text-mf-dim" />
                </motion.button>
              ) : (
                <motion.button
                  key="disconnected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setModalOpen(true)}
                  className="sheen-gold relative flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs tracking-widest text-black bg-gradient-to-b from-mf-gold-hi via-mf-gold to-mf-gold-deep hover:shadow-[0_0_28px_rgba(232,184,75,0.55)] transition-shadow"
                >
                  <Wallet size={15} />
                  CONNECT
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Wallet Modal */}
      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Notification Panel */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
