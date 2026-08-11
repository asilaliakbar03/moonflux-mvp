import { NextResponse } from 'next/server';

export async function GET() {
  const currentDate = new Date();
  
  const mockLaunches = Array.from({ length: 12 }).map((_, i) => {
    const launchDate = new Date(currentDate);
    // Spread dates across current month and next 2 weeks (roughly -5 to +20 days)
    launchDate.setDate(currentDate.getDate() + (Math.floor(Math.random() * 25) - 5));
    
    const riskRatings = ['low', 'medium', 'high'] as const;
    const statuses = ['upcoming', 'live', 'completed'] as const;
    
    // Names and tickers
    const names = ['AeroDoge', 'MoonPepe', 'SolSurfer', 'CosmicCat', 'DeFiDegen', 'NeoPunk', 'StarDust', 'QuantumPup', 'CyberInu', 'AstroMonkey', 'PlasmaPig', 'NexusFrog'];
    const tickers = ['ADOGE', 'MPEPE', 'SURF', 'CCAT', 'DEGEN', 'NPUNK', 'DUST', 'QPUP', 'CYBER', 'AMONK', 'PIG', 'NEXUS'];
    
    const risk = riskRatings[Math.floor(Math.random() * riskRatings.length)];
    let status = 'upcoming';
    if (launchDate.getTime() < currentDate.getTime()) {
      status = 'completed';
    } else if (launchDate.getDate() === currentDate.getDate() && launchDate.getMonth() === currentDate.getMonth()) {
      status = 'live';
    }

    return {
      id: `launch-${i + 1}`,
      tokenName: names[i],
      ticker: tickers[i],
      launchDate: launchDate.toISOString(),
      hypeScore: Math.floor(Math.random() * 100),
      whaleInterest: Math.floor(Math.random() * 10),
      expectedLiquiditySol: Math.floor(Math.random() * 500) + 50,
      riskRating: risk,
      status: status,
      creatorWallet: `E9x...${Math.floor(Math.random() * 9999)}`
    };
  });

  // Sort by date
  mockLaunches.sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime());

  return NextResponse.json({ launches: mockLaunches });
}
