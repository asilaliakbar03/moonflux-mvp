import { NextResponse } from 'next/server';
import { aiGenerate, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 60;

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedToken {
  name: string;
  ticker: string;
  description: string;
  whitepaper: string;
  roadmap: { q1: string; q2: string; q3: string; q4: string };
  tokenomics: { community: number; liquidity: number; team: number; marketing: number; treasury: number };
  websiteCopy: { heroTitle: string; heroSubtitle: string };
  xBio: string;
  xPosts: string[];
  website: string;
  twitter: string;
  telegram: string;
  suggestedCurve: string;
  suggestedLiquidity: string;
  loreArc: { origin: string; conflict: string; resolution: string };
  aiNarrativeTags: string[];
  riskTier: string;
}

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
      whitepaper: 'MoonBark ($BARK) is the first community-driven canine token on Solana, born from the belief that loyalty should be rewarded on-chain. Our mission is to create the most engaged dog-meta community in crypto, powered by meme culture and diamond paws.\n\nThe $BARK ecosystem features auto-staking bone rewards, a community-governed treat treasury, and partnerships with real-world dog shelters. Every transaction contributes to the Bark Fund, ensuring that both digital and real dogs eat well.',
      roadmap: { q1: 'Fair launch on pump.fun, community building, 10K holder milestone', q2: 'Bark Staking v1, partnerships with dog shelter DAOs, CEX listings', q3: 'BarkSwap DEX launch, NFT collar collection, cross-chain bridge', q4: 'Bark DAO governance, real-world dog rescue fund, 100K holders' },
      tokenomics: { community: 50, liquidity: 25, team: 10, marketing: 10, treasury: 5 },
      websiteCopy: { heroTitle: 'Diamond Paws Only 🐾', heroSubtitle: 'The most loyal dog on Solana. $BARK rewards holders who never let go.' },
      xBio: '🐕 The goodest boy on Solana | $BARK | Diamond paws only 🐾 | Community-driven, degen-approved',
      xPosts: [
        '🐕 $BARK just launched and we\'re already trending. The goodest boy on Solana has arrived. Diamond paws only. 🐾🚀',
        'They said dog coins are dead. $BARK said hold my bone. 📈🦴',
        'POV: You aped into $BARK at launch and now you\'re buying your dog a diamond collar 💎🐕',
        'The $BARK community just hit 5K holders in 24 hours. This is what loyalty looks like on-chain. 🐾',
        'New partnership dropping tomorrow. $BARK isn\'t just a meme — it\'s a movement. Stay tuned. 👀🐕',
      ],
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
      whitepaper: 'NeuralFlux ($NFLX) is the first self-improving AI agent token on Solana. Every on-chain transaction feeds data into a neural network that optimizes trading strategies in real-time. The model learns from every buy and sell, creating a positive feedback loop of intelligence and value.\n\nThe $NFLX protocol features three core modules: the Prediction Engine (market sentiment analysis), the Execution Layer (autonomous trade routing), and the Learning Core (continuous model improvement). Token holders gain governance rights over model parameters and share in trading profits generated by the AI.',
      roadmap: { q1: 'Agent v1 launch, initial model training on historical Solana data, token fair launch', q2: 'Prediction Engine live, real-time sentiment dashboard, API access for holders', q3: 'Autonomous trading module, cross-DEX arbitrage, revenue sharing for stakers', q4: 'Agent v2 with multi-chain intelligence, institutional API tier, DAO governance' },
      tokenomics: { community: 40, liquidity: 20, team: 15, marketing: 10, treasury: 15 },
      websiteCopy: { heroTitle: 'The AI That Trades Itself 🤖', heroSubtitle: '$NFLX gets smarter every block. An autonomous agent born on Solana.' },
      xBio: '🤖 Autonomous AI trading agent on Solana | $NFLX | Gets smarter every block | Built by degens, trained by markets',
      xPosts: [
        '🤖 $NFLX just predicted its 13th consecutive top. This time, people are listening. The AI agent era is here.',
        'Every time you buy $NFLX, the model gets smarter. Every time you sell, it learns your weakness. Choose wisely. 🧠',
        'The $NFLX agent just executed 47 profitable trades in a row. No human intervention. Pure neural alpha. 📈🤖',
        'Other tokens have communities. $NFLX has a sentient AI that fights for its own survival. We are not the same.',
        'BREAKING: $NFLX Prediction Engine going live next week. Real-time sentiment analysis for all holders. The future is autonomous. 🚀',
      ],
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
    whitepaper: 'NeonBrew ($ESPR) is the first caffeinated DeFi token on Solana, built by a community of sleepless degens who believe that the best trades happen after midnight. The project centers around a cyberpunk frog who runs a neon-lit underground café where the only accepted currency is $ESPR.\n\nThe NeonBrew ecosystem includes Brew Staking (stake your $ESPR to earn freshly brewed rewards), the Café DAO (community governance over project direction), and the Neon NFT collection featuring unique cyberpunk frog baristas. A portion of all transaction fees funds the Caffeine Treasury, which powers community initiatives and buybacks.',
    roadmap: { q1: 'Fair launch, community café Discord, first 5K holders, meme contest', q2: 'Brew Staking launch, Neon Frog NFT collection, DEX listings', q3: 'Café DAO governance, cross-chain brewing, merch store', q4: 'Real-world café pop-ups, 50K holders, animated series pilot' },
    tokenomics: { community: 50, liquidity: 25, team: 10, marketing: 10, treasury: 5 },
    websiteCopy: { heroTitle: 'Brewed in the Neon Underground ☕', heroSubtitle: 'A cyberpunk frog. A DeFi café. $ESPR is the currency of the caffeinated underground.' },
    xBio: '🐸☕ Cyberpunk frog running a neon DeFi café | $ESPR | Caffeinated gains only | The underground is brewing',
    xPosts: [
      '☕ $ESPR just launched. The neon café is open. Grab your espresso and strap in, degens. 🐸🚀',
      'They told the frog to sleep. He said "I\'ll sleep when the chart stops going up." $ESPR ☕📈',
      'The Caffeine Treasury just hit $100K. The frog never sleeps and neither does this chart. $ESPR 🐸',
      'POV: You\'re in the neon café at 3am, watching your $ESPR bag 10x while sipping a double shot. This is the way. ☕',
      'ANNOUNCEMENT: Brew Staking goes live next week. Stake your $ESPR, earn freshly brewed rewards. The café never closes. 🐸☕',
    ],
  };
}

// ── System prompt for AI generation ───────────────────────────────────────────
const SYSTEM_PROMPT = `You are the MoonFluxx AI Token Architect — a creative director for viral Solana meme tokens. You have deep knowledge of crypto culture, Solana DeFi, pump.fun dynamics, and what makes tokens culturally sticky.

You MUST return a single JSON object with ALL of the following fields. No extra text, no markdown.

JSON fields:
- "name" (string): A catchy, viral 1-3 word token name. No generic words like "coin" or "token".
- "ticker" (string): 3-5 letter all-caps ticker, no $ prefix.
- "description" (string): Compelling 2-3 sentence lore/backstory. Crypto-native voice. Make it highly shareable.
- "whitepaper" (string): A short whitepaper in exactly 2 paragraphs separated by \\n\\n. First paragraph: project vision and mission. Second paragraph: ecosystem features and tokenomics rationale. Keep it punchy and crypto-native, not corporate.
- "roadmap" (object): Quarterly roadmap with keys "q1", "q2", "q3", "q4". Each value is a string with 3-4 comma-separated milestones.
- "tokenomics" (object): Token distribution with keys "community", "liquidity", "team", "marketing", "treasury". Values are integers (percentages) that MUST sum to 100.
- "websiteCopy" (object): Keys "heroTitle" (string, punchy 3-7 word headline with 1 emoji) and "heroSubtitle" (string, 1-2 sentence tagline that makes people want to buy).
- "xBio" (string): Twitter/X bio, max 160 characters, includes ticker with $, uses 2-3 emojis, captures the token's vibe.
- "xPosts" (array of 5 strings): Five ready-to-post tweets. Mix of: launch announcement, community hype, alpha tease, meme/humor, milestone celebration. Each 180-280 characters. Use emojis sparingly but effectively.
- "website" (string): A realistic .xyz or .io domain, e.g. moonbark.xyz
- "twitter" (string): Twitter handle starting with @
- "telegram" (string): Telegram link e.g. t.me/projectname
- "suggestedCurve" (string): One of "fast", "balanced", "community", "premium". fast=pure meme/viral, balanced=utility+hype, community=DAO/governance, premium=serious project with roadmap.
- "suggestedLiquidity" (string): One of "fair", "standard", "growth". fair=equal access launch, standard=moderate, growth=larger initial pool.
- "loreArc" (object): A 3-act narrative arc with keys "origin" (1 sentence: how/where the token was born, be creative and specific), "conflict" (1 sentence: the central tension or enemy the community faces), "resolution" (1 sentence: the triumphant future state if hodlers prevail).
- "aiNarrativeTags" (array of 2-3 strings): Current Solana meta narratives this token belongs to. Choose from: Dog Meta, AI Agents, Meme Season, Gaming, RWA, DePIN, SocialFi, L2s, Community, Utility.
- "riskTier" (string): One of "meme", "utility", "community". meme=pure speculation, utility=real use case, community=DAO-driven.`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // ── AI generation via centralized client ──────────────────────────────────
    if (isAIConfigured()) {
      try {
        const result = await aiGenerate<GeneratedToken>({
          system: SYSTEM_PROMPT,
          prompt: `User's prompt: "${prompt}"\n\nGenerate the perfect, ready-to-launch Solana token. The lore should be unique, specific, and shareable. The ticker should be memorable. The description should make someone WANT to buy immediately. The narrative tags must reflect genuine 2025 Solana meta trends. The whitepaper should feel authentic but degen. The roadmap should be ambitious but plausible. The tweets should be fire.`,
          model: MODELS.SMART,
          temperature: 0.3,
          maxTokens: 1200,
          cacheTtlMs: 3600000, // 1 hour
        });

        const response = NextResponse.json(result.data);
        response.headers.set('X-Cache', result.cached ? 'HIT' : 'MISS');
        return response;
      } catch (err) {
        console.warn('[generate-token] AI failed, using mock fallback:', err);
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
