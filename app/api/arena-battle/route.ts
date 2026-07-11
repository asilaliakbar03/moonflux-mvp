import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const MOCK_ANALYSES: Record<string, string[]> = {
  default: [
    "$LDOGE enters the arena with a devastating +142% weekly gain, backed by explosive social velocity. The Dog Meta narrative is at peak strength (94/100). Holder count is up 340% this week — institutional-grade accumulation is visible on-chain. $LDOGE is the crowd favorite and enters as a heavy frontrunner.",
    "$PEPE2 fights back with classic underdog energy. Memetic potential is off the charts — Pepe narratives have historically reversed against strong dog coins in late-cycle momentum swings. A significant volume spike in the last 2 hours suggests coordinated whale accumulation that shouldn't be ignored.",
    "AI Prediction: LDOGE wins with 73% probability. However, if PEPE2 crosses the 40% vote threshold within the next 2 hours, historical pattern analysis indicates a narrative flip could trigger a surprise pump. Watch the vote momentum closely — this battle is not over.",
  ],
  regenerated: [
    "$LDOGE's on-chain metrics are extraordinary: 847 Battle Power units derived from social momentum, holder velocity, and volume consistency. The dog meta is entering a euphoric phase — sentiment trackers show 91% positive mentions across X and Telegram in the last 6 hours.",
    "$PEPE2 has quietly built a war chest. Three wallets identified as historically accurate early-movers loaded significant positions 4 hours ago. Memetic resilience score: 78/100. Do not count out the frog — it has clawed back from worse deficits.",
    "Updated Prediction: LDOGE retains the edge at 69% confidence, but the gap is closing. The next 90 minutes are critical — if social mentions for PEPE2 cross 15K/hr, the algorithmic model flips to PEPE2 as the winner. This is a live battle. Stay alert.",
  ],
};

export async function POST(req: Request) {
  try {
    const { tokenA, tokenB } = await req.json() as { tokenA: string; tokenB: string };

    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      const analyses = MOCK_ANALYSES.default;
      return NextResponse.json({
        paragraphs: analyses,
        winner: tokenA ?? 'LDOGE',
        confidence: 73,
        loser: tokenB ?? 'PEPE2',
      });
    }

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20240620'),
      schema: z.object({
        paragraphs: z.array(z.string()).length(3).describe(
          'Three dramatic sports-commentator-style analysis paragraphs. First covers tokenA strengths. Second covers tokenB counter-narrative. Third is the AI prediction.'
        ),
        winner: z.string().describe('Ticker of the predicted winner.'),
        confidence: z.number().min(50).max(99).describe('Win probability % for the winner.'),
        loser: z.string().describe('Ticker of the underdog.'),
      }),
      prompt: `You are the MoonFluxx Arena AI — a dramatic, hyper-enthusiastic crypto battle commentator blending sports punditry with on-chain analysis. 
      
Token A: ${tokenA}
Token B: ${tokenB}

Write a 3-paragraph battle analysis as if you are calling a live championship fight. 
- Para 1: ${tokenA}'s strengths, momentum, narrative power, and why it's the favorite.
- Para 2: ${tokenB}'s counter-narrative, underdog energy, any recent signals that could flip the battle.
- Para 3: Your AI prediction with a specific win probability, and what condition would cause a surprise upset.

Use crypto-native language (Battle Power, memetic potential, social velocity, narrative meta, on-chain signals, whale accumulation). Keep it thrilling and shareable.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Arena battle error:', error);
    return NextResponse.json({ error: 'Failed to generate battle analysis' }, { status: 500 });
  }
}
