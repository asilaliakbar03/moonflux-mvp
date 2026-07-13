"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Sparkles, Settings, Check, Loader2, Upload, Rocket, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { useMoonWallet } from "@/components/WalletProvider";
import { useTokenDeploy, TokenDeployFormData } from "@/hooks/useTokenDeploy";
import BondingCurveChart from "@/components/BondingCurveChart";

const EASE = [0.16, 1, 0.3, 1] as const;

type LaunchMode = 'none' | 'ai' | 'custom';
type Step = 1 | 2 | 3;

export default function LaunchPage() {
  const { anchorWallet } = useMoonWallet();
  const { deployToken, isDeploying } = useTokenDeploy();

  const [mode, setMode] = useState<LaunchMode>('none');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingStep, setGeneratingStep] = useState(0);

  const [formData, setFormData] = useState<TokenDeployFormData>({
    name: "",
    ticker: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Curve Settings
  const [selectedCurve, setSelectedCurve] = useState<"fast" | "balanced" | "stable" | "aggressive">("balanced");
  
  // Liquidity Settings
  const [selectedLiquidity, setSelectedLiquidity] = useState("fair");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [devAllocation, setDevAllocation] = useState(10); // Default 10% in advanced mode

  // Validation
  const isTickerValid = useMemo(() => {
    return formData.ticker.length >= 2 && formData.ticker.length <= 10 && /^[A-Z0-9]+$/.test(formData.ticker);
  }, [formData.ticker]);

  const handleDeploy = () => {
    deployToken(formData, imageFile);
  };

  const simulateAIGeneration = async () => {
    setGeneratingStep(1); // "Analyzing prompt..."
    
    // Simulate sequencing
    setTimeout(() => setGeneratingStep(2), 1500); // "Forging tokenomics..."
    setTimeout(() => setGeneratingStep(3), 3000); // "Finalizing contract..."
    
    try {
      const res = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...formData,
          name: data.name || "",
          ticker: data.ticker || "",
          description: data.description || "",
        });
        if (data.suggestedCurve) setSelectedCurve(data.suggestedCurve);
        if (data.suggestedLiquidity) setSelectedLiquidity(data.suggestedLiquidity);
      } else {
        throw new Error("API error");
      }
    } catch(e) {
      await new Promise(r => setTimeout(r, 4500)); // wait for animations if fallback
      const prefixes = ["Neon", "Cyber", "Quantum", "Aero", "Luna", "Astro", "Nova", "Plasma"];
      const suffixes = ["Doge", "Inu", "Flux", "Sync", "Pulse", "Node", "Byte", "Chain"];
      
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      
      const words = aiPrompt.split(' ');
      const userWord = words.find(w => w.length > 3) || "Meme";
      
      const mockName = `${randomPrefix} ${userWord.charAt(0).toUpperCase() + userWord.slice(1)}`;
      const mockTicker = `${randomPrefix.substring(0,2)}${userWord.substring(0,2)}`.toUpperCase();
      
      setFormData({
        ...formData,
        name: mockName,
        ticker: mockTicker,
        description: `Forged in the digital ether. Inspired by: ${aiPrompt}. This token harnesses the power of the MoonFluxx protocol to deliver blazing fast community growth.`,
      });
      setSelectedCurve(Math.random() > 0.5 ? "fast" : "balanced");
    } finally {
      setGeneratingStep(0);
      setCurrentStep(2);
    }
  };

  const renderStepIndicator = (labels: string[]) => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isActive ? 'bg-[#6366F1] text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : isDone ? 'bg-[#10B981] text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[rgba(255,255,255,0.1)] text-[#94A3B8]'}`}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : isDone ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'}`}>{label}</span>
            </div>
            {stepNum < labels.length && (
              <div className={`w-8 h-px transition-colors duration-500 ${isDone ? 'bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-[rgba(255,255,255,0.1)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const resetLaunch = () => {
    setMode('none');
    setCurrentStep(1);
    setFormData({ name: "", ticker: "", description: "", website: "", twitter: "", telegram: "" });
    setAiPrompt("");
  };

  type CurveOption = {
    id: "fast" | "balanced" | "stable" | "aggressive";
    name: string;
    desc: string;
    risk: string;
    color: string;
    svg: string;
    recommended?: boolean;
  };

  const CURVES: CurveOption[] = [
    { id: 'fast', name: 'Fast Launch', desc: 'High velocity. Great for memes.', risk: 'High', color: '#F43F5E', svg: 'M0,25 L10,22 L20,15 L30,5 L40,0' },
    { id: 'balanced', name: 'Balanced', desc: 'Steady growth for early believers.', risk: 'Medium', color: '#F59E0B', recommended: true, svg: 'M0,25 L10,22 L20,18 L30,12 L40,0' },
    { id: 'stable', name: 'Stable', desc: 'Slow and steady for long-term.', risk: 'Low', color: '#10B981', svg: 'M0,25 L10,23 L20,20 L30,15 L40,0' },
    { id: 'aggressive', name: 'Aggressive', desc: 'Max degenerate mode.', risk: 'Very High', color: '#8B5CF6', svg: 'M0,25 L10,20 L20,10 L30,2 L40,0' }
  ];

  const devSolCost = ((devAllocation / 100) * 85).toFixed(2); // Mock: max 85 SOL for pool

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
            <div className="surface-card p-6 flex flex-col items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-[rgba(99,102,241,0.15)] text-[#818CF8] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Launch</h2>
              <p className="text-[#94A3B8] text-sm flex-1">Describe your idea. Our AI creates the perfect token narrative, name, and settings for you.</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-success">Recommended for beginners</span>
                <span className="text-xs text-[#94A3B8]">~2 mins</span>
              </div>
              
              <button onClick={() => { setMode('ai'); setCurrentStep(1); }} className="w-full btn-primary text-base py-3 shadow-[0_0_20px_rgba(99,102,241,0.3)]">Start with AI</button>
            </div>
            
            <div className="surface-card p-6 flex flex-col items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] text-[#94A3B8] flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Custom Launch</h2>
              <p className="text-[#94A3B8] text-sm flex-1">Full control. Set your own name, ticker, curve, and liquidity options.</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-muted">For experienced creators</span>
                <span className="text-xs text-[#94A3B8]">~5 mins</span>
              </div>
              
              <button onClick={() => { setMode('custom'); setCurrentStep(1); }} className="w-full btn-ghost text-base py-3">Start Custom</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SHARED LAYOUT FOR AI/CUSTOM ── */}
      {mode !== 'none' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={resetLaunch} className="text-[#94A3B8] hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
            ← Cancel Launch
          </button>
          
          {renderStepIndicator(mode === 'ai' ? ['Describe', 'Review', 'Deploy'] : ['Details', 'Settings', 'Deploy'])}

          <div className="surface-card p-6 md:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#6366F1] opacity-[0.03] blur-[100px] pointer-events-none rounded-full" />

            <AnimatePresence mode="wait">
              {/* AI STEP 1: Describe */}
              {mode === 'ai' && currentStep === 1 && (
                <motion.div key="ai-step-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-6">What's your token about?</h2>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={generatingStep > 0}
                    placeholder="Describe your token in a few words. E.g. 'A meme token for dog lovers with auto-burn and community rewards'"
                    className="w-full max-w-xl h-32 bg-[#080B12] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.4)] rounded-xl p-4 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-none mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="text-xs text-[#475569] mb-8">{aiPrompt.length} / 280 chars</div>
                  
                  <button 
                    onClick={simulateAIGeneration}
                    disabled={aiPrompt.length < 10 || generatingStep > 0}
                    className="btn-primary flex items-center gap-2 px-8 py-3 w-full max-w-xs justify-center disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all overflow-hidden relative"
                  >
                    {generatingStep > 0 && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                    {generatingStep > 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {generatingStep === 0 && "Generate Token"}
                    {generatingStep === 1 && "Analyzing prompt..."}
                    {generatingStep === 2 && "Forging tokenomics..."}
                    {generatingStep === 3 && "Finalizing contract..."}
                  </button>
                  <p className="text-xs text-[#475569] mt-4 max-w-sm">AI will generate: name, ticker, description, and recommended curve settings</p>
                </motion.div>
              )}

              {/* CUSTOM STEP 1: Details OR AI STEP 2: Review */}
              {((mode === 'custom' && currentStep === 1) || (mode === 'ai' && currentStep === 2)) && (
                <motion.div key="details-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">{mode === 'ai' ? "Review AI's Creation" : "Token Details"}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5 flex justify-between items-center">
                        <span>Name {mode==='custom' && '*'}</span>
                        {formData.name.length > 0 ? (
                          <span className="text-[#10B981] flex items-center gap-1 text-xs drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                        ) : (
                          <span className="text-[#F43F5E] flex items-center gap-1 text-xs"><ShieldAlert className="w-3.5 h-3.5" /> Required</span>
                        )}
                      </label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full bg-[#080B12] border rounded-lg p-3 text-white focus:outline-none transition-colors ${formData.name.length > 0 ? 'border-[rgba(16,185,129,0.5)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]' : 'border-[rgba(99,102,241,0.2)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}`} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5 flex justify-between items-center">
                        <span>Ticker {mode==='custom' && '*'}</span>
                        {formData.ticker.length > 0 && (
                          isTickerValid 
                            ? <span className="text-[#10B981] flex items-center gap-1 text-xs drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                            : <span className="text-[#F43F5E] flex items-center gap-1 text-xs"><ShieldAlert className="w-3.5 h-3.5" /> 2-10 chars</span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] font-mono">$</span>
                        <input type="text" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} maxLength={10} className={`w-full bg-[#080B12] border rounded-lg p-3 pl-8 text-white focus:outline-none font-mono transition-colors ${formData.ticker.length > 0 ? (isTickerValid ? 'border-[rgba(16,185,129,0.5)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]' : 'border-[rgba(244,63,94,0.5)] focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E]') : 'border-[rgba(99,102,241,0.2)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Description {mode==='custom' && '*'}</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`w-full h-24 bg-[#080B12] border rounded-lg p-3 text-white focus:outline-none resize-none transition-colors ${formData.description.length > 0 ? 'border-[rgba(16,185,129,0.5)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]' : 'border-[rgba(99,102,241,0.2)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}`} />
                  </div>

                  {/* AI Mode: Show Curve Selection directly in this step */}
                  {mode === 'ai' && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-3 flex items-center gap-2">
                        Launch Settings
                        <span className="text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-[rgba(99,102,241,0.3)]">AI Recommendations</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CURVES.slice(0, 2).map(curve => (
                          <div 
                            key={curve.id} 
                            onClick={() => setSelectedCurve(curve.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)] shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-[rgba(255,255,255,0.05)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                          >
                            <h3 className="font-bold text-white mb-1">{curve.name} Curve</h3>
                            <p className="text-xs text-[#94A3B8] mb-2">{curve.desc}</p>
                            <div className="flex-1 min-h-[100px]">
                              {selectedCurve === curve.id ? (
                                <BondingCurveChart curveType={curve.id} color={curve.color} />
                              ) : (
                                <div className="w-full h-full flex items-end justify-end pb-2 opacity-50">
                                  <svg viewBox="0 0 40 25" className="w-[60px] h-[35px] drop-shadow-md">
                                    <path d={curve.svg} fill="none" stroke={curve.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border border-dashed border-[rgba(99,102,241,0.3)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[rgba(99,102,241,0.05)] hover:border-[#6366F1] transition-all cursor-pointer group mt-2">
                    <Upload className="w-6 h-6 text-[#6366F1] mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold text-white">Upload token image (optional)</div>
                    <div className="text-xs text-[#475569]">PNG, JPG up to 2MB</div>
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    {mode === 'ai' ? (
                      <>
                        <button onClick={() => setCurrentStep(1)} className="btn-ghost flex-1 py-3 hover:bg-[rgba(255,255,255,0.05)]">Back</button>
                        <button onClick={() => setCurrentStep(3)} disabled={!isTickerValid} className="btn-primary flex-1 py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50">Continue to Deploy</button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.name || !formData.ticker || !formData.description || !isTickerValid}
                        className="btn-primary w-full py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:shadow-none"
                      >
                        Continue to Settings
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CUSTOM STEP 2: Settings (Not used in AI mode) */}
              {mode === 'custom' && currentStep === 2 && (
                <motion.div key="settings-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 relative z-10">
                  <h2 className="text-2xl font-bold text-white">Launch Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-4">Select Bonding Curve</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {CURVES.map(curve => (
                        <div 
                          key={curve.id} 
                          onClick={() => setSelectedCurve(curve.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)] shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[1.02] col-span-1 lg:col-span-2 row-span-2' : 'border-[rgba(255,255,255,0.05)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white">{curve.name}</h3>
                            {curve.recommended && selectedCurve !== curve.id && <span className="text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded uppercase font-bold border border-[rgba(99,102,241,0.3)]">Rec</span>}
                          </div>
                          <p className={`text-[#94A3B8] ${selectedCurve === curve.id ? 'text-sm mb-4' : 'text-xs mb-2'}`}>{curve.desc}</p>
                          
                          <div className="flex-1 w-full min-h-[60px] flex items-end">
                            {selectedCurve === curve.id ? (
                              <div className="w-full h-[150px]">
                                <BondingCurveChart curveType={curve.id} color={curve.color} />
                              </div>
                            ) : (
                              <div className="w-full flex justify-between items-end group">
                                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: curve.color }}>{curve.risk}</span>
                                <svg viewBox="0 0 40 25" className="w-[40px] h-[25px] opacity-60 group-hover:opacity-100 transition-opacity">
                                  <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: "linear" }}
                                    d={curve.svg} 
                                    fill="none" 
                                    stroke={curve.color} 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-[#94A3B8]">Liquidity Split</label>
                      <button 
                        onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${isAdvancedMode ? 'bg-[rgba(139,92,246,0.1)] border-[#8B5CF6] text-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white'}`}
                      >
                        {isAdvancedMode ? 'Advanced Mode: ON' : 'Advanced Mode'}
                      </button>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {isAdvancedMode ? (
                        <motion.div key="advanced" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 rounded-xl border border-[#8B5CF6] bg-[rgba(139,92,246,0.05)] shadow-[0_0_20px_rgba(139,92,246,0.1)] overflow-hidden">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <div className="font-bold text-white text-lg">{devAllocation}% Dev Allocation</div>
                              <div className="text-sm text-[#94A3B8]">Tokens reserved for the creator</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#10B981] text-lg">{100 - devAllocation}% Pool</div>
                              <div className="text-sm text-[#94A3B8]">Added to initial liquidity</div>
                            </div>
                          </div>
                          
                          <div className="relative pt-4 pb-2">
                            <input 
                              type="range" 
                              min="0" 
                              max="50" 
                              step="1"
                              value={devAllocation} 
                              onChange={(e) => setDevAllocation(Number(e.target.value))}
                              className="w-full h-2 bg-[#080B12] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] border border-[rgba(255,255,255,0.1)] shadow-inner"
                            />
                            <div className="absolute top-[28px] pointer-events-none" style={{ left: `calc(${devAllocation * 2}% - 14px)` }}>
                               <motion.div layout className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                                 {devSolCost} SOL
                               </motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-[#64748B] mt-6 font-mono">
                              <span>0% (0 SOL)</span>
                              <span>25% (~21 SOL)</span>
                              <span>50% (~42 SOL)</span>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="simple" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3">
                          {[
                            { id: 'fair', label: 'Fair Launch', desc: '100% to liquidity pool. Maximum community trust.', rec: true },
                            { id: 'standard', label: 'Standard', desc: '70% pool / 30% dev allocation for operations.', rec: false }
                          ].map(opt => (
                            <div 
                              key={opt.id}
                              onClick={() => {
                                setSelectedLiquidity(opt.id);
                                setDevAllocation(opt.id === 'fair' ? 0 : 30);
                              }}
                              className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${selectedLiquidity === opt.id ? 'border-[#10B981] bg-[rgba(16,185,129,0.05)] shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[rgba(255,255,255,0.05)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLiquidity === opt.id ? 'border-[#10B981]' : 'border-[#475569]'}`}>
                                {selectedLiquidity === opt.id && <motion.div layoutId="liq-dot" className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                  {opt.label}
                                  {opt.rec && <span className="text-[10px] bg-[rgba(16,185,129,0.15)] text-[#10B981] px-2 py-0.5 rounded uppercase font-bold border border-[rgba(16,185,129,0.3)]">Recommended</span>}
                                </div>
                                <div className="text-sm text-[#94A3B8]">{opt.desc}</div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setCurrentStep(1)} className="btn-ghost flex-1 py-3 hover:bg-[rgba(255,255,255,0.05)]">Back</button>
                    <button onClick={() => setCurrentStep(3)} className="btn-primary flex-1 py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">Review & Deploy</button>
                  </div>
                </motion.div>
              )}
              
              {/* SHARED STEP 3: Deploy */}
              {currentStep === 3 && (
                <motion.div key="deploy-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 relative z-10">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-white">Ready to Deploy</h2>
                    <p className="text-[#94A3B8]">Review your token details before launching multi-chain.</p>
                  </div>
                  
                  <div className="bg-[#080B12] rounded-xl p-6 border border-[rgba(99,102,241,0.15)] flex flex-col gap-4 shadow-[0_0_30px_rgba(99,102,241,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(99,102,241,0.1)] blur-3xl rounded-full pointer-events-none" />
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[#94A3B8]">Token</span>
                      <span className="font-bold text-white text-lg">{formData.name} <span className="text-[#6366F1] font-mono ml-1">${formData.ticker}</span></span>
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[#94A3B8] whitespace-nowrap mr-8">Description</span>
                      <span className="text-white text-right text-sm line-clamp-3">{formData.description}</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[#94A3B8]">Bonding Curve</span>
                      <span className="text-[#10B981] capitalize font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{selectedCurve} Curve</span>
                    </div>
                    
                    <div className="h-px bg-[rgba(255,255,255,0.05)] my-2 relative z-10" />
                    
                    {/* Transaction Breakdown Receipt */}
                    <div className="bg-[#0D1117] rounded-lg p-4 border border-[rgba(255,255,255,0.05)] relative z-10 space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-[#94A3B8]">Dev Allocation ({devAllocation}%)</span>
                         <span className="font-mono text-white">{devSolCost} SOL</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-[#94A3B8]">Network Fee</span>
                         <span className="font-mono text-white">0.002 SOL</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-[#94A3B8]">Platform Fee</span>
                         <span className="font-mono text-[#10B981]">Free</span>
                       </div>
                       <div className="h-px bg-[rgba(255,255,255,0.1)] w-full" />
                       <div className="flex justify-between items-center font-bold">
                         <span className="text-white">Total Cost</span>
                         <span className="font-mono text-[#F59E0B] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                           ~{(Number(devSolCost) + 0.002).toFixed(3)} SOL
                         </span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center relative z-10 mt-2">
                      <span className="text-[#94A3B8]">Network</span>
                      <span className="text-white font-semibold">Multi-Chain Deployment</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setCurrentStep(mode === 'ai' ? 2 : 2)} className="btn-ghost py-4 px-6 hover:bg-[rgba(255,255,255,0.05)]">Back</button>
                    <button 
                      onClick={handleDeploy}
                      disabled={isDeploying || !anchorWallet}
                      className={`btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3 transition-all duration-300 ${isDeploying ? 'animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]'}`}
                    >
                      {isDeploying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                      {isDeploying ? "Deploying Token..." : !anchorWallet ? "Connect Wallet to Deploy" : "Launch Token"}
                    </button>
                  </div>
                  
                  <p className="text-xs text-center text-[#475569]">By launching, you agree to our Terms. Tokens deployed on-chain cannot be deleted after launch.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

    </div>
  );
}
