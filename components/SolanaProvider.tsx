"use client";

import { ReactNode, useMemo, useState, createContext, useContext } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModal } from "@/components/WalletModal";

// Use your Helius RPC URL from env var, fallback to public devnet
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet");

interface SolanaProviderProps {
  children: ReactNode;
}

const WalletModalContext = createContext({
  setModalOpen: (open: boolean) => {},
});

export function useWalletModal() {
  return useContext(WalletModalContext);
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalContext.Provider value={{ setModalOpen }}>
          {children}
          <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </WalletModalContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
