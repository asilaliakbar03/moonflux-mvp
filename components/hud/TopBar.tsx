'use client';

import { Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useMoonWallet } from '@/components/WalletProvider';
import { useWalletModal } from '@/components/SolanaProvider';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { SearchModal } from '@/components/SearchModal';

function shortenAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function TopBar() {
  const { connected, address } = useMoonWallet();
  const { setModalOpen } = useWalletModal();
  const { theme, toggleTheme } = useTheme();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: isDark
          ? '1px solid rgba(99,102,241,0.06)'
          : '1px solid rgba(99,102,241,0.10)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-3 shrink-0 group mr-2 sm:mr-6">
        <span className="bmark">
          <span className="b-ring"></span>
          <span className="b-ring2"></span>
          <span className="b-flow"></span>
          <span className="b-fh"></span>
          <span className="b-fhl"></span>
          <span className="b-fv"></span>
          <span className="b-core"></span>
        </span>
        
        <span
          className="inline group-hover:opacity-80 transition-opacity"
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 500,
            fontSize: '1rem',
            letterSpacing: '.22em',
            textTransform: 'uppercase' as const,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          MoonFluxx<sup style={{ fontSize: '.5em', fontWeight: 300, letterSpacing: 0 }}>®</sup>
        </span>
      </Link>

      {/* ── Search ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
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
              color: 'var(--color-text-faint)',
              pointerEvents: 'none',
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search tokens..."
            readOnly
            onClick={() => setSearchModalOpen(true)}
            style={{
              width: '100%',
              height: 40,
              background: isDark ? 'var(--color-surface-2)' : 'var(--color-surface-2)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 10,
              paddingLeft: 36,
              paddingRight: 12,
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              color: 'var(--color-text-primary)',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.40)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
          />
          <kbd
            className="hidden lg:flex"
            style={{
              position: 'absolute',
              right: 10,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--color-text-faint)',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              borderRadius: 4,
              padding: '2px 6px',
              alignItems: 'center',
              gap: 2,
              pointerEvents: 'none',
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Mobile search icon */}
        <div className="flex md:hidden" style={{ alignItems: 'center' }}>
          <button
            onClick={() => setSearchModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#818CF8',
              transition: 'all 0.2s ease',
            }}
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* ── Theme Toggle ── */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.08)',
          border: '1px solid var(--color-border-subtle)',
          cursor: 'pointer',
          color: isDark ? '#F59E0B' : '#6366F1',
          flexShrink: 0,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.15)';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.08)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── Wallet ── */}
      <div style={{ flexShrink: 0 }}>
        {connected && address ? (
          <button
            className="shadow-[0_0_0_2px_rgba(99,102,241,0.3)]"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 14px',
              background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.20)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
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
              background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #4338CA, #4F46E5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #4F46E5, #6366F1)';
            }}
            onClick={() => setModalOpen(true)}
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="fluxx-beam" />
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}
