import { NextResponse } from 'next/server';

export const maxDuration = 60;

// ── Types ─────────────────────────────────────────────────────────────────────

export type TradingStyle =
  | 'Diamond Hands'
  | 'Paper Hands'
  | 'Ape Brain'
  | 'Contrarian'
  | 'Sniper'
  | 'Bot Fodder'
  | 'Exit Liquidity Provider'
  | 'Accidental Genius';

export interface WalletRoast {
  persona:           string;         // e.g. "Chaotic Neutral Degen"
  roast:             string;         // 3-4 sentence brutal roast
  portfolioScore:    number;         // 0-100 (lower = funnier/worse)
  winRate:           string;         // e.g. "12%"
  rugCount:          number;
  biggestBag:        string;         // funniest dead token they probably hold
  tradingStyle:      TradingStyle;
  advice:            string;         // 1 genuinely useful but funny piece of advice
  nftEquivalent:     string;         // "you are the [NFT name] of traders"
}

// ── Deterministic mock builder ─────────────────────────────────────────────────

function buildMockRoast(address: string): WalletRoast {
  const hash  = address.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const tier  = hash % 4;

  const roasts: WalletRoast[] = [
    {
      persona:        'Exit Liquidity Provider',
      roast:          'You have an uncanny talent for buying the exact top of every meme cycle and selling the exact bottom. Your wallet is essentially a charity — donating your SOL to early buyers since 2021. You\'ve been rugged 14 times and you\'re somehow surprised every single time. Your portfolio is a graveyard with a Buy More button.',
      portfolioScore: 11,
      winRate:        '9%',
      rugCount:       14,
      biggestBag:     'INU (the third one)',
      tradingStyle:   'Bot Fodder',
      advice:         'Seriously — set a 20% stop loss. Just once. Try it. It will change your life.',
      nftEquivalent:  'You are the Bored Ape of traders — once worth something, now just embarrassing.',
    },
    {
      persona:        'Chaotic Neutral Degen',
      roast:          'You buy everything that trends on X within 4 minutes of it posting. You\'ve spent more on gas fees than most people spend on rent. Your biggest win ever was a 3x on a token that went on to 200x after you sold it. You have 47 tokens in your wallet and you can\'t name 12 of them.',
      portfolioScore: 31,
      winRate:        '23%',
      rugCount:       8,
      biggestBag:     'ShibaInu2.0 (yes, the second one)',
      tradingStyle:   'Ape Brain',
      advice:         'Stop trading for 24 hours. I\'m serious. The market will still be there. Your dopamine system needs a timeout.',
      nftEquivalent:  'You are the DeGods NFT of traders — degen identity but unclear actual value.',
    },
    {
      persona:        'Accidentally Profitable Fool',
      roast:          'You somehow have a 34% win rate despite making zero decisions based on logic. You once held a token for 6 months because you forgot your seed phrase, and it 10x\'d. Every time you buy for the wrong reason, you accidentally get the timing right. This is not skill. This is chaos theory operating at portfolio scale.',
      portfolioScore: 52,
      winRate:        '34%',
      rugCount:       5,
      biggestBag:     'BONK (at least this one was real)',
      tradingStyle:   'Accidental Genius',
      advice:         'Whatever you\'re doing — don\'t think about it too hard. You will jinx it the moment you become self-aware.',
      nftEquivalent:  'You are the Okay Bears of traders — inexplicably survived the bear market.',
    },
    {
      persona:        'Overly Cautious Diamond Hands',
      roast:          'You bought SOL at $20 and you\'re still holding your LUNA from the first collapse because "it could come back". Your stop-loss strategy is "check the price every 3 days". You once turned down a 5x because the chart looked "a bit toppy". You have $40K in unrealized losses that you refuse to call losses.',
      portfolioScore: 28,
      winRate:        '18%',
      rugCount:       3,
      biggestBag:     'LUNA Classic (at your cost basis)',
      tradingStyle:   'Diamond Hands',
      advice:         'Cutting a loss IS a decision. Doing nothing is also a decision — a bad one. LUNA is not coming back.',
      nftEquivalent:  'You are the CryptoPunks of traders — refusing to sell because of nostalgia.',
    },
  ];

  return roasts[tier];
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }

    // Simulate fetching on-chain data (in production: call Helius API here)
    // For now we pass just the address — Claude invents a plausible history
    // When HELIUS_API_KEY is set, this would inject real token names and trade history
    const hasHelius   = Boolean(process.env.HELIUS_API_KEY);
    let realTxContext = '';

    if (hasHelius) {
      try {
        // Fetch last 10 transactions from Helius
        const heliusRes = await fetch(
          `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=10&type=SWAP`
        );
        if (heliusRes.ok) {
          const txData = await heliusRes.json() as Array<{ description?: string }>;
          const summaries = txData
            .slice(0, 5)
            .map((tx) => tx.description ?? '')
            .filter(Boolean);
          if (summaries.length > 0) {
            realTxContext = `\n\nReal transaction history (last 5 swaps):\n${summaries.join('\n')}`;
          }
        }
      } catch {
        // Helius call failed — proceed without real data
      }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { anthropic }      = await import('@ai-sdk/anthropic');
        const { generateObject } = await import('ai');
        const { z }              = await import('zod');

        // Simulate latency for "deep scan" UX
        await new Promise(r => setTimeout(r, 800));

        const { object } = await generateObject({
          model: anthropic('claude-3-5-sonnet-20241022'),
          schema: z.object({
            persona: z.string().describe('An RPG-style title for this trader. Examples: "Exit Liquidity Provider", "Chaotic Neutral Degen", "Paper-Hand Patrician", "Accidental Genius". Be creative and specific to their history.'),
            roast:   z.string().describe('3-4 sentences: brutal, hilarious, deeply personal roast of their trading history. Reference specific crypto disasters (LUNA, FTX, rugs, buying tops). Make it shareable.'),
            portfolioScore:  z.number().int().min(0).max(100).describe('Overall portfolio quality score 0-100. 0=complete disaster, 100=sigma trading god. Most wallets score 15-45.'),
            winRate:         z.string().describe('Realistic (usually low) win rate percentage as a string, e.g. "12%". Rarely above 35%.'),
            rugCount:        z.number().int().min(0).max(30).describe('How many rug pulls they\'ve experienced. Random between 3-20 for a normal degen.'),
            biggestBag:      z.string().describe('The name of a dead, embarrassing, or funny meme coin they probably still hold. Be specific.'),
            tradingStyle: z.enum(['Diamond Hands', 'Paper Hands', 'Ape Brain', 'Contrarian', 'Sniper', 'Bot Fodder', 'Exit Liquidity Provider', 'Accidental Genius']),
            advice: z.string().describe('1 sentence of genuinely useful trading advice delivered in a funny, crypto-native way. Actually helpful, just wrapped in roast energy.'),
            nftEquivalent: z.string().describe('Complete the sentence: "You are the [famous NFT collection] of traders because [funny comparison]."'),
          }),
          prompt: `You are MoonFluxx AI Wallet Roaster — the most ruthless, funny, and accurate crypto personality analyst on Solana. You have deep knowledge of crypto disasters (LUNA, FTX, SafeMoon, every dog coin pump & dump).

Wallet address: ${address}${realTxContext}

Roast this wallet holder. Invent a completely plausible but devastating trading history. Reference real events they probably suffered through. Make it highly shareable — the kind of roast people screenshot and post on X. Be brutal but not mean-spirited — more "Comedy Central roast" than "personal attack". The advice should be ACTUALLY useful.`,
        });

        return NextResponse.json(object as WalletRoast);
      } catch (err) {
        console.warn('[roast-wallet] Claude failed, using mock:', err);
        await new Promise(r => setTimeout(r, 1500)); // maintain "scanning" UX
        return NextResponse.json(buildMockRoast(address));
      }
    }

    // No API key — deterministic mock with dramatic delay
    await new Promise(r => setTimeout(r, 2200));
    return NextResponse.json(buildMockRoast(address));

  } catch (error) {
    console.error('[roast-wallet] Unhandled error:', error);
    return NextResponse.json({ error: 'Failed to roast wallet' }, { status: 500 });
  }
}
