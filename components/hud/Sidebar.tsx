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

type NavItem = { icon: LucideIcon; label: string; href: string };

const MAIN_ITEMS: NavItem[] = [
  { icon: Activity, label: 'Terminal', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Rocket, label: 'Launch', href: '/launch' },
  { icon: TrendingUp, label: 'Trending', href: '/terminal' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Swords, label: 'Arena', href: '/arena' },
  { icon: Lightbulb, label: 'Venture', href: '/venture' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block">
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
          transition-colors duration-200
          ${
            isActive
              ? 'bg-[#ffd369] text-[#775a00]'
              : 'text-[#d1c5b1] hover:bg-[#353436] hover:text-[#ffd369]'
          }
        `}
      >
        <div className="flex items-center justify-center w-8 h-8 shrink-0">
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span
          className="
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            whitespace-nowrap text-xs font-semibold uppercase tracking-[0.05em]
          "
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        group
        hidden md:flex flex-col
        fixed left-0 top-16 bottom-0
        w-20 hover:w-64
        transition-[width] duration-300 ease-in-out
        z-40
      "
      style={{
        backgroundColor: '#131314',
        borderRight: '1px solid #4e4636',
      }}
    >
      {/* Main nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 pt-4 overflow-y-auto overflow-x-hidden">
        {MAIN_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 px-3 pb-4 border-t border-[#4e4636]/40 pt-3">
        {/* Launch Token button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="
            flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
            border border-[#ffd369] text-[#ffd369]
            hover:bg-[#ffd369]/10
            transition-colors duration-200
          "
        >
          <div className="flex items-center justify-center w-8 h-8 shrink-0">
            <Plus size={20} strokeWidth={2} />
          </div>
          <span
            className="
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              whitespace-nowrap text-xs font-semibold uppercase tracking-[0.05em]
            "
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Launch Token
          </span>
        </motion.button>

        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </aside>
  );
}
