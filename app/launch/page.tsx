"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Sparkles, Settings, Loader2, Rocket, Shield, Zap, TrendingUp, Terminal, ArrowLeft, Flame } from "lucide-react";
import { useTheme } from '@/components/ThemeProvider';
import { useMoonWallet } from "@/components/WalletProvider";
import { useTokenDeploy, TokenDeployFormData } from "@/hooks/useTokenDeploy";
import { useToast } from "@/components/ToastProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

type LaunchMode = 'none' | 'ai' | 'custom';
type Step = 1 | 2 | 3;

/* ── Step Indicator ── */
function StepIndicator({ labels, currentStep, isDark }: { labels: string[]; currentStep: number; isDark: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4 font-mono">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 text-[10px] font-black uppercase border transition-all ${
                isActive
                  ? isDark 
                    ? 'bg-[#10B981] text-black border-[#10B981] shadow-[2px_2px_0px_0px_#FFF]' 
                    : 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#10B981]'
                  : isDone
                  ? isDark ? 'bg-black text-[#10B981] border-[#10B981]' : 'bg-gray-200 text-black border-black'
                  : isDark ? 'bg-black text-gray-600 border-gray-800' : 'bg-white text-gray-400 border-gray-300'
              }`}
            >
              [ 0{stepNum}: {label} ]
            </div>
            {i < labels.length - 1 && (
              <span className={`text-[10px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>➔</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LaunchPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { anchorWallet } = useMoonWallet();
  const { showToast } = useToast();
  const { deployToken, isDeploying } = useTokenDeploy(showToast);

  const [mode, setMode] = useState<LaunchMode>('none');
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State
  const [formData, setFormData] = useState<TokenDeployFormData>({
    name: "",
    ticker: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
  });

  const [selectedCurve, setSelectedCurve] = useState<"fast" | "balanced" | "stable" | "aggressive">("balanced");
  const [devAllocation, setDevAllocation] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingStep, setGeneratingStep] = useState<number>(0);

  const isTickerValid = useMemo(() => {
    return formData.ticker.length >= 2 && formData.ticker.length <= 10 && /^[A-Z0-9]+$/.test(formData.ticker);
  }, [formData.ticker]);

  const handleDeploy = async () => {
    try {
      await deployToken(formData, imageFile);
    } catch (e) {
      console.error("Deploy failed", e);
    }
  };

  const simulateAIGeneration = async () => {
    if (!aiPrompt) return;
    setGeneratingStep(1);
    await new Promise((r) => setTimeout(r, 1000));
    setGeneratingStep(2);
    await new Promise((r) => setTimeout(r, 1200));
    setGeneratingStep(3);
    await new Promise((r) => setTimeout(r, 800));

    try {
      const prefixes = ["NEO", "CYBER", "QUANTUM", "SOL", "FLUX", "LUNA", "HYPER", "ASTRO"];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const words = aiPrompt.split(' ');
      const userWord = words.find(w => w.length > 3) || "Token";
      
      const mockName = `${randomPrefix} ${userWord.charAt(0).toUpperCase() + userWord.slice(1)}`;
      const mockTicker = `${randomPrefix.substring(0,2)}${userWord.substring(0,2)}`.toUpperCase();
      
      setFormData({
        ...formData,
        name: mockName,
        ticker: mockTicker,
        description: `Forged in the digital ether. Inspired by: ${aiPrompt}. This token harnesses the power of the MoonFluxx protocol to deliver community growth.`,
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
    icon: React.ReactNode;
    recommended?: boolean;
  };

  const CURVES: CurveOption[] = [
    { id: 'fast', name: 'Fast Launch', desc: 'High velocity momentum.', risk: 'High', color: '#F43F5E', icon: <Flame className="w-4 h-4" /> },
    { id: 'balanced', name: 'Balanced', desc: 'Steady growth curve.', risk: 'Medium', color: '#F59E0B', recommended: true, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'stable', name: 'Stable', desc: 'Low volatility growth.', risk: 'Low', color: '#10B981', icon: <Shield className="w-4 h-4" /> },
    { id: 'aggressive', name: 'Aggressive', desc: 'Max Degen mode.', risk: 'Very High', color: '#8B5CF6', icon: <Zap className="w-4 h-4" /> }
  ];

  // Brutalist style helpers
  const bBorder = isDark ? "border-2 border-[rgba(255,255,255,0.2)]" : "border-3 border-black";
  const bShadow = isDark ? "shadow-[4px_4px_0px_0px_#10B981]" : "shadow-[4px_4px_0px_0px_#000]";
  const bBg = isDark ? "bg-[#050510]" : "bg-white";
  const bText = isDark ? "text-white" : "text-black";
  const bMuted = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-4 font-mono flex flex-col justify-center min-h-[calc(100vh-80px)]">
      
      {/* ── INIT MODE SELECTION ── */}
      {mode === 'none' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col justify-center h-full gap-4 sm:gap-6">
          
          {/* Prominent Header Banner */}
          <div className={`p-6 sm:p-10 text-center relative overflow-hidden shrink-0 ${bBorder} ${bShadow} ${bBg}`}>
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 mb-3 text-xs font-black uppercase border ${isDark ? "bg-[#10B981] text-black border-[#10B981]" : "bg-black text-white border-black"}`}>
              <Terminal className="w-4 h-4" /> TOKEN LAUNCHPAD FORGE
            </div>
            
            <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-3 ${bText}`}>
              LAUNCH YOUR <span className="text-[#6366F1]">TOKEN</span>
            </h1>
            <p className={`text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest max-w-xl mx-auto ${bMuted}`}>
              {">"} TWO WAYS TO FORGE YOUR TOKEN ON-CHAIN IN MINUTES.
            </p>
          </div>
          
          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
            
            {/* AI Launch Card */}
            <div 
              onClick={() => { setMode('ai'); setCurrentStep(1); }}
              className={`p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all ${bBorder} ${bShadow} ${bBg} hover:-translate-y-0.5 group`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 border-2 flex items-center justify-center ${isDark ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" : "border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${isDark ? "bg-[#10B981] text-black border-[#10B981]" : "bg-[#10B981] text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}>
                    RECOMMENDED
                  </span>
                </div>
                
                <h2 className={`text-lg sm:text-xl font-black uppercase mb-1.5 ${bText}`}>[ AI LAUNCH FORGE ]</h2>
                <p className={`text-[11px] font-bold leading-normal mb-3 ${bMuted}`}>
                  Describe your idea in plain text. AI generates token narrative, ticker, and optimal curve settings automatically.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className={`text-[9px] font-black uppercase ${isDark ? "text-[#10B981]" : "text-black"}`}>ESTIMATED TIME: ~2 MINS</span>
                <div className={`w-full py-2.5 text-center text-xs font-black uppercase border-2 transition-all ${isDark ? "bg-[#6366F1] text-white border-white group-hover:bg-[#10B981] group-hover:text-black" : "bg-[#6366F1] text-white border-black shadow-[3px_3px_0px_0px_#000] group-hover:bg-black group-hover:text-white"}`}>
                  [ START WITH AI ]
                </div>
              </div>
            </div>
            
            {/* Custom Launch Card */}
            <div 
              onClick={() => { setMode('custom'); setCurrentStep(1); }}
              className={`p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all ${bBorder} ${bShadow} ${bBg} hover:-translate-y-0.5 group`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 border-2 flex items-center justify-center ${isDark ? "border-white bg-white/10 text-white" : "border-black bg-gray-100 text-black shadow-[2px_2px_0px_0px_#000]"}`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${isDark ? "bg-black text-gray-300 border-gray-600" : "bg-gray-200 text-black border-black"}`}>
                    MANUAL CONTROL
                  </span>
                </div>
                
                <h2 className={`text-lg sm:text-xl font-black uppercase mb-1.5 ${bText}`}>[ CUSTOM LAUNCH ]</h2>
                <p className={`text-[11px] font-bold leading-normal mb-3 ${bMuted}`}>
                  Full manual control. Define your token name, symbol, description, bonding curve parameters, and initial liquidity.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className={`text-[9px] font-black uppercase ${bMuted}`}>ESTIMATED TIME: ~5 MINS</span>
                <div className={`w-full py-2.5 text-center text-xs font-black uppercase border-2 transition-all ${isDark ? "bg-black text-white border-white hover:border-[#10B981]" : "bg-white text-black border-black shadow-[3px_3px_0px_0px_#000] group-hover:bg-black group-hover:text-white"}`}>
                  [ START CUSTOM ]
                </div>
              </div>
            </div>

          </div>

          {/* Trust Indicators */}
          <div className={`flex flex-wrap items-center justify-center gap-4 p-2.5 border ${isDark ? "border-[rgba(255,255,255,0.1)] bg-black/40 text-gray-400" : "border-black bg-gray-50 text-black"} text-[10px] font-black uppercase shrink-0`}>
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#10B981]" /> AUDITED CONTRACTS</div>
            <span>//</span>
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> INSTANT DEPLOYMENT</div>
            <span>//</span>
            <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[#6366F1]" /> MULTI-CHAIN</div>
          </div>
        </motion.div>
      )}

      {/* ── SHARED FORM FOR AI & CUSTOM MODE ── */}
      {mode !== 'none' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col justify-center h-full">
          
          {/* Back Button */}
          <button 
            onClick={resetLaunch} 
            className={`self-start flex items-center gap-1.5 mb-3 px-2.5 py-1 text-[10px] font-black uppercase border transition-all ${isDark ? "bg-black text-gray-300 border-gray-700 hover:text-white hover:border-white" : "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"}`}
          >
            <ArrowLeft size={12} /> [ CANCEL & RETURN ]
          </button>
          
          <StepIndicator
            labels={mode === 'ai' ? ['DESCRIBE', 'REVIEW', 'DEPLOY'] : ['DETAILS', 'SETTINGS', 'DEPLOY']}
            currentStep={currentStep}
            isDark={isDark}
          />

          {/* Main Form Box */}
          <div className={`p-4 sm:p-6 ${bBorder} ${bShadow} ${bBg}`}>
            
            <AnimatePresence mode="wait">
              
              {/* AI STEP 1: Describe */}
              {mode === 'ai' && currentStep === 1 && (
                <motion.div key="ai-step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 border-2 flex items-center justify-center mb-3 ${isDark ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" : "border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]"}`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className={`text-lg sm:text-xl font-black uppercase mb-1 ${bText}`}>[ WHAT IS YOUR TOKEN ABOUT? ]</h2>
                  <p className={`text-[10px] sm:text-xs font-bold uppercase mb-4 max-w-md ${bMuted}`}>
                    DESCRIBE YOUR TOKEN IDEA AND AI WILL FORGE NAME, TICKER & PARAMETERS.
                  </p>
                  
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={generatingStep > 0}
                    placeholder="E.g. 'A meme coin for cat lovers on Solana with community rewards and 100% fair launch...'"
                    className={`w-full max-w-lg h-24 border-2 p-3 text-xs font-bold uppercase outline-none resize-none mb-1 ${
                      isDark 
                        ? 'bg-black text-white border-[rgba(255,255,255,0.2)] focus:border-[#10B981]' 
                        : 'bg-gray-50 text-black border-black focus:bg-white shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  />
                  <div className={`text-[9px] font-mono mb-4 ${bMuted}`}>{aiPrompt.length} / 280 CHARS</div>
                  
                  <button 
                    onClick={simulateAIGeneration}
                    disabled={aiPrompt.length < 5 || generatingStep > 0}
                    className={`w-full max-w-xs py-3 text-xs font-black uppercase border-2 transition-all flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'bg-[#10B981] text-black border-[#10B981] hover:bg-[#059669] disabled:opacity-40' 
                        : 'bg-[#6366F1] text-white border-black shadow-[3px_3px_0px_0px_#000] hover:bg-black hover:text-white disabled:opacity-40'
                    }`}
                  >
                    {generatingStep > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generatingStep === 0 && "[ GENERATE TOKEN IDENTITY ]"}
                    {generatingStep === 1 && "ANALYZING PROMPT..."}
                    {generatingStep === 2 && "FORGING TOKENOMICS..."}
                    {generatingStep === 3 && "FINALIZING DETAILS..."}
                  </button>
                </motion.div>
              )}

              {/* DETAILS / REVIEW STEP */}
              {((mode === 'custom' && currentStep === 1) || (mode === 'ai' && currentStep === 2)) && (
                <motion.div key="details-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <div className="border-b pb-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }}>
                    <h2 className={`text-lg sm:text-xl font-black uppercase ${bText}`}>
                      {mode === 'ai' ? "[ REVIEW AI CREATION ]" : "[ TOKEN DETAILS ]"}
                    </h2>
                    <p className={`text-[10px] font-bold uppercase mt-0.5 ${bMuted}`}>
                      {mode === 'ai' ? 'EDIT ANY GENERATED DETAILS BEFORE CONTINUING.' : 'ENTER YOUR TOKEN IDENTITY.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label className={`block text-[10px] font-black uppercase mb-1 ${bText}`}>TOKEN NAME *</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className={`w-full border-2 p-2.5 text-xs font-bold uppercase outline-none ${
                          isDark ? 'bg-black text-white border-[rgba(255,255,255,0.2)] focus:border-[#10B981]' : 'bg-gray-50 text-black border-black focus:bg-white'
                        }`} 
                        placeholder="E.G. MOON FLUX"
                      />
                    </div>
                    {/* Ticker */}
                    <div>
                      <label className={`block text-[10px] font-black uppercase mb-1 ${bText}`}>TICKER SYMBOL *</label>
                      <div className="relative">
                        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black ${bMuted}`}>$</span>
                        <input 
                          type="text" 
                          value={formData.ticker} 
                          onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})} 
                          maxLength={10} 
                          className={`w-full border-2 p-2.5 pl-6 text-xs font-bold uppercase outline-none ${
                            isDark ? 'bg-black text-white border-[rgba(255,255,255,0.2)] focus:border-[#10B981]' : 'bg-gray-50 text-black border-black focus:bg-white'
                          }`} 
                          placeholder="FLUX"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className={`block text-[10px] font-black uppercase mb-1 ${bText}`}>DESCRIPTION *</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className={`w-full h-16 border-2 p-2.5 text-xs font-bold uppercase outline-none resize-none ${
                        isDark ? 'bg-black text-white border-[rgba(255,255,255,0.2)] focus:border-[#10B981]' : 'bg-gray-50 text-black border-black focus:bg-white'
                      }`} 
                    />
                  </div>

                  {/* Curve Options */}
                  {mode === 'ai' && (
                    <div>
                      <label className={`block text-[10px] font-black uppercase mb-2 ${bText}`}>BONDING CURVE CONFIG</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                        {CURVES.slice(0, 2).map(curve => (
                          <div 
                            key={curve.id} 
                            onClick={() => setSelectedCurve(curve.id)}
                            className={`p-3 border-2 cursor-pointer transition-all ${
                              selectedCurve === curve.id 
                                ? isDark ? 'border-[#10B981] bg-[#10B981]/10 text-white' : 'border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]' 
                                : isDark ? 'border-gray-800 bg-black text-gray-400' : 'border-gray-300 bg-white text-black'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {curve.icon}
                              <h3 className="font-black text-xs uppercase">{curve.name}</h3>
                            </div>
                            <p className="text-[9px] font-bold uppercase opacity-80">{curve.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    {mode === 'ai' ? (
                      <>
                        <button onClick={() => setCurrentStep(1)} className={`flex-1 py-2.5 text-xs font-black uppercase border-2 ${isDark ? "bg-black text-white border-gray-700" : "bg-white text-black border-black"}`}>[ BACK ]</button>
                        <button onClick={() => setCurrentStep(3)} disabled={!isTickerValid || !formData.name} className={`flex-1 py-2.5 text-xs font-black uppercase border-2 ${isDark ? "bg-[#10B981] text-black border-[#10B981] disabled:opacity-40" : "bg-[#6366F1] text-white border-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-40"}`}>[ CONTINUE TO DEPLOY ]</button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.name || !formData.ticker || !formData.description || !isTickerValid}
                        className={`w-full py-2.5 text-xs font-black uppercase border-2 ${isDark ? "bg-[#10B981] text-black border-[#10B981] disabled:opacity-40" : "bg-[#6366F1] text-white border-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-40"}`}
                      >
                        [ CONTINUE TO SETTINGS ]
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CUSTOM STEP 2: Settings */}
              {mode === 'custom' && currentStep === 2 && (
                <motion.div key="settings-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <div className="border-b pb-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }}>
                    <h2 className={`text-lg sm:text-xl font-black uppercase ${bText}`}>[ LAUNCH SETTINGS ]</h2>
                    <p className={`text-[10px] font-bold uppercase mt-0.5 ${bMuted}`}>CONFIGURE BONDING CURVE & LIQUIDITY SPLIT.</p>
                  </div>
                  
                  {/* Curve Selection */}
                  <div>
                    <label className={`block text-[10px] font-black uppercase mb-2 ${bText}`}>SELECT BONDING CURVE</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {CURVES.map(curve => (
                        <div 
                          key={curve.id} 
                          onClick={() => setSelectedCurve(curve.id)}
                          className={`p-3 border-2 cursor-pointer transition-all ${
                            selectedCurve === curve.id 
                              ? isDark ? 'border-[#10B981] bg-[#10B981]/10 text-white' : 'border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000]' 
                              : isDark ? 'border-gray-800 bg-black text-gray-400' : 'border-gray-300 bg-white text-black'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {curve.icon}
                            <h3 className="font-black text-xs uppercase">{curve.name}</h3>
                          </div>
                          <p className="text-[9px] font-bold uppercase opacity-80">{curve.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <button onClick={() => setCurrentStep(1)} className={`flex-1 py-2.5 text-xs font-black uppercase border-2 ${isDark ? "bg-black text-white border-gray-700" : "bg-white text-black border-black"}`}>[ BACK ]</button>
                    <button onClick={() => setCurrentStep(3)} className={`flex-1 py-2.5 text-xs font-black uppercase border-2 ${isDark ? "bg-[#10B981] text-black border-[#10B981]" : "bg-[#6366F1] text-white border-black shadow-[2px_2px_0px_0px_#000]"}`}>[ REVIEW & DEPLOY ]</button>
                  </div>
                </motion.div>
              )}
              
              {/* STEP 3: Deploy */}
              {currentStep === 3 && (
                <motion.div key="deploy-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <div className="text-center border-b pb-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }}>
                    <div className={`w-10 h-10 border-2 flex items-center justify-center mx-auto mb-2 ${isDark ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" : "border-black bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000]"}`}>
                      <Rocket className="w-5 h-5" />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-black uppercase ${bText}`}>[ READY TO DEPLOY ]</h2>
                    <p className={`text-[10px] font-bold uppercase mt-0.5 ${bMuted}`}>REVIEW YOUR TOKEN RECEIPT BEFORE LAUNCHING ON-CHAIN.</p>
                  </div>
                  
                  {/* Receipt Box */}
                  <div className={`p-4 border-2 flex flex-col gap-2 ${isDark ? "border-white bg-black" : "border-black bg-gray-50 shadow-[3px_3px_0px_0px_#000]"}`}>
                    <div className="flex justify-between text-[11px] font-black uppercase">
                      <span>TOKEN NAME:</span>
                      <span className="text-[#6366F1]">{formData.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase">
                      <span>TICKER SYMBOL:</span>
                      <span className="text-[#6366F1]">${formData.ticker}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase">
                      <span>BONDING CURVE:</span>
                      <span className="text-[#10B981]">{selectedCurve}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase">
                      <span>NETWORK:</span>
                      <span>SOLANA MULTI-CHAIN</span>
                    </div>
                    
                    <div className="border-t my-1" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'black' }} />

                    <div className="flex justify-between text-xs font-black uppercase">
                      <span>ESTIMATED COST:</span>
                      <span className="text-[#F59E0B]">~0.002 SOL</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setCurrentStep(2)} className={`py-3 px-5 text-xs font-black uppercase border-2 ${isDark ? "bg-black text-white border-gray-700" : "bg-white text-black border-black"}`}>[ BACK ]</button>
                    <button 
                      onClick={handleDeploy}
                      disabled={isDeploying || !anchorWallet}
                      className={`flex-1 py-3 text-xs font-black uppercase border-2 flex items-center justify-center gap-2 ${
                        isDark 
                          ? "bg-[#10B981] text-black border-[#10B981] hover:bg-[#059669] disabled:opacity-40" 
                          : "bg-[#6366F1] text-white border-black shadow-[3px_3px_0px_0px_#000] hover:bg-black hover:text-white disabled:opacity-40"
                      }`}
                    >
                      {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                      {isDeploying ? "[ DEPLOYING ON-CHAIN... ]" : !anchorWallet ? "[ CONNECT WALLET TO DEPLOY ]" : "[ FORGE TOKEN ON-CHAIN ]"}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}

    </div>
  );
}
