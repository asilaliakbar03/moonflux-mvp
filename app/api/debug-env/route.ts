import { NextResponse } from 'next/server';
import { isAIConfigured, aiGenerate, MODELS } from '@/lib/ai';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  let fastTestResult = null;
  let fastTestError = null;
  let smartTestResult = null;
  let smartTestError = null;

  if (isAIConfigured()) {
    try {
      fastTestResult = await aiGenerate({
        system: "Test",
        prompt: "Say 1",
        maxTokens: 5,
        model: MODELS.FAST
      });
    } catch (e: any) {
      fastTestError = e.message;
    }
    try {
      smartTestResult = await aiGenerate({
        system: "Test",
        prompt: "Say 1",
        maxTokens: 5,
        model: MODELS.SMART
      });
    } catch (e: any) {
      smartTestError = e.message;
    }
  }

  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    keyLength: key?.length ?? 0,
    fastTestError,
    smartTestError,
    fastTestResult,
    smartTestResult
  });
}
