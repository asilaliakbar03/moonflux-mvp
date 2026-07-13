"use client";

import { useMemo } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BondingCurveChartProps {
  curveType: 'fast' | 'balanced' | 'stable' | 'aggressive';
  color: string;
}

export default function BondingCurveChart({ curveType, color }: BondingCurveChartProps) {
  
  // Generate data points based on curve type
  const data = useMemo(() => {
    const points = [];
    const maxSupply = 100;
    
    for (let i = 0; i <= maxSupply; i += 5) {
      let price = 0;
      // Normalizing x to be a small decimal for smoother curves visually
      const x = i / 10; 
      
      switch (curveType) {
        case 'stable':
          price = x; // Linear
          break;
        case 'balanced':
          price = Math.pow(x, 1.5); // Moderate curve
          break;
        case 'fast':
          price = Math.pow(x, 2); // Exponential
          break;
        case 'aggressive':
          price = Math.pow(x, 3); // Highly exponential
          break;
      }
      
      points.push({
        supply: i,
        price: Number(price.toFixed(4))
      });
    }
    return points;
  }, [curveType]);

  return (
    <div className="w-full h-full min-h-[100px] relative mt-4">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-10 blur-2xl rounded-full pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: color }}
      />
      
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(8, 11, 18, 0.95)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: `0 0 20px ${color}40`,
              color: '#fff',
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px'
            }}
            itemStyle={{ color: color, fontWeight: 'bold' }}
            formatter={(value: any) => [`${value} SOL`, 'Est. Price']}
            labelFormatter={(label) => `${label}% Sold`}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
