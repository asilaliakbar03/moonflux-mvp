'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const targetNum = typeof value === 'number' && !isNaN(value) ? value : parseFloat(value as any) || 0;
  const [displayValue, setDisplayValue] = useState(targetNum);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (targetNum - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [targetNum, duration]);

  const numVal = isNaN(displayValue) ? 0 : displayValue;
  const formatted = decimals > 0
    ? numVal.toFixed(decimals)
    : Math.round(numVal).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
