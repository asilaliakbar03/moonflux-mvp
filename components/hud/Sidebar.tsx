'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useSidebar } from '@/components/SidebarContext';

/* ─── Types ─────────────────────────────────────────────────── */
type NavItem = { icon: LucideIcon; label: string; href: string };

/* ─── Nav data ───────────────────────────────────────────────── */
const MAIN_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Home',        href: '/'            },
  { icon: Compass,         label: 'Explore',     href: '/explore'     },
  { icon: Film,            label: 'Feed',        href: '/feed'        },
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = item.icon;

  return (
    <Link href={item.href} className="block relative group/link">
      <div
        className={`
          flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150 font-mono font-black uppercase tracking-wider text-sm
          ${isActive 
            ? `${isDark ? 'bg-[#6366F1] text-white border-2 border-[rgba(255,255,255,0.2)]' : 'bg-[#6366F1] text-white border-3 border-black'}` 
            : `${isDark ? 'text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:text-black hover:bg-gray-100'} border-2 border-transparent`
          }
        `}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-7 h-7 shrink-0">
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>

        {/* Label */}
        {expanded && (
          <span className="whitespace-nowrap text-sm">
            {item.label}
          </span>
        )}
      </div>

      {/* Tooltip — only when collapsed */}
      {!expanded && (
        <div
          className={`
            absolute left-full top-1/2 -translate-y-1/2 ml-3
            px-3 py-2
            text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap
            opacity-0 group-hover/link:opacity-100
            transition-opacity duration-150
            pointer-events-none z-50
            ${isDark ? 'bg-black text-white border-2 border-[rgba(255,255,255,0.2)]' : 'bg-white text-black border-3 border-black'}
            shadow-[3px_3px_0px_0px_#6366F1]
          `}
        >
          {item.label}
        </div>
      )}
    </Link>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
export default function Sidebar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();
  const { expanded, toggle } = useSidebar();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const sidebarWidth = expanded ? 220 : 64;
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#000';

  return (
    <>
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 overflow-hidden`}
        style={{
          width: sidebarWidth,
          backgroundColor: isDark ? '#050510' : '#FFFFFF',
          borderRight: `3px solid ${borderColor}`,
          transition: 'width 250ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Toggle Button ── */}
        <div className="flex items-center justify-end px-2 pt-4 pb-2">
          <button
            onClick={toggle}
            className={`
              p-2 font-mono font-black transition-all
              ${isDark 
                ? 'text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]' 
                : 'text-gray-400 hover:text-black hover:bg-gray-100 border-2 border-gray-200 hover:border-black'}
            `}
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        {/* ── Main nav ── */}
        <nav className="flex-1 flex flex-col gap-1 px-2 pt-2 overflow-y-auto overflow-x-hidden">
          {MAIN_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              expanded={expanded}
            />
          ))}

          {/* ── LAUNCH BUTTON (right below Community) ── */}
          <div className="mt-2">
            <Link href="/launch" className="block relative group/link">
              <div
                className={`
                  flex items-center gap-3 px-3 py-3 cursor-pointer font-mono font-black uppercase tracking-wider text-sm
                  bg-[#10B981] text-black transition-all
                  ${isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black'}
                  ${isDark ? 'shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]' : 'shadow-[3px_3px_0px_0px_#000]'}
                  hover:shadow-[5px_5px_0px_0px_#F59E0B] hover:-translate-y-0.5
                  active:translate-y-0.5 active:shadow-none
                  ${pathname === '/launch' ? 'ring-2 ring-white' : ''}
                `}
              >
                <div className="flex items-center justify-center w-7 h-7 shrink-0">
                  <Rocket size={20} strokeWidth={2.5} />
                </div>
                {expanded && <span>Launch</span>}
              </div>
              {/* Tooltip when collapsed */}
              {!expanded && (
                <div
                  className={`
                    absolute left-full top-1/2 -translate-y-1/2 ml-3
                    px-3 py-2
                    text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap
                    opacity-0 group-hover/link:opacity-100
                    transition-opacity duration-150
                    pointer-events-none z-50
                    ${isDark ? 'bg-black text-white border-2 border-[rgba(255,255,255,0.2)]' : 'bg-white text-black border-3 border-black'}
                    shadow-[3px_3px_0px_0px_#10B981]
                  `}
                >
                  Launch
                </div>
              )}
            </Link>
          </div>
        </nav>

        {/* ── Divider ── */}
        <div
          className="mx-2 my-2"
          style={{ borderTop: `2px solid ${borderColor}` }}
        />

        {/* ── Bottom section (Profile & Settings) ── */}
        <div className="flex flex-col gap-1 px-2 pb-4">
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

      {/* ── Mobile Bottom Nav ── */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] flex justify-around items-center h-16 px-1 pb-[env(safe-area-inset-bottom)] ${
          isDark ? 'bg-[#050510] border-t-3 border-[rgba(255,255,255,0.2)]' : 'bg-white border-t-3 border-black'
        }`}
      >
        {[
          MAIN_ITEMS[0], // Home
          MAIN_ITEMS[1], // Explore
          MAIN_ITEMS[2], // Feed
          { icon: Rocket, label: 'Launch', href: '/launch' },
          { icon: Menu, label: 'More', href: '#more' }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isLaunch = item.href === '/launch';
          
          if (item.href === '#more') {
            return (
              <button key="more" onClick={() => setShowMobileMenu(true)} className="flex flex-col items-center justify-center w-full h-full gap-1">
                <Icon size={22} strokeWidth={2.5} className={isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-gray-400'} />
                <span className={`text-[10px] font-mono font-black uppercase ${isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-gray-400'}`}>More</span>
              </button>
            );
          }

          const activeColor = isLaunch ? 'text-[#10B981]' : 'text-[#6366F1]';
          const inactiveColor = isDark ? 'text-[rgba(255,255,255,0.4)]' : 'text-gray-400';

          return (
            <Link key={item.href} href={item.href} onClick={() => setShowMobileMenu(false)} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <div className={`flex items-center justify-center p-1 ${isActive ? activeColor : inactiveColor}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-mono font-black uppercase ${isActive ? activeColor : inactiveColor}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile Full Menu ── */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`md:hidden fixed inset-0 z-[110] overflow-y-auto pb-24 pt-6 px-4 flex flex-col ${
              isDark ? 'bg-[#050510]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-8 mt-2">
              <h2 className="text-3xl font-mono font-black uppercase tracking-widest">[ MENU ]</h2>
              <button 
                onClick={() => setShowMobileMenu(false)} 
                className={`p-3 font-black ${isDark ? 'bg-[#F43F5E] text-black border-2 border-[rgba(255,255,255,0.2)]' : 'bg-[#F43F5E] text-white border-3 border-black'} shadow-[3px_3px_0px_0px_#000]`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-mono font-black text-[#06B6D4] tracking-widest uppercase mb-3 px-2">[ NAVIGATION ]</h3>
                <div className="flex flex-col gap-2">
                  {MAIN_ITEMS.map(item => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-4 p-4 font-mono font-black uppercase tracking-wider text-base transition-all active:scale-95 ${
                        pathname === item.href 
                          ? `bg-[#6366F1] text-white ${isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black'} shadow-[4px_4px_0px_0px_#000]` 
                          : `${isDark ? 'text-[rgba(255,255,255,0.5)] border-2 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] hover:text-white' : 'text-gray-500 border-2 border-gray-200 hover:border-black hover:text-black'}`
                      }`}
                    >
                      <item.icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {/* Launch in mobile menu */}
                  <Link href="/launch" onClick={() => setShowMobileMenu(false)}>
                    <div className={`flex items-center gap-4 p-4 font-mono font-black uppercase tracking-wider text-base bg-[#10B981] text-black ${isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black'} shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all`}>
                      <Rocket size={22} strokeWidth={2.5} />
                      <span>Launch Token</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono font-black text-[#F59E0B] tracking-widest uppercase mb-3 px-2">[ ACCOUNT ]</h3>
                <div className="flex flex-col gap-2">
                  {BOTTOM_ITEMS.map(item => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-4 p-4 font-mono font-black uppercase tracking-wider text-base transition-all active:scale-95 ${
                        pathname === item.href 
                          ? `bg-[#6366F1] text-white ${isDark ? 'border-2 border-[rgba(255,255,255,0.2)]' : 'border-3 border-black'} shadow-[4px_4px_0px_0px_#000]` 
                          : `${isDark ? 'text-[rgba(255,255,255,0.5)] border-2 border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] hover:text-white' : 'text-gray-500 border-2 border-gray-200 hover:border-black hover:text-black'}`
                      }`}
                    >
                      <item.icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
