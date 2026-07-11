"use client";
import { useState, useEffect } from "react";

const CACHE = new Map<string, { price: number; change24h: number; ts: number }>();
const TTL = 30_000; // 30 second cache

export function useLiveTokenPrice(mintAddress: string | undefined) {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mintAddress) return;

    const cached = CACHE.get(mintAddress);
    if (cached && Date.now() - cached.ts < TTL) {
      setPrice(cached.price);
      setChange24h(cached.change24h);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const pairs = (data.pairs ?? []).filter((p: { chainId: string }) => p.chainId === "solana");
        if (pairs.length === 0) return;
        const best = pairs.sort((a: { liquidity?: { usd?: number } }, b: { liquidity?: { usd?: number } }) =>
          (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
        const p = parseFloat(best.priceUsd ?? "0");
        const c = best.priceChange?.h24 ?? 0;
        CACHE.set(mintAddress, { price: p, change24h: c, ts: Date.now() });
        setPrice(p);
        setChange24h(c);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [mintAddress]);

  return { price, change24h, loading };
}
