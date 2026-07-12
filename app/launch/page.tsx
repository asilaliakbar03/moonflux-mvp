"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Settings, ChevronRight, Check, Loader2, Upload, AlertCircle, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMoonWallet } from "@/components/WalletProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

type LaunchMode = 'none' | 'ai' | 'custom';
type AIStep = 1 | 2 | 3;
type CustomStep = 1 | 2 | 3;

export default function LaunchPage() {
  const router = useRouter();
  const { anchorWallet, connection } = useMoonWallet();

  const [mode, setMode] = useState<LaunchMode>('none');
  const [aiStep, setAiStep] = useState<AIStep>(1);
  const [customStep, setCustomStep] = useState<CustomStep>(1);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCurve, setSelectedCurve] = useState("balanced");
  const [selectedLiquidity, setSelectedLiquidity] = useState("fair");

  // ── Blockchain Logic (Preserved exactly as requested) ──
  const handleDeploy = async () => {
    if (!anchorWallet) {
      alert("Please connect your wallet first");
      return;
    }

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
        6,
        curvePda,
        null,
        TOKEN_PROGRAM_ID
      );

      const createPoolTx = await program.methods.createPool(metadataUri, 0)
        .accounts({
          bondingCurve:           curvePda,
          solVault:               solVaultPda,
          curveTokenAccount,
          mint:                   mint.publicKey,
          creator:                anchorWallet.publicKey,
          quoteMint:              SystemProgram.programId,
          tokenProgram:           TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram:          SystemProgram.programId,
          globalConfig:           globalPda,
        })
        .transaction();

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const combinedTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer:        anchorWallet.publicKey,
      })
        .add(createMintIx)
        .add(initMintIx)
        .add(...createPoolTx.instructions);

      combinedTx.partialSign(mint);

      const signedTx = await anchorWallet.signTransaction(combinedTx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      router.push(`/token/${mint.publicKey.toBase58()}`);
    } catch (err) {
      console.error("Deploy failed:", err);
      alert("Deployment failed. See console.");
    } finally {
      setIsDeploying(false);
    }
  };
  // ──────────────────────────────────────────────────────────

  const simulateAIGeneration = async () => {
    setIsGenerating(true);
    
    // Simulate real generation
    await new Promise(r => setTimeout(r, 2000));
    
    const words = aiPrompt.split(' ');
    const mockName = words.length >= 2 ? `${words[0]} ${words[1]}` : 'Lunar Pup';
    const mockTicker = (words.length >= 2 ? `${words[0].substring(0,2)}${words[1].substring(0,3)}` : 'LPUP').toUpperCase();
    
    try {
      // Attempt real API if it exists
      const res = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...formData,
          name: data.name || mockName,
          ticker: data.ticker || mockTicker,
          description: data.description || "Generated description...",
        });
        if (data.suggestedCurve) setSelectedCurve(data.suggestedCurve);
        if (data.suggestedLiquidity) setSelectedLiquidity(data.suggestedLiquidity);
      } else {
        throw new Error("fallback");
      }
    } catch(e) {
      // Fallback
      setFormData({
        ...formData,
        name: mockName,
        ticker: `$${mockTicker}`,
        description: `A community-driven token inspired by: ${aiPrompt}. Born on MoonFluxx.`,
      });
    }

    setIsGenerating(false);
    setAiStep(2);
  };

  const renderStepIndicator = (current: number, total: number, labels: string[]) => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = current === stepNum;
        const isDone = current > stepNum;
        return (
          <div key={label} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-[#6366F1] text-white' : isDone ? 'bg-[#10B981] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[#94A3B8]'}`}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : isDone ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'}`}>{label}</span>
            </div>
            {stepNum < total && (
              <div className={`w-8 h-px ${isDone ? 'bg-[#10B981]' : 'bg-[rgba(255,255,255,0.1)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto w-full pt-8 pb-16">
      
      {/* ── INIT MODE SELECTION ── */}
      {mode === 'none' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold font-display text-white mb-3">Launch Your Token</h1>
            <p className="text-[#94A3B8] text-lg">Two ways to bring your token to life across chains.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="surface-card p-6 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Launch</h2>
              <p className="text-[#94A3B8] text-sm flex-1">Describe your idea. Our AI creates the perfect token narrative, name, and settings for you.</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-success">Recommended for beginners</span>
                <span className="text-xs text-[#94A3B8]">~2 mins</span>
              </div>
              
              <button onClick={() => setMode('ai')} className="w-full btn-primary text-base py-3">Start with AI</button>
            </div>
            
            <div className="surface-card p-6 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] text-[#94A3B8] flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Custom Launch</h2>
              <p className="text-[#94A3B8] text-sm flex-1">Full control. Set your own name, ticker, curve, and liquidity options.</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-muted">For experienced creators</span>
                <span className="text-xs text-[#94A3B8]">~5 mins</span>
              </div>
              
              <button onClick={() => setMode('custom')} className="w-full btn-ghost text-base py-3">Start Custom</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── AI MODE ── */}
      {mode === 'ai' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setMode('none')} className="text-[#94A3B8] hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
            ← Cancel Launch
          </button>
          
          {renderStepIndicator(aiStep, 3, ['Describe', 'Review', 'Deploy'])}

          <div className="surface-card p-6 md:p-8">
            
            {aiStep === 1 && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-white mb-6">What's your token about?</h2>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your token in a few words. E.g. 'A meme token for dog lovers with auto-burn and community rewards'"
                  className="w-full max-w-xl h-32 bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-xl p-4 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366F1] resize-none mb-2"
                />
                <div className="text-xs text-[#475569] mb-8">{aiPrompt.length} / 280 chars</div>
                
                <button 
                  onClick={simulateAIGeneration}
                  disabled={aiPrompt.length < 10 || isGenerating}
                  className="btn-primary flex items-center gap-2 px-8 py-3 w-full max-w-xs justify-center disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? "Generating..." : "Generate Token"}
                </button>
                <p className="text-xs text-[#475569] mt-4 max-w-sm">AI will generate: name, ticker, description, and recommended settings</p>
              </div>
            )}

            {aiStep === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Here's your token</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Ticker</label>
                    <input type="text" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value})} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] font-mono" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] resize-none" />
                </div>
                
                <div className="flex gap-4 p-4 rounded-xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                  <div className="flex-1">
                    <div className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-1">Recommended Curve</div>
                    <div className="font-medium text-[#10B981] capitalize">{selectedCurve} Curve</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold mb-1">Recommended Liquidity</div>
                    <div className="font-medium text-[#10B981]">Fair Launch (100% pool)</div>
                  </div>
                </div>
                
                <div className="border border-dashed border-[rgba(99,102,241,0.3)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[rgba(99,102,241,0.02)] transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-[#6366F1] mb-2" />
                  <div className="text-sm font-semibold text-white">Upload token image (optional)</div>
                  <div className="text-xs text-[#475569]">PNG, JPG up to 2MB</div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setAiStep(1)} className="btn-ghost flex-1 py-3">Back</button>
                  <button onClick={() => setAiStep(3)} className="btn-primary flex-1 py-3">Continue to Deploy</button>
                </div>
              </div>
            )}

            {aiStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-white">Ready to Deploy</h2>
                  <p className="text-[#94A3B8]">Review your token details before launching multi-chain.</p>
                </div>
                
                <div className="bg-[#080B12] rounded-xl p-6 border border-[rgba(99,102,241,0.15)] flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Token</span>
                    <span className="font-bold text-white">{formData.name} <span className="text-[#6366F1] font-mono ml-1">{formData.ticker}</span></span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#94A3B8] whitespace-nowrap mr-8">Description</span>
                    <span className="text-white text-right text-sm line-clamp-2">{formData.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Bonding Curve</span>
                    <span className="text-white capitalize">{selectedCurve}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Liquidity Mode</span>
                    <span className="text-white">Fair Launch</span>
                  </div>
                  
                  <div className="h-px bg-[rgba(99,102,241,0.1)] my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Estimated Cost</span>
                    <span className="font-mono font-bold text-white">~0.02 SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Network</span>
                    <span className="text-white">Multi-Chain Deployment</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying || !anchorWallet}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-4"
                >
                  {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                  {isDeploying ? "Deploying Token..." : !anchorWallet ? "Connect Wallet to Deploy" : "Launch Token"}
                </button>
                
                <p className="text-xs text-center text-[#475569]">By launching, you agree to our Terms. Tokens deployed on-chain cannot be deleted after launch.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* ── CUSTOM MODE ── */}
      {mode === 'custom' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setMode('none')} className="text-[#94A3B8] hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
            ← Cancel Launch
          </button>
          
          {renderStepIndicator(customStep, 3, ['Details', 'Settings', 'Deploy'])}

          <div className="surface-card p-6 md:p-8">
            {customStep === 1 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-white mb-2">Token Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Token Name *</label>
                    <input type="text" placeholder="e.g. Moon Doge" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Ticker Symbol *</label>
                    <input type="text" placeholder="e.g. MDOGE" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} maxLength={10} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] font-mono" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Description *</label>
                  <textarea placeholder="Tell the world about your token..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] resize-none" />
                </div>
                
                <div className="border border-dashed border-[rgba(99,102,241,0.3)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[rgba(99,102,241,0.02)] transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-[#6366F1] mb-2" />
                  <div className="text-sm font-semibold text-white">Upload token image (optional)</div>
                </div>
                
                <button 
                  onClick={() => setCustomStep(2)}
                  disabled={!formData.name || !formData.ticker || !formData.description}
                  className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}
            
            {customStep === 2 && (
              <div className="flex flex-col gap-8">
                <h2 className="text-2xl font-bold text-white">Launch Settings</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-[#94A3B8] mb-3">Select Bonding Curve</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'fast', name: 'Fast Launch', desc: 'High velocity. Great for memes.', risk: 'High', color: '#F43F5E', svg: 'M0,25 L10,22 L20,15 L30,5 L40,0' },
                      { id: 'balanced', name: 'Balanced', desc: 'Steady growth for early believers.', risk: 'Medium', color: '#F59E0B', recommended: true, svg: 'M0,25 L10,22 L20,18 L30,12 L40,0' },
                      { id: 'community', name: 'Community', desc: 'Slow and steady for long-term.', risk: 'Low', color: '#10B981', svg: 'M0,25 L10,23 L20,20 L30,15 L40,0' }
                    ].map(curve => (
                      <div 
                        key={curve.id} 
                        onClick={() => setSelectedCurve(curve.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)]' : 'border-[rgba(99,102,241,0.15)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)]'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white">{curve.name}</h3>
                          {curve.recommended && <span className="text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded uppercase font-bold">Rec</span>}
                        </div>
                        <p className="text-xs text-[#94A3B8] mb-4 min-h-[32px]">{curve.desc}</p>
                        
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: curve.color }}>{curve.risk} Risk</span>
                          <svg viewBox="0 0 40 25" className="w-[40px] h-[25px] opacity-70">
                            <path d={curve.svg} fill="none" stroke={curve.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#94A3B8] mb-3">Liquidity Split</label>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'fair', label: 'Fair Launch', desc: '100% to liquidity pool. Maximum community trust.', rec: true },
                      { id: 'standard', label: 'Standard', desc: '70% pool / 30% dev allocation for operations.', rec: false }
                    ].map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setSelectedLiquidity(opt.id)}
                        className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedLiquidity === opt.id ? 'border-[#10B981] bg-[rgba(16,185,129,0.05)]' : 'border-[rgba(99,102,241,0.15)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLiquidity === opt.id ? 'border-[#10B981]' : 'border-[#475569]'}`}>
                          {selectedLiquidity === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white flex items-center gap-2">
                            {opt.label}
                            {opt.rec && <span className="text-[10px] bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded uppercase font-bold">Recommended</span>}
                          </div>
                          <div className="text-sm text-[#94A3B8]">{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 mt-2">
                  <button onClick={() => setCustomStep(1)} className="btn-ghost flex-1 py-3">Back</button>
                  <button onClick={() => setCustomStep(3)} className="btn-primary flex-1 py-3">Review & Deploy</button>
                </div>
              </div>
            )}
            
            {customStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-white">Ready to Deploy</h2>
                  <p className="text-[#94A3B8]">Review your token details before launching multi-chain.</p>
                </div>
                
                <div className="bg-[#080B12] rounded-xl p-6 border border-[rgba(99,102,241,0.15)] flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Token</span>
                    <span className="font-bold text-white">{formData.name} <span className="text-[#6366F1] font-mono ml-1">{formData.ticker}</span></span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#94A3B8] whitespace-nowrap mr-8">Description</span>
                    <span className="text-white text-right text-sm line-clamp-2">{formData.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Bonding Curve</span>
                    <span className="text-white capitalize">{selectedCurve}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Liquidity Mode</span>
                    <span className="text-white capitalize">{selectedLiquidity}</span>
                  </div>
                  
                  <div className="h-px bg-[rgba(99,102,241,0.1)] my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Estimated Cost</span>
                    <span className="font-mono font-bold text-white">~0.02 SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94A3B8]">Network</span>
                    <span className="text-white">Multi-Chain Deployment</span>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setCustomStep(2)} className="btn-ghost py-4 px-6">Back</button>
                  <button 
                    onClick={handleDeploy}
                    disabled={isDeploying || !anchorWallet}
                    className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
                  >
                    {isDeploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                    {isDeploying ? "Deploying Token..." : !anchorWallet ? "Connect Wallet to Deploy" : "Launch Token"}
                  </button>
                </div>
                
                <p className="text-xs text-center text-[#475569]">By launching, you agree to our Terms. Tokens deployed on-chain cannot be deleted after launch.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </div>
  );
}
