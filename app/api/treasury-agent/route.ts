import { NextRequest, NextResponse } from "next/server";
import { aiChat, isAIConfigured, MODELS } from '@/lib/ai';

export const maxDuration = 30;

interface AgentAction { type: string; description: string; confidence: number; }

interface RequestBody { message: string; context?: { proposals?: unknown[]; treasury?: unknown; }; }

function getMockResponse(msg: string): { response: string; actions?: AgentAction[] } {
  const lower = msg.toLowerCase();
  if (lower.includes("analyze") || (lower.includes("proposal") && !lower.includes("draft"))) {
    return { response: "ZK-Rollup integration has 78% support — above the 75% threshold for auto-execution. I recommend scheduling the on-chain transaction for tomorrow at 00:00 UTC to maximize voter participation. Expected gas: ~0.02 SOL.", actions: [{ type: "Execute", description: "Schedule ZK-Rollup vote execution", confidence: 78 }] };
  }
  if (lower.includes("treasury") || lower.includes("health")) {
    return { response: "Treasury at $4.2M — excellent health. Protocol revenue of $48K/month exceeds burn rate by 3.9x. I recommend deploying $840K (20%) into Marinade Finance for ~7.2% APY staking yield while maintaining governance liquidity.", actions: [{ type: "Monitor", description: "Track Marinade Finance yield opportunities", confidence: 91 }] };
  }
  if (lower.includes("vote") || lower.includes("simulate")) {
    return { response: "Simulation: if current voting velocity holds, ZK-Rollup passes in 31h with 81% FOR. APY increase has only 19h remaining and needs 1,240 more FOR votes to hit quorum — unlikely at current rate. Recommend community alert.", actions: [{ type: "Monitor", description: "Alert community on APY proposal quorum shortfall", confidence: 94 }] };
  }
  if (lower.includes("draft") || lower.includes("counter")) {
    return { response: "Drafted: Reduce Launch Fee to 0.003 SOL (compromise position between 0.005 requested and current 0.01). Rationale: lower barrier grows protocol volume +34% based on historical data from Pump.fun fee reduction. Ready to submit for vote.", actions: [{ type: "Draft", description: "Counter-proposal: reduce launch fee to 0.003 SOL", confidence: 71 }] };
  }
  return { response: "Analyzing all active governance data... 3 proposals near resolution threshold. Treasury efficiency ratio: 94/100. No critical risks detected. All autonomous safeguards active." };
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { message, context } = body;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    if (isAIConfigured()) {
      try {
        const systemPrompt = "You are the MoonFluxx Autonomous Treasury Agent. You are a razor-sharp DAO governance AI. You analyze proposals, model vote outcomes, check treasury health, and make autonomous recommendations. You are decisive, quantitative, and crypto-native. Keep responses under 4 sentences.";
        const contextSummary = context ? `\n\nContext: ${JSON.stringify(context)}` : "";

        const { text } = await aiChat({
          system: systemPrompt,
          prompt: message + contextSummary,
          model: MODELS.FAST,
          temperature: 0.3,
          maxTokens: 300,
        });

        return NextResponse.json({ response: text });
      } catch (err) {
        console.warn('[treasury-agent] AI failed, using mock:', err);
      }
    }
    const mock = getMockResponse(message);
    return NextResponse.json(mock);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
