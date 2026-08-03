'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface TickerItem {
  symbol: string;
  change: number;
}

const MOCK_TICKERS: TickerItem[] = [
  { symbol: '$SWRM', change: 211.4 },
  { symbol: '$NVFX', change: 67.8 },
  { symbol: '$DAPE', change: 388.2 },
  { symbol: '$SEGL', change: 34.2 },
  { symbol: '$GFLX', change: 52.6 },
  { symbol: '$RWAK', change: 18.9 },
  { symbol: '$PCAT', change: -5.4 },
  { symbol: '$LDOGE', change: 142.5 },
  { symbol: '$CPEP', change: 78.3 },
  { symbol: '$ZNMK', change: -2.1 },
];

export default function TickerBar() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  /* Double items for seamless infinite scroll */
  const items = [...MOCK_TICKERS, ...MOCK_TICKERS];

  return (
    <div
      className="relative w-full overflow-hidden whitespace-nowrap"
      style={{
        background: isDark ? 'rgba(12, 10, 20, 0.95)' : 'rgba(248, 250, 252, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: isDark ? '1px solid rgba(248, 211, 103, 0.06)' : '1px solid rgba(99,102,241,0.08)',
        borderBottom: isDark ? '1px solid rgba(248, 211, 103, 0.06)' : '1px solid rgba(99,102,241,0.08)',
        maskImage:
          'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
      }}
    >
      <div
        className="flex items-center gap-0 py-2 px-4 animate-ct-ticker"
        style={{ animationDuration: '40s' }}
      >
        {items.map((item, i) => {
          const up = item.change > 0;
          return (
            <span
              key={`${item.symbol}-${i}`}
              className="flex items-center shrink-0"
            >
              {/* Dot separator (skip before first item) */}
              {i > 0 && (
                <span
                  className="mx-4 select-none"
                  style={{ color: isDark ? '#44403C' : '#CBD5E1', fontSize: '14px' }}
                  aria-hidden="true"
                >
                  ·
                </span>
              )}

              {/* Symbol */}
              <span
                style={{
                  color: isDark ? '#A8A29E' : '#64748B',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  marginRight: '6px',
                }}
              >
                {item.symbol}
              </span>

              {/* Price change */}
              <span
                style={{
                  color: up ? '#22C55E' : '#EF4444',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                {up ? '+' : ''}
                {item.change.toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
