import { NextRequest, NextResponse } from "next/server";
import { upsertUser, getUserByWallet, updateUserProfile } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/profile?wallet=<address>
 * Fetches user profile + their created tokens + trade stats from Supabase.
 */
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  if (!isSupabaseConfigured) {
    return NextResponse.json({ user: null, tokens: [], trades: [], stats: null });
  }

  // Upsert user (creates if first visit)
  await upsertUser(wallet);
  const user = await getUserByWallet(wallet);

  // Fetch tokens created by this user
  const { data: tokens } = await (supabase as any)
    .from("tokens")
    .select("*")
    .eq("creator_id", user?.id || "")
    .order("created_at", { ascending: false });

  // Fetch user's trades
  const { data: trades } = await (supabase as any)
    .from("trades")
    .select("*, tokens!token_id(name, ticker, mint_address)")
    .eq("wallet_address", wallet)
    .order("created_at", { ascending: false })
    .limit(50);

  // Compute trade stats
  const allTrades = trades || [];
  const buys = allTrades.filter((t: any) => t.type === "buy");
  const sells = allTrades.filter((t: any) => t.type === "sell");
  const totalVolume = allTrades.reduce((s: number, t: any) => s + (t.sol_amount || 0), 0);
  const totalBuyValue = buys.reduce((s: number, t: any) => s + (t.sol_amount || 0), 0);
  const totalSellValue = sells.reduce((s: number, t: any) => s + (t.sol_amount || 0), 0);
  const pnlSol = totalSellValue - totalBuyValue;

  const stats = {
    totalTrades: allTrades.length,
    totalBuys: buys.length,
    totalSells: sells.length,
    totalVolumeSol: parseFloat(totalVolume.toFixed(4)),
    pnlSol: parseFloat(pnlSol.toFixed(4)),
    tokensLaunched: (tokens || []).length,
  };

  return NextResponse.json({
    user,
    tokens: tokens || [],
    trades: allTrades,
    stats,
  });
}

/**
 * POST /api/profile
 * Updates user profile (username, bio, twitter, avatar).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, username, bio, twitter_handle, avatar_url } = body;

    if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

    if (!isSupabaseConfigured) {
      return NextResponse.json({ user: null });
    }

    // Ensure user exists
    await upsertUser(wallet);

    // Update profile
    const user = await updateUserProfile(wallet, {
      ...(username !== undefined && { username }),
      ...(bio !== undefined && { bio }),
      ...(twitter_handle !== undefined && { twitter_handle }),
      ...(avatar_url !== undefined && { avatar_url }),
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
