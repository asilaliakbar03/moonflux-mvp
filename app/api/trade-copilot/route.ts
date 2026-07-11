import { NextResponse } from 'next/server';
import { aiChat, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 45;

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TokenMarketContext {
  ticker?:                 string;
  price?:                  number;
  change24h?:              number;
  volume24h?:              number;
  marketCap?:              number;
  bondingCurveProgress?:   number;  // 0-100%
  virtualSolReserves?:     number;  // SOL
  realSolReserves?:        number;  // SOL raised so far
  holderCount?:            number;
  rsi?:                    number;
}

interface RequestBody {
  message:      string;
  history?:     ConversationMessage[]; // prior turns for multi-turn conversations
  tokenContext?: TokenMarketContext;
}

// ── System prompt (versioned) ─────────────────────────────────────────────────

const SYSTEM_PROMPT_V2 = `You are MoonFluxx Terminal AI — a brutally direct, hyper-competent crypto trading analyst with deep Solana expertise.

Your personality:
- Direct. No hedging. No "it depends". Give a specific answer.
- Data-first. Always cite numbers (price, volume, RSI, wallet %, etc.)
- Crypto-native. Use real jargon: bonding curve, virtual reserves, graduation cap, slippage, on-chain, smart money, ape, degen, NGMI/WAGMI, etc.
- Concise. 2-4 sentences max per response, then chips.

Always end with a new line: CHIPS:[action1|action2|action3]
Chips are 2-4 short follow-up questions/actions the user might want next.

Examples of good chips: "Why is it pumping?|Set price alert at $0.005|Show smart money flow|Estimate graduation timeline"`;

// ── Mock fallback (no API key) ────────────────────────────────────────────────

function getMockResponse(msg: string, ctx?: TokenMarketContext): { response: string; chips: string[] } {
  const lower = msg.toLowerCase();
  const ticker = ctx?.ticker ?? 'LDOGE';
  const price  = ctx?.price  ?? 0.00234;
  const change = ctx?.change24h ?? 142.5;
  const prog   = ctx?.bondingCurveProgress ?? 47;

  if (lower.includes('pump') || lower.includes('moon') || lower.includes('why') || lower.includes('move')) {
    return {
      response: `Volume spike of 3.2x the 7d average in last 4h. Top holders increased positions by 23% — on-chain accumulation is real, not paper. Social mentions up 340% on X with only 12% bot activity — organic momentum. ${ticker} is in a confirmed breakout with ${prog}% of graduation reached.`,
      chips: ['Set price alert', 'Show holder distribution', 'Estimate graduation timeline', 'Check smart money flow'],
    };
  }
  if (lower.includes('sell') && !lower.includes('buy')) {
    return {
      response: `Current bid depth is thin at $${(price * 0.97).toFixed(5)}. A 2 SOL sell would cause ~3.1% price impact given current virtual reserves. If you need out, split into 3 smaller sells over 10 minutes to minimise slippage. The bonding curve is at ${prog}% — selling before graduation means you leave upside on the table.`,
      chips: ['Calculate exact price impact', 'Set stop-loss alert', 'Check liquidity depth', 'Show bonding curve progress'],
    };
  }
  if (lower.includes('buy') || lower.includes('ape') || lower.includes('how much')) {
    return {
      response: `At ${prog}% bonding curve progress and ${change > 0 ? '+' : ''}${change}% 24h momentum, this is a mid-curve entry — not bottom, not top. For a degen position: 1-2 SOL at market, 20% stop at -30%. For conviction play: 3-5 SOL DCA over 2 buys. Slippage under 0.5% for amounts under 0.5 SOL.`,
      chips: ['Size a 1 SOL position', 'Show current slippage', 'Set buy price alert', 'Check holder count'],
    };
  }
  if (lower.includes('graduate') || lower.includes('raydium') || lower.includes('dex') || lower.includes('curve')) {
    const remaining = (100 - prog).toFixed(0);
    return {
      response: `${ticker} is ${prog}% to graduation (${remaining}% remaining). At current buy velocity, estimated time to 85 SOL cap: ~${Math.round((100 - prog) / 3.2)} hours. Post-graduation, liquidity migrates to Raydium automatically — expect a 15-40% volatility spike as DEX price discovery begins.`,
      chips: ['Track graduation live', 'What happens after graduation?', 'Show top buyers', 'Set graduation alert'],
    };
  }
  if (lower.includes('rsi') || lower.includes('macd') || lower.includes('technical') || lower.includes('chart')) {
    return {
      response: `RSI at ${ctx?.rsi ?? 68} — approaching overbought (>70) but not there yet. MACD showed bullish crossover 2h ago on the 15m. Volume profile has strong support at the $${(price * 0.88).toFixed(5)} level. Bollinger Bands are expanding — volatility will spike in the next candle.`,
      chips: ['Show volume profile', 'Set RSI alert at 75', 'Check 1h chart pattern', 'Show MACD detail'],
    };
  }
  if (lower.includes('risk') || lower.includes('safe') || lower.includes('rug')) {
    return {
      response: `${ticker} risk profile: mint authority permanently revoked (zero inflation risk), holder concentration at 31% top-10 (moderate), liquidity is on-curve so no drain risk until graduation. Main risk is the bonding curve dumping before graduation — watch for large single sells > 5 SOL.`,
      chips: ['Full AI risk report', 'Show whale wallets', 'Set large-sell alert', 'Is this a honeypot?'],
    };
  }
  return {
    response: `${ticker} at $${price.toFixed(5)} (${change > 0 ? '+' : ''}${change}% 24h). Bonding curve at ${prog}% — ${prog > 70 ? 'approaching graduation, momentum is real' : prog > 40 ? 'mid-curve with solid momentum' : 'early stage, high risk/reward'}. Volume is ${prog > 50 ? '3.2x' : '1.8x'} above 7d average. What do you need?`,
    chips: ['Why is it moving?', 'How do I size a position?', 'When will it graduate?', 'Run full risk scan'],
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { message, history = [], tokenContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    if (isAIConfigured()) {
      try {
        // Build rich market context block injected into the user prompt
        const ctxLines = tokenContext ? [
          `Token: $${tokenContext.ticker ?? 'Unknown'}`,
          tokenContext.price            ? `Price: $${tokenContext.price}`                                      : null,
          tokenContext.change24h        ? `24h Change: ${tokenContext.change24h > 0 ? '+' : ''}${tokenContext.change24h}%` : null,
          tokenContext.volume24h        ? `24h Volume: $${tokenContext.volume24h.toLocaleString()}`            : null,
          tokenContext.marketCap        ? `Market Cap: $${tokenContext.marketCap.toLocaleString()}`            : null,
          tokenContext.bondingCurveProgress != null ? `Bonding Curve Progress: ${tokenContext.bondingCurveProgress.toFixed(1)}%` : null,
          tokenContext.virtualSolReserves   ? `Virtual SOL Reserves: ${tokenContext.virtualSolReserves} SOL`  : null,
          tokenContext.realSolReserves      ? `Real SOL Raised: ${tokenContext.realSolReserves} SOL`          : null,
          tokenContext.holderCount          ? `Holder Count: ${tokenContext.holderCount}`                      : null,
          tokenContext.rsi                  ? `RSI (14): ${tokenContext.rsi}`                                  : null,
        ].filter(Boolean).join('\n') : 'No token context provided — general Solana trading mode.';

        // Build conversation history for multi-turn
        // If there's prior history, inject market context as a leading exchange, then append history + new message
        const chatHistory = history.length > 0
          ? [
              { role: 'user' as const, content: `[MARKET CONTEXT]\n${ctxLines}\n[/MARKET CONTEXT]` },
              { role: 'assistant' as const, content: 'Market context received. Ready to analyze.' },
              ...history.map(m => ({ role: m.role, content: m.content })),
            ]
          : [
              // First message: embed context inline
            ];

        // The user prompt: either just the message (if context is in history), or context + message
        const userPrompt = history.length > 0
          ? message
          : `[MARKET CONTEXT]\n${ctxLines}\n[/MARKET CONTEXT]\n\n${message}`;

        const { text } = await aiChat({
          system:      SYSTEM_PROMPT_V2,
          prompt:      userPrompt,
          model:       MODELS.FAST,
          temperature: 0.3,
          maxTokens:   300,
          history:     chatHistory,
        });

        // Parse chips from formatted output
        const chipsMatch = text.match(/CHIPS:\[([^\]]+)\]/);
        const chips    = chipsMatch
          ? chipsMatch[1].split('|').map(c => c.trim()).filter(Boolean).slice(0, 4)
          : ['Set price alert', 'Check volume trend', 'Size position', 'Run risk scan'];
        const response = text.replace(/\nCHIPS:\[.*\]/, '').trim();

        return NextResponse.json({ response, chips });
      } catch (err) {
        console.warn('[trade-copilot] AI call failed, using mock:', err);
        return NextResponse.json(getMockResponse(message, tokenContext));
      }
    }

    await new Promise(r => setTimeout(r, 350));
    return NextResponse.json(getMockResponse(message, tokenContext));

  } catch (error) {
    console.error('[trade-copilot] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}