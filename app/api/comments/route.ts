import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/comments?mint=<address>
 * Fetches comments for a token by mint address.
 */
export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get("mint");
  if (!mint) return NextResponse.json({ comments: [] });

  if (!isSupabaseConfigured) {
    return NextResponse.json({ comments: [] });
  }

  // First get token id from mint
  const { data: token } = await (supabase as any)
    .from("tokens")
    .select("id")
    .eq("mint_address", mint)
    .single();

  if (!token) return NextResponse.json({ comments: [] });

  const { data: comments } = await (supabase as any)
    .from("comments")
    .select("*, users!user_id(username, wallet_address)")
    .eq("token_id", token.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ comments: comments || [] });
}

/**
 * POST /api/comments
 * Posts a comment on a token.
 */
export async function POST(req: NextRequest) {
  try {
    const { mint, wallet, text } = await req.json();

    if (!mint || !wallet || !text?.trim()) {
      return NextResponse.json({ error: "mint, wallet, text required" }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: "Comment too long (max 500 chars)" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ comment: { id: "mock", text, created_at: new Date().toISOString() } });
    }

    // Get or create user
    const { data: user } = await (supabase as any)
      .from("users")
      .upsert({ wallet_address: wallet, updated_at: new Date().toISOString() }, { onConflict: "wallet_address", ignoreDuplicates: false })
      .select()
      .single();

    // Get token
    const { data: token } = await (supabase as any)
      .from("tokens")
      .select("id")
      .eq("mint_address", mint)
      .single();

    if (!token || !user) {
      return NextResponse.json({ error: "Token or user not found" }, { status: 404 });
    }

    const { data: comment, error } = await (supabase as any)
      .from("comments")
      .insert({ token_id: token.id, user_id: user.id, text: text.trim() })
      .select("*, users!user_id(username, wallet_address)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
