'use client';

import { useEffect, useState } from 'react';

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
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Double the items for seamless loop
  const items = [...MOCK_TICKERS, ...MOCK_TICKERS];

  return (
    <div
      className="w-full border-b overflow-hidden whitespace-nowrap py-2"
      style={{
        background: '#131314',
        borderColor: '#4e4636',
      }}
    >
      <div className="animate-ct-ticker flex items-center gap-8 px-5">
        {items.map((item, i) => {
          const up = item.change > 0;
          return (
            <span
              key={`${item.symbol}-${i}`}
              className="flex items-center gap-2"
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ color: up ? '#4ade80' : '#f87171' }}>
                {item.symbol}
              </span>
              <span style={{ color: up ? '#22c55e' : '#ef4444' }}>
                {up ? '+' : ''}{item.change.toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
