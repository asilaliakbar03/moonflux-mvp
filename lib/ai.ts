/**
 * lib/ai.ts — Centralized AI client for MoonFluxx
 * 
 * Uses Aerolink.lat (Anthropic-compatible proxy) to route to Claude models.
 * Features:
 * - In-memory response caching with configurable TTL
 * - Structured JSON output
 * - Low temperature for predictable results
 * - Single entry point for all AI calls
 */

// ── Cache ────────────────────────────────────────────────────────────────────
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(prompt: string, model: string): string {
  const normalized = `${model}:${prompt.replace(/\s+/g, ' ').trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `ai_${hash}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number = DEFAULT_CACHE_TTL_MS): void {
  if (cache.size >= 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Models ───────────────────────────────────────────────────────────────────
export const MODELS = {
  FAST: 'claude-haiku-4-5-20251001',
  SMART: 'claude-sonnet-5',
} as const;

export type ModelId = typeof MODELS[keyof typeof MODELS];

// ── Configuration ────────────────────────────────────────────────────────────
const AEROLINK_URL = 'https://capi.aerolink.lat/v1/messages';

// User provided specific aero_live key as a fallback
function getApiKey(): string {
  return process.env.AEROLINK_API_KEY || "aero_live_CGrq5c0ufYyE34VA65I_KvspqjHbntBL8ZA_yKDhfHg";
}

export function isAIConfigured(): boolean {
  return true; // We always have the fallback key now
}

// ── Core AI Call ─────────────────────────────────────────────────────────────
export interface AIRequestOptions {
  system: string;
  prompt: string;
  model?: ModelId;
  temperature?: number;
  maxTokens?: number;
  cacheTtlMs?: number;
  skipCache?: boolean;
}

export interface AIResponse<T = unknown> {
  data: T;
  cached: boolean;
  model: string;
  tokensUsed?: number;
}

export async function aiGenerate<T = unknown>(
  options: AIRequestOptions
): Promise<AIResponse<T>> {
  const {
    system,
    prompt,
    model = MODELS.FAST,
    temperature = 0.3,
    maxTokens = 4000,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    skipCache = false,
  } = options;

  const cacheKey = getCacheKey(`${system}${prompt}`, model);
  if (!skipCache && cacheTtlMs > 0) {
    const cached = getFromCache<T>(cacheKey);
    if (cached !== null) {
      return { data: cached, cached: true, model };
    }
  }

  const apiKey = getApiKey();

  const response = await fetch(AEROLINK_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity'
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      system: `${system}\n\nIMPORTANT: Always respond with valid JSON only. No markdown, no code fences, no extra text.`,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const textBlock = result.content?.find((c: any) => c.type === 'text');
  const content = textBlock?.text;
  
  if (!content) {
    throw new Error(`AI returned empty response. Raw: ${JSON.stringify(result)}`);
  }

  let parsed: T;
  try {
    parsed = JSON.parse(content) as T;
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        throw new Error(`Failed to parse AI JSON response. Raw string: ${content}`);
      }
    } else {
      throw new Error(`Failed to parse AI JSON response. Raw string: ${content}`);
    }
  }

  if (cacheTtlMs > 0) {
    setCache(cacheKey, parsed, cacheTtlMs);
  }

  const tokensUsed = result.usage?.input_tokens + result.usage?.output_tokens;
  return { data: parsed, cached: false, model, tokensUsed };
}

export async function aiChat(
  options: AIRequestOptions & { history?: Array<{ role: 'user' | 'assistant'; content: string }> }
): Promise<{ text: string; cached: boolean; tokensUsed?: number }> {
  const {
    system,
    prompt,
    model = MODELS.FAST,
    temperature = 0.3,
    maxTokens = 300,
    history = [],
  } = options;

  const apiKey = getApiKey();

  const messages = [
    ...history,
    { role: 'user' as const, content: prompt },
  ];

  const response = await fetch(AEROLINK_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity'
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const textBlock = result.content?.find((c: any) => c.type === 'text');
  const text = textBlock?.text || '';
  const tokensUsed = result.usage?.input_tokens + result.usage?.output_tokens;

  return { text, cached: false, tokensUsed };
}
