/**
 * lib/ai.ts — Centralized AI client for MoonFluxx
 * 
 * Uses OpenRouter API (OpenAI-compatible) to route to Claude models.
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
  // Simple hash — normalize whitespace and lowercase for dedup
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
  // Cap cache at 100 entries to prevent memory bloat
  if (cache.size >= 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Models ───────────────────────────────────────────────────────────────────
export const MODELS = {
  /** Fast, cheap — for interactive/real-time features */
  FAST: 'anthropic/claude-3-haiku',
  /** Smart, still cheap — for generation-heavy features */
  SMART: 'anthropic/claude-3.5-sonnet',
} as const;

export type ModelId = typeof MODELS[keyof typeof MODELS];

// ── Configuration ────────────────────────────────────────────────────────────
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null;
}

export function isAIConfigured(): boolean {
  const key = getApiKey();
  return !!key && !key.includes('YOUR_') && key.length > 10;
}

// ── Core AI Call ─────────────────────────────────────────────────────────────
export interface AIRequestOptions {
  /** System prompt */
  system: string;
  /** User prompt */
  prompt: string;
  /** Model to use (default: FAST) */
  model?: ModelId;
  /** Temperature 0-1 (default: 0.3) */
  temperature?: number;
  /** Max output tokens (default: 800) */
  maxTokens?: number;
  /** Cache TTL in ms (default: 1 hour, set 0 to skip caching) */
  cacheTtlMs?: number;
  /** Skip cache lookup (force fresh) */
  skipCache?: boolean;
}

export interface AIResponse<T = unknown> {
  data: T;
  cached: boolean;
  model: string;
  tokensUsed?: number;
}

/**
 * Send a single request to the AI and get structured JSON back.
 * Caches responses by default.
 */
export async function aiGenerate<T = unknown>(
  options: AIRequestOptions
): Promise<AIResponse<T>> {
  const {
    system,
    prompt,
    model = MODELS.FAST,
    temperature = 0.3,
    maxTokens = 800,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    skipCache = false,
  } = options;

  // ── Check cache first ──────────────────────────────────────────────────────
  const cacheKey = getCacheKey(`${system}${prompt}`, model);
  if (!skipCache && cacheTtlMs > 0) {
    const cached = getFromCache<T>(cacheKey);
    if (cached !== null) {
      return { data: cached, cached: true, model };
    }
  }

  // ── Check API key ─────────────────────────────────────────────────────────
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  // ── Call OpenRouter ───────────────────────────────────────────────────────
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://moonflux-mvp.vercel.app',
      'X-Title': 'MoonFluxx',
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${system}\n\nIMPORTANT: Always respond with valid JSON only. No markdown, no code fences, no extra text.` },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('AI returned empty response');
  }

  // ── Parse JSON from response ──────────────────────────────────────────────
  let parsed: T;
  try {
    // Try direct parse first
    parsed = JSON.parse(content) as T;
  } catch {
    // Try extracting JSON from markdown code fence
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1].trim()) as T;
    } else {
      throw new Error(`Failed to parse AI JSON response: ${content.slice(0, 200)}`);
    }
  }

  // ── Cache result ──────────────────────────────────────────────────────────
  if (cacheTtlMs > 0) {
    setCache(cacheKey, parsed, cacheTtlMs);
  }

  const tokensUsed = result.usage?.total_tokens;
  return { data: parsed, cached: false, model, tokensUsed };
}

/**
 * Send a chat-style request (for conversational features like trade-copilot).
 * Returns raw text, not JSON.
 */
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
  if (!apiKey) throw new Error('AI_NOT_CONFIGURED');

  const messages = [
    { role: 'system' as const, content: system },
    ...history,
    { role: 'user' as const, content: prompt },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://moonflux-mvp.vercel.app',
      'X-Title': 'MoonFluxx',
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content || '';
  const tokensUsed = result.usage?.total_tokens;

  return { text, cached: false, tokensUsed };
}
