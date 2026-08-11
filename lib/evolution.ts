export type EvolutionStage = {
  stage: number;
  name: string;
  emoji: string;
  description: string;
  nextMilestone: string;
  progress: number;
};

export const STAGES = [
  { stage: 1, name: 'SEED', emoji: '🥚' },
  { stage: 2, name: 'COMMUNITY', emoji: '🌱' },
  { stage: 3, name: 'GROWTH', emoji: '🌿' },
  { stage: 4, name: 'DEX', emoji: '🌳' },
  { stage: 5, name: 'PROTOCOL', emoji: '🏛️' },
  { stage: 6, name: 'DAO', emoji: '👑' },
];

export function getEvolutionStage(data: {
  holders: number;
  poolSol: number;
  graduated: boolean;
  hasRevenue: boolean;
  hasGovernance: boolean;
}): EvolutionStage {
  if (data.hasGovernance) {
    return {
      stage: 6,
      name: 'DAO',
      emoji: '👑',
      description: 'Full governance enabled',
      nextMilestone: 'Max Evolution Reached',
      progress: 100
    };
  }
  
  if (data.hasRevenue) {
    return {
      stage: 5,
      name: 'PROTOCOL',
      emoji: '🏛️',
      description: 'Revenue generating',
      nextMilestone: 'Enable governance',
      progress: 0
    };
  }
  
  if (data.graduated) {
    return {
      stage: 4,
      name: 'DEX',
      emoji: '🌳',
      description: 'Bonding curve graduated',
      nextMilestone: 'Generate revenue',
      progress: 0
    };
  }
  
  if (data.holders >= 1000 && data.poolSol >= 50) {
    const progress = Math.min(100, (data.poolSol / 85) * 100);
    return {
      stage: 3,
      name: 'GROWTH',
      emoji: '🌿',
      description: '1K+ holders, 50+ SOL pool',
      nextMilestone: 'Graduate (85 SOL)',
      progress
    };
  }
  
  if (data.holders >= 100) {
    const holderProgress = Math.min(100, (data.holders / 1000) * 100);
    const poolProgress = Math.min(100, (data.poolSol / 50) * 100);
    return {
      stage: 2,
      name: 'COMMUNITY',
      emoji: '🌱',
      description: '100+ holders',
      nextMilestone: '1K holders + 50 SOL pool',
      progress: (holderProgress + poolProgress) / 2
    };
  }
  
  return {
    stage: 1,
    name: 'SEED',
    emoji: '🥚',
    description: 'Token just created',
    nextMilestone: '100 holders',
    progress: Math.min(100, (data.holders / 100) * 100)
  };
}
