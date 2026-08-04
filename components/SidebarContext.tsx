'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  setExpanded: () => {},
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle: () => setExpanded(e => !e) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
