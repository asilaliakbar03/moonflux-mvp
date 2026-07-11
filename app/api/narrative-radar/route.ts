import { NextResponse } from 'next/server';

export const maxDuration = 45;

// Cache the response for 60 seconds to avoid hammering the LLM on every poll
let cache: { data: NarrativeRadarResponse; expiresAt: number } | null = null;
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
      { id: 'dog_meta',    name: 'Dog Meta',    emoji: '🐕', score: 94, delta: +12, trend: 'spike',  sources: ['X', 'Telegram'],         topToken: 'LDOGE', topTokenChange: '+142%', sentimentBias: +78, botPercentage: 11, insight: 'Organic viral moment — top Solana KOLs posting simultaneously, not coordinated.',          alertLevel: 'watch'    },
      { id: 'meme_season', name: 'Meme Season', emoji: '🔥', score: 88, delta:  +8, trend: 'up',     sources: ['X', 'Reddit'],           topToken: 'DAPE',  topTokenChange: '+388%', sentimentBias: +65, botPercentage: 18, insight: 'Broad meme season indicators at 2024 highs — watch for exhaustion at the next candle.',  alertLevel: 'watch'    },
      { id: 'ai_agents',   name: 'AI Agents',   emoji: '🤖', score: 76, delta:  +5, trend: 'up',     sources: ['X', 'Discord'],          topToken: 'SWRM',  topTokenChange: '+211%', sentimentBias: +52, botPercentage: 22, insight: 'Smart money accumulating quietly — AI narrative building without media hype yet.',          alertLevel: 'none'     },
      { id: 'gaming',      name: 'Gaming',      emoji: '🎮', score: 71, delta:  +3, trend: 'flat',   sources: ['Discord', 'Reddit'],     topToken: 'GAMER', topTokenChange: '+34%',  sentimentBias: +31, botPercentage: 29, insight: 'Gaming meta stable after June catalyst — needs new game launch to re-ignite.',             alertLevel: 'none'     },
      { id: 'depin',       name: 'DePIN',       emoji: '📡', score: 58, delta: +22, trend: 'spike',  sources: ['X', 'Telegram'],         topToken: 'WIFI',  topTokenChange: '+134%', sentimentBias: +44, botPercentage: 15, insight: 'Unusual velocity spike — 3 whale wallets entered DePIN positions in last 2 hours.',         alertLevel: 'critical' },
      { id: 'socialfi',    name: 'SocialFi',    emoji: '💬', score: 44, delta:  -2, trend: 'flat',   sources: ['X'],                     topToken: 'BFREN', topTokenChange: '+15%',  sentimentBias:  +8, botPercentage: 34, insight: 'SocialFi in accumulation — watching for a catalyst similar to friend.tech 2023.',           alertLevel: 'none'     },
      { id: 'rwa',         name: 'RWA',         emoji: '🏦', score: 39, delta:  -8, trend: 'down',   sources: ['Reddit', 'X'],           topToken: 'ONDO',  topTokenChange: '-12%',  sentimentBias: -18, botPercentage: 41, insight: 'RWA losing the meme war — institutional thesis intact but retail is chasing dog coins.',    alertLevel: 'none'     },
      { id: 'l2s',         name: 'L2 Tokens',   emoji: '⚡', score: 29, delta: -11, trend: 'down',   sources: ['Reddit'],                topToken: 'ARB',   topTokenChange: '-24%',  sentimentBias: -32, botPercentage: 38, insight: 'L2 narrative losing market share to Solana native assets — funds rotating cross-chain.',   alertLevel: 'none'     },
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
  // Serve from cache if still fresh
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'X-Cache': 'HIT',
      },
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { anthropic }      = await import('@ai-sdk/anthropic');
      const { generateObject } = await import('ai');
      const { z }              = await import('zod');

      const SignalSchema = z.object({
        id:             z.string(),
        name:           z.string(),
        emoji:          z.string(),
        score:          z.number().int().min(0).max(100),
        delta:          z.number().int().describe('Change in score vs 1 hour ago (can be negative)'),
        trend:          z.enum(['up', 'down', 'flat', 'spike']).describe('spike = dramatic unusual movement'),
        sources:        z.array(z.enum(['X', 'Telegram', 'Reddit', 'OnChain', 'Discord'])).min(1).max(3),
        topToken:       z.string().describe('Ticker of the token currently leading this narrative'),
        topTokenChange: z.string().describe('24h price change of topToken, e.g. "+142%" or "-18%"'),
        sentimentBias:  z.number().int().min(-100).max(100).describe('Net sentiment: -100=max bearish, +100=max bullish'),
        botPercentage:  z.number().int().min(0).max(100).describe('Estimated % of mentions that are bot-generated'),
        insight:        z.string().describe('1 sharp, crypto-native insight about this narrative RIGHT NOW'),
        alertLevel:     z.enum(['none', 'watch', 'warning', 'critical']).describe('none=normal, watch=monitor, warning=act soon, critical=act now'),
      });

      const { object } = await generateObject({
        model: anthropic('claude-3-5-haiku-20241022'),
        schema: z.object({
          narratives: z.array(SignalSchema).length(8),
          marketSentiment: z.object({
            regime:            z.enum(['Bull Run', 'Bear Market', 'Sideways', 'Euphoria', 'Recovery', 'Distribution']),
            regimeConfidence:  z.number().int().min(0).max(100),
            signal:            z.enum(['STRONG BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG SELL']),
            signalStrength:    z.number().int().min(0).max(100),
            fearGreedIndex:    z.number().int().min(0).max(100),
            dominantNarrative: z.string(),
            rotationTarget:    z.string().describe('One sentence: "Funds rotating FROM X TO Y" based on current signals'),
          }),
          breakoutAlert: z.object({
            id:      z.string(),
            name:    z.string(),
            reason:  z.string().describe('2 sentences: what is happening and why it matters right now'),
            urgency: z.enum(['low', 'medium', 'high', 'critical']),
          }).nullable(),
        }),
        prompt: `You are MoonFluxx L·13 Narrative Radar — a real-time Solana market intelligence engine. You analyze social velocity, on-chain flows, and narrative momentum across all major Solana meta categories.

Generate a live pulse of these 8 narratives. IDs and names:
- dog_meta: Dog Meta (BARK, BONK, LDOGE, SHIB derivatives)
- meme_season: Meme Season (broad meme market)
- ai_agents: AI Agents (autonomous on-chain AI tokens)
- gaming: Gaming (GameFi tokens)
- depin: DePIN (decentralized physical infrastructure)
- socialfi: SocialFi (Friend.tech, social graph)
- rwa: RWA (Real World Assets)
- l2s: L2 Tokens (Ethereum L2s vs Solana)

For each narrative:
- Make scores realistic and VARIED (not all clustered around 70)
- Some should be declining (negative delta)
- botPercentage should be higher for pump narratives (15-45%)
- insight must be SPECIFIC and ACTIONABLE — not generic
- alertLevel 'critical' for at most 1-2 narratives

For breakoutAlert: choose the ONE most unusual signal. Can be null if nothing stands out.`,
      });

      const response: NarrativeRadarResponse = {
        ...object,
        lastUpdated: new Date().toISOString(),
        nextRefresh: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
      };

      // Update cache
      cache = { data: response, expiresAt: Date.now() + CACHE_TTL_MS };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          'X-Cache': 'MISS',
        },
      });
    } catch (err) {
      console.warn('[narrative-radar] Claude failed, using mock:', err);
    }
  }

  const mock = buildMock();
  cache = { data: mock, expiresAt: Date.now() + CACHE_TTL_MS };

  await new Promise(r => setTimeout(r, 200));
  return NextResponse.json(mock, {
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  });
}
