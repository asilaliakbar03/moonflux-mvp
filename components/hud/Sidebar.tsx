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
  Plus,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

/* ─── Types ─────────────────────────────────────────────────── */
type NavItem = { icon: LucideIcon; label: string; href: string };

/* ─── Nav data ───────────────────────────────────────────────── */
const MAIN_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/'            },
  { icon: Compass,         label: 'Explore',     href: '/explore'     },
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
          background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
          borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
          color: isActive ? '#818CF8' : '#475569',
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
        backgroundColor: '#080B12',
        borderRight: '1px solid rgba(99,102,241,0.08)',
        transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-[18px] pt-5 pb-3">
        {/* Indigo gradient circle */}
        <div
          className="flex items-center justify-center shrink-0 rounded-full"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            boxShadow: '0 0 16px rgba(99,102,241,0.35)',
          }}
        >
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>

        {/* Wordmark */}
        <span
          className="whitespace-nowrap transition-opacity duration-200"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: 15,
            color: '#E0E7FF',
            letterSpacing: '-0.01em',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          MoonFluxx
        </span>
      </div>

      {/* ── Main nav ── */}
      <nav
        className="flex-1 flex flex-col gap-0.5 px-2 pt-2 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'none' }}
      >
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
        style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
      />

      {/* ── Bottom section ── */}
      <div className="flex flex-col gap-0.5 px-2 pb-4">

        {/* Launch Token button */}
        <Link href="/launch" className="block mb-1">
          <motion.div
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150"
            style={{ background: '#6366F1', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4F46E5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366F1';
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <Plus size={20} strokeWidth={2.2} />
            </div>

            <span
              className="whitespace-nowrap font-semibold transition-opacity duration-200"
              style={{
                fontSize: '13px',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                opacity: expanded ? 1 : 0,
                pointerEvents: expanded ? 'auto' : 'none',
              }}
            >
              Launch Token
            </span>
          </motion.div>
        </Link>

        {/* Thin divider above profile/settings */}
        <div
          className="mx-1 mb-1"
          style={{ borderTop: '1px solid rgba(99,102,241,0.06)' }}
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
