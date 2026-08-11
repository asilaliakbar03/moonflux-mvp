import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Marketplace listings retrieved",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId, bidderWallet, amountSol } = body;

    if (!listingId || !bidderWallet || !amountSol) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bid placed successfully',
      bid: {
        listingId,
        bidderWallet,
        amountSol,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
