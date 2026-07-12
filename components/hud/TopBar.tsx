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
      <Link href="/" className="flex items-center gap-4 shrink-0 group mr-8">
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-visible">
          {/* Sweeping Energy Flow (Rightwards) */}
          <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-[60px] h-[16px] bg-[radial-gradient(ellipse_at_left,rgba(168,85,247,0.6)_0%,rgba(59,130,246,0.4)_50%,transparent_100%)] blur-[3px] rounded-r-full mix-blend-screen" />
          <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-[80px] h-[3px] bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(168,85,247,0.8)_30%,rgba(59,130,246,0.5)_70%,transparent_100%)] blur-[0.5px] rounded-r-full mix-blend-screen" />

          {/* Left short beam */}
          <div className="absolute right-[50%] top-1/2 -translate-y-1/2 w-[16px] h-[2px] bg-[linear-gradient(270deg,rgba(255,255,255,0.9)_0%,rgba(168,85,247,0.5)_100%)] blur-[0.5px] rounded-l-full mix-blend-screen" />

          {/* Vertical Crosshair */}
          <div className="absolute w-[2px] h-[180%] bg-[linear-gradient(180deg,transparent_0%,rgba(168,85,247,0.8)_25%,rgba(255,255,255,1)_50%,rgba(168,85,247,0.8)_75%,transparent_100%)] blur-[0.5px] rounded-full mix-blend-screen" style={{ boxShadow: "0 0 12px 2px rgba(168,85,247,0.6)" }} />

          {/* The Orbit/Circle Ring */}
          <div className="absolute inset-[-2px] rounded-full border border-[#a855f7] opacity-60 [mask-image:linear-gradient(90deg,#000_30%,transparent_80%)]" />
          <div className="absolute inset-[-2px] rounded-full border border-[#3b82f6] opacity-40 [mask-image:linear-gradient(180deg,transparent_20%,#000_80%)]" />

          {/* Glowing Core */}
          <div className="absolute w-4 h-4 bg-white rounded-full blur-[3px]" style={{ boxShadow: "0 0 15px 4px rgba(168,85,247,0.9), 0 0 30px 8px rgba(59,130,246,0.7)" }} />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full" />
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
                width: 36,
                height: 36,
                background: '#161B27',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#475569',
              }}
              aria-label="Search"
            >
              <Search size={15} />
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
              background: '#6366F1',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4F46E5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366F1';
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
