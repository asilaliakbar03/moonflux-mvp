import { NextResponse } from 'next/server';
import { aiGenerate, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 45;

const CACHE_TTL_MS = 60_000; // 60 seconds

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignalSource = 'X' | 'Telegram' | 'Reddit' | 'OnChain' | 'Discord';
export type TrendDirection = 'up' | 'down' | 'flat' | 'spike';

export interface NarrativeSignal {
  id:              string;
  name:            string;
  emoji:           string;
  score:           number;         // 0-100 real-time narrative strength
  delta:           number;         // +/- change vs 1h ago
  trend:           TrendDirection;
  sources:         SignalSource[];  // where the signal is strongest
  topToken:        string;         // the token driving this narrative right now
  topTokenChange:  string;         // e.g. "+142%" or "-18%"
  sentimentBias:   number;         // -100 to +100 (negative = bearish, positive = bullish)
  botPercentage:   number;         // 0-100% estimated bot activity
  insight:         string;         // 1-sentence AI read on this narrative
  alertLevel:      'none' | 'watch' | 'warning' | 'critical'; // if score spikes or crashes fast
}

export interface MarketSentiment {
  regime:            'Bull Run' | 'Bear Market' | 'Sideways' | 'Euphoria' | 'Recovery' | 'Distribution';
  regimeConfidence:  number;       // 0-100
  signal:            'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  signalStrength:    number;       // 0-100
  fearGreedIndex:    number;       // 0-100
  dominantNarrative: string;
  rotationTarget:    string;       // "Funds rotating FROM X TO Y"
}

export interface NarrativeRadarResponse {
  narratives:      NarrativeSignal[];
  marketSentiment: MarketSentiment;
  breakoutAlert: {
    id:      string;
    name:    string;
    reason:  string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  } | null;
  lastUpdated:  string;
  nextRefresh:  string;  // when the next cache refresh will fire
}

// ── Static mock (fast, deterministic) ─────────────────────────────────────────

function buildMock(): NarrativeRadarResponse {
  const now = new Date();
  return {
    narratives: [
      { id: 'dog_meta',    name: 'Dog Meta',    emoji: '🐕', score: 94, delta: +12, trend: 'spike',  sources: ['X', 'Telegram'],         topToken: 'LDOGE', topTokenChange: '+142%', sentimentBias: +78, botPercentage: 11, insight: 'Organic viral moment — top Multi-Chain KOLs posting simultaneously, not coordinated.',          alertLevel: 'watch'    },
      { id: 'meme_season', name: 'Meme Season', emoji: '🔥', score: 88, delta:  +8, trend: 'up',     sources: ['X', 'Reddit'],           topToken: 'DAPE',  topTokenChange: '+388%', sentimentBias: +65, botPercentage: 18, insight: 'Broad meme season indicators at 2024 highs — watch for exhaustion at the next candle.',  alertLevel: 'watch'    },
      { id: 'ai_agents',   name: 'AI Agents',   emoji: '🤖', score: 76, delta:  +5, trend: 'up',     sources: ['X', 'Discord'],          topToken: 'SWRM',  topTokenChange: '+211%', sentimentBias: +52, botPercentage: 22, insight: 'Smart money accumulating quietly — AI narrative building without media hype yet.',          alertLevel: 'none'     },
      { id: 'gaming',      name: 'Gaming',      emoji: '🎮', score: 71, delta:  +3, trend: 'flat',   sources: ['Discord', 'Reddit'],     topToken: 'GAMER', topTokenChange: '+34%',  sentimentBias: +31, botPercentage: 29, insight: 'Gaming meta stable after June catalyst — needs new game launch to re-ignite.',             alertLevel: 'none'     },
      { id: 'depin',       name: 'DePIN',       emoji: '📡', score: 58, delta: +22, trend: 'spike',  sources: ['X', 'Telegram'],         topToken: 'WIFI',  topTokenChange: '+134%', sentimentBias: +44, botPercentage: 15, insight: 'Unusual velocity spike — 3 whale wallets entered DePIN positions in last 2 hours.',         alertLevel: 'critical' },
      { id: 'socialfi',    name: 'SocialFi',    emoji: '💬', score: 44, delta:  -2, trend: 'flat',   sources: ['X'],                     topToken: 'BFREN', topTokenChange: '+15%',  sentimentBias:  +8, botPercentage: 34, insight: 'SocialFi in accumulation — watching for a catalyst similar to friend.tech 2023.',           alertLevel: 'none'     },
      { id: 'rwa',         name: 'RWA',         emoji: '🏦', score: 39, delta:  -8, trend: 'down',   sources: ['Reddit', 'X'],           topToken: 'ONDO',  topTokenChange: '-12%',  sentimentBias: -18, botPercentage: 41, insight: 'RWA losing the meme war — institutional thesis intact but retail is chasing dog coins.',    alertLevel: 'none'     },
      { id: 'l2s',         name: 'L2 Tokens',   emoji: '⚡', score: 29, delta: -11, trend: 'down',   sources: ['Reddit'],                topToken: 'ARB',   topTokenChange: '-24%',  sentimentBias: -32, botPercentage: 38, insight: 'L2 narrative losing market share to Crypto native assets — funds rotating cross-chain.',   alertLevel: 'none'     },
    ],
    marketSentiment: {
      regime:            'Euphoria',
      regimeConfidence:  82,
      signal:            'BUY',
      signalStrength:    74,
      fearGreedIndex:    79,
      dominantNarrative: 'Dog Meta',
      rotationTarget:    'Funds rotating FROM L2 Tokens TO Dog Meta',
    },
    breakoutAlert: {
      id:      'depin',
      name:    'DePIN',
      reason:  'DePIN mention velocity spiked 340% in 2 hours — 3 known smart money wallets entered simultaneously. Pre-breakout pattern.',
      urgency: 'critical',
    },
    lastUpdated: now.toISOString(),
    nextRefresh: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  if (isAIConfigured()) {
    try {
      const result = await aiGenerate<Omit<NarrativeRadarResponse, 'lastUpdated' | 'nextRefresh'>>({
        system: `You are MoonFluxx L·13 Narrative Radar — a real-time Crypto market intelligence engine. You analyze social velocity, on-chain flows, and narrative momentum across all major Crypto meta categories.

Respond with a JSON object containing these fields:
- "narratives" (array of exactly 8 objects): Each signal object contains:
  - "id" (string): narrative slug
  - "name" (string): human-readable name
  - "emoji" (string): a single relevant emoji
  - "score" (integer 0-100): real-time narrative strength
  - "delta" (integer): change in score vs 1 hour ago (can be negative)
  - "trend" (string): one of "up", "down", "flat", "spike" — spike = dramatic unusual movement
  - "sources" (array of 1-3 strings): each one of "X", "Telegram", "Reddit", "OnChain", "Discord"
  - "topToken" (string): ticker of the token currently leading this narrative
  - "topTokenChange" (string): 24h price change of topToken, e.g. "+142%" or "-18%"
  - "sentimentBias" (integer -100 to +100): net sentiment: -100=max bearish, +100=max bullish
  - "botPercentage" (integer 0-100): estimated % of mentions that are bot-generated
  - "insight" (string): 1 sharp, crypto-native insight about this narrative RIGHT NOW
  - "alertLevel" (string): one of "none", "watch", "warning", "critical" — critical for at most 1-2 narratives
- "marketSentiment" (object):
  - "regime" (string): one of "Bull Run", "Bear Market", "Sideways", "Euphoria", "Recovery", "Distribution"
  - "regimeConfidence" (integer 0-100)
  - "signal" (string): one of "STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"
  - "signalStrength" (integer 0-100)
  - "fearGreedIndex" (integer 0-100)
  - "dominantNarrative" (string)
  - "rotationTarget" (string): one sentence: "Funds rotating FROM X TO Y" based on current signals
- "breakoutAlert" (object or null): the ONE most unusual signal, or null if nothing stands out
  - "id" (string)
  - "name" (string)
  - "reason" (string): 2 sentences: what is happening and why it matters right now
  - "urgency" (string): one of "low", "medium", "high", "critical"`,
        prompt: `Generate a live pulse of these 8 narratives. IDs and names:
- dog_meta: Dog Meta (BARK, BONK, LDOGE, SHIB derivatives)
- meme_season: Meme Season (broad meme market)
- ai_agents: AI Agents (autonomous on-chain AI tokens)
- gaming: Gaming (GameFi tokens)
- depin: DePIN (decentralized physical infrastructure)
- socialfi: SocialFi (Friend.tech, social graph)
- rwa: RWA (Real World Assets)
- l2s: L2 Tokens (Ethereum L2s vs Multi-Chain)

For each narrative:
- Make scores realistic and VARIED (not all clustered around 70)
- Some should be declining (negative delta)
- botPercentage should be higher for pump narratives (15-45%)
- insight must be SPECIFIC and ACTIONABLE — not generic
- alertLevel 'critical' for at most 1-2 narratives

For breakoutAlert: choose the ONE most unusual signal. Can be null if nothing stands out.`,
        model: MODELS.FAST,
        temperature: 0.3,
        maxTokens: 600,
        cacheTtlMs: CACHE_TTL_MS,
      });

      const now = new Date();
      const response: NarrativeRadarResponse = {
        ...result.data,
        lastUpdated: now.toISOString(),
        nextRefresh: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          'X-Cache': result.cached ? 'HIT' : 'MISS',
        },
      });
    } catch (err) {
      console.warn('[narrative-radar] AI failed, using mock:', err);
    }
  }

  const mock = buildMock();

  await new Promise(r => setTimeout(r, 200));
  return NextResponse.json(mock, {
    headers: { 'Cache-Control': 'public, s-maxage=60', 'X-Cache': 'MOCK' },
  });
}
