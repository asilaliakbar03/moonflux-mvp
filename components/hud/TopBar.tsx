'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useMoonWallet } from '@/components/WalletProvider';
import { motion } from 'framer-motion';
import Link from 'next/link';

function shortenAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function TopBar() {
  const { connected, address } = useMoonWallet();
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        background: 'rgba(11,4,20,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,42,109,0.20)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
      }}
    >
      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-3 shrink-0 group mr-2 sm:mr-8">
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-visible">
          {/* The Orbit/Circle Ring (Static left half) */}
          <div className="absolute inset-[-2px] rounded-full border-[1.5px] border-[#a855f7] opacity-80 [mask-image:linear-gradient(90deg,#000_30%,transparent_70%)]" style={{ boxShadow: "inset 0 0 10px rgba(168,85,247,0.3)" }} />
          <div className="absolute inset-[-2px] rounded-full border-[1.5px] border-[#3b82f6] opacity-50 [mask-image:linear-gradient(180deg,transparent_20%,#000_80%)]" />

          {/* Sweeping Energy Flow (Rightwards - "Fluxing") */}
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.9, 1.15, 0.9] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute left-[40%] top-1/2 -translate-y-1/2 w-[70px] h-[12px] bg-[radial-gradient(ellipse_at_left,rgba(168,85,247,0.8)_0%,rgba(59,130,246,0.6)_50%,transparent_100%)] rounded-r-full mix-blend-screen"
            style={{ transformOrigin: "left center" }}
          />
          <motion.div 
            animate={{ opacity: [0.7, 1, 0.7], x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute left-[40%] top-1/2 -translate-y-1/2 w-[90px] h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(168,85,247,1)_30%,rgba(59,130,246,0.8)_70%,transparent_100%)] rounded-r-full mix-blend-screen"
            style={{ boxShadow: "0 0 12px 2px rgba(59,130,246,0.8)", transformOrigin: "left center" }}
          />

          {/* Left short beam (Static) */}
          <div className="absolute right-[50%] top-1/2 -translate-y-1/2 w-[16px] h-[2px] bg-[linear-gradient(270deg,rgba(255,255,255,1)_0%,rgba(168,85,247,0.5)_100%)] rounded-l-full mix-blend-screen" style={{ boxShadow: "0 0 8px rgba(168,85,247,0.6)" }} />

          {/* Vertical Crosshair (Sharp & Static) */}
          <div className="absolute w-[2px] h-[180%] bg-[linear-gradient(180deg,transparent_0%,rgba(168,85,247,0.9)_30%,rgba(255,255,255,1)_50%,rgba(168,85,247,0.9)_70%,transparent_100%)] rounded-full mix-blend-screen" style={{ boxShadow: "0 0 12px 2px rgba(168,85,247,0.8)" }} />

          {/* Glowing Core (Sharp) */}
          <div className="absolute w-2 h-2 bg-white rounded-full" style={{ boxShadow: "0 0 20px 6px rgba(168,85,247,1), 0 0 40px 10px rgba(59,130,246,0.8)" }} />
        </div>
        
        <span
          className="inline font-bold text-[#F1F5F9] group-hover:text-[#a855f7] transition-colors"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 18,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          MoonFluxx<sup className="text-[0.5em] font-light tracking-normal opacity-50 ml-0.5">®</sup>
        </span>
      </Link>

      {/* ── Search ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Desktop search input */}
        <div
          className="hidden md:flex"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            alignItems: 'center',
          }}
        >
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              color: '#475569',
              pointerEvents: 'none',
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search tokens..."
            style={{
              width: '100%',
              height: 40,
              background: '#161B27',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 8,
              paddingLeft: 36,
              paddingRight: 12,
              fontSize: 13,
              color: '#F1F5F9',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.40)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)';
            }}
          />
        </div>

        {/* Mobile search icon / expanded input */}
        <div className="flex md:hidden" style={{ alignItems: 'center' }}>
          {searchExpanded ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 10,
                  color: '#475569',
                  pointerEvents: 'none',
                }}
              />
              <input
                autoFocus
                type="text"
                placeholder="Search tokens..."
                onBlur={() => setSearchExpanded(false)}
                style={{
                  height: 36,
                  width: 130,
                  background: '#161B27',
                  border: '1px solid rgba(99,102,241,0.30)',
                  borderRadius: 8,
                  paddingLeft: 32,
                  paddingRight: 10,
                  fontSize: 13,
                  color: '#F1F5F9',
                  outline: 'none',
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchExpanded(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                background: 'rgba(255,42,109,0.05)',
                border: '1px solid rgba(255,42,109,0.2)',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#05D5FA',
                transition: 'all 0.2s ease',
              }}
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Wallet ── */}
      <div style={{ flexShrink: 0 }}>
        {connected && address ? (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 14px',
              background: 'rgba(255,42,109,0.05)',
              border: '1px solid rgba(255,42,109,0.20)',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#F8F0FF',
              fontSize: 12,
              fontFamily: 'monospace',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10B981',
                flexShrink: 0,
                boxShadow: '0 0 6px rgba(16,185,129,0.7)',
              }}
            />
            {shortenAddr(address)}
          </button>
        ) : (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 36,
              padding: '0 16px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.8) 0%, rgba(59,130,246,0.8) 100%)',
              boxShadow: '0 4px 15px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => setModalOpen(true)}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
