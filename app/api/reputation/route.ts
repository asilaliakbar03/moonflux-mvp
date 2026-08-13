import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/reputation
 * Returns a reputation graph: nodes (users/tokens) and edges (follows/trades).
 * Uses real Supabase data when available, mock fallback otherwise.
 */
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(generateMockGraph());
  }

  try {
    // Fetch users with their stats
    const { data: users } = await (supabase as any)
      .from("users")
      .select("id, wallet_address, username, tokens_launched, total_volume_traded")
      .limit(50);

    // Fetch tokens
    const { data: tokens } = await (supabase as any)
      .from("tokens")
      .select("id, name, ticker, creator_id, mint_address")
      .limit(30);

    // Fetch follows for edges
    const { data: follows } = await (supabase as any)
      .from("follows")
      .select("follower_id, following_id")
      .limit(100);

    if (!users?.length) {
      return NextResponse.json(generateMockGraph());
    }

    const nodes: any[] = [];
    const edges: any[] = [];

    // Build user nodes
    (users || []).forEach((u: any) => {
      const volume = parseFloat(u.total_volume_traded) || 0;
      let type = "community";
      if ((u.tokens_launched || 0) > 0) type = "founder";
      else if (volume > 50) type = "whale";

      nodes.push({
        id: u.id,
        label: u.username || `${u.wallet_address.slice(0, 4)}...${u.wallet_address.slice(-4)}`,
        type,
        score: Math.min(100, Math.floor(30 + volume * 2 + (u.tokens_launched || 0) * 20)),
        wallet: u.wallet_address,
        metadata: {
          projectsLaunched: u.tokens_launched || 0,
          followers: 0,
        },
      });
    });

    // Build token nodes
    (tokens || []).forEach((t: any) => {
      nodes.push({
        id: `token-${t.id}`,
        label: t.ticker || t.name,
        type: "project",
        score: 50,
        wallet: t.mint_address,
        metadata: { projectsLaunched: 0, followers: 0 },
      });

      const creatorNode = nodes.find((n: any) => n.wallet === t.creator_id);
      if (creatorNode) {
        edges.push({ source: creatorNode.id, target: `token-${t.id}`, weight: 3 });
      }
    });

    // Build follow edges
    (follows || []).forEach((f: any) => {
      edges.push({ source: f.follower_id, target: f.following_id, weight: 1 });
      const targetNode = nodes.find((n: any) => n.id === f.following_id);
      if (targetNode) targetNode.metadata.followers++;
    });

    return NextResponse.json({ nodes, edges });
  } catch (err) {
    console.error("[reputation] error:", err);
    return NextResponse.json(generateMockGraph());
  }
}

function generateMockGraph() {
  const types = ["founder", "whale", "project", "community"] as const;
  const names = [
    "AlphaBuilder", "SolWhale", "DegenDAO", "MoonDev",
    "LiquidKing", "TokenForge", "CryptoAnon", "LaunchPad",
    "DiamondHands", "VaultRunner", "NeonTrader", "ChainWiz",
  ];

  const nodes = names.map((name, i) => ({
    id: `mock-${i}`,
    label: name,
    type: types[i % types.length],
    score: 30 + Math.floor(Math.random() * 70),
    wallet: `${name.slice(0, 4)}...${name.slice(-4)}`,
    metadata: {
      projectsLaunched: Math.floor(Math.random() * 5),
      followers: Math.floor(Math.random() * 200),
    },
  }));

  const edges: any[] = [];
  for (let i = 0; i < 18; i++) {
    const a = Math.floor(Math.random() * nodes.length);
    let b = Math.floor(Math.random() * nodes.length);
    if (a === b) b = (a + 1) % nodes.length;
    edges.push({ source: nodes[a].id, target: nodes[b].id, weight: 1 + Math.floor(Math.random() * 3) });
  }

  return { nodes, edges };
}
