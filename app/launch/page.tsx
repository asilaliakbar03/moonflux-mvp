"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useCallback } from "react";
import { Sparkles, Settings, Check, Loader2, Upload, Rocket, ChevronDown, CheckCircle2, ShieldAlert, Zap, Shield, TrendingUp, Flame } from "lucide-react";
import { useMoonWallet } from "@/components/WalletProvider";
import { useTokenDeploy, TokenDeployFormData } from "@/hooks/useTokenDeploy";
import BondingCurveChart from "@/components/BondingCurveChart";
import MagneticButton from '@/components/MagneticButton';

const EASE = [0.16, 1, 0.3, 1] as const;

type LaunchMode = 'none' | 'ai' | 'custom';
type Step = 1 | 2 | 3;

/* ── 3D Tilt Card Component ── */
function TiltCard({ children, className, onClick, intensity = 8 }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((y - cy) / cy) * -intensity,
      y: ((x - cx) / cx) * intensity,
    });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(99,102,241,${glare.opacity}), transparent 60%)`,
          transition: 'opacity 0.4s',
        }}
      />
      {children}
    </div>
  );
}

/* ── Animated Step Indicator ── */
function StepIndicator({ labels, currentStep }: { labels: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  boxShadow: isActive
                    ? '0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.2)'
                    : isDone
                    ? '0 0 15px rgba(16,185,129,0.5)'
                    : '0 0 0px transparent',
                }}
                transition={{ duration: 0.4 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white'
                    : isDone
                    ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white'
                    : 'bg-[rgba(99,102,241,0.08)] text-[#475569] border border-[rgba(99,102,241,0.15)]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNum}
              </motion.div>
              <span className={`text-sm font-semibold hidden sm:inline transition-all duration-300 ${
                isActive ? 'text-white' : isDone ? 'text-[#94A3B8]' : 'text-[#475569]'
              }`}>
                {label}
              </span>
            </div>
            {stepNum < labels.length && (
              <div className="relative w-8 sm:w-12 h-px">
                <div className="absolute inset-0 bg-[rgba(99,102,241,0.1)]" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#10B981] to-[#6366F1]"
                  initial={{ width: '0%' }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ boxShadow: isDone ? '0 0 8px rgba(16,185,129,0.5)' : 'none' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const [devAllocation, setDevAllocation] = useState(10);

  // Validation
  const isTickerValid = useMemo(() => {
    return formData.ticker.length >= 2 && formData.ticker.length <= 10 && /^[A-Z0-9]+$/.test(formData.ticker);
  }, [formData.ticker]);

  const handleDeploy = () => {
    deployToken(formData, imageFile);
  };

  const simulateAIGeneration = async () => {
    setGeneratingStep(1);
    
    setTimeout(() => setGeneratingStep(2), 1500);
    setTimeout(() => setGeneratingStep(3), 3000);
    
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
      await new Promise(r => setTimeout(r, 4500));
      const prefixes = ["Neon", "Cyber", "Quantum", "Aero", "Luna", "Astro", "Nova", "Plasma"];
      const suffixes = ["Doge", "Inu", "Flux", "Sync", "Pulse", "Node", "Byte", "Chain"];
      
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
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
    icon: React.ReactNode;
    recommended?: boolean;
  };

  const CURVES: CurveOption[] = [
    { id: 'fast', name: 'Fast Launch', desc: 'High velocity. Great for memes.', risk: 'High', color: '#F43F5E', svg: 'M0,25 L10,22 L20,15 L30,5 L40,0', icon: <Flame className="w-4 h-4" /> },
    { id: 'balanced', name: 'Balanced', desc: 'Steady growth for early believers.', risk: 'Medium', color: '#F59E0B', recommended: true, svg: 'M0,25 L10,22 L20,18 L30,12 L40,0', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'stable', name: 'Stable', desc: 'Slow and steady for long-term.', risk: 'Low', color: '#10B981', svg: 'M0,25 L10,23 L20,20 L30,15 L40,0', icon: <Shield className="w-4 h-4" /> },
    { id: 'aggressive', name: 'Aggressive', desc: 'Max degenerate mode.', risk: 'Very High', color: '#8B5CF6', svg: 'M0,25 L10,20 L20,10 L30,2 L40,0', icon: <Zap className="w-4 h-4" /> }
  ];

  const devSolCost = ((devAllocation / 100) * 85).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto w-full pt-4 pb-16 overflow-x-hidden">
      
      {/* ── INIT MODE SELECTION ── */}
      {mode === 'none' && (
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, ease: EASE }}>
          
          {/* Hero header with galaxy glow */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-[0.08] bg-[#6366F1] fluxx-nebula" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none opacity-[0.05] bg-[#A78BFA] fluxx-drift-2" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-full px-4 py-1.5 mb-6"
            >
              <Rocket className="w-3.5 h-3.5 text-[#818CF8]" />
              <span className="text-xs font-bold text-[#A5B4FC] uppercase tracking-widest">Token Launchpad</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-white mb-4 display-safe relative z-10">
              Launch Your{' '}
              <span className="fluxx-text-flow">
                Token
              </span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-md mx-auto relative z-10">
              Two ways to bring your token to life across chains.
            </p>
          </div>
          
          {/* Mode Selection — 3D Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AI Launch Card */}
            <MagneticButton as="div" strength={0.2} className="h-full">
              <TiltCard
                onClick={() => { setMode('ai'); setCurrentStep(1); }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-full"
                intensity={6}
              >
                <div className="bg-[rgba(5,5,16,0.85)] backdrop-blur-2xl border border-[rgba(99,102,241,0.12)] rounded-2xl p-8 flex flex-col items-start gap-5 relative z-0 h-full transition-all duration-500 group-hover:border-[rgba(99,102,241,0.35)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] fluxx-hover-shimmer">
                  {/* Accent glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366F1] opacity-[0.06] blur-[60px] pointer-events-none rounded-full group-hover:opacity-[0.12] transition-opacity duration-500" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(167,139,250,0.1)] text-[#818CF8] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-[rgba(99,102,241,0.2)] fluxx-float-slow">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white display-safe mb-2">AI Launch</h2>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">
                      Describe your idea. Our AI creates the perfect token narrative, name, and settings for you.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-[rgba(16,185,129,0.1)] text-[#10B981] px-3 py-1 rounded-full border border-[rgba(16,185,129,0.2)]">
                      Recommended
                    </span>
                    <span className="text-xs text-[#475569] font-mono">~2 min</span>
                  </div>
                  
                  <div className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.35)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-shadow duration-500">
                    Start with AI
                  </div>
                </div>
              </TiltCard>
            </MagneticButton>
            
            {/* Custom Launch Card */}
            <MagneticButton as="div" strength={0.2} className="h-full">
              <TiltCard
                onClick={() => { setMode('custom'); setCurrentStep(1); }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-full"
                intensity={6}
              >
                <div className="bg-[rgba(5,5,16,0.85)] backdrop-blur-2xl border border-[rgba(99,102,241,0.08)] rounded-2xl p-8 flex flex-col items-start gap-5 relative z-0 h-full transition-all duration-500 group-hover:border-[rgba(99,102,241,0.25)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] fluxx-hover-shimmer">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.04)] text-[#94A3B8] flex items-center justify-center border border-[rgba(255,255,255,0.06)] group-hover:text-[#818CF8] group-hover:border-[rgba(99,102,241,0.2)] transition-all duration-500">
                    <Settings className="w-7 h-7" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white display-safe mb-2">Custom Launch</h2>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">
                      Full control. Set your own name, ticker, curve, and liquidity options.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-[rgba(255,255,255,0.04)] text-[#475569] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.06)]">
                      For experienced creators
                    </span>
                    <span className="text-xs text-[#475569] font-mono">~5 min</span>
                  </div>
                  
                  <div className="w-full h-12 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center text-[#94A3B8] font-bold text-sm group-hover:text-white group-hover:border-[rgba(99,102,241,0.3)] group-hover:bg-[rgba(99,102,241,0.08)] transition-all duration-500">
                    Start Custom
                  </div>
                </div>
              </TiltCard>
            </MagneticButton>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10 text-[#475569] text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Audited Contracts</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[rgba(99,102,241,0.3)]" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Deployment</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[rgba(99,102,241,0.3)]" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Multi-Chain</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SHARED LAYOUT FOR AI/CUSTOM ── */}
      {mode !== 'none' && (
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-50px' }}>
          <button onClick={resetLaunch} className="text-[#475569] hover:text-white text-sm flex items-center gap-1.5 mb-8 transition-colors group focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Cancel Launch
          </button>
          
          <StepIndicator
            labels={mode === 'ai' ? ['Describe', 'Review', 'Deploy'] : ['Details', 'Settings', 'Deploy']}
            currentStep={currentStep}
          />

          {/* Main form panel — 3D glassmorphic */}
          <TiltCard className="relative rounded-2xl overflow-hidden" intensity={3}>
            <div className="bg-[rgba(5,5,16,0.85)] backdrop-blur-2xl border border-[rgba(99,102,241,0.10)] rounded-2xl p-6 md:p-10 relative overflow-hidden">
              {/* Nebula background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6366F1] opacity-[0.025] blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#A78BFA] opacity-[0.02] blur-[80px] pointer-events-none rounded-full" />

              <AnimatePresence mode="wait">
                {/* AI STEP 1: Describe */}
                {mode === 'ai' && currentStep === 1 && (
                  <motion.div key="ai-step-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(99,102,241,0.15)] to-[rgba(167,139,250,0.08)] text-[#818CF8] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.15)]">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 display-safe">What's your token about?</h2>
                    <p className="text-[#475569] text-sm mb-8 max-w-md">Describe your idea and our AI will forge the perfect token identity, narrative, and launch parameters.</p>
                    
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={generatingStep > 0}
                      placeholder="E.g. 'A meme token for dog lovers with auto-burn and community rewards'"
                      className="w-full max-w-xl h-36 bg-[rgba(0,0,0,0.5)] border border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.3)] rounded-2xl p-5 text-white placeholder:text-[#334155] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all resize-none mb-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed"
                    />
                    <div className="text-xs text-[#334155] font-mono mb-8">{aiPrompt.length} / 280</div>
                    
                    <button 
                      onClick={simulateAIGeneration}
                      disabled={aiPrompt.length < 10 || generatingStep > 0}
                      className="flex items-center gap-3 px-10 py-4 w-full max-w-xs justify-center rounded-xl font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none relative overflow-hidden"
                    >
                      {generatingStep > 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />}
                      {generatingStep > 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {generatingStep === 0 && "Generate Token"}
                      {generatingStep === 1 && "Analyzing prompt..."}
                      {generatingStep === 2 && "Forging tokenomics..."}
                      {generatingStep === 3 && "Finalizing contract..."}
                    </button>
                    <p className="text-xs text-[#334155] mt-5 max-w-sm">AI generates name, ticker, description, and recommended curve settings</p>
                  </motion.div>
                )}

                {/* CUSTOM STEP 1: Details OR AI STEP 2: Review */}
                {((mode === 'custom' && currentStep === 1) || (mode === 'ai' && currentStep === 2)) && (
                  <motion.div key="details-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 relative z-10">
                    <div className="mb-2">
                      <h2 className="text-2xl font-bold text-white display-safe">{mode === 'ai' ? "Review AI's Creation" : "Token Details"}</h2>
                      <p className="text-[#475569] text-sm mt-1">{mode === 'ai' ? 'Edit anything before continuing.' : 'Fill in your token identity.'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name field */}
                      <div>
                        <label className="block text-sm font-semibold text-[#94A3B8] mb-2 flex justify-between items-center">
                          <span>Name {mode==='custom' && <span className="text-[#F43F5E]">*</span>}</span>
                          {formData.name.length > 0 ? (
                            <span className="text-[#10B981] flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                          ) : (
                            <span className="text-[#F43F5E] flex items-center gap-1 text-xs"><ShieldAlert className="w-3.5 h-3.5" /> Required</span>
                          )}
                        </label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full bg-[rgba(0,0,0,0.4)] rounded-xl p-3.5 text-white focus:outline-none transition-all text-sm border ${formData.name.length > 0 ? 'border-[rgba(16,185,129,0.3)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[rgba(99,102,241,0.12)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]'}`} />
                      </div>
                      {/* Ticker field */}
                      <div>
                        <label className="block text-sm font-semibold text-[#94A3B8] mb-2 flex justify-between items-center">
                          <span>Ticker {mode==='custom' && <span className="text-[#F43F5E]">*</span>}</span>
                          {formData.ticker.length > 0 && (
                            isTickerValid 
                              ? <span className="text-[#10B981] flex items-center gap-1 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                              : <span className="text-[#F43F5E] flex items-center gap-1 text-xs"><ShieldAlert className="w-3.5 h-3.5" /> 2-10 chars</span>
                          )}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] font-mono text-sm">$</span>
                          <input type="text" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} maxLength={10} className={`w-full bg-[rgba(0,0,0,0.4)] rounded-xl p-3.5 pl-8 text-white focus:outline-none font-mono text-sm transition-all border ${formData.ticker.length > 0 ? (isTickerValid ? 'border-[rgba(16,185,129,0.3)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]' : 'border-[rgba(244,63,94,0.3)] focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E]') : 'border-[rgba(99,102,241,0.12)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-2">Description {mode==='custom' && <span className="text-[#F43F5E]">*</span>}</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`w-full h-28 bg-[rgba(0,0,0,0.4)] rounded-xl p-3.5 text-white focus:outline-none resize-none text-sm leading-relaxed transition-all border ${formData.description.length > 0 ? 'border-[rgba(16,185,129,0.3)] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]' : 'border-[rgba(99,102,241,0.12)] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]'}`} />
                    </div>

                    {/* AI Mode: Show Curve Selection */}
                    {mode === 'ai' && (
                      <div className="mt-2">
                        <label className="block text-sm font-semibold text-[#94A3B8] mb-4 flex items-center gap-2">
                          Launch Settings
                          <span className="text-[10px] bg-[rgba(99,102,241,0.1)] text-[#818CF8] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest border border-[rgba(99,102,241,0.2)]">AI Rec</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {CURVES.slice(0, 2).map(curve => (
                            <div 
                              key={curve.id} 
                              onClick={() => setSelectedCurve(curve.id)}
                              className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.06)] shadow-[0_0_20px_rgba(99,102,241,0.12)]' : 'border-[rgba(99,102,241,0.08)] bg-[rgba(0,0,0,0.3)] hover:border-[rgba(99,102,241,0.2)]'}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span style={{ color: curve.color }}>{curve.icon}</span>
                                <h3 className="font-bold text-white text-sm">{curve.name} Curve</h3>
                              </div>
                              <p className="text-xs text-[#475569] mb-3">{curve.desc}</p>
                              <div className="flex-1 min-h-[100px]">
                                {selectedCurve === curve.id ? (
                                  <BondingCurveChart curveType={curve.id} color={curve.color} />
                                ) : (
                                  <div className="w-full h-full flex items-end justify-end pb-2 opacity-40">
                                    <svg viewBox="0 0 40 25" className="w-[60px] h-[35px]">
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
                    
                    {/* Image Upload */}
                    <div className="border border-dashed border-[rgba(99,102,241,0.2)] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-[rgba(99,102,241,0.03)] hover:border-[rgba(99,102,241,0.4)] transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(99,102,241,0.08)] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[rgba(99,102,241,0.15)] transition-all">
                        <Upload className="w-5 h-5 text-[#6366F1]" />
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">Upload token image</div>
                      <div className="text-xs text-[#334155]">PNG, JPG up to 2MB (optional)</div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex gap-4 mt-4">
                      {mode === 'ai' ? (
                        <>
                          <button onClick={() => setCurrentStep(1)} className="flex-1 py-3.5 rounded-xl border border-[rgba(99,102,241,0.12)] text-[#94A3B8] font-semibold hover:bg-[rgba(99,102,241,0.05)] hover:text-white transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">Back</button>
                          <button onClick={() => setCurrentStep(3)} disabled={!isTickerValid} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">Continue to Deploy</button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setCurrentStep(2)}
                          disabled={!formData.name || !formData.ticker || !formData.description || !isTickerValid}
                          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none"
                        >
                          Continue to Settings
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* CUSTOM STEP 2: Settings */}
                {mode === 'custom' && currentStep === 2 && (
                  <motion.div key="settings-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold text-white display-safe">Launch Settings</h2>
                      <p className="text-[#475569] text-sm mt-1">Configure your bonding curve and liquidity.</p>
                    </div>
                    
                    {/* Curve Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-[#94A3B8] mb-4">Select Bonding Curve</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CURVES.map(curve => (
                          <div 
                            key={curve.id} 
                            onClick={() => setSelectedCurve(curve.id)}
                            className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col ${selectedCurve === curve.id ? 'border-[#6366F1] bg-[rgba(99,102,241,0.06)] shadow-[0_0_20px_rgba(99,102,241,0.12)] md:col-span-2' : 'border-[rgba(99,102,241,0.08)] bg-[rgba(0,0,0,0.3)] hover:border-[rgba(99,102,241,0.2)]'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span style={{ color: curve.color }}>{curve.icon}</span>
                                <h3 className="font-bold text-white text-sm">{curve.name}</h3>
                              </div>
                              {curve.recommended && selectedCurve !== curve.id && <span className="text-[10px] bg-[rgba(99,102,241,0.1)] text-[#818CF8] px-2 py-0.5 rounded-full uppercase font-bold border border-[rgba(99,102,241,0.2)]">Rec</span>}
                            </div>
                            <p className={`text-[#475569] ${selectedCurve === curve.id ? 'text-sm mb-4' : 'text-xs mb-2'}`}>{curve.desc}</p>
                            
                            <div className="flex-1 w-full min-h-[60px] flex items-end">
                              {selectedCurve === curve.id ? (
                                <div className="w-full h-[150px]">
                                  <BondingCurveChart curveType={curve.id} color={curve.color} />
                                </div>
                              ) : (
                                <div className="w-full flex justify-between items-end group">
                                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono" style={{ color: curve.color }}>{curve.risk}</span>
                                  <svg viewBox="0 0 40 25" className="w-[40px] h-[25px] opacity-40 group-hover:opacity-80 transition-opacity">
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
                    
                    {/* Liquidity Split */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-semibold text-[#94A3B8]">Liquidity Split</label>
                        <button 
                          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                          className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${isAdvancedMode ? 'bg-[rgba(139,92,246,0.1)] border-[#8B5CF6] text-[#A78BFA] shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-transparent border-[rgba(255,255,255,0.08)] text-[#475569] hover:text-white hover:border-[rgba(255,255,255,0.15)]'}`}
                        >
                          {isAdvancedMode ? 'Advanced: ON' : 'Advanced'}
                        </button>
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {isAdvancedMode ? (
                          <motion.div key="advanced" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 rounded-xl border border-[#8B5CF6] bg-[rgba(139,92,246,0.04)] shadow-[0_0_25px_rgba(139,92,246,0.08)] overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                              <div>
                                <div className="font-bold text-white text-lg">{devAllocation}% Dev Allocation</div>
                                <div className="text-sm text-[#475569]">Tokens reserved for creator</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-[#10B981] text-lg">{100 - devAllocation}% Pool</div>
                                <div className="text-sm text-[#475569]">Initial liquidity</div>
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
                                className="w-full h-2 bg-[rgba(0,0,0,0.5)] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] border border-[rgba(139,92,246,0.2)] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none"
                              />
                              <div className="absolute top-[28px] pointer-events-none" style={{ left: `calc(${devAllocation * 2}% - 14px)` }}>
                                 <motion.div layout className="bg-[#8B5CF6] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-[0_0_12px_rgba(139,92,246,0.4)]">
                                   {devSolCost} SOL
                                 </motion.div>
                              </div>
                              <div className="flex justify-between text-xs text-[#334155] mt-6 font-mono">
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
                                className={`p-5 rounded-xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${selectedLiquidity === opt.id ? 'border-[#10B981] bg-[rgba(16,185,129,0.04)] shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'border-[rgba(99,102,241,0.08)] bg-[rgba(0,0,0,0.3)] hover:border-[rgba(99,102,241,0.2)]'}`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedLiquidity === opt.id ? 'border-[#10B981]' : 'border-[#334155]'}`}>
                                  {selectedLiquidity === opt.id && <motion.div layoutId="liq-dot" className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-white flex items-center gap-2 text-sm">
                                    {opt.label}
                                    {opt.rec && <span className="text-[10px] bg-[rgba(16,185,129,0.1)] text-[#10B981] px-2 py-0.5 rounded-full uppercase font-bold border border-[rgba(16,185,129,0.2)]">Recommended</span>}
                                  </div>
                                  <div className="text-sm text-[#475569]">{opt.desc}</div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => setCurrentStep(1)} className="flex-1 py-3.5 rounded-xl border border-[rgba(99,102,241,0.12)] text-[#94A3B8] font-semibold hover:bg-[rgba(99,102,241,0.05)] hover:text-white transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">Back</button>
                      <button onClick={() => setCurrentStep(3)} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">Review & Deploy</button>
                    </div>
                  </motion.div>
                )}
                
                {/* SHARED STEP 3: Deploy */}
                {currentStep === 3 && (
                  <motion.div key="deploy-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6 relative z-10">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgba(16,185,129,0.15)] to-[rgba(16,185,129,0.05)] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <Rocket className="w-8 h-8 text-[#10B981]" />
                      </div>
                      <h2 className="text-2xl font-bold text-white display-safe">Ready to Deploy</h2>
                      <p className="text-[#475569] text-sm mt-1">Review your token details before launching.</p>
                    </div>
                    
                    {/* Token Summary Card */}
                    <div className="bg-[rgba(0,0,0,0.5)] rounded-2xl p-6 border border-[rgba(99,102,241,0.12)] flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[rgba(99,102,241,0.06)] blur-[60px] rounded-full pointer-events-none" />
                      
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[#475569] text-sm">Token</span>
                        <span className="font-bold text-white text-lg">{formData.name} <span className="text-[#818CF8] font-mono ml-1">${formData.ticker}</span></span>
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <span className="text-[#475569] text-sm whitespace-nowrap mr-8">Description</span>
                        <span className="text-[#94A3B8] text-right text-sm line-clamp-3">{formData.description}</span>
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[#475569] text-sm">Bonding Curve</span>
                        <span className="text-[#10B981] capitalize font-bold text-sm">{selectedCurve}</span>
                      </div>
                      
                      <div className="h-px bg-[rgba(99,102,241,0.08)] my-1" />
                      
                      {/* Transaction Receipt */}
                      <div className="bg-[rgba(5,5,16,0.80)] rounded-xl p-5 border border-[rgba(99,102,241,0.08)] space-y-3">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-[#475569]">Dev Allocation ({devAllocation}%)</span>
                           <span className="font-mono text-white">{devSolCost} SOL</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-[#475569]">Network Fee</span>
                           <span className="font-mono text-white">0.002 SOL</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-[#475569]">Platform Fee</span>
                           <span className="font-mono text-[#10B981]">--</span>
                         </div>
                         <div className="h-px bg-[rgba(99,102,241,0.1)] w-full" />
                         <div className="flex justify-between items-center font-bold">
                           <span className="text-white">Total Cost</span>
                           <span className="font-mono text-[#F59E0B] text-lg">
                             ~{(Number(devSolCost) + 0.002).toFixed(3)} SOL
                           </span>
                         </div>
                      </div>

                      <div className="flex justify-between items-center relative z-10 mt-1">
                        <span className="text-[#475569] text-sm">Network</span>
                        <span className="text-white font-semibold text-sm">Multi-Chain Deployment</span>
                      </div>
                    </div>
                    
                    {/* Deploy Actions */}
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => setCurrentStep(mode === 'ai' ? 2 : 2)} className="py-4 px-6 rounded-xl border border-[rgba(99,102,241,0.12)] text-[#94A3B8] font-semibold hover:bg-[rgba(99,102,241,0.05)] hover:text-white transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none">Back</button>
                      <button 
                        onClick={handleDeploy}
                        disabled={isDeploying || !anchorWallet}
                        className={`flex-1 py-4 text-lg rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all duration-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none ${
                          isDeploying 
                            ? 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] animate-pulse shadow-[0_0_40px_rgba(99,102,241,0.5)]' 
                            : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_45px_rgba(99,102,241,0.5)]'
                        }`}
                      >
                        {isDeploying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                        {isDeploying ? "Deploying Token..." : !anchorWallet ? "Connect Wallet to Deploy" : "Launch Token"}
                      </button>
                    </div>
                    
                    <p className="text-xs text-center text-[#334155]">By launching, you agree to our Terms. Tokens deployed on-chain cannot be deleted after launch.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TiltCard>
        </motion.div>
      )}

    </div>
  );
}
