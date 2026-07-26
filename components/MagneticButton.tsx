'use client';

import { useRef, useState, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: 'button' | 'div' | 'a';
  [key: string]: any;
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  as: Tag = 'button',
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    setPos({ x, y });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    setPos({ x: 0, y: 0 });
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: pos.x === 0 && pos.y === 0
          ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 0.15s ease-out',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
