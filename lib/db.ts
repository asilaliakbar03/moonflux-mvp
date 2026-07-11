/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase as _supabase, isSupabaseConfigured } from "./supabase";

// Cast to any — our manual Database type doesn't perfectly align with Supabase's
// internal generics. All functions have explicit return types for safety.
const db = _supabase as any;

// ── USERS ──────────────────────────────────────────────────────────────────────

/**
 * Upsert a user when they connect their wallet.
 * Creates a new record if first time, updates last_seen if returning.
 */
export async function upsertUser(walletAddress: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("users")
    .upsert(
      {
        wallet_address: walletAddress,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "wallet_address",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error("[db] upsertUser error:", error.message);
    return null;
  }
  return data;
}

/**
 * Get a user profile by wallet address.
 */
export async function getUserByWallet(walletAddress: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error) return null;
  return data;
}

/**
 * Update user profile fields (username, bio, twitter etc.)
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: { username?: string; bio?: string; twitter_handle?: string; avatar_url?: string }
) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("wallet_address", walletAddress)
    .select()
    .single();

  if (error) {
    console.error("[db] updateUserProfile error:", error.message);
    return null;
  }
  return data;
}

// ── TOKENS ────────────────────────────────────────────────────────────────────

/**
 * Get all tokens launched on the platform, sorted by newest first.
 */
export async function getAllTokens(limit = 50) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await db
    .from("tokens")
    .select("*, users!creator_id(username, wallet_address)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

/**
 * Get a single token by ID.
 */
export async function getToken(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("tokens")
    .select("*, users!creator_id(username, wallet_address)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get trending tokens (highest volume in last 24h via trades table).
 */
export async function getTrendingTokens(limit = 10) {
  if (!isSupabaseConfigured) return [];
  // Join with trades to get 24h volume
  const { data, error } = await db
    .from("tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

/**
 * Create a new token record (called after successful on-chain launch).
 */
export async function createToken(token: {
  mint_address: string;
  name: string;
  ticker: string;
  icon: string;
  description: string;
  creator_id: string;
  category: string;
  metadata_uri?: string;
}) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("tokens")
    .insert(token)
    .select()
    .single();

  if (error) {
    console.error("[db] createToken error:", error.message);
    return null;
  }
  return data;
}

// ── TRADES ────────────────────────────────────────────────────────────────────

/**
 * Record a trade (called after confirmed Solana transaction).
 */
export async function recordTrade(trade: {
  token_id: string;
  wallet_address: string;
  type: "buy" | "sell";
  sol_amount: number;
  token_amount: number;
  price_usd: number;
  tx_signature: string;
}) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("trades")
    .insert(trade)
    .select()
    .single();

  if (error) {
    console.error("[db] recordTrade error:", error.message);
    return null;
  }
  return data;
}

/**
 * Get recent trades for a token (for the live feed on token detail page).
 */
export async function getTokenTrades(tokenId: string, limit = 20) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await db
    .from("trades")
    .select("*, users!wallet_address(username)")
    .eq("token_id", tokenId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * Post a comment on a token.
 */
export async function postComment(tokenId: string, userId: string, text: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("comments")
    .insert({ token_id: tokenId, user_id: userId, text })
    .select()
    .single();

  if (error) {
    console.error("[db] postComment error:", error.message);
    return null;
  }
  return data;
}

/**
 * Get comments for a token, newest first.
 */
export async function getTokenComments(tokenId: string, limit = 50) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await db
    .from("comments")
    .select("*, users!user_id(username, wallet_address)")
    .eq("token_id", tokenId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

// ── PRICE ALERTS ──────────────────────────────────────────────────────────────

/**
 * Save a user's price alerts to the DB (syncs from local state).
 */
export async function saveAlert(alert: {
  user_id: string;
  token_id: string;
  condition: "above" | "below";
  target_price: number;
}) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await db
    .from("price_alerts")
    .insert(alert)
    .select()
    .single();

  if (error) return null;
  return data;
}

/**
 * Get all active alerts for a user.
 */
export async function getUserAlerts(userId: string) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await db
    .from("price_alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);

  if (error) return [];
  return data;
}

// ── WATCHLIST ─────────────────────────────────────────────────────────────────

export async function addToWatchlist(userId: string, tokenId: string) {
  if (!isSupabaseConfigured) return null;
  const { error } = await db
    .from("watchlist")
    .upsert({ user_id: userId, token_id: tokenId }, { onConflict: "user_id,token_id" });
  return error ? null : true;
}

export async function removeFromWatchlist(userId: string, tokenId: string) {
  if (!isSupabaseConfigured) return null;
  const { error } = await db
    .from("watchlist")
    .delete()
    .match({ user_id: userId, token_id: tokenId });
  return error ? null : true;
}

export async function getUserWatchlist(userId: string) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await db
    .from("watchlist")
    .select("*, tokens(*)")
    .eq("user_id", userId);
  if (error) return [];
  return data;
}
