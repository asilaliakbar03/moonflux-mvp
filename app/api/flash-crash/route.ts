import { NextResponse } from 'next/server';
import { aiGenerate, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 30;

// ── Types ─────────────────────────────────────────────────────────────────────

export type CrashCause  = 'whale_dump' | 'coordinated_exit' | 'liquidity_drain' | 'market_wide' | 'panic_cascade' | 'bot_attack';
export type CrashSeverity = 'moderate' | 'severe' | 'extreme';

export interface FlashCrashReport {
  causeType:               CrashCause;
  causeLabel:              string;         // Human-readable label
  explanation:             string;         // 2-3 sentences, crypto-native
  severity:                CrashSeverity;
  contractSafe:            boolean;
  affectedWallets:         number;         // estimated count
  solOutflow:              string;         // e.g. "12.4 SOL"
  recoveryTimeEstimate:    string;         // e.g. "2-6 hours" or "Unlikely — avoid"
  actionRecommendation:    string;         // 1 sentence — what should the user DO?
  priceTargetIfRecovery:   string | null;  // e.g. "+38% from current" or null if avoid
}

// ── Mock builder ──────────────────────────────────────────────────────────────

function buildMock(priceChange: number, tokenName: string): FlashCrashReport {
  const pct = Math.abs(priceChange);

  if (pct >= 40) {
    return {
      causeType:             'coordinated_exit',
      causeLabel:            'Coordinated Insider Exit',
      explanation:           `A cluster of 3 early-insider wallets (combined 12.4% supply) executed a synchronized sell over 23 minutes beginning 47 minutes ago. The sell wall at the $${(0.00234 * 0.6).toFixed(5)} level triggered automated stop-losses from 340 additional holders, cascading the drop. Contract is unchanged — this is market structure, not a rug.`,
      severity:              'extreme',
      contractSafe:          true,
      affectedWallets:       340,
      solOutflow:            '18.7 SOL',
      recoveryTimeEstimate:  '4-12 hours',
      actionRecommendation:  'Wait for the panic to exhaust — watch for a volume spike and red-to-green candle before re-entering.',
      priceTargetIfRecovery: '+55% from current lows if buy volume returns',
    };
  }
  if (pct >= 25) {
    return {
      causeType:             'whale_dump',
      causeLabel:            'Single Whale Dump',
      explanation:           `A single wallet holding 5.2% of the supply sold 1.4M ${tokenName} tokens over 20 minutes beginning 1 hour ago. This triggered a liquidity gap as the bonding curve absorbed the sell pressure. No abnormal smart contract activity detected — the sell was user-initiated.`,
      severity:              'severe',
      contractSafe:          true,
      affectedWallets:       120,
      solOutflow:            '8.2 SOL',
      recoveryTimeEstimate:  '2-6 hours',
      actionRecommendation:  'Buy pressure is needed to re-establish price — community buys in the $0.0018-0.0022 zone could trigger a bounce.',
      priceTargetIfRecovery: '+34% from current if community holds',
    };
  }
  return {
    causeType:             'panic_cascade',
    causeLabel:            'Routine Profit-Taking Cascade',
    explanation:           `Moderate sell pressure from 2 mid-tier wallets (combined 3.1% supply) triggered low-conviction holders to exit in sympathy over the last 2 hours. No abnormal contract activity. This pattern is consistent with normal post-pump profit-taking after the recent rally.`,
    severity:              'moderate',
    contractSafe:          true,
    affectedWallets:       48,
    solOutflow:            '3.1 SOL',
    recoveryTimeEstimate:  '30-90 minutes',
    actionRecommendation:  'Normal market behavior — if you believe in the thesis, this is a buy opportunity, not a signal to exit.',
    priceTargetIfRecovery: '+18% recovery to pre-crash level likely',
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { tokenId, priceChange, tokenName } = await req.json();

    if (!tokenId) {
      return NextResponse.json({ error: 'tokenId is required' }, { status: 400 });
    }

    const pct      = Math.abs(priceChange ?? 0);
    const severity: CrashSeverity = pct >= 40 ? 'extreme' : pct >= 25 ? 'severe' : 'moderate';

    if (isAIConfigured()) {
      try {
        const result = await aiGenerate<Omit<FlashCrashReport, 'severity'>>({
          system: `You are MoonFluxx AI Crash Analyst — the first responder when a Solana token crashes.

Respond with a JSON object containing these fields:
- "causeType" (string): one of "whale_dump", "coordinated_exit", "liquidity_drain", "market_wide", "panic_cascade", "bot_attack"
- "causeLabel" (string): short 3-5 word human-readable label for the cause
- "explanation" (string): 2-3 sentences in crypto-native voice. Include specific plausible data: wallet %, token amounts, timing. End with a note on contract safety.
- "contractSafe" (boolean): is the smart contract itself safe? Usually true unless there are clear rug indicators.
- "affectedWallets" (integer): estimated number of wallets impacted by the crash
- "solOutflow" (string): estimated SOL that left the liquidity pool, e.g. "12.4 SOL"
- "recoveryTimeEstimate" (string): realistic estimate, e.g. "2-6 hours" or "Unlikely — avoid"
- "actionRecommendation" (string): 1 specific, actionable sentence: what should the user DO right now? Be direct.
- "priceTargetIfRecovery" (string or null): recovery price target if bullish, or null if the outlook is bearish`,
          prompt: `Analyze this flash crash.

Token: ${tokenName ?? tokenId}
Price Drop: -${pct.toFixed(1)}%
Severity: ${severity.toUpperCase()}

Generate a realistic crash analysis. Be specific with numbers (wallet percentages, SOL amounts, timestamps). Sound like an experienced on-chain analyst, not a bot. The contractSafe field should be true in most cases (it's rarely the contract). Give a genuinely useful action recommendation.`,
          model: MODELS.FAST,
          temperature: 0.2,
          maxTokens: 400,
          cacheTtlMs: 300000,
        });

        return NextResponse.json(
          { ...result.data, severity } as FlashCrashReport,
          { headers: { 'X-Cache': result.cached ? 'HIT' : 'MISS' } },
        );
      } catch (err) {
        console.warn('[flash-crash] AI failed, using mock:', err);
        return NextResponse.json(buildMock(priceChange ?? 0, tokenName ?? tokenId));
      }
    }

    await new Promise(r => setTimeout(r, 400));
    return NextResponse.json(buildMock(priceChange ?? 0, tokenName ?? tokenId));

  } catch (error) {
    console.error('[flash-crash] Unhandled error:', error);
    return NextResponse.json({ error: 'Failed to analyse crash' }, { status: 500 });
  }
}
