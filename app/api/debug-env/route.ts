import { NextResponse } from 'next/server';
import { isAIConfigured } from '@/lib/ai';

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    keyPresent: !!key,
    keyLength: key?.length ?? 0,
    keyPrefix: key?.substring(0, 12) ?? 'NOT_SET',
  });
}
