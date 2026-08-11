import { NextResponse } from 'next/server';

export async function GET() {
  const nodeTypes = ['founder', 'whale', 'project', 'community'] as const;
  
  const nodes = Array.from({ length: 20 }).map((_, i) => {
    const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    let label = '';
    
    switch (type) {
      case 'founder': label = `Dev_0x${i}`; break;
      case 'whale': label = `Whale_Alpha${i}`; break;
      case 'project': label = `Project_${i}`; break;
      case 'community': label = `DAO_${i}`; break;
    }

    return {
      id: `node-${i}`,
      label,
      type,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      metadata: {
        projectsLaunched: Math.floor(Math.random() * 5),
        followers: Math.floor(Math.random() * 10000),
      }
    };
  });

  const edges = [];
  // Generate ~25 random connections
  for (let i = 0; i < 25; i++) {
    const source = Math.floor(Math.random() * nodes.length);
    let target = Math.floor(Math.random() * nodes.length);
    
    // Prevent self-links
    while (target === source) {
      target = Math.floor(Math.random() * nodes.length);
    }

    edges.push({
      source: `node-${source}`,
      target: `node-${target}`,
      weight: Math.random() * 5 + 1
    });
  }

  return NextResponse.json({ nodes, edges });
}
