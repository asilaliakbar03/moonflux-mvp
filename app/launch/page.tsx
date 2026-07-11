"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield, Rocket, ChevronRight, Cpu, PenTool,
  Loader2, Check, Zap, Users,
  TrendingUp, Star, Lock, AlertTriangle, Upload,
  Sparkles, BarChart3, Globe, AtSign, MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMoonWallet } from "@/components/WalletProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── BONDING CURVE DATA ────────────────────────────────────────────────────────
const CURVES = [
  {
    id: "fast",
    name: "Fast Launch",
    subtitle: "High velocity",
    description: "Steep curve for rapid price discovery. Great for memes with strong community momentum.",
    color: "#e8b84b",
    colorDim: "rgba(232,184,75,0.15)",
    risk: "High",
    riskColor: "#ef4444",
    idealFor: "Meme tokens · Viral plays",
    points: [0, 4, 14, 32, 58, 80, 94, 100],
  },
  {
    id: "balanced",
    name: "Balanced",
    subtitle: "Standard curve",
    description: "The goldilocks curve. Steady price growth rewarding early believers without being too steep.",
    color: "#a855f7",
    colorDim: "rgba(168,85,247,0.15)",
    risk: "Medium",
    riskColor: "#f59e0b",
    idealFor: "DeFi tokens · AI projects",
    points: [0, 2, 6, 14, 26, 44, 64, 82, 94, 100],
  },
  {
    id: "community",
    name: "Community",
    subtitle: "Gradual rise",
    description: "Slow and steady. Rewards patient holders and long-term community builders over flippers.",
    color: "#10b981",
    colorDim: "rgba(16,185,129,0.15)",
    risk: "Low",
    riskColor: "#10b981",
    idealFor: "DAO tokens · Ecosystem plays",
    points: [0, 1, 3, 6, 11, 18, 28, 42, 60, 78, 92, 100],
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Exclusive tier",
    description: "Flat early entry, then exponential. Only for verified creators. Maximum trust signal.",
    color: "#38bdf8",
    colorDim: "rgba(56,189,248,0.15)",
    risk: "Low",
    riskColor: "#10b981",
    idealFor: "Verified projects · Incubations",
    points: [0, 1, 2, 3, 5, 8, 14, 26, 52, 88, 100],
    premium: true,
  },
];

const LIQUIDITY_OPTIONS = [
  { id: "fair", label: "Fair Launch", desc: "100% Pool", detail: "Maximum trust. Zero dev allocation. Full community ownership.", icon: Users, color: "#10b981" },
  { id: "standard", label: "Standard", desc: "Pool 70% / Dev 30%", detail: "Balanced approach. Dev retains allocation for future development.", icon: BarChart3, color: "#e8b84b" },
  { id: "growth", label: "Growth Mode", desc: "Pool 90% / Dev 10%", detail: "Near-fair with a small dev reserve for operations.", icon: TrendingUp, color: "#a855f7" },
];

// ── MINI SVG CURVE PREVIEW ────────────────────────────────────────────────────
function CurvePreview({ points, color, active }: { points: number[]; color: string; active: boolean }) {
  const W = 120, H = 56;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = H - (v / 100) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`cg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <motion.polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={`url(#cg-${color.replace("#","")})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
      />
      {/* Line */}
      <motion.polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={active ? 2 : 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: active ? `drop-shadow(0 0 4px ${color}80)` : "none" }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {/* End dot */}
      <motion.circle
        cx={W}
        cy={4}
        r={active ? 3.5 : 2.5}
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        animate={{ scale: active ? [1, 1.3, 1] : 1 }}
        transition={{ repeat: active ? Infinity : 0, duration: 1.8 }}
      />
    </svg>
  );
}

// ── TYPING TEXT EFFECT ────────────────────────────────────────────────────────
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 22);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-mf-gold ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

// ── AI LOG LINES ─────────────────────────────────────────────────────────────
const AI_LOG_LINES = [
  { text: "Parsing narrative parameters...", delay: 100 },
  { text: "Scanning X for related viral hooks...", delay: 800 },
  { text: "Computing tokenomics DNA...", delay: 1600 },
  { text: "Generating identity matrix...", delay: 2400 },
  { text: "Synthesizing logo concept...", delay: 3100 },
  { text: "Running rug-probability simulation...", delay: 3800 },
  { text: "Crystallizing final metadata...", delay: 4400 },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LaunchPage() {
  const [mode, setMode] = useState<"selection" | "manual" | "ai">("selection");
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCurve, setSelectedCurve] = useState("balanced");
  const [selectedLiquidity, setSelectedLiquidity] = useState("standard");
  const [antisniperEnabled, setAntisniperEnabled] = useState(true);
  const [logLines, setLogLines] = useState<number[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    prompt: "",
    website: "",
    twitter: "",
    telegram: "",
  });

  const STEPS =
    mode === "ai"
      ? ["Vision", "Synthesis", "Identity", "Mechanics", "Deploy"]
      : ["Identity", "Mechanics", "Deploy"];

  const handleAiGenerate = async () => {
    if (!formData.prompt.trim()) return;
    setIsGenerating(true);
    setLogLines([]);

    // Stagger reveal log lines
    AI_LOG_LINES.forEach((_, i) => {
      setTimeout(() => setLogLines(prev => [...prev, i]), AI_LOG_LINES[i].delay);
    });

    try {
      const res = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formData.prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        ticker: data.ticker || prev.ticker,
        description: data.description || prev.description,
        website: data.website || prev.website,
        twitter: data.twitter || prev.twitter,
        telegram: data.telegram || prev.telegram,
      }));

      if (data.suggestedCurve) setSelectedCurve(data.suggestedCurve);
      if (data.suggestedLiquidity) setSelectedLiquidity(data.suggestedLiquidity);

      setIsGenerating(false);
      setStep(2); // Jump to Identity step
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      // Fallback in case of error
      setStep(2);
    }
  };

  const { anchorWallet, connection } = useMoonWallet();

  const handleDeploy = async () => {
    if (!anchorWallet) {
      alert("Please connect your wallet first");
      return;
    }

    // ── Step 0: Upload metadata to IPFS before any Solana code ───────────────
    let metadataUri = '';
    try {
      const uploadForm = new FormData();
      if (imageFile) uploadForm.append('image', imageFile);
      uploadForm.append('name', formData.name);
      uploadForm.append('ticker', formData.ticker);
      uploadForm.append('description', formData.description);
      if (formData.website) uploadForm.append('website', formData.website);
      if (formData.twitter) uploadForm.append('twitter', formData.twitter);
      if (formData.telegram) uploadForm.append('telegram', formData.telegram);
      uploadForm.append('creatorAddress', anchorWallet.publicKey.toBase58());

      const uploadRes = await fetch('/api/upload-metadata', { method: 'POST', body: uploadForm });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        metadataUri = uploadData.metadataUri as string;
      }
    } catch (e) {
      console.warn('Metadata upload failed, continuing without URI:', e);
    }

    setIsDeploying(true);
    try {
      const { Keypair, SystemProgram, PublicKey, Transaction } = await import("@solana/web3.js");
      const {
        getMoonfluxProgram,
        getBondingCurvePDA,
        getSolVaultPDA,
        getGlobalConfigPDA,
      } = await import("@/lib/program");
      const {
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        getAssociatedTokenAddressSync,
        createInitializeMintInstruction,
        createInitializeMint2Instruction,
        MintLayout,
      } = await import("@solana/spl-token");

      const program     = getMoonfluxProgram(connection, anchorWallet);
      const mint        = Keypair.generate();
      const curvePda    = getBondingCurvePDA(mint.publicKey);
      const solVaultPda = getSolVaultPDA(mint.publicKey);
      const globalPda   = getGlobalConfigPDA();

      const curveTokenAccount = getAssociatedTokenAddressSync(
        mint.publicKey,
        curvePda,
        true // allow PDA as owner (off-curve)
      );

      // ── Step 1: Create and initialize the Mint account ────────────────────
      // The mint authority MUST be set to the bondingCurve PDA so that
      // create_pool (which uses the PDA as a signer) can call mint_to.
      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
      const createMintIx = SystemProgram.createAccount({
        fromPubkey:         anchorWallet.publicKey,
        newAccountPubkey:   mint.publicKey,
        space:              MintLayout.span,
        lamports:           lamportsForMint,
        programId:          TOKEN_PROGRAM_ID,
      });
      const initMintIx = createInitializeMint2Instruction(
        mint.publicKey,
        6,               // 6 decimal places (standard)
        curvePda,        // mint authority = bonding curve PDA
        null,            // freeze authority = none
        TOKEN_PROGRAM_ID
      );

      // ── Step 2: Build the create_pool instruction ─────────────────────────
      // quoteType=0 → SOL-native pool (Phase 1)
      // quoteMint for SOL pools = SystemProgram.programId (ignored by contract)
      const createPoolTx = await program.methods.createPool(metadataUri, 0)
        .accounts({
          bondingCurve:           curvePda,
          solVault:               solVaultPda,
          curveTokenAccount,
          mint:                   mint.publicKey,
          creator:                anchorWallet.publicKey,
          quoteMint:              SystemProgram.programId, // SOL pool — no SPL quote mint
          tokenProgram:           TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram:          SystemProgram.programId,
          globalConfig:           globalPda,
        })
        .transaction();

      // ── Step 3: Combine into one atomic transaction ───────────────────────
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const combinedTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer:        anchorWallet.publicKey,
      })
        .add(createMintIx)
        .add(initMintIx)
        .add(...createPoolTx.instructions);

      // Partial sign with the new mint keypair (only this keypair signs for the mint account)
      combinedTx.partialSign(mint);

      // User wallet signs the full transaction (pays fees and authorizes as creator)
      const signedTx = await anchorWallet.signTransaction(combinedTx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      // Redirect to the newly created token page (using its mint address as the ID)
      router.push(`/token/${mint.publicKey.toBase58()}`);
    } catch (err) {
      console.error("Deploy failed:", err);
      alert("Deployment failed. See console.");
    } finally {
      setIsDeploying(false);
    }
  };

  const selectedCurveData = CURVES.find(c => c.id === selectedCurve)!;
  const selectedLiquidityData = LIQUIDITY_OPTIONS.find(l => l.id === selectedLiquidity)!;

  return (
    <div className="max-w-4xl mx-auto flex-1 flex flex-col gap-4 pt-2 pb-4 relative w-full px-4 lg:px-0">

      {/* ── COMPACT HEADER BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(28,20,6,0.9)", border: "1px solid rgba(232,184,75,0.5)" }}>
            <Zap size={14} style={{ color: "#e8b84b" }} />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-[0.12em] font-medium text-gold-liquid leading-none">THE FORGE</h1>
            <p className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color: "#6b6987" }}>14-Layer Protocol · Solana {process.env.NEXT_PUBLIC_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}</p>
          </div>
        </div>
        <span className="eyebrow text-[0.5rem] hidden sm:block" style={{ color: "#6b6987" }}>Token Deployment Engine</span>
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">


        {/* ══ SELECTION SCREEN — full-height hero ══ */}
        {mode === "selection" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Hero headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="text-center mb-6"
            >
              <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase mb-2" style={{ color: "#a9791f" }}>
                Choose your deployment path
              </p>
              <h2 className="font-display text-4xl tracking-wide" style={{ color: "#ffe6a3" }}>
                How do you want to forge?
              </h2>
            </motion.div>

            {/* Two big hero cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-0">

              {/* AI Genesis */}
              <motion.button
                id="launch-mode-ai"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                whileHover={{ scale: 1.015, y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setMode("ai"); setStep(0); }}
                className="rounded-3xl transition-all group relative overflow-hidden flex flex-col items-center justify-center gap-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold/70 p-10"
                style={{
                  background: "rgba(18,14,8,0.95)",
                  border: "1px solid rgba(232,184,75,0.5)",
                  boxShadow: "0 0 60px -12px rgba(232,184,75,0.25), inset 0 1px 0 rgba(255,230,163,0.1)",
                }}
              >
                <div className="absolute inset-0 aurora-mesh opacity-50 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-mf-gold/10 via-transparent to-mf-violet/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-mf-gold/80 to-transparent" />
                <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />

                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="absolute w-36 h-36 rounded-full blur-2xl"
                    style={{ background: "rgba(232,184,75,0.2)" }}
                  />
                  <div className="relative w-28 h-28 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                    style={{ background: "rgba(30,22,8,0.9)", border: "2px solid rgba(232,184,75,0.5)", boxShadow: "0 0 40px rgba(232,184,75,0.3)" }}>
                    <div className="absolute inset-0 rounded-full bg-mf-gold/15 blur-xl animate-pulse" />
                    <Cpu size={44} className="relative" style={{ color: "#e8b84b", filter: "drop-shadow(0 0 12px rgba(232,184,75,0.8))" }} />
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <span className="mb-4 inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-widest uppercase px-3 py-1.5 rounded-full"
                    style={{ color: "#ffe6a3", background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.4)" }}>
                    <Sparkles size={10} /> Recommended
                  </span>
                  <h2 className="font-display text-4xl mb-3 text-gold-liquid">AI Genesis</h2>
                  <p className="font-mono text-sm tracking-widest uppercase leading-loose" style={{ color: "#8a8099" }}>
                    Describe your idea.<br />
                    Our Quantum-LLM forges the name,<br />
                    lore, logo &amp; mechanics.
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap justify-center relative z-10">
                  {["Name", "Ticker", "Logo", "Roadmap", "Memes"].map(tag => (
                    <span key={tag} className="font-mono text-[0.6rem] tracking-widest uppercase px-3 py-1.5 rounded-full"
                      style={{ color: "#e8b84b", background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.3)" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 relative z-10" style={{ color: "#e8b84b" }}>
                  <span className="font-mono text-[0.6rem] tracking-widest uppercase">Click to begin</span>
                  <ChevronRight size={14} />
                </div>
              </motion.button>

              {/* Manual Forge */}
              <motion.button
                id="launch-mode-manual"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                whileHover={{ scale: 1.015, y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setMode("manual"); setStep(0); }}
                className="rounded-3xl transition-all group relative overflow-hidden flex flex-col items-center justify-center gap-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-champagne/60 p-10"
                style={{
                  background: "rgba(14,12,20,0.95)",
                  border: "1px solid rgba(196,181,253,0.3)",
                  boxShadow: "0 0 60px -12px rgba(124,58,237,0.2), inset 0 1px 0 rgba(196,181,253,0.08)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-mf-flare/6 via-transparent to-mf-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
                <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent" />

                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    className="absolute w-36 h-36 rounded-full blur-2xl"
                    style={{ background: "rgba(168,85,247,0.2)" }}
                  />
                  <div className="relative w-28 h-28 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                    style={{ background: "rgba(20,16,28,0.9)", border: "2px solid rgba(196,181,253,0.4)", boxShadow: "0 0 40px rgba(168,85,247,0.2)" }}>
                    <PenTool size={44} style={{ color: "#c4b5fd", filter: "drop-shadow(0 0 10px rgba(168,85,247,0.6))" }} />
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <h2 className="font-display text-4xl mb-3" style={{ color: "#f5e6c8" }}>Manual Forge</h2>
                  <p className="font-mono text-sm tracking-widest uppercase leading-loose" style={{ color: "#8a8099" }}>
                    Absolute control.<br />
                    Configure every parameter,<br />
                    upload assets &amp; tune mechanics.
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap justify-center relative z-10">
                  {["Full Control", "Custom Assets", "Fine-Tuned"].map(tag => (
                    <span key={tag} className="font-mono text-[0.6rem] tracking-widest uppercase px-3 py-1.5 rounded-full"
                      style={{ color: "#c4b5fd", background: "rgba(196,181,253,0.08)", border: "1px solid rgba(196,181,253,0.3)" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 relative z-10" style={{ color: "#c4b5fd" }}>
                  <span className="font-mono text-[0.6rem] tracking-widest uppercase">Click to begin</span>
                  <ChevronRight size={14} />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══ WIZARD ══ */}
        {mode !== "selection" && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col"
            style={{ flex: 1 }}
          >
            {/* Progress bar */}
            <div className="flex justify-between items-center mb-5 relative px-6">
              <div className="absolute left-8 right-8 top-5 h-[1px] bg-mf-line-gold z-0" />
              <motion.div
                className="absolute left-8 top-5 h-[2px] bg-gradient-to-r from-mf-gold-deep via-mf-gold to-mf-gold-hi z-0 rounded-full shadow-[0_0_10px_rgba(232,184,75,0.55)]"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / (STEPS.length - 1)) * (100 - (16 / (STEPS.length - 1)))}%` }}
                transition={{ ease: EASE, duration: 0.55 }}
              />
              {STEPS.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-xs transition-all ${
                      i < step
                        ? "bg-mf-gold border-mf-gold text-black"
                        : i === step
                        ? "bg-mf-obsidian border-mf-gold text-mf-gold-hi shadow-[0_0_20px_rgba(232,184,75,0.4)]"
                        : "bg-mf-obsidian border-mf-line-gold text-mf-dim"
                    }`}
                    animate={i === step ? { boxShadow: ["0 0 16px rgba(232,184,75,0.3)", "0 0 30px rgba(232,184,75,0.6)", "0 0 16px rgba(232,184,75,0.3)"] } : {}}
                    transition={{ repeat: i === step ? Infinity : 0, duration: 2, ease: "easeInOut" }}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </motion.div>
                  <span className={`font-mono text-[0.5rem] tracking-widest uppercase absolute -bottom-5 whitespace-nowrap ${i <= step ? "text-mf-gold" : "text-mf-dimmer"}`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${step}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
                style={{
                  flex: 1,
                  background: "rgba(12,10,7,0.94)",
                  border: "1px solid rgba(232,184,75,0.3)",
                  boxShadow: "0 32px 80px -20px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,230,163,0.07)",
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />
                <div className="pointer-events-none absolute -top-20 -right-14 w-56 h-56 bg-mf-gold/12 blur-[80px] rounded-full" />
                <div className="pointer-events-none absolute -bottom-20 -left-14 w-48 h-48 bg-mf-violet/10 blur-[70px] rounded-full" />

                <div className="flex-1 overflow-y-auto relative">

                  {/* ─ AI Vision ─ */}
                  {mode === "ai" && step === 0 && (
                    <div className="flex flex-col h-full gap-5">
                      <div>
                        <h2 className="font-display text-2xl text-gold-liquid flex items-center gap-3 mb-1">
                          <Cpu style={{ color: "#e8b84b" }} className="shrink-0" size={22} />
                          Describe Your Vision
                        </h2>
                        <p className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: "#6b6987" }}>
                          One sentence or a full pitch — our AI handles the rest.
                        </p>
                      </div>

                      <textarea
                        id="ai-vision-input"
                        value={formData.prompt}
                        onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                        className="flex-1 min-h-[180px] rounded-2xl p-5 font-body text-sm resize-none outline-none leading-relaxed transition-all"
                        style={{
                          background: "rgba(5,4,3,0.85)",
                          border: "1px solid rgba(232,184,75,0.35)",
                          color: "#f5e6c8",
                        }}
                        placeholder={`e.g., "A cosmic feline meme token with real DeFi utility. The mascot is a cyborg cat named Nova. Should feel premium and viral. Deflationary mechanics."`}
                      />

                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-mono text-[0.55rem] tracking-wider uppercase" style={{ color: "#6b6987" }}>Quick prompts:</span>
                        {["Viral meme with dog", "AI-powered DeFi protocol", "Gaming guild token", "Community DAO"].map(p => (
                          <button
                            key={p}
                            onClick={() => setFormData({ ...formData, prompt: p })}
                            className="font-mono text-[0.55rem] tracking-wider px-2.5 py-1 rounded-full transition-all"
                            style={{ border: "1px solid rgba(232,184,75,0.3)", color: "#a9791f" }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "rgba(232,184,75,0.6)"; (e.target as HTMLElement).style.color = "#e8b84b"; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "rgba(232,184,75,0.3)"; (e.target as HTMLElement).style.color = "#a9791f"; }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─ AI Synthesis ─ */}
                  {mode === "ai" && step === 1 && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
                      {/* Orbital animation */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-mf-gold/30"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                          className="absolute inset-4 rounded-full border border-mf-violet/40"
                        />
                        <div className="absolute inset-0 bg-mf-gold/10 rounded-full blur-2xl animate-pulse" />
                        <div className="w-20 h-20 rounded-full glass-gold pulse-gold flex items-center justify-center relative z-10">
                          <Cpu size={36} className="text-gold-glow" />
                        </div>
                        {/* Orbiting dots */}
                        {[0, 120, 240].map((angle, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2.5 h-2.5 rounded-full bg-mf-gold shadow-[0_0_8px_rgba(232,184,75,0.8)]"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
                            style={{
                              transformOrigin: "68px 68px",
                              top: "50%",
                              left: "50%",
                              transform: `rotate(${angle}deg) translateX(52px) translateY(-50%)`,
                            }}
                          />
                        ))}
                      </div>

                      <div className="text-center">
                        <h3 className="font-display text-xl text-gold-liquid mb-2">Synthesizing DNA...</h3>
                        <p className="font-mono text-[0.6rem] text-mf-dim tracking-widest uppercase mb-6">
                          Quantum-LLM processing · ETA ~5s
                        </p>

                        {/* Log lines */}
                        <div className="text-left w-full max-w-sm mx-auto bg-mf-obsidian/60 rounded-xl p-4 border border-mf-line-gold font-mono text-[0.6rem] tracking-wide space-y-1.5">
                          {AI_LOG_LINES.map((line, i) => (
                            logLines.includes(i) && (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-mf-champagne/70"
                              >
                                <span className="text-mf-gold">›</span>
                                <TypingText text={line.text} />
                              </motion.div>
                            )
                          ))}
                          {isGenerating && logLines.length < AI_LOG_LINES.length && (
                            <div className="flex gap-1 pt-1">
                              {[0,1,2].map(i => (
                                <motion.div
                                  key={i}
                                  className="w-1 h-1 rounded-full bg-mf-gold/60"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─ Identity (Manual Step 0 | AI Step 2) ─ */}
                  {((mode === "manual" && step === 0) || (mode === "ai" && step === 2)) && (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <h2 className="font-display text-2xl text-gold-liquid flex items-center gap-3">
                          <PenTool className="text-mf-gold shrink-0" size={20} />
                          Token Identity
                        </h2>
                        {mode === "ai" && (
                          <span className="chip-gold flex items-center gap-1.5">
                            <Sparkles size={9} /> AI Generated
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                        {/* Logo upload */}
                        <label
                          htmlFor="logo-upload-input"
                          className="w-full md:w-36 h-36 border-2 border-dashed border-mf-line-gold rounded-2xl flex flex-col items-center justify-center bg-mf-obsidian/40 hover:bg-mf-obsidian/60 hover:border-mf-gold/40 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          {mode === "ai" && !imagePreview ? (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-mf-gold/10 to-mf-violet/10" />
                              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-mf-gold/30 to-mf-violet/20 flex items-center justify-center font-display text-3xl text-gold mb-2 shadow-[0_0_20px_rgba(232,184,75,0.25)]">
                                {formData.name[0] || "?"}
                              </div>
                              <span className="font-mono text-[0.5rem] tracking-widest uppercase text-mf-gold/60 relative">AI Generated</span>
                            </>
                          ) : imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Token logo preview"
                                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <Upload size={20} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-mf-gold/10 border border-mf-line-gold flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={18} className="text-mf-gold-deep" />
                              </div>
                              <span className="font-mono text-[0.55rem] tracking-widest uppercase text-mf-dim text-center px-2">
                                Drop logo<br />PNG · SVG · GIF
                              </span>
                            </>
                          )}
                          <input
                            id="logo-upload-input"
                            type="file"
                            accept="image/png,image/svg+xml,image/gif,image/jpeg,image/webp"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setImageFile(file);
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              } else {
                                setImagePreview(null);
                              }
                            }}
                          />
                        </label>

                        {/* Inputs */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim">Token Name</label>
                              <input
                                id="token-name"
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. AstroCat"
                                className="w-full bg-mf-obsidian/60 border border-mf-line-gold rounded-xl px-4 py-3 text-white font-display text-sm outline-none focus:border-mf-gold/50 focus-visible:ring-1 focus-visible:ring-mf-gold/40 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim">Ticker</label>
                              <input
                                id="token-ticker"
                                type="text"
                                value={formData.ticker}
                                onChange={e => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                                placeholder="ACAT"
                                maxLength={6}
                                className="w-full bg-mf-obsidian/60 border border-mf-line-gold rounded-xl px-4 py-3 text-mf-gold-hi font-mono text-sm outline-none focus:border-mf-gold/50 focus-visible:ring-1 focus-visible:ring-mf-gold/40 transition-all uppercase tracking-widest"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim">Description / Lore</label>
                            <textarea
                              id="token-description"
                              value={formData.description}
                              onChange={e => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Describe the vision, utility, and lore of your token..."
                              className="w-full bg-mf-obsidian/60 border border-mf-line-gold rounded-xl px-4 py-3 text-mf-champagne font-body text-sm h-24 resize-none outline-none focus:border-mf-gold/50 focus-visible:ring-1 focus-visible:ring-mf-gold/40 transition-all leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social links */}
                      <div>
                        <p className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim mb-3">Social Links <span className="text-mf-dimmer">(optional)</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { id: "token-website", key: "website", icon: Globe, placeholder: "astrocat.xyz" },
                            { id: "token-twitter", key: "twitter", icon: AtSign, placeholder: "@AstroCatSOL" },
                            { id: "token-telegram", key: "telegram", icon: MessageCircle, placeholder: "t.me/astrocat" },
                          ].map(({ id, key, icon: Icon, placeholder }) => (
                            <div key={key} className="flex items-center gap-2 bg-mf-obsidian/40 border border-mf-line-gold rounded-xl px-3 py-2.5">
                              <Icon size={14} className="text-mf-gold-deep shrink-0" />
                              <input
                                id={id}
                                type="text"
                                value={formData[key as keyof typeof formData]}
                                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent outline-none text-mf-champagne font-mono text-xs placeholder:text-mf-dimmer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─ Mechanics (Manual Step 1 | AI Step 3) ─ */}
                  {((mode === "manual" && step === 1) || (mode === "ai" && step === 3)) && (
                    <div className="flex flex-col gap-7">
                      <h2 className="font-display text-2xl text-gold-liquid flex items-center gap-3">
                        <Shield className="text-mf-gold-hi shrink-0" size={22} />
                        Mechanics &amp; Rules
                      </h2>

                      {/* ── Bonding Curve Selector ── */}
                      <div>
                        <p className="font-mono text-[0.6rem] tracking-widest uppercase text-mf-dim mb-4">
                          L·01 — Dynamic Bonding Curve
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {CURVES.map(curve => (
                            <button
                              key={curve.id}
                              id={`curve-${curve.id}`}
                              onClick={() => setSelectedCurve(curve.id)}
                              className={`relative rounded-2xl p-4 border text-left transition-all flex flex-col gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold/60 ${
                                selectedCurve === curve.id
                                  ? "border-[var(--curve-color)] bg-[var(--curve-bg)]"
                                  : "border-mf-line-gold bg-mf-obsidian/40 hover:border-mf-line-gold/80"
                              }`}
                              style={{
                                "--curve-color": curve.color,
                                "--curve-bg": curve.colorDim,
                              } as React.CSSProperties}
                            >
                              {curve.premium && (
                                <span className="absolute -top-2 -right-2 font-mono text-[0.5rem] tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-mf-ice/20 text-mf-ice border border-mf-ice/30 flex items-center gap-1">
                                  <Star size={7} fill="currentColor" /> Pro
                                </span>
                              )}

                              {selectedCurve === curve.id && (
                                <div
                                  className="absolute inset-0 rounded-2xl opacity-20"
                                  style={{ boxShadow: `inset 0 0 30px ${curve.color}40` }}
                                />
                              )}

                              {/* Curve SVG */}
                              <div className="relative">
                                <CurvePreview
                                  points={curve.points}
                                  color={curve.color}
                                  active={selectedCurve === curve.id}
                                />
                              </div>

                              <div>
                                <p className="font-display text-sm text-white leading-tight">{curve.name}</p>
                                <p className="font-mono text-[0.55rem] tracking-widest uppercase mt-0.5" style={{ color: curve.color }}>
                                  {curve.subtitle}
                                </p>
                              </div>

                              {selectedCurve === curve.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="text-[0.6rem] text-mf-dim leading-relaxed border-t border-mf-line-gold/30 pt-2"
                                >
                                  {curve.description}
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Selected curve details */}
                        <motion.div
                          key={selectedCurve}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex flex-wrap gap-4 items-center"
                        >
                          <span className="font-mono text-[0.58rem] text-mf-dim uppercase tracking-widest">Ideal for:</span>
                          <span className="font-mono text-[0.6rem] tracking-wider" style={{ color: selectedCurveData.color }}>
                            {selectedCurveData.idealFor}
                          </span>
                          <span className="ml-auto font-mono text-[0.58rem] text-mf-dim uppercase tracking-widest">Risk:</span>
                          <span className="font-mono text-[0.6rem] tracking-wider" style={{ color: selectedCurveData.riskColor }}>
                            {selectedCurveData.risk}
                          </span>
                        </motion.div>
                      </div>

                      {/* ── Anti-Sniper Shield (L·02) ── */}
                      <div className="rounded-2xl border border-mf-line-gold p-5 bg-mf-obsidian/40 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${antisniperEnabled ? "bg-mf-success/15 border border-mf-success/40" : "bg-mf-obsidian/60 border border-mf-line-gold"}`}>
                              <Shield size={18} className={antisniperEnabled ? "text-mf-success" : "text-mf-dim"} />
                            </div>
                            <div>
                              <p className="font-mono text-[0.62rem] tracking-widest uppercase text-mf-dim mb-0.5">L·02 — Anti-Sniper Launch Shield</p>
                              <p className="font-display text-base text-white">60-Second Protection Mode</p>
                            </div>
                          </div>

                          {/* Toggle */}
                          <button
                            id="antisniper-toggle"
                            onClick={() => setAntisniperEnabled(!antisniperEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-all shrink-0 mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold/60 ${antisniperEnabled ? "bg-mf-success/30 border border-mf-success/50" : "bg-mf-obsidian border border-mf-line-gold"}`}
                          >
                            <motion.div
                              animate={{ x: antisniperEnabled ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`absolute top-0.5 w-5 h-5 rounded-full ${antisniperEnabled ? "bg-mf-success shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-mf-dim"}`}
                            />
                          </button>
                        </div>

                        <AnimatePresence>
                          {antisniperEnabled && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                            >
                              {[
                                { label: "Max Wallet", value: "2%", icon: Lock },
                                { label: "Max TX", value: "1%", icon: AlertTriangle },
                                { label: "Batch Exec", value: "On", icon: Shield },
                                { label: "Anti-MEV", value: "Active", icon: Zap },
                              ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-mf-success/5 border border-mf-success/20 rounded-xl p-3 flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <Icon size={10} className="text-mf-success" />
                                    <span className="font-mono text-[0.55rem] tracking-widest uppercase text-mf-dim">{label}</span>
                                  </div>
                                  <span className="font-display text-sm text-mf-success">{value}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!antisniperEnabled && (
                          <p className="mt-3 font-mono text-[0.58rem] text-mf-danger/70 tracking-wider">
                            ⚠ Bots and snipers can front-run your launch without this shield.
                          </p>
                        )}
                      </div>

                      {/* ── Liquidity Distribution ── */}
                      <div>
                        <p className="font-mono text-[0.6rem] tracking-widest uppercase text-mf-dim mb-3">
                          Liquidity Distribution
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {LIQUIDITY_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.id}
                                id={`liquidity-${opt.id}`}
                                onClick={() => setSelectedLiquidity(opt.id)}
                                className={`rounded-2xl p-4 border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold/60 ${
                                  selectedLiquidity === opt.id
                                    ? "border-mf-gold/50 bg-mf-gold/8"
                                    : "border-mf-line-gold bg-mf-obsidian/40 hover:border-mf-line-gold/80"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon size={14} style={{ color: opt.color }} />
                                  <span className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim">{opt.label}</span>
                                </div>
                                <p className="font-display text-sm text-white">{opt.desc}</p>
                                {selectedLiquidity === opt.id && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-mono text-[0.58rem] text-mf-dim mt-2 leading-relaxed"
                                  >
                                    {opt.detail}
                                  </motion.p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─ Deploy (Manual Step 2 | AI Step 4) ─ */}
                  {((mode === "manual" && step === 2) || (mode === "ai" && step === 4)) && (
                    <div className="flex flex-col gap-6">
                      <h2 className="font-display text-2xl text-gold-liquid flex items-center gap-3">
                        <Rocket className="text-mf-gold shrink-0" size={22} />
                        Ready for Liftoff
                      </h2>

                      {/* Summary card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Token card */}
                        <div className="rounded-2xl border border-mf-gold/30 bg-mf-gold/5 p-5 relative overflow-hidden">
                          <div className="absolute -top-8 -right-8 w-32 h-32 bg-mf-gold/10 blur-2xl rounded-full" />
                          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-mf-gold-deep mb-3">Token Identity</p>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mf-gold/30 to-mf-violet/20 flex items-center justify-center font-display text-2xl text-gold shadow-[0_0_14px_rgba(232,184,75,0.2)]">
                              {formData.name[0] || "?"}
                            </div>
                            <div>
                              <p className="font-display text-lg text-white">{formData.name || "Unnamed"}</p>
                              <p className="font-mono text-xs text-mf-gold tracking-widest">${formData.ticker || "????"}</p>
                            </div>
                          </div>
                          {formData.description && (
                            <p className="font-body text-xs text-mf-dim leading-relaxed line-clamp-2">{formData.description}</p>
                          )}
                        </div>

                        {/* Mechanics summary */}
                        <div className="rounded-2xl border border-mf-line-gold bg-mf-obsidian/40 p-5 space-y-3">
                          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-mf-dim mb-3">Mechanics Summary</p>
                          {[
                            { label: "Curve", value: selectedCurveData.name, color: selectedCurveData.color },
                            { label: "Liquidity", value: selectedLiquidityData.desc, color: "#e8b84b" },
                            { label: "Anti-Sniper", value: antisniperEnabled ? "Active ✓" : "Disabled ✗", color: antisniperEnabled ? "#10b981" : "#ef4444" },
                            { label: "Network", value: process.env.NEXT_PUBLIC_NETWORK === 'mainnet-beta' ? 'Solana Mainnet' : 'Solana Devnet', color: "#a855f7" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center py-2 border-b border-mf-line-gold/20 last:border-0">
                              <span className="font-mono text-[0.58rem] tracking-widest uppercase text-mf-dim">{label}</span>
                              <span className="font-mono text-[0.65rem] tracking-wider" style={{ color }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deploy CTA */}
                      <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-mf-gold/20 blur-2xl rounded-full scale-150" />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="relative w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(28,20,6,0.9)", border: "1px solid rgba(232,184,75,0.5)", boxShadow: "0 0 30px rgba(232,184,75,0.3)" }}
                          >
                            <Rocket size={38} style={{ color: "#e8b84b", filter: "drop-shadow(0 0 10px rgba(232,184,75,0.7))" }} />
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <p className="font-display text-lg text-white mb-1">Contract ready to deploy</p>
                          <p className="font-mono text-[0.58rem] text-mf-dim tracking-widest uppercase">
                            Estimated cost: ~0.02 SOL · Solana {process.env.NEXT_PUBLIC_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Footer Actions ── */}
                <div className="mt-6 pt-5 flex justify-between items-center" style={{ borderTop: "1px solid rgba(232,184,75,0.25)" }}>
                  <button
                    id="launch-back-btn"
                    onClick={() => {
                      if (step === 0) setMode("selection");
                      else setStep(step - 1);
                    }}
                    className="font-mono text-[0.62rem] tracking-widest uppercase rounded-full px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold/50 transition-colors"
                    style={{ color: "#6b6987" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b6987")}
                  >
                    {step === 0 ? "← Cancel" : "← Back"}
                  </button>

                  <button
                    id="launch-next-btn"
                    onClick={() => {
                      if (mode === "ai" && step === 0) {
                        setStep(1);
                        handleAiGenerate();
                      } else if (step === STEPS.length - 1) {
                        handleDeploy();
                      } else {
                        setStep(Math.min(STEPS.length - 1, step + 1));
                      }
                    }}
                    disabled={isGenerating || isDeploying || (mode === "ai" && step === 1 && isGenerating)}
                    className="sheen-gold px-6 py-2.5 rounded-full bg-gradient-to-r from-mf-gold-hi via-mf-gold to-mf-gold-deep text-black font-mono text-[0.65rem] tracking-widest uppercase font-semibold hover:brightness-110 hover:shadow-[0_0_26px_rgba(232,184,75,0.55)] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-mf-gold-hi/80"
                  >
                    {(() => {
                      if (isDeploying) return <><Loader2 className="animate-spin" size={13} /> Deploying...</>;
                      if (isGenerating) return <><Loader2 className="animate-spin" size={13} /> Synthesizing...</>;
                      if (step === STEPS.length - 1) return <><Rocket size={13} /> Deploy Contract</>;
                      if (mode === "ai" && step === 0) return <>Synthesize <Sparkles size={13} /></>;
                      return <>Next <ChevronRight size={13} /></>;
                    })()}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
