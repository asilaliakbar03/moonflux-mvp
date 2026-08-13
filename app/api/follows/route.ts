import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/follows?wallet=<address>
 * Returns follower/following counts and list for a wallet.
 * Optional: &viewer=<address> to check if viewer is following this wallet.
 */
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const viewer = req.nextUrl.searchParams.get("viewer");

  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });
  if (!isSupabaseConfigured) {
    return NextResponse.json({ followers: 0, following: 0, isFollowing: false });
  }

  // Get user id
  const { data: user } = await (supabase as any)
    .from("users")
    .select("id")
    .eq("wallet_address", wallet)
    .single();

  if (!user) return NextResponse.json({ followers: 0, following: 0, isFollowing: false });

  // Count followers (people following this user)
  const { count: followers } = await (supabase as any)
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id);

  // Count following (people this user follows)
  const { count: following } = await (supabase as any)
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", user.id);

  // Check if viewer is following this user
  let isFollowing = false;
  if (viewer && viewer !== wallet) {
    const { data: viewerUser } = await (supabase as any)
      .from("users")
      .select("id")
      .eq("wallet_address", viewer)
      .single();

    if (viewerUser) {
      const { data: follow } = await (supabase as any)
        .from("follows")
        .select("follower_id")
        .eq("follower_id", viewerUser.id)
        .eq("following_id", user.id)
        .single();
      isFollowing = !!follow;
    }
  }

  return NextResponse.json({
    followers: followers || 0,
    following: following || 0,
    isFollowing,
  });
}

/**
 * POST /api/follows
 * Toggle follow/unfollow.
 * Body: { followerWallet, followingWallet }
 */
export async function POST(req: NextRequest) {
  try {
    const { followerWallet, followingWallet } = await req.json();

    if (!followerWallet || !followingWallet || followerWallet === followingWallet) {
      return NextResponse.json({ error: "Invalid follow request" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ action: "followed", isFollowing: true });
    }

    // Upsert both users
    const upsert = async (wallet: string) => {
      const { data } = await (supabase as any)
        .from("users")
        .upsert({ wallet_address: wallet, updated_at: new Date().toISOString() }, { onConflict: "wallet_address", ignoreDuplicates: false })
        .select("id")
        .single();
      return data;
    };

    const follower = await upsert(followerWallet);
    const following = await upsert(followingWallet);

    if (!follower || !following) {
      return NextResponse.json({ error: "Could not resolve users" }, { status: 500 });
    }

    // Check if already following
    const { data: existing } = await (supabase as any)
      .from("follows")
      .select("follower_id")
      .eq("follower_id", follower.id)
      .eq("following_id", following.id)
      .single();

    if (existing) {
      // Unfollow
      await (supabase as any)
        .from("follows")
        .delete()
        .eq("follower_id", follower.id)
        .eq("following_id", following.id);
      return NextResponse.json({ action: "unfollowed", isFollowing: false });
    } else {
      // Follow
      await (supabase as any)
        .from("follows")
        .insert({ follower_id: follower.id, following_id: following.id });
      return NextResponse.json({ action: "followed", isFollowing: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
