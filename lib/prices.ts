/**
 * MoonFluxx Live Price Service
 * Fetches real token prices from DexScreener (free, no key) and Jupiter (free).
 * Falls back to mock data if API is unreachable.
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────
export interface LiveTokenPrice {
  price: number;       // USD price
  priceSOL: number;    // Price in SOL
  change24h: number;   // % change 24h
  volume24h: number;   // USD volume
  marketCap: number;   // USD market cap
  liquidity: number;   // USD liquidity
  fdv: number;         // Fully diluted valuation
  source: "dexscreener" | "jupiter" | "mock";
}

export interface SOLPrice {
  usd: number;
  change24h: number;
}

// ── DEXSCREENER — get price for a Solana token by mint address ────────────────
export async function fetchTokenPrice(mintAddress: string): Promise<LiveTokenPrice | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
      { next: { revalidate: 30 } } // cache for 30 seconds in Next.js
    );
    if (!res.ok) throw new Error(`DexScreener ${res.status}`);
    const data = await res.json();

    // DexScreener returns an array of pairs — use the one with highest liquidity
    const pairs: DexScreenerPair[] = data.pairs ?? [];
    if (pairs.length === 0) return null;

    const best = pairs
      .filter(p => p.chainId === "solana")
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

    if (!best) return null;

    return {
      price: parseFloat(best.priceUsd ?? "0"),
      priceSOL: parseFloat(best.priceNative ?? "0"),
      change24h: best.priceChange?.h24 ?? 0,
      volume24h: best.volume?.h24 ?? 0,
      marketCap: best.marketCap ?? best.fdv ?? 0,
      liquidity: best.liquidity?.usd ?? 0,
      fdv: best.fdv ?? 0,
      source: "dexscreener",
    };
  } catch {
    return null;
  }
}

// ── DEXSCREENER — search tokens by name/ticker ────────────────────────────────
export async function searchTokens(query: string): Promise<DexSearchResult[]> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`DexScreener search ${res.status}`);
    const data = await res.json();
    const pairs: DexScreenerPair[] = (data.pairs ?? []).filter(
      (p: DexScreenerPair) => p.chainId === "solana"
    );

    // De-dupe by baseToken address, keep highest liquidity pair per token
    const seen = new Map<string, DexSearchResult>();
    for (const pair of pairs) {
      const addr = pair.baseToken?.address ?? "";
      if (!addr) continue;
      const existing = seen.get(addr);
      const liq = pair.liquidity?.usd ?? 0;
      if (!existing || liq > existing.liquidity) {
        seen.set(addr, {
          name: pair.baseToken?.name ?? "",
          ticker: pair.baseToken?.symbol ?? "",
          mintAddress: addr,
          price: parseFloat(pair.priceUsd ?? "0"),
          change24h: pair.priceChange?.h24 ?? 0,
          volume24h: pair.volume?.h24 ?? 0,
          liquidity: liq,
          pairUrl: pair.url ?? "",
        });
      }
    }
    return Array.from(seen.values()).slice(0, 12);
  } catch {
    return [];
  }
}

// ── JUPITER — get SOL/USD price ───────────────────────────────────────────────
const SOL_MINT = "So11111111111111111111111111111111111111112";

export async function fetchSOLPrice(): Promise<SOLPrice> {
  try {
    const res = await fetch(
      `https://price.jup.ag/v4/price?ids=${SOL_MINT}`,
      { next: { revalidate: 15 } }
    );
    if (!res.ok) throw new Error(`Jupiter ${res.status}`);
    const data = await res.json();
    const info = data.data?.[SOL_MINT];
    if (!info) throw new Error("No SOL data");
    return {
      usd: info.price ?? 231.4,
      change24h: info.priceChange24h ?? 0,
    };
  } catch {
    return { usd: 231.4, change24h: 0 };
  }
}

// ── DEXSCREENER — trending Solana tokens ─────────────────────────────────────
export async function fetchTrendingSolana(): Promise<DexSearchResult[]> {
  try {
    // Search for high-volume meme/new tokens on Solana
    const res = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=solana",
      { next: { revalidate: 120 } }
    );
    if (!res.ok) throw new Error(`DexScreener trending ${res.status}`);
    const data = await res.json();
    const pairs: DexScreenerPair[] = (data.pairs ?? [])
      .filter((p: DexScreenerPair) => p.chainId === "solana")
      .sort((a: DexScreenerPair, b: DexScreenerPair) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));

    const seen = new Map<string, DexSearchResult>();
    for (const pair of pairs) {
      const addr = pair.baseToken?.address ?? "";
      if (!addr || seen.has(addr)) continue;
      seen.set(addr, {
        name: pair.baseToken?.name ?? "",
        ticker: pair.baseToken?.symbol ?? "",
        mintAddress: addr,
        price: parseFloat(pair.priceUsd ?? "0"),
        change24h: pair.priceChange?.h24 ?? 0,
        volume24h: pair.volume?.h24 ?? 0,
        liquidity: pair.liquidity?.usd ?? 0,
        pairUrl: pair.url ?? "",
      });
      if (seen.size >= 20) break;
    }
    return Array.from(seen.values());
  } catch {
    return [];
  }
}

// ── TYPES (DexScreener API response shape) ────────────────────────────────────
interface DexScreenerPair {
  chainId: string;
  priceUsd?: string;
  priceNative?: string;
  priceChange?: { h24?: number; h6?: number; h1?: number; m5?: number };
  volume?: { h24?: number; h6?: number; h1?: number };
  liquidity?: { usd?: number };
  marketCap?: number;
  fdv?: number;
  baseToken?: { name?: string; symbol?: string; address?: string };
  url?: string;
}

export interface DexSearchResult {
  name: string;
  ticker: string;
  mintAddress: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  pairUrl: string;
}
