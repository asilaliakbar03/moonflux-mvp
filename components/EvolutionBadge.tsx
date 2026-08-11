'use client';

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface EvolutionBadgeProps {
  stage: number;
  name: string;
  emoji: string;
  className?: string;
}

export function EvolutionBadge({ stage, name, emoji, className = '' }: EvolutionBadgeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const borderColor = isDark ? 'border-[rgba(255,255,255,0.15)]' : 'border-black';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-none border-2 ${borderColor} shadow-[2px_2px_0px_0px_#000] font-mono text-[10px] sm:text-xs uppercase bg-white dark:bg-[#050510] ${className}`}
      title={`Stage ${stage}: ${name}`}
    >
      <span>{emoji}</span>
      <span className="font-bold tracking-widest">{name}</span>
    </div>
  );
}
