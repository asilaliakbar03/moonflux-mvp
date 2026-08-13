import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/explore-tokens?limit=20
 * Returns recent tokens for the explore page and community feed.
 */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  if (!isSupabaseConfigured) {
    return NextResponse.json({ tokens: [] });
  }

  const { data: tokens, error } = await (supabase as any)
    .from("tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 50));

  if (error) {
    return NextResponse.json({ tokens: [] });
  }

  return NextResponse.json({ tokens: tokens || [] });
}
