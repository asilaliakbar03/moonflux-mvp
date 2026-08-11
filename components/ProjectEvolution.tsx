'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { getEvolutionStage, STAGES } from '@/lib/evolution';

interface ProjectEvolutionProps {
  holders: number;
  poolSol: number;
  graduated: boolean;
  hasRevenue?: boolean;
  hasGovernance?: boolean;
}

export function ProjectEvolution({
  holders,
  poolSol,
  graduated,
  hasRevenue = false,
  hasGovernance = false,
}: ProjectEvolutionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black';
  const bgColor = isDark ? 'bg-[#050510]' : 'bg-white';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  const currentStageInfo = getEvolutionStage({
    holders,
    poolSol,
    graduated,
    hasRevenue,
    hasGovernance,
  });

  return (
    <div className={`p-6 border-2 ${borderColor} ${bgColor} shadow-[4px_4px_0px_0px_#000] font-mono uppercase tracking-wider w-full`}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="text-3xl">{currentStageInfo.emoji}</span>
            <span>
              STAGE {currentStageInfo.stage}: <span className="text-[#F59E0B]">{currentStageInfo.name}</span>
            </span>
          </h3>
          <p className={`text-sm ${textMuted} mt-2 normal-case`}>{currentStageInfo.description}</p>
        </div>
        
        <div className="text-left md:text-right w-full md:w-auto">
          <div className="text-xs font-bold text-[#6366F1] mb-1">NEXT MILESTONE</div>
          <div className="text-sm font-bold">{currentStageInfo.nextMilestone}</div>
          <div className={`w-full md:w-64 h-4 mt-3 border-2 ${borderColor} bg-gray-200 dark:bg-gray-800 rounded-none overflow-hidden relative`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentStageInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-[#10B981]"
            />
          </div>
        </div>
      </div>

      <div className="relative mt-12 mb-4 px-4 sm:px-8">
        {/* Connection Line */}
        <div className={`absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-gray-200 dark:bg-gray-800 z-0`} />
        
        <div className="flex justify-between relative z-10">
          {STAGES.map((s) => {
            const isCompleted = s.stage < currentStageInfo.stage;
            const isCurrent = s.stage === currentStageInfo.stage;

            let nodeColor = isDark ? 'bg-gray-900' : 'bg-gray-100';
            let textColor = textMuted;
            let glow = '';

            if (isCompleted) {
              nodeColor = 'bg-[#10B981]';
              textColor = 'text-[#10B981]';
            } else if (isCurrent) {
              nodeColor = 'bg-[#F59E0B]';
              textColor = 'text-[#F59E0B]';
              glow = 'shadow-[0_0_15px_rgba(245,158,11,0.6)]';
            }

            return (
              <div key={s.stage} className="flex flex-col items-center gap-3">
                <motion.div
                  initial={isCurrent ? { scale: 0.9 } : { scale: 1 }}
                  animate={isCurrent ? { scale: [0.9, 1.15, 0.9] } : { scale: 1 }}
                  transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                  className={`w-12 h-12 rounded-full border-2 ${borderColor} flex items-center justify-center text-2xl ${nodeColor} ${glow} relative`}
                >
                  {isCompleted && !isCurrent ? (
                    <span className="text-white text-lg">✓</span>
                  ) : (
                    <span>{s.emoji}</span>
                  )}
                </motion.div>
                <div className={`text-xs font-bold ${textColor} hidden sm:block text-center max-w-[80px]`}>
                  {s.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
