'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useMoonWallet } from '@/components/WalletProvider';

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
        background: 'rgba(8,11,18,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99,102,241,0.10)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          minWidth: 40,
        }}
      >
        <span
          style={{
            fontSize: 20,
            color: '#6366F1',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          ●
        </span>
        <span
          className="hidden sm:inline"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: '#F1F5F9',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          MoonFluxx
        </span>
      </div>

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
                  width: 180,
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
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#818CF8',
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
