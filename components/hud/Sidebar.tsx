'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Rocket,
  LineChart,
  Trophy,
  Swords,
  Users,
  UserCircle,
  Settings,
  Film,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

/* ─── Types ─────────────────────────────────────────────────── */
type NavItem = { icon: LucideIcon; label: string; href: string };

/* ─── Nav data ───────────────────────────────────────────────── */
const MAIN_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/'            },
  { icon: Compass,         label: 'Explore',     href: '/explore'     },
  { icon: Film,            label: 'Feed',        href: '/feed'        },
  { icon: Rocket,          label: 'Launch',      href: '/launch'      },
  { icon: LineChart,       label: 'Terminal',    href: '/terminal'    },
  { icon: Trophy,          label: 'Leaderboard', href: '/leaderboard' },
  { icon: Swords,          label: 'Arena',       href: '/arena'       },
  { icon: Users,           label: 'Community',   href: '/venture'     },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: UserCircle, label: 'Profile',  href: '/profile'  },
  { icon: Settings,   label: 'Settings', href: '/settings' },
];

/* ─── NavLink ────────────────────────────────────────────────── */
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
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150"
        style={{
          background: isActive ? 'rgba(255,42,109,0.15)' : 'transparent',
          borderLeft: isActive ? '2px solid #FF2A6D' : '2px solid transparent',
          color: isActive ? '#FFF' : '#C8A2C8',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#94A3B8';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#475569';
          }
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 shrink-0">
          <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
        </div>

        {/* Label */}
        <span
          className="whitespace-nowrap font-medium transition-opacity duration-200"
          style={{
            fontSize: '13px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          {item.label}
        </span>
      </motion.div>

      {/* Tooltip — only when collapsed */}
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
            background: '#0F1221',
            color: '#CBD5E1',
            border: '1px solid rgba(99,102,241,0.18)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          {item.label}
        </div>
      )}
    </Link>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setExpanded(false), 80);
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
        width: expanded ? 220 : 72,
        backgroundColor: '#0B0414',
        borderRight: '1px solid rgba(255,42,109,0.15)',
        transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* ── Main nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-6 overflow-hidden">
        {MAIN_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div
        className="mx-3 my-1"
        style={{ borderTop: '1px solid rgba(255,42,109,0.15)' }}
      />

      {/* ── Bottom section ── */}
      <div className="flex flex-col gap-0.5 px-2 pb-4">

        {/* Thin divider above profile/settings */}
        <div
          className="mx-1 mb-1"
          style={{ borderTop: '1px solid rgba(255,42,109,0.15)' }}
        />

        {/* Profile & Settings */}
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}
      </div>
    </aside>
  );
}
