"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, Settings, Check, Loader2, Upload, Rocket, ChevronDown } from "lucide-react";
import { useMoonWallet } from "@/components/WalletProvider";
import { useTokenDeploy, TokenDeployFormData } from "@/hooks/useTokenDeploy";

const EASE = [0.16, 1, 0.3, 1] as const;

type LaunchMode = 'none' | 'ai' | 'custom';
type Step = 1 | 2 | 3;

export default function LaunchPage() {
  const { anchorWallet } = useMoonWallet();
  const { deployToken, isDeploying } = useTokenDeploy();

  const [mode, setMode] = useState<LaunchMode>('none');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<TokenDeployFormData>({
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

  const handleDeploy = () => {
    deployToken(formData, imageFile);
  };

  const simulateAIGeneration = async () => {
    setIsGenerating(true);
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
      const words = aiPrompt.split(' ');
      const mockName = words.length >= 2 ? `${words[0]} ${words[1]}` : 'Lunar Pup';
      const mockTicker = (words.length >= 2 ? `${words[0].substring(0,2)}${words[1].substring(0,3)}` : 'LPUP').toUpperCase();
      
      setFormData({
        ...formData,
        name: mockName,
        ticker: `$${mockTicker}`,
        description: `A community-driven token inspired by: ${aiPrompt}. Born on MoonFluxx.`,
      });
    } finally {
      setIsGenerating(false);
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

  const CURVES = [
    { id: 'fast', name: 'Fast Launch', desc: 'High velocity. Great for memes.', risk: 'High', color: '#F43F5E', svg: 'M0,25 L10,22 L20,15 L30,5 L40,0' },
    { id: 'balanced', name: 'Balanced', desc: 'Steady growth for early believers.', risk: 'Medium', color: '#F59E0B', recommended: true, svg: 'M0,25 L10,22 L20,18 L30,12 L40,0' },
    { id: 'stable', name: 'Stable', desc: 'Slow and steady for long-term.', risk: 'Low', color: '#10B981', svg: 'M0,25 L10,23 L20,20 L30,15 L40,0' },
    { id: 'aggressive', name: 'Aggressive', desc: 'Max degenerate mode.', risk: 'Very High', color: '#8B5CF6', svg: 'M0,25 L10,20 L20,10 L30,2 L40,0' }
  ];

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
                    placeholder="Describe your token in a few words. E.g. 'A meme token for dog lovers with auto-burn and community rewards'"
                    className="w-full max-w-xl h-32 bg-[#080B12] border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.4)] rounded-xl p-4 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-none mb-2"
                  />
                  <div className="text-xs text-[#475569] mb-8">{aiPrompt.length} / 280 chars</div>
                  
                  <button 
                    onClick={simulateAIGeneration}
                    disabled={aiPrompt.length < 10 || isGenerating}
                    className="btn-primary flex items-center gap-2 px-8 py-3 w-full max-w-xs justify-center disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? "Generating Magic..." : "Generate Token"}
                  </button>
                  <p className="text-xs text-[#475569] mt-4 max-w-sm">AI will generate: name, ticker, description, and recommended curve settings</p>
                </motion.div>
              )}

              {/* CUSTOM STEP 1: Details OR AI STEP 2: Review (They share similar UI, but let's separate for clarity) */}
              {((mode === 'custom' && currentStep === 1) || (mode === 'ai' && currentStep === 2)) && (
                <motion.div key="details-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">{mode === 'ai' ? "Review AI's Creation" : "Token Details"}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Name {mode==='custom' && '*'}</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Ticker {mode==='custom' && '*'}</label>
                      <input type="text" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} maxLength={10} className="w-full bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] font-mono transition-colors" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#94A3B8] mb-1.5">Description {mode==='custom' && '*'}</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 bg-[#080B12] border border-[rgba(99,102,241,0.2)] rounded-lg p-3 text-white focus:outline-none focus:border-[#6366F1] resize-none transition-colors" />
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
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)] shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-[rgba(255,255,255,0.05)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                          >
                            <h3 className="font-bold text-white mb-1">{curve.name} Curve</h3>
                            <p className="text-xs text-[#94A3B8] mb-3">{curve.desc}</p>
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: curve.color }}>{curve.risk} Risk</span>
                              <svg viewBox="0 0 40 25" className="w-[40px] h-[25px] opacity-80 drop-shadow-md">
                                <path d={curve.svg} fill="none" stroke={curve.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
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
                        <button onClick={() => setCurrentStep(3)} className="btn-primary flex-1 py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">Continue to Deploy</button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.name || !formData.ticker || !formData.description}
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
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)] shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[1.02]' : 'border-[rgba(255,255,255,0.05)] bg-[#080B12] hover:border-[rgba(99,102,241,0.3)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white">{curve.name}</h3>
                            {curve.recommended && <span className="text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818CF8] px-2 py-0.5 rounded uppercase font-bold border border-[rgba(99,102,241,0.3)]">Rec</span>}
                          </div>
                          <p className="text-xs text-[#94A3B8] mb-4 min-h-[32px]">{curve.desc}</p>
                          
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: curve.color }}>{curve.risk} Risk</span>
                            <svg viewBox="0 0 40 25" className="w-[40px] h-[25px] opacity-80 drop-shadow-md">
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
                    </div>
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
                      <span className="font-bold text-white text-lg">{formData.name} <span className="text-[#6366F1] font-mono ml-1">{formData.ticker}</span></span>
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <span className="text-[#94A3B8] whitespace-nowrap mr-8">Description</span>
                      <span className="text-white text-right text-sm line-clamp-3">{formData.description}</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[#94A3B8]">Bonding Curve</span>
                      <span className="text-[#10B981] capitalize font-bold">{selectedCurve} Curve</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[#94A3B8]">Liquidity Mode</span>
                      <span className="text-white capitalize">{selectedLiquidity.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="h-px bg-[rgba(255,255,255,0.05)] my-2 relative z-10" />
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[#94A3B8]">Estimated Cost</span>
                      <span className="font-mono font-bold text-[#F59E0B]">~0.02 SOL</span>
                    </div>
                    <div className="flex justify-between items-center relative z-10">
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
