"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";

// Use your Helius RPC URL from env var, fallback to public mainnet
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");

interface SolanaProviderProps {
  children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
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
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
