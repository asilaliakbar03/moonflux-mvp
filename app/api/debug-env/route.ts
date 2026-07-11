import { NextResponse } from 'next/server';
import { isAIConfigured, aiGenerate } from '@/lib/ai';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  let aiTestResult = null;
  let aiTestError = null;

  if (isAIConfigured()) {
    try {
      const result = await aiGenerate({
        system: "You are a test bot.",
        prompt: "Say hello and return a JSON object like {'hello': 'world'}",
        maxTokens: 50,
      });
      aiTestResult = result;
    } catch (e: any) {
      aiTestError = e.message;
    }
  }

  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    keyPresent: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key?.substring(0, 12) ?? 'NOT_SET',
    aiTestResult,
    aiTestError
  });
}
