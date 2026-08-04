'use client';

import { useSidebar } from '@/components/SidebarContext';
import { useEffect, useState } from 'react';

export function MainContent({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return (
    <main
      className="relative z-10 pt-[64px] pb-20 md:pb-0 min-h-screen"
      style={{
        paddingLeft: isMd ? (expanded ? 220 : 64) : 0,
        transition: 'padding-left 250ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-[1400px] mx-auto">
        {children}
      </div>
    </main>
  );
}
