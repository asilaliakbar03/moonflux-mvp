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
  Store,
  CalendarDays,
  Network,
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
  { icon: Store,           label: 'Marketplace', href: '/marketplace' },
  { icon: CalendarDays,    label: 'Calendar',    href: '/calendar'    },
  { icon: Network,         label: 'Reputation',  href: '/reputation'  },
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
          flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 font-mono font-black uppercase tracking-wider text-sm
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
        className={`hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40`}
        style={{
          width: sidebarWidth,
          backgroundColor: isDark ? '#050510' : '#FFFFFF',
          borderRight: `3px solid ${borderColor}`,
          transition: 'width 250ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Toggle Button ── */}
        <div className={`flex items-center ${expanded ? 'justify-end' : 'justify-center'} px-2 pt-2 pb-1 shrink-0`}>
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
        <nav className="flex flex-col gap-0.5 px-2 pt-1 overflow-x-hidden">
          {MAIN_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              expanded={expanded}
            />
          ))}

          {/* ── LAUNCH BUTTON (right below Community) ── */}
          <div className="mt-1">
            <Link href="/launch" className="block relative group/link">
              <div
                className={`
                  flex items-center gap-3 px-3 py-2.5 cursor-pointer font-mono font-black uppercase tracking-wider text-sm
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
          className="mx-2 my-1"
          style={{ borderTop: `2px solid ${borderColor}` }}
        />

        {/* ── Bottom section (Profile & Settings) ── */}
        <div className="flex flex-col gap-0.5 px-2 pb-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              expanded={expanded}
            />
          ))}
        </div>

        {/* ── Social Links ── */}
        <div className={`flex ${expanded ? 'justify-start gap-3 px-4' : 'flex-col items-center gap-2'} pb-3 pt-1`}>
          {[
            { href: 'https://x.com/moonfluxx', label: 'X', icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            )},
            { href: 'https://t.me/moonfluxx', label: 'TG', icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            )},
            { href: 'https://discord.gg/moonfluxx', label: 'DC', icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
            )},
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className={`p-1.5 transition-all ${isDark ? 'text-gray-600 hover:text-[#818CF8]' : 'text-gray-400 hover:text-[#6366F1]'}`}
              title={s.label}
            >
              {s.icon}
            </a>
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
