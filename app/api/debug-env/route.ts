import { NextResponse } from 'next/server';
import { isAIConfigured, aiGenerate, MODELS } from '@/lib/ai';

export async function GET() {
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
    hasNvidiaKey: !!process.env.NVIDIA_API_KEY,
    smartTestError,
    smartTestResult
  });
}
