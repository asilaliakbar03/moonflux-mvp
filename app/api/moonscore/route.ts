import { NextRequest, NextResponse } from 'next/server';
import { aiGenerate, MODELS } from '@/lib/ai';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mint = searchParams.get('mint');

  if (!mint) {
    return NextResponse.json(
      { error: 'Missing mint address' },
      { status: 400 }
    );
  }

  try {
    const prompt = `
      You are an expert Solana token evaluator. The user has provided a token mint address: "${mint}".
      Please generate a deterministic but realistic MoonScore evaluation for this specific token address.
      Consider the characters in the address to formulate consistent scores.
      You must respond ONLY with a valid JSON object matching this schema:
      {
        "score": number (0-100),
        "community": number (0-100),
        "liquidity": number (0-100),
        "growth": number (0-100),
        "security": number (0-100),
        "lastUpdated": string (ISO 8601 timestamp for today)
      }
      Do not include any other text, markdown formatting, or explanations. Just the raw JSON object.
    `;

    const { data: aiResponse } = await aiGenerate({
      system: 'You are a crypto token scoring expert. Respond with valid JSON only.',
      prompt,
      model: MODELS.FAST,
      maxTokens: 300,
    });

    // Clean up potential markdown formatting in case the AI added it
    const raw = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
    const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error generating MoonScore:', error);
    // Fallback deterministic score logic if AI fails
    const seed = mint.charCodeAt(0) + mint.charCodeAt(mint.length - 1);
    const fakeScore = 30 + (seed % 60); // 30-90 range
    
    return NextResponse.json({
      score: fakeScore,
      community: Math.min(100, fakeScore + (seed % 15)),
      liquidity: Math.max(0, fakeScore - (seed % 10)),
      growth: fakeScore,
      security: Math.min(100, fakeScore + (seed % 5)),
      lastUpdated: new Date().toISOString(),
    });
  }
}
