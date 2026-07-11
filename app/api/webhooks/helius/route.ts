import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { HeliusEnrichedTransaction, parseMoonfluxTrade } from "@/lib/helius";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { PROGRAM_ID } from "@/lib/program";

// The Helius webhook secret used to verify incoming requests
const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // 1. Verify the webhook secret (if set in environment)
    if (HELIUS_WEBHOOK_SECRET) {
      const headerList = await headers();
      const authHeader = headerList.get("authorization");
      if (authHeader !== HELIUS_WEBHOOK_SECRET) {
        console.warn("[Webhook] Unauthorized request attempt.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn("[Webhook] Warning: HELIUS_WEBHOOK_SECRET not set. Skipping auth check.");
    }

    const payload: HeliusEnrichedTransaction[] = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      console.warn("[Webhook] Supabase is not configured. Received payload, but cannot write to DB.");
      return NextResponse.json({ success: true, message: "Webhook received but DB disabled." });
    }

    const supabase = createServiceClient();
    let processedCount = 0;

    // 2. Process each transaction in the payload
    for (const tx of payload) {
      const trade = parseMoonfluxTrade(tx, PROGRAM_ID.toBase58());
      
      if (trade) {
        // Fetch the corresponding token id from the database using the mint address
        const { data: tokenData, error: tokenError } = await supabase
          .from("tokens")
          .select("id")
          .eq("mint_address", trade.token_mint)
          .single();
        
        if (tokenError || !tokenData) {
          console.error(`[Webhook] Could not find token in DB for mint: ${trade.token_mint}`);
          continue;
        }

        // Insert the trade into the database
        const { error: insertError } = await (supabase as any)
          .from("trades")
          .insert({
            token_id: (tokenData as any).id,
            wallet_address: trade.wallet_address,
            type: trade.type,
            sol_amount: trade.sol_amount,
            token_amount: trade.token_amount,
            price_usd: 0, // In a real app, fetch current SOL price to calculate USD value
            tx_signature: trade.tx_signature,
          });

        if (insertError) {
          console.error(`[Webhook] Error inserting trade: ${insertError.message}`);
        } else {
          processedCount++;
          console.log(`[Webhook] Successfully recorded ${trade.type} trade for ${trade.token_mint}`);
        }
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });

  } catch (error: any) {
    console.error("[Webhook] Internal server error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
