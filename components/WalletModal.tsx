"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Copy, LogOut, ChevronRight, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useMoonWallet } from "@/components/WalletProvider";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const WALLET_META: Record<string, { desc: string; color: string; icon: ReactNode }> = {
  Phantom: {
    desc: "Most popular Solana wallet",
    color: "#551BF9",
    icon: (
      <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="url(#ph_grad)"/>
        <defs>
          <linearGradient id="ph_grad" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#534BB1"/>
            <stop offset="1" stopColor="#551BF9"/>
          </linearGradient>
        </defs>
        <path d="M110.584 64.984c0 25.74-21.735 46.593-48.546 46.593-25.716 0-47.17-18.88-48.394-43.11-.071-1.393-.047-2.794.071-4.178C15.832 43.8 31.95 28.415 52.14 24.15c6.02-1.274 12.263-1.274 18.283 0 20.19 4.265 36.308 19.65 38.09 40.139.049.566.071 1.133.071 1.695z" fill="white"/>
        <ellipse cx="79" cy="62" rx="7" ry="9" fill="#534BB1"/>
        <ellipse cx="55" cy="62" rx="7" ry="9" fill="#534BB1"/>
      </svg>
    ),
  },
  Backpack: {
    desc: "xNFT wallet by Coral",
    color: "#E33E3F",
    icon: (
      <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#E33E3F"/>
        <path d="M64 24C46.327 24 32 38.327 32 56v8h8v-8c0-13.255 10.745-24 24-24s24 10.745 24 24v8h8v-8c0-17.673-14.327-32-32-32z" fill="white"/>
        <rect x="24" y="60" width="80" height="48" rx="12" fill="white"/>
        <circle cx="64" cy="80" r="8" fill="#E33E3F"/>
      </svg>
    ),
  },
  Solflare: {
    desc: "Non-custodial Solana wallet",
    color: "#FC8D22",
    icon: (
      <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#FC8D22"/>
        <path d="M64 20L96 96H32L64 20Z" fill="white"/>
        <path d="M64 52L80 96H48L64 52Z" fill="#FC8D22"/>
      </svg>
    ),
  },
};

const FALLBACK_META: { desc: string; color: string; icon: ReactNode } = {
  desc: "Connect your Solana wallet",
  color: "#e8b84b",
  icon: (
    <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="28" fill="#e8b84b"/>
      <circle cx="64" cy="64" r="28" fill="white"/>
    </svg>
  ),
};

function shortenAddr(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { wallets, select, connect, connecting, connected, wallet } = useWallet();
  const { address, balance, wallet: connectedWalletName, disconnect } = useMoonWallet();
  const [step, setStep] = useState<"select" | "connecting" | "done" | "error">("select");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  // Ref to track if we're waiting to connect after select() settles
  const pendingConnect = useState(false);
  const [isPending, setIsPending] = pendingConnect;

  // When connection succeeds, advance to done
  useEffect(() => {
    if (connected && step === "connecting") {
      setStep("done");
      setTimeout(onClose, 1800);
    }
  }, [connected, step, onClose]);

  // select() is synchronous but the wallet state update is async —
  // watch for wallet to change then call connect()
  useEffect(() => {
    if (!isPending || !wallet) return;
    setIsPending(false);
    connect().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotReady") || msg.includes("not installed")) {
        setErrorMsg(`${selectedName} extension not detected. Please install it first.`);
      } else if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("user rejected")) {
        setErrorMsg("Connection rejected in wallet. Try again.");
      } else if (msg.includes("WalletNotSelectedError") || msg === "undefined") {
        setErrorMsg("Could not select wallet. Make sure the extension is installed.");
      } else {
        setErrorMsg(msg || "Unknown error. Please try again.");
      }
      setStep("error");
    });
  }, [wallet, isPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (walletName: string) => {
    setSelectedName(walletName);
    setStep("connecting");
    setErrorMsg("");
    // select() triggers a state update → the useEffect above picks it up and calls connect()
    select(walletName as WalletName<string>);
    setIsPending(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("select"); setSelectedName(null); setErrorMsg(""); }, 400);
  };

  const handleCopy = () => {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const handleDisconnect = () => { disconnect(); handleClose(); };

  // Build wallet list from detected adapters + supplement with known ones
  const detectedNames = wallets.map((w: { adapter: { name: string } }) => w.adapter.name);
  const allWalletNames = ["Phantom", "Solflare"].filter(() => true);
  const detected = new Set(detectedNames);

  const selectedMeta = selectedName
    ? (WALLET_META[selectedName] ?? FALLBACK_META)
    : FALLBACK_META;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-3xl p-6 relative overflow-hidden mx-4"
              style={{ background: "rgba(8,6,3,0.98)", border: "1px solid rgba(232,184,75,0.3)", boxShadow: "0 40px 100px -20px rgba(0,0,0,0.9), 0 0 60px -20px rgba(232,184,75,0.15)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Gold top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/70 to-transparent" />
              {/* Glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(232,184,75,0.08)" }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase mb-0.5" style={{ color: "#a9791f" }}>MoonFluxx</p>
                  <h2 className="font-display text-lg text-white font-semibold">
                    {step === "done" ? "Wallet Connected" : step === "connecting" ? "Connecting…" : step === "error" ? "Connection Failed" : "Connect Wallet"}
                  </h2>
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,184,75,0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                  <X size={14} style={{ color: "#6b6987" }} />
                </button>
              </div>

              <AnimatePresence mode="wait">

                {/* SELECT */}
                {step === "select" && (
                  <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                    {connected && address ? (
                      // Already connected
                      <div>
                        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}>
                              <CheckCircle size={18} style={{ color: "#10b981" }} />
                            </div>
                            <div>
                              <p className="font-mono text-xs font-semibold" style={{ color: "#10b981" }}>Connected via {connectedWalletName}</p>
                              <p className="font-mono text-[0.6rem]" style={{ color: "#6b6987" }}>{shortenAddr(address)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}>
                              <p className="font-mono text-[0.5rem] uppercase tracking-widest mb-0.5" style={{ color: "#6b6987" }}>Balance</p>
                              <p className="font-mono text-sm font-bold" style={{ color: "#e8b84b" }}>{balance.toFixed(3)} SOL</p>
                            </div>
                            <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(5,4,3,0.8)", border: "1px solid rgba(232,184,75,0.12)" }}>
                              <p className="font-mono text-[0.5rem] uppercase tracking-widest mb-0.5" style={{ color: "#6b6987" }}>Network</p>
                              <p className="font-mono text-sm font-bold" style={{ color: "#10b981" }}>Mainnet</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-xs transition-all"
                            style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.25)", color: copied ? "#10b981" : "#e8b84b" }}>
                            <Copy size={13} />{copied ? "Copied!" : "Copy Address"}
                          </button>
                          <button onClick={handleDisconnect} className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs transition-all"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                            <LogOut size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Pick wallet
                      <div className="flex flex-col gap-2">
                        <p className="font-mono text-[0.6rem] tracking-widest uppercase mb-2" style={{ color: "#6b6987" }}>Choose your wallet</p>
                        {allWalletNames.map((name, i) => {
                          const meta = WALLET_META[name] ?? FALLBACK_META;
                          const isDetected = detected.has(name as WalletName<string>);
                          return (
                            <motion.button
                              key={name}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }}
                              onClick={() => handleSelect(name)}
                              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all group"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", opacity: isDetected ? 1 : 0.55 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${meta.color}10`; (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}40`; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {meta.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-display text-sm font-semibold text-white">{name}</p>
                                <p className="font-mono text-[0.6rem]" style={{ color: "#6b6987" }}>
                                  {isDetected ? meta.desc : "Not installed — click to install"}
                                </p>
                              </div>
                              {isDetected && (
                                <span className="font-mono text-[0.48rem] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                                  Detected
                                </span>
                              )}
                              <ChevronRight size={16} style={{ color: "#6b6987" }} className="group-hover:translate-x-0.5 transition-transform" />
                            </motion.button>
                          );
                        })}
                        <p className="font-mono text-center text-[0.55rem] mt-3" style={{ color: "#35334a" }}>
                          By connecting you agree to our Terms of Service
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* CONNECTING */}
                {step === "connecting" && selectedName && (
                  <motion.div key="connecting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="flex flex-col items-center py-8 gap-5">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ border: `2px solid ${selectedMeta.color}60`, boxShadow: `0 0 30px ${selectedMeta.color}40` }}
                    >
                      {selectedMeta.icon}
                    </motion.div>
                    <div className="text-center">
                      <p className="font-display text-base text-white mb-1">Connecting to {selectedName}</p>
                      <p className="font-mono text-[0.62rem]" style={{ color: "#6b6987" }}>Approve the connection in your wallet…</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: selectedMeta.color }}
                          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ERROR */}
                {step === "error" && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="flex flex-col items-center py-6 gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.4)" }}>
                      <AlertCircle size={28} style={{ color: "#ef4444" }} />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-base text-white mb-1">Connection Failed</p>
                      <p className="font-mono text-[0.6rem] px-4" style={{ color: "#6b6987" }}>{errorMsg}</p>
                    </div>
                    <button onClick={() => setStep("select")} className="px-6 py-2.5 rounded-xl font-mono text-[0.65rem] uppercase tracking-widest transition-all"
                      style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)", color: "#e8b84b" }}>
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* DONE */}
                {step === "done" && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center py-8 gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.5)", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
                      <CheckCircle size={32} style={{ color: "#10b981" }} />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-display text-base text-white mb-1">Wallet Connected!</p>
                      <p className="font-mono text-[0.62rem]" style={{ color: "#10b981" }}>Welcome to MoonFluxx</p>
                      {address && <p className="font-mono text-[0.55rem] mt-1" style={{ color: "#6b6987" }}>{shortenAddr(address)} · {balance.toFixed(3)} SOL</p>}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
