import { NextResponse } from 'next/server';
import { aiGenerate, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 45;

// ── Types ─────────────────────────────────────────────────────────────────────

export type MarketRegime = 'Bull Run' | 'Bear Market' | 'Sideways' | 'Euphoria' | 'Recovery';
export type NarrativeTrend = 'Heating Up' | 'Stable' | 'Cooling' | 'PEAK' | 'Awakening';

export interface NarrativeForecast {
  id:               string;
  name:             string;
  emoji:            string;
  confidence:       number;       // 0-100 AI confidence score
  momentumScore:    number;       // 0-100 current momentum
  trend:            NarrativeTrend;
  timeframe:        'Next 24h' | 'Next 3d' | 'Next 7d';
  tag:              'AI Pick' | 'High Risk' | 'Watch' | 'Fading';
  color:            string;       // hex color for UI
  volumeChange24h:  number;       // % change in narrative token volumes
  mentionVelocity:  number;       // social mentions per hour (relative)
  keyDrivers:       string[];     // 2-3 specific tokens or events driving this narrative
  aiInsight:        string;       // 1-sentence AI reasoning
}

export interface MarketSentiment {
  regime:          MarketRegime;
  regimeConfidence: number;       // 0-100
  overallSignal:   'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  signalStrength:  number;        // 0-100
  fearGreedIndex:  number;        // 0-100 (higher = more greed)
  dominantNarrative: string;      // The #1 narrative by score
}

export interface PumpForecastResponse {
  narratives:      NarrativeForecast[];
  marketSentiment: MarketSentiment;
  breakoutAlert:   { narrativeId: string; reason: string } | null; // single most unusual spike
  generatedAt:     string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK: PumpForecastResponse = {
  narratives: [
    { id: 'dog_meta',   name: 'Dog Meta',   emoji: '🐕', confidence: 87, momentumScore: 91, trend: 'PEAK',       timeframe: 'Next 24h', tag: 'AI Pick',   color: '#e8b84b', volumeChange24h: +312, mentionVelocity: 94,  keyDrivers: ['LDOGE', 'BARK', 'BONK2'],   aiInsight: 'Dog narrative entering euphoria phase — historically precedes a 20-40% correction within 48h.' },
    { id: 'ai_agents',  name: 'AI Agents',  emoji: '🤖', confidence: 79, momentumScore: 74, trend: 'Heating Up', timeframe: 'Next 3d',  tag: 'AI Pick',   color: '#a855f7', volumeChange24h: +187, mentionVelocity: 71,  keyDrivers: ['GOAT', 'SWRM', 'AIVM'],     aiInsight: 'AI agent tokens showing organic accumulation by known smart wallets — not bot-driven.' },
    { id: 'meme_season',name: 'Meme Season', emoji: '🔥', confidence: 91, momentumScore: 88, trend: 'PEAK',       timeframe: 'Next 24h', tag: 'AI Pick',   color: '#f97316', volumeChange24h: +445, mentionVelocity: 100, keyDrivers: ['Multiple'],                  aiInsight: 'Broad meme season indicators at cycle highs — monitor for exhaustion signals after this candle.' },
    { id: 'gaming',     name: 'Gaming',     emoji: '🎮', confidence: 64, momentumScore: 58, trend: 'Stable',     timeframe: 'Next 3d',  tag: 'Watch',     color: '#38bdf8', volumeChange24h:  +42, mentionVelocity: 44,  keyDrivers: ['GAMER', 'PXVLT'],           aiInsight: 'Gaming narrative consolidating after the June run — watching for Q3 catalyst.' },
    { id: 'rwa',        name: 'RWA',        emoji: '🏦', confidence: 41, momentumScore: 33, trend: 'Cooling',    timeframe: 'Next 7d',  tag: 'Fading',    color: '#ef4444', volumeChange24h:  -28, mentionVelocity: 18,  keyDrivers: ['ONDO', 'BUIDL'],            aiInsight: 'RWA narrative losing meme market share to dog meta — institutional buyers absent this week.' },
    { id: 'depin',      name: 'DePIN',      emoji: '📡', confidence: 55, momentumScore: 61, trend: 'Awakening',  timeframe: 'Next 3d',  tag: 'Watch',     color: '#14b8a6', volumeChange24h:  +89, mentionVelocity: 52,  keyDrivers: ['HNT', 'IOTX', 'WIFI'],      aiInsight: 'DePIN showing unusual early accumulation — possible next narrative rotation target.' },
    { id: 'socialfi',   name: 'SocialFi',   emoji: '💬', confidence: 47, momentumScore: 44, trend: 'Stable',     timeframe: 'Next 7d',  tag: 'Watch',     color: '#6366f1', volumeChange24h:  +15, mentionVelocity: 31,  keyDrivers: ['SOCIAL', 'BFREN'],          aiInsight: 'SocialFi tokens in accumulation phase — watch for a Friends.tech-style catalyst to ignite.' },
    { id: 'l2s',        name: 'L2 Tokens',  emoji: '⚡', confidence: 38, momentumScore: 29, trend: 'Cooling',    timeframe: 'Next 7d',  tag: 'High Risk', color: '#94a3b8', volumeChange24h:  -41, mentionVelocity: 22,  keyDrivers: ['ARB', 'OP'],                aiInsight: 'L2 tokens losing ground to Multi-Chain-native assets — funds rotating on-chain.' },
  ],
  marketSentiment: {
    regime:            'Euphoria',
    regimeConfidence:  82,
    overallSignal:     'BUY',
    signalStrength:    74,
    fearGreedIndex:    79,
    dominantNarrative: 'Meme Season',
  },
  breakoutAlert: {
    narrativeId: 'depin',
    reason: 'DePIN mention velocity spiked 340% in the last 2 hours — unusual pre-breakout pattern detected across 4 social platforms.',
  },
  generatedAt: new Date().toISOString(),
};

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  if (isAIConfigured()) {
    try {
      const result = await aiGenerate<Omit<PumpForecastResponse, 'generatedAt'>>({
        system: `You are MoonFluxx AI Pump Forecaster — an expert Crypto narrative analyst. Generate a real-time market pulse report.

Respond with a JSON object containing these fields:
- "narratives" (array of exactly 8 objects): Each narrative object contains:
  - "id" (string): narrative slug (e.g. "dog_meta", "ai_agents")
  - "name" (string): human-readable name
  - "emoji" (string): a single relevant emoji
  - "confidence" (integer 0-100): prediction confidence (50-95 range realistic)
  - "momentumScore" (integer 0-100): current momentum strength, make them varied
  - "trend" (string): one of "Heating Up", "Stable", "Cooling", "PEAK", "Awakening"
  - "timeframe" (string): one of "Next 24h", "Next 3d", "Next 7d"
  - "tag" (string): one of "AI Pick", "High Risk", "Watch", "Fading"
  - "color" (string): hex color for UI
  - "volumeChange24h" (number): % volume change vs 24h ago — can be negative
  - "mentionVelocity" (integer 0-100): social mention velocity relative score
  - "keyDrivers" (array of 1-3 strings): token tickers or events driving this narrative
  - "aiInsight" (string): 1 punchy sentence AI analysis — crypto-native, specific, actionable
- "marketSentiment" (object):
  - "regime" (string): one of "Bull Run", "Bear Market", "Sideways", "Euphoria", "Recovery"
  - "regimeConfidence" (integer 0-100)
  - "overallSignal" (string): one of "STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"
  - "signalStrength" (integer 0-100)
  - "fearGreedIndex" (integer 0-100): crypto Fear & Greed index proxy — higher = more greed
  - "dominantNarrative" (string): name of the strongest narrative right now
- "breakoutAlert" (object or null): the single narrative showing the most unusual velocity spike, or null if none stand out
  - "narrativeId" (string)
  - "reason" (string): 1-2 sentences explaining why this narrative is spiking unusually`,
        prompt: `Analyze these 8 narratives for the current Crypto meta:
1. dog_meta — Dog Meta (BARK, BONK derivatives, LDOGE)
2. ai_agents — AI Agents (autonomous on-chain AI tokens)
3. meme_season — Meme Season (broad meme market health)
4. gaming — Gaming (GameFi, gaming guild tokens)
5. rwa — RWA (Real World Assets tokenization)
6. depin — DePIN (Decentralized Physical Infrastructure)
7. socialfi — SocialFi (Friend.tech, social graph tokens)
8. l2s — L2 Tokens (Ethereum L2s vs Multi-Chain competition)

For each narrative:
- confidence: how confident is this prediction (50-95 range realistic)
- momentumScore: current strength (make them varied, not all the same)
- trend: actual direction right now
- volumeChange24h: realistic % change (some negative is realistic)
- keyDrivers: 2-3 specific real tokens driving the narrative
- aiInsight: 1 specific, crypto-native, actionable sentence

For marketSentiment: be realistic about the current cycle phase.
For breakoutAlert: pick the ONE narrative with the most unusual/surprising signal.`,
        model: MODELS.FAST,
        temperature: 0.3,
        maxTokens: 600,
        cacheTtlMs: 300000,
      });

      return NextResponse.json(
        { ...result.data, generatedAt: new Date().toISOString() } as PumpForecastResponse,
        { headers: { 'X-Cache': result.cached ? 'HIT' : 'MISS' } },
      );
    } catch (err) {
      console.warn('[pump-forecast] AI failed, using mock:', err);
    }
  }

  await new Promise(r => setTimeout(r, 300));
  return NextResponse.json({ ...MOCK, generatedAt: new Date().toISOString() });
}
