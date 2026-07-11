/**
 * useSOLPrice — Real-time SOL/USD price hook
 *
 * Fetches the live SOL price from Jupiter Aggregator on mount,
 * then refreshes every 15 seconds. Falls back to the last known
 * price on network errors so the UI never goes blank.
 *
 * Usage:
 *   const { price, change24h, isLive } = useSOLPrice();
 */

'use client';

import { useState, useEffect, useRef } from 'react';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const REFRESH_MS = 15_000; // every 15 seconds

export interface SOLPriceState {
  price:     number;  // USD price
  change24h: number;  // 24h % change
  isLive:    boolean; // false = using fallback/last-known
}

const FALLBACK: SOLPriceState = { price: 0, change24h: 0, isLive: false };

export function useSOLPrice(): SOLPriceState {
  const [state, setState] = useState<SOLPriceState>(FALLBACK);
  const lastKnown = useRef<number>(0);

  async function fetchPrice() {
    try {
      // Jupiter v6 price API — free, no key needed
      const res = await fetch(
        `https://api.jup.ag/price/v2?ids=${SOL_MINT}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`Jupiter ${res.status}`);
      const data = await res.json();
      const info = data?.data?.[SOL_MINT];
      if (!info?.price) throw new Error('No price in response');

      const price = Number(info.price);
      lastKnown.current = price;

      setState({
        price,
        change24h: Number(info.extraInfo?.lastSwappedPrice?.lastJupiterSellPrice
          ? ((info.price - info.extraInfo.lastSwappedPrice.lastJupiterSellPrice) /
             info.extraInfo.lastSwappedPrice.lastJupiterSellPrice) * 100
          : 0),
        isLive: true,
      });
    } catch {
      // CoinGecko fallback
      try {
        const cg = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
          { cache: 'no-store' }
        );
        if (cg.ok) {
          const cgData = await cg.json();
          const price = Number(cgData?.solana?.usd ?? 0);
          const change24h = Number(cgData?.solana?.usd_24h_change ?? 0);
          if (price > 0) {
            lastKnown.current = price;
            setState({ price, change24h, isLive: true });
            return;
          }
        }
      } catch {}
      // Keep last known price visible; just mark as not-live
      if (lastKnown.current > 0) {
        setState(prev => ({ ...prev, isLive: false }));
      }
    }
  }

  useEffect(() => {
    fetchPrice(); // immediate first call
    const id = setInterval(fetchPrice, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return state;
}
