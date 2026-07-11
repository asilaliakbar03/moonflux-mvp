import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Only allow Vercel Cron (or our own secret for manual testing)
const CRON_SECRET = process.env.CRON_SECRET;

type AlertCondition = 'above' | 'below' | 'change_pct';

interface PriceAlert {
  id: string;
  user_id: string;
  token_id: string;
  condition: AlertCondition;
  target_price: number;
  active: boolean;
  token?: { mint_address: string; name: string; ticker: string };
}

async function fetchTokenPrice(mintAddress: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = (data.pairs ?? []).filter(
      (p: { chainId: string }) => p.chainId === 'solana'
    );
    if (pairs.length === 0) return null;
    const best = pairs.sort(
      (
        a: { liquidity?: { usd?: number } },
        b: { liquidity?: { usd?: number } }
      ) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];
    return parseFloat(best.priceUsd ?? '0');
  } catch {
    return null;
  }
}

function isAlertTriggered(alert: PriceAlert, currentPrice: number): boolean {
  switch (alert.condition) {
    case 'above':
      return currentPrice >= alert.target_price;
    case 'below':
      return currentPrice <= alert.target_price;
    default:
      return false;
  }
}

export async function GET(req: Request) {
  // Auth check — Vercel passes the secret as a header
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('YOUR_PROJECT')) {
    return NextResponse.json({ skipped: true, reason: 'Supabase not configured' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch active alerts with token info
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*, token:tokens(mint_address, name, ticker)')
      .eq('active', true)
      .is('triggered_at', null)
      .limit(100);

    if (error || !alerts || alerts.length === 0) {
      return NextResponse.json({ checked: 0, triggered: 0 });
    }

    // 2. Group by token to batch price fetches
    const mintMap = new Map<string, string>(); // token_id -> mint_address
    for (const alert of alerts) {
      const mint = (alert.token as { mint_address?: string })?.mint_address;
      if (mint) mintMap.set(alert.token_id, mint);
    }

    // 3. Fetch prices in parallel (max 5 at once to avoid rate limits)
    const priceMap = new Map<string, number>(); // token_id -> current price
    const tokenIds = Array.from(mintMap.keys());
    const BATCH = 5;

    for (let i = 0; i < tokenIds.length; i += BATCH) {
      const batch = tokenIds.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (tokenId) => {
          const mint = mintMap.get(tokenId)!;
          const price = await fetchTokenPrice(mint);
          if (price !== null) priceMap.set(tokenId, price);
        })
      );
      // Brief pause between batches to avoid rate limits
      if (i + BATCH < tokenIds.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // 4. Check each alert and fire notifications for triggered ones
    let triggered = 0;
    const triggeredAt = new Date().toISOString();

    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.token_id);
      if (currentPrice === undefined) continue;

      if (isAlertTriggered(alert as PriceAlert, currentPrice)) {
        triggered++;
        const tokenInfo = alert.token as { name?: string; ticker?: string };

        // Mark alert as triggered (deactivate)
        await supabase
          .from('price_alerts')
          .update({ active: false, triggered_at: triggeredAt })
          .eq('id', alert.id);

        // Insert notification row
        await supabase.from('notifications').insert({
          user_id: alert.user_id,
          type: 'price_alert',
          payload: {
            alertId: alert.id,
            tokenId: alert.token_id,
            tokenName: tokenInfo?.name ?? 'Unknown',
            ticker: tokenInfo?.ticker ?? '???',
            condition: alert.condition,
            targetPrice: alert.target_price,
            currentPrice,
            message:
              alert.condition === 'above'
                ? `$${tokenInfo?.ticker} hit your target of $${alert.target_price.toFixed(6)} (now $${currentPrice.toFixed(6)})`
                : `$${tokenInfo?.ticker} dropped below $${alert.target_price.toFixed(6)} (now $${currentPrice.toFixed(6)})`,
          },
          read: false,
        });
      }
    }

    return NextResponse.json({
      checked: alerts.length,
      triggered,
      timestamp: triggeredAt,
    });
  } catch (err) {
    console.error('[cron/price-alerts] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
