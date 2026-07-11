import { NextResponse } from 'next/server';
import { isAIConfigured, aiGenerate, MODELS } from '@/lib/ai';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  let smartTestResult = null;
  let smartTestError = null;

  if (isAIConfigured()) {
    try {
      smartTestResult = await aiGenerate({
        system: "You are a test bot.",
        prompt: "Say hello and return a JSON object with a single key 'hello' and value 'world'. No markdown, no quotes outside JSON.",
        maxTokens: 50,
        model: MODELS.SMART
      });
    } catch (e: any) {
      smartTestError = e.message;
    }
  }

  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    smartTestError,
    smartTestResult
  });
}
