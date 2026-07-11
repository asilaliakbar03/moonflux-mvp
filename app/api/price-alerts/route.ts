import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('YOUR_PROJECT')) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, serviceKey);
}

// GET /api/price-alerts?userId=xxx — list alerts for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ alerts: [], mock: true });
  }

  const { data, error } = await supabase
    .from('price_alerts')
    .select('*, token:tokens(name, ticker)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data ?? [] });
}

// POST /api/price-alerts — create alert
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, tokenId, condition, targetPrice } = body as {
    userId: string;
    tokenId: string;
    condition: string;
    targetPrice: number;
  };

  if (!userId || !tokenId || !condition || targetPrice == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['above', 'below'].includes(condition)) {
    return NextResponse.json(
      { error: 'condition must be "above" or "below"' },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: true, mock: true });
  }

  const { data, error } = await supabase
    .from('price_alerts')
    .insert({
      user_id: userId,
      token_id: tokenId,
      condition,
      target_price: targetPrice,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data });
}

// DELETE /api/price-alerts?id=xxx — delete alert
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: true, mock: true });
  }

  const { error } = await supabase.from('price_alerts').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
