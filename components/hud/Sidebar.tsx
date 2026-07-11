'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Compass,
  Rocket,
  TrendingUp,
  Trophy,
  Swords,
  Lightbulb,
  User,
  Settings,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

/* ─── types ─── */
type NavItem = { icon: LucideIcon; label: string; href: string };

/* ─── nav data ─── */
const MAIN_ITEMS: NavItem[] = [
  { icon: Activity, label: 'Dashboard', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Rocket, label: 'Launch', href: '/launch' },
  { icon: TrendingUp, label: 'Terminal', href: '/terminal' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Swords, label: 'Arena', href: '/arena' },
  { icon: Lightbulb, label: 'Venture', href: '/venture' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

/* ─── NavLink ─── */
function NavLink({
  item,
  isActive,
  expanded,
}: {
  item: NavItem;
  isActive: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block relative group/link">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200"
        style={{
          background: isActive
            ? 'rgba(245, 158, 11, 0.12)'
            : 'transparent',
          borderLeft: isActive
            ? '2px solid #F59E0B'
            : '2px solid transparent',
          color: isActive ? '#FBBF24' : '#78716C',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#F0ECE5';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#78716C';
          }
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 shrink-0">
          <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
        </div>

        <span
          className="whitespace-nowrap font-medium uppercase tracking-[0.05em] transition-opacity duration-200"
          style={{
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          {item.label}
        </span>
      </motion.div>

      {/* Tooltip — only visible when collapsed */}
      {!expanded && (
        <div
          className="
            absolute left-full top-1/2 -translate-y-1/2 ml-3
            px-2.5 py-1.5 rounded-md
            text-xs font-medium whitespace-nowrap
            opacity-0 group-hover/link:opacity-100
            transition-opacity duration-150
            pointer-events-none z-50
          "
          style={{
            background: '#1C1917',
            color: '#F0ECE5',
            border: '1px solid rgba(248, 211, 103, 0.12)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {item.label}
        </div>
      )}
    </Link>
  );
}

/* ─── Sidebar ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Debounced hover expansion */
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setExpanded(false), 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 overflow-hidden"
      style={{
        width: expanded ? 240 : 72,
        backgroundColor: '#0C0A14',
        borderRight: '1px solid rgba(248, 211, 103, 0.08)',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ─ Logo ─ */}
      <div className="flex items-center gap-3 px-3 pt-5 pb-2">
        <div
          className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, #F59E0B 40%, rgba(245,158,11,0.25) 100%)',
            boxShadow: '0 0 12px rgba(245,158,11,0.35)',
          }}
        >
          <span className="text-sm font-bold" style={{ color: '#0C0A14' }}>
            ◉
          </span>
        </div>
        <span
          className="font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-opacity duration-200"
          style={{
            fontSize: '13px',
            color: '#FBBF24',
            opacity: expanded ? 1 : 0,
          }}
        >
          MoonFluxx
        </span>
      </div>

      {/* ─ Main nav ─ */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-3 overflow-y-auto overflow-x-hidden ct-hide-scrollbar">
        {MAIN_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* ─ Divider ─ */}
      <div className="mx-3 my-1" style={{ borderTop: '1px solid rgba(248, 211, 103, 0.08)' }} />

      {/* ─ Bottom section ─ */}
      <div className="flex flex-col gap-0.5 px-2 pb-2">
        {/* Launch Token button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 ct-launch-pulse"
          style={{
            border: '1px solid rgba(245, 158, 11, 0.5)',
            color: '#FBBF24',
            background: 'rgba(245, 158, 11, 0.06)',
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 shrink-0">
            <Plus size={20} strokeWidth={2} />
          </div>
          <span
            className="whitespace-nowrap font-semibold uppercase tracking-[0.05em] transition-opacity duration-200"
            style={{
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              opacity: expanded ? 1 : 0,
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            Launch Token
          </span>
        </motion.button>

        {/* Profile & Settings */}
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}

        {/* Version badge */}
        <div
          className="flex items-center justify-center pt-2 pb-3 transition-opacity duration-200"
          style={{ opacity: expanded ? 0.5 : 0 }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '10px',
              color: '#44403C',
              letterSpacing: '0.06em',
            }}
          >
            v0.9.1 beta
          </span>
        </div>
      </div>
    </aside>
  );
}
