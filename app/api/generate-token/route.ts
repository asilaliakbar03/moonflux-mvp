import { NextResponse } from 'next/server';

export const maxDuration = 60;

// ── Mock fallback ─────────────────────────────────────────────────────────────
// Used when no API key is present OR as a last-resort fallback on Claude error.
// Deterministic based on a simple hash of the prompt so it feels "personalised".
function getMockToken(prompt: string) {
  const seed = prompt.toLowerCase();
  if (seed.includes('dog') || seed.includes('doge') || seed.includes('shib')) {
    return {
      name: 'MoonBark', ticker: 'BARK',
      description: 'The most loyal dog on the Solana blockchain. $BARK was forged in the fires of meme culture by a community of degens who believe that good boys deserve good gains. Diamond paws only.',
      website: 'moonbark.xyz', twitter: '@MoonBarkSol', telegram: 't.me/moonbarksol',
      suggestedCurve: 'fast', suggestedLiquidity: 'fair',
      loreArc: { origin: 'A stray dog found a Solana wallet on the streets of Tokyo.', conflict: 'The bears tried to put him down. He just wagged his tail.', resolution: 'Every sell becomes a buy. $BARK cannot be stopped.' },
      aiNarrativeTags: ['Dog Meta', 'Meme Season', 'Community'],
      riskTier: 'meme',
    };
  }
  if (seed.includes('ai') || seed.includes('agent') || seed.includes('robot') || seed.includes('bot')) {
    return {
      name: 'NeuralFlux', ticker: 'NFLX',
      description: 'An autonomous AI agent that trades its own token on the Solana blockchain. Every buy trains the model. Every sell is a lesson. $NFLX gets smarter every block.',
      website: 'neuralflux.ai', twitter: '@NeuralFluxAI', telegram: 't.me/neuralfluxai',
      suggestedCurve: 'balanced', suggestedLiquidity: 'standard',
      loreArc: { origin: 'Born in a GPU cluster at 3am during a bull run.', conflict: 'It predicted the top 12 times. No one listened.', resolution: 'Now it trades for itself. Join or get left behind.' },
      aiNarrativeTags: ['AI Agents', 'DePIN', 'Utility'],
      riskTier: 'utility',
    };
  }
  return {
    name: 'NeonBrew', ticker: 'ESPR',
    description: 'A highly caffeinated cyberpunk frog navigating the neon-lit DeFi slums. Powered by espresso shots and sheer degen energy, $ESPR is the currency of the caffeinated underground.',
    website: 'neonbrew.xyz', twitter: '@NeonBrewFrog', telegram: 't.me/neonbrew',
    suggestedCurve: 'fast', suggestedLiquidity: 'fair',
    loreArc: { origin: 'Born in a 24-hour café in Shibuya. Accidentally sent its life savings to the wrong address.', conflict: 'The coffee machine is sentient and it is angry.', resolution: 'Community rallies. The frog hops to the moon. The café is now a DAO.' },
    aiNarrativeTags: ['Meme Season', 'Dog Meta', 'Community'],
    riskTier: 'meme',
  };
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // ── Dynamic import: ONLY runs if API key is set, never crashes cold ────────
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { anthropic }    = await import('@ai-sdk/anthropic');
        const { generateObject } = await import('ai');
        const { z }            = await import('zod');

        const TokenSchema = z.object({
          name: z.string().describe('A catchy, viral 1-3 word token name. No generic words like "coin" or "token".'),
          ticker: z.string().min(3).max(5).describe('3-5 letter all-caps ticker, no $ prefix.'),
          description: z.string().describe('Compelling 2-3 sentence lore/backstory. Crypto-native voice. Make it highly shareable.'),
          website: z.string().describe('A realistic .xyz or .io domain, e.g. moonbark.xyz'),
          twitter: z.string().describe('Twitter handle starting with @'),
          telegram: z.string().describe('Telegram link e.g. t.me/projectname'),
          suggestedCurve: z.enum(['fast', 'balanced', 'community', 'premium']).describe(
            'Best bonding curve for this token: fast=pure meme/viral, balanced=utility+hype, community=DAO/governance, premium=serious project with roadmap'
          ),
          suggestedLiquidity: z.enum(['fair', 'standard', 'growth']).describe(
            'Liquidity strategy: fair=equal access launch, standard=moderate, growth=larger initial pool'
          ),
          loreArc: z.object({
            origin:     z.string().describe('1 sentence: how/where the token was born. Be creative and specific.'),
            conflict:   z.string().describe('1 sentence: the central tension or enemy the community faces.'),
            resolution: z.string().describe('1 sentence: the triumphant future state if hodlers prevail.'),
          }).describe('A 3-act narrative arc that gives the token a story and identity beyond a ticker.'),
          aiNarrativeTags: z.array(z.string()).min(2).max(3).describe(
            'The 2-3 current Solana meta narratives this token belongs to. Choose from: Dog Meta, AI Agents, Meme Season, Gaming, RWA, DePIN, SocialFi, L2s, Community, Utility'
          ),
          riskTier: z.enum(['meme', 'utility', 'community']).describe(
            'Risk classification: meme=pure speculation, utility=real use case, community=DAO-driven'
          ),
        });

        const { object } = await generateObject({
          model: anthropic('claude-3-5-sonnet-20241022'),
          schema: TokenSchema,
          prompt: `You are the MoonFluxx AI Token Architect — a creative director for viral Solana meme tokens. You have deep knowledge of crypto culture, Solana DeFi, pump.fun dynamics, and what makes tokens culturally sticky.

User's prompt: "${prompt}"

Generate the perfect, ready-to-launch Solana token. The lore should be unique, specific, and shareable. The ticker should be memorable. The description should make someone WANT to buy immediately. The narrative tags must reflect genuine 2025 Solana meta trends.`,
        });

        return NextResponse.json(object);
      } catch (err) {
        console.warn('[generate-token] Claude failed, using mock fallback:', err);
        return NextResponse.json(getMockToken(prompt));
      }
    }

    // No API key — deterministic mock (still useful for dev)
    await new Promise(r => setTimeout(r, 600)); // simulate latency
    return NextResponse.json(getMockToken(prompt));

  } catch (error) {
    console.error('[generate-token] Unhandled error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
