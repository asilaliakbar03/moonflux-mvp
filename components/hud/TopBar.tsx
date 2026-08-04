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
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#000';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-3 sm:px-5 gap-3 font-mono uppercase tracking-wider"
      style={{
        height: 64,
        backgroundColor: isDark ? '#050510' : '#FFFFFF',
        borderBottom: `3px solid ${borderColor}`,
      }}
    >
      {/* ── Logo (mobile only, desktop has it in sidebar) ── */}
      <Link href="/" className="flex md:hidden items-center gap-2 shrink-0 group mr-2">
        <div className={`w-8 h-8 flex items-center justify-center font-black text-lg bg-[#6366F1] text-white ${isDark ? 'border-2 border-[rgba(255,255,255,0.3)]' : 'border-2 border-black'} shadow-[2px_2px_0px_0px_#10B981]`}>
          M
        </div>
        <span className="font-black text-sm tracking-[0.2em] group-hover:text-[#6366F1] transition-colors">
          MOONFLUXX
        </span>
      </Link>

      {/* ── Search ── */}
      <div className="flex-1 flex justify-center">
        {/* Desktop search */}
        <div className="hidden md:flex relative w-full" style={{ maxWidth: 480 }}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#999' }}
          />
          <input
            type="text"
            placeholder="> SEARCH_TOKENS.EXE --QUERY='...'"
            readOnly
            onClick={() => setSearchModalOpen(true)}
            className={`
              w-full h-10 pl-9 pr-16 font-mono font-bold text-xs uppercase tracking-wider cursor-pointer
              ${isDark 
                ? 'bg-black text-white border-2 border-[rgba(255,255,255,0.2)] placeholder-[rgba(255,255,255,0.25)] focus:border-[#6366F1]' 
                : 'bg-gray-50 text-black border-2 border-black placeholder-gray-400 focus:border-[#6366F1]'}
              outline-none transition-colors
            `}
          />
          <kbd
            className={`
              hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2
              text-[10px] font-mono font-black px-2 py-1 pointer-events-none
              ${isDark 
                ? 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.15)]' 
                : 'bg-gray-200 text-gray-500 border border-gray-300'}
            `}
          >
            ⌘K
          </kbd>
        </div>

        {/* Mobile search icon */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setSearchModalOpen(true)}
            className={`
              flex items-center justify-center w-9 h-9
              ${isDark 
                ? 'bg-black text-[#6366F1] border-2 border-[rgba(255,255,255,0.2)] hover:border-[#6366F1]' 
                : 'bg-white text-[#6366F1] border-2 border-black hover:bg-[#6366F1] hover:text-white'}
              transition-all
            `}
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
        className={`
          flex items-center justify-center w-9 h-9 shrink-0 font-black transition-all
          ${isDark 
            ? 'bg-black text-[#F59E0B] border-2 border-[rgba(255,255,255,0.2)] hover:border-[#F59E0B] hover:shadow-[2px_2px_0px_0px_#F59E0B]' 
            : 'bg-white text-[#6366F1] border-2 border-black hover:bg-[#6366F1] hover:text-white hover:shadow-[2px_2px_0px_0px_#000]'}
          active:translate-y-0.5 active:shadow-none
        `}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── Wallet ── */}
      <div className="shrink-0">
        {connected && address ? (
          <button
            className={`
              flex items-center gap-2 h-9 px-3 font-mono font-black text-xs tracking-wider
              ${isDark 
                ? 'bg-black text-[#10B981] border-2 border-[#10B981] shadow-[2px_2px_0px_0px_#10B981]' 
                : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#10B981]'}
              hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all
            `}
          >
            <span className="w-2 h-2 bg-[#10B981] shrink-0 shadow-[0_0_6px_#10B981]" />
            {shortenAddr(address)}
          </button>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className={`
              flex items-center justify-center h-9 px-4 font-mono font-black text-xs tracking-wider
              bg-[#6366F1] text-white
              ${isDark ? 'border-2 border-[rgba(255,255,255,0.3)]' : 'border-2 border-black'}
              shadow-[3px_3px_0px_0px_#10B981]
              hover:shadow-[5px_5px_0px_0px_#10B981] hover:-translate-y-0.5
              active:translate-y-0.5 active:shadow-none
              transition-all
            `}
          >
            [ CONNECT WALLET ]
          </button>
        )}
      </div>

      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}
