import { NextRequest, NextResponse } from 'next/server';
import { aiGenerate, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedToken {
  id:            string;
  matchScore:    number;           // 0-100 personalization fit
  urgencySignal: 'Buy Window' | 'Watch' | 'Avoid' | 'Strong Buy';
  matchReasons:  string[];         // 2-3 specific reasons this was recommended
  explanation:   string;           // Full sentence explanation
}

export interface PersonalizedFeedResponse {
  tokens:      FeedToken[];
  profileTag:  string;            // e.g. "Degen Ape", "Diamond Hand Maxi", "AI-First Trader"
  insight:     string;            // 1 sentence overall portfolio insight
}

// ── Token universe (expanded) ─────────────────────────────────────────────────

const TOKEN_UNIVERSE = [
  { id: 'tok_luna_doge', ticker: 'LDOGE', name: 'Luna Doge',   category: 'Dog Meta',  change: '+142%', status: 'graduated',    risk: 'medium' },
  { id: 'tok_ai_swarm',  ticker: 'SWRM',  name: 'AI Swarm',    category: 'AI Agents', change: '+211%', status: 'bonding_curve', risk: 'high'   },
  { id: 'tok_degen_ape', ticker: 'DAPE',  name: 'DegenApe',    category: 'Meme',      change: '+388%', status: 'bonding_curve', risk: 'very_high' },
  { id: 'tok_cyber_pep', ticker: 'CPEP',  name: 'CyberPep',    category: 'Meme',      change: '+78%',  status: 'bonding_curve', risk: 'medium' },
  { id: 'tok_nova_flux', ticker: 'NVFX',  name: 'NovaFlux',    category: 'AI Agents', change: '+67%',  status: 'graduated',    risk: 'low'    },
  { id: 'tok_gold_flux', ticker: 'GFLX',  name: 'GoldFlux',    category: 'RWA',       change: '+52%',  status: 'graduated',    risk: 'low'    },
  { id: 'tok_moon_bark', ticker: 'BARK',  name: 'MoonBark',    category: 'Dog Meta',  change: '+89%',  status: 'bonding_curve', risk: 'medium' },
  { id: 'tok_sol_depin', ticker: 'WIFI',  name: 'SolWifi',     category: 'DePIN',     change: '+134%', status: 'graduated',    risk: 'medium' },
];

// ── Mock fallback ─────────────────────────────────────────────────────────────

function getMockFeed(preferences: Record<string, unknown> = {}): PersonalizedFeedResponse {
  const hasDogPreference = JSON.stringify(preferences).toLowerCase().includes('dog');
  const hasAIPreference  = JSON.stringify(preferences).toLowerCase().includes('ai');

  const tokens: FeedToken[] = [
    {
      id: 'tok_luna_doge', matchScore: 94, urgencySignal: 'Buy Window',
      matchReasons: ['Matches Dog Meta interest', 'Top momentum token this week', 'Graduated — lower rug risk'],
      explanation: 'LDOGE is the highest-conviction Dog Meta play right now — graduated to Raydium, organic holder growth, and smart money accumulation in the last 4h.',
    },
    {
      id: 'tok_ai_swarm', matchScore: 88, urgencySignal: hasAIPreference ? 'Strong Buy' : 'Watch',
      matchReasons: ['AI Agents narrative aligns with your profile', '+211% momentum with organic volume', 'Early bonding curve — high upside window'],
      explanation: 'SWRM is an AI narrative token at 42% bonding curve — early enough for significant upside if the AI meta continues its current run.',
    },
    {
      id: 'tok_degen_ape', matchScore: 79, urgencySignal: 'Watch',
      matchReasons: ['+388% momentum matches your degen risk profile', 'High social velocity — potential viral moment', 'Bonding curve at 67% — graduation risk/reward'],
      explanation: 'DAPE is the highest-momentum token in the feed — extreme risk but extreme reward. Sized for degen position only (1-2% portfolio max).',
    },
    {
      id: 'tok_cyber_pep', matchScore: 71, urgencySignal: 'Watch',
      matchReasons: ['Meme momentum matching tokens you viewed', 'Similar holder pattern to LDOGE early days', 'Bonding curve at 31% — early entry'],
      explanation: 'CPEP follows a similar holder growth pattern to LDOGE 48h before it broke out. Early but not confirmed.',
    },
    {
      id: 'tok_nova_flux', matchScore: 65, urgencySignal: 'Buy Window',
      matchReasons: ['AI category + graduated = lower risk', 'Steady +67% without pump/dump pattern', 'Smart money holding — no whale exits'],
      explanation: 'NVFX is the "boring but safe" AI token — graduated, low risk, steady appreciation. Good for portfolio balance against your higher-risk positions.',
    },
    {
      id: 'tok_sol_depin', matchScore: 58, urgencySignal: 'Watch',
      matchReasons: ['DePIN narrative showing unusual velocity spike', 'Diversifies your meme-heavy portfolio', 'Real utility backing the price'],
      explanation: 'WIFI is showing pre-breakout signals in the DePIN narrative — unusual volume spike detected. Monitoring for entry confirmation.',
    },
  ];

  return {
    tokens,
    profileTag: hasDogPreference ? 'Dog Meta Degen' : hasAIPreference ? 'AI-First Trader' : 'Balanced Degen',
    insight: 'Your portfolio skews heavy toward meme tokens — the AI Agents narrative offers both momentum and a narrative hedge if meme season cools.',
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { walletAddress?: string; recentViews?: string[]; recentBuys?: string[]; preferences?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch { /* proceed with defaults */ }

  if (isAIConfigured()) {
    try {
      const result = await aiGenerate<PersonalizedFeedResponse>({
        system: `You are MoonFluxx AI Recommendation Engine — a personalized token discovery system for Solana traders.

Respond with a JSON object containing these fields:
- "tokens" (array of 4-6 objects): Each token object contains:
  - "id" (string): must be one of the exact token IDs from the token universe list provided in the prompt
  - "matchScore" (integer 0-100): personalization fit score
  - "urgencySignal" (string): one of "Buy Window", "Watch", "Avoid", "Strong Buy" — "Buy Window" = entry opportunity open now, "Watch" = monitor but not urgent, "Avoid" = risk too high, "Strong Buy" = strong conviction
  - "matchReasons" (array of 2-3 strings): specific reasons this token matches this user (15 words max each)
  - "explanation" (string): 1-2 sentences in crypto-native voice explaining why this token is recommended for this specific user
- "profileTag" (string): a creative 2-3 word label for this trader's style, e.g. "Degen Ape", "Diamond Hand Maxi", "AI-First Trader"
- "insight" (string): 1 strategic sentence — what should this trader focus on right now based on their profile and the current market?`,
        prompt: `User Profile:
- Wallet: ${body.walletAddress ?? 'anonymous'}
- Recently viewed tokens: ${(body.recentViews ?? []).join(', ') || 'none'}
- Recently bought tokens: ${(body.recentBuys ?? []).join(', ') || 'none'}
- Stated preferences: ${JSON.stringify(body.preferences ?? {})}

Token Universe (select 4-6 tokens to recommend, use exact IDs):
${TOKEN_UNIVERSE.map(t => `- ${t.id}: ${t.name} (${t.ticker}) — ${t.category}, ${t.change} 24h, ${t.status}, risk: ${t.risk}`).join('\n')}

Rank tokens by fit for this user. Consider: their viewing/buying history, stated preferences, current narrative momentum, and risk tolerance inferred from their history. Give specific, personalized reasons — not generic ones. The urgencySignal must reflect actual current market conditions.`,
        model: MODELS.FAST,
        temperature: 0.3,
        maxTokens: 400,
        cacheTtlMs: 300000,
      });

      return NextResponse.json(result.data, {
        headers: { 'X-Cache': result.cached ? 'HIT' : 'MISS' },
      });
    } catch (err) {
      console.warn('[personalized-feed] AI failed, using mock:', err);
      return NextResponse.json(getMockFeed(body.preferences));
    }
  }

  return NextResponse.json(getMockFeed(body.preferences));
}
