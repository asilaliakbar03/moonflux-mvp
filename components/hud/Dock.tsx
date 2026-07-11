"use client";

import { motion } from "framer-motion";
import { Activity, Compass, Rocket, TrendingUp, Trophy, Swords, Lightbulb, User, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

type NavItem = { icon: LucideIcon; label: string; href: string; type?: never };
type DividerItem = { type: "divider"; icon?: never; label?: never; href?: never };
type DockEntry = NavItem | DividerItem;

const ITEMS: DockEntry[] = [
  { icon: Activity,   label: "Dashboard",   href: "/" },
  { icon: Compass,    label: "Explore",      href: "/explore" },
  { icon: Rocket,     label: "Launch",       href: "/launch" },
  { icon: TrendingUp, label: "Terminal",     href: "/terminal" },
  { icon: Trophy,     label: "Leaderboard",  href: "/leaderboard" },
  { icon: Swords,     label: "Arena",        href: "/arena" },
  { icon: Lightbulb,  label: "Venture",      href: "/venture" },
  { type: "divider" },
  { icon: User,       label: "Profile",      href: "/profile" },
  { icon: Settings,   label: "Settings",     href: "/settings" },
];

const NAV_ITEMS = ITEMS.filter((i): i is NavItem => !("type" in i && i.type === "divider"));

// Mobile: show only the 5 most important items in the bottom tab bar
const MOBILE_ITEMS = [
  NAV_ITEMS.find(i => i.href === "/")!,
  NAV_ITEMS.find(i => i.href === "/explore")!,
  NAV_ITEMS.find(i => i.href === "/arena")!,
  NAV_ITEMS.find(i => i.href === "/launch")!,
  NAV_ITEMS.find(i => i.href === "/profile")!,
];

function DockItem({
  item,
  isActive,
}: {
  item: { icon: LucideIcon; label: string; href: string };
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.icon;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
    el.style.transform = "";
    setTimeout(() => { if (el) el.style.transition = ""; }, 500);
  };

  return (
    <Link href={item.href} aria-label={item.label}>
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div
          whileHover={{ scale: 1.18, y: -5 }}
          whileTap={{ scale: 0.92 }}
          className={`group relative p-3 rounded-full transition-colors ${
            isActive ? "text-gold" : "text-mf-gold-deep hover:text-mf-champagne"
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="dock-active-bg"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-mf-gold/30 to-mf-gold-hi/15 border border-mf-gold/40 shadow-[0_0_18px_rgba(232,184,75,0.4)]"
            />
          )}

          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />

          {isActive && (
            <motion.div
              layoutId="dock-active-dot"
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mf-gold shadow-[0_0_8px_rgba(232,184,75,1)]"
            />
          )}

          {/* tooltip — desktop only */}
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-mf-obsidian/95 backdrop-blur-md border border-mf-line-gold rounded-md text-[0.58rem] font-mono tracking-[0.25em] uppercase text-gold opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all whitespace-nowrap pointer-events-none">
            {item.label}
          </div>
        </motion.div>
      </div>
    </Link>
  );
}

// ── MOBILE BOTTOM TAB ITEM ─────────────────────────────────────────────────────
function MobileTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative">
      {isActive && (
        <motion.div
          layoutId="mobile-active-bg"
          className="absolute inset-x-1 inset-y-0.5 rounded-xl"
          style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.25)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon
        size={20}
        strokeWidth={isActive ? 2.5 : 1.8}
        style={{ color: isActive ? "#e8b84b" : "#6b6987" }}
        className="relative z-10"
      />
      <span
        className="font-mono text-[0.45rem] tracking-widest uppercase relative z-10 transition-colors"
        style={{ color: isActive ? "#e8b84b" : "#35334a" }}
      >
        {item.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="mobile-active-dot"
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ background: "#e8b84b", boxShadow: "0 0 8px rgba(232,184,75,0.9)" }}
        />
      )}
    </Link>
  );
}

export default function Dock() {
  const pathname = usePathname();

  return (
    <>
      {/* ── DESKTOP DOCK — floating pill (hidden on mobile) ── */}
      <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
        >
          <motion.div
            initial={false}
            whileHover="expanded"
            variants={{ expanded: { scale: 1, opacity: 1 } }}
            animate={{ scale: 0.82, opacity: 0.32 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <div
              className="relative rounded-full px-4 py-2.5 flex items-center gap-1.5 backdrop-blur-2xl"
              style={{
                background: "rgba(12, 10, 7, 0.72)",
                border: "1px solid rgba(232, 184, 75, 0.35)",
                boxShadow: "0 20px 60px -20px rgba(232,184,75,0.35)",
              }}
            >
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-mf-gold/50 to-transparent" />
              {ITEMS.map((item, idx) =>
                "type" in item && item.type === "divider" ? (
                  <div key={`div-${idx}`} className="w-[1px] h-7 bg-mf-line mx-1.5" />
                ) : (
                  <DockItem
                    key={(item as { href: string }).href}
                    item={item as { icon: LucideIcon; label: string; href: string }}
                    isActive={pathname === (item as { href: string }).href}
                  />
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR (visible only on mobile) ── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.15 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch safe-b"
        style={{
          background: "rgba(8,6,3,0.97)",
          borderTop: "1px solid rgba(232,184,75,0.2)",
          boxShadow: "0 -12px 40px -12px rgba(0,0,0,0.8)",
          backdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Gold top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mf-gold/40 to-transparent" />
        {MOBILE_ITEMS.map(item => (
          <MobileTab key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </motion.div>
    </>
  );
}
