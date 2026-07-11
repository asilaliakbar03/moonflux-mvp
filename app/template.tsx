"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Global page-transition. Next.js re-mounts this on every navigation, so each
 * route enters with a cinematic blur-lift reveal + a sweeping gold light bar.
 * Keeps the whole app feeling like one continuous, fast, high-end surface.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 26, scale: 0.985, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-full"
    >
      {/* sweeping gold light bar on route enter */}
      <motion.div
        initial={{ x: "-30%", opacity: 0.9 }}
        animate={{ x: "130%", opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed top-0 left-0 z-40 h-full w-1/3"
        style={{ background: "linear-gradient(100deg, transparent, rgba(232,184,75,0.10), transparent)" }}
      />
      {children}
    </motion.div>
  );
}
