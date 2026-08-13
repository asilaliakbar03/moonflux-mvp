import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/record-trade
 * Records a confirmed on-chain trade to Supabase for analytics/activity feed.
 */
export async function POST(req: NextRequest) {
  try {
    const { mint, wallet, type, solAmount, tokenAmount, txSignature } = await req.json();

    if (!mint || !wallet || !type || !txSignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ recorded: false, reason: "supabase not configured" });
    }

    // Get token ID from mint
    const { data: token } = await (supabase as any)
      .from("tokens")
      .select("id")
      .eq("mint_address", mint)
      .single();

    if (!token) {
      return NextResponse.json({ recorded: false, reason: "token not found in db" });
    }

    // Record the trade
    const { error } = await (supabase as any)
      .from("trades")
      .insert({
        token_id: token.id,
        wallet_address: wallet,
        type,
        sol_amount: solAmount,
        token_amount: tokenAmount,
        price_usd: 0, // Can be enriched later with SOL price
        tx_signature: txSignature,
      });

    if (error) {
      // Duplicate tx_signature is OK (idempotent)
      if (error.code === "23505") {
        return NextResponse.json({ recorded: true, duplicate: true });
      }
      console.error("[record-trade] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recorded: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
