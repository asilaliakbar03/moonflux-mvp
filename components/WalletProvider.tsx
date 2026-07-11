// Re-export everything from the real Solana wallet adapter
// This file bridges our @/components/WalletProvider import to the real adapter
"use client";

export {
  useWallet,
  useConnection,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";

import { useWallet as useSolanaWallet, useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";

export function useMoonWallet() {
  const {
    connected,
    publicKey,
    wallet,
    connecting,
    disconnect,
    sendTransaction,
  } = useSolanaWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!connected || !publicKey) { setBalance(0); return; }
    const address = publicKey.toBase58();
    let cancelled = false;

    // Fetch real SOL balance
    connection.getBalance(publicKey).then((lamports: number) => {
      if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
    }).catch(() => {});

    // Register / update user in Supabase (fire and forget)
    import("@/lib/db").then(({ upsertUser }) => {
      if (!cancelled) upsertUser(address);
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [connected, publicKey, connection]);

  return {
    connected,
    address: publicKey?.toBase58() ?? null,
    publicKey,
    wallet: wallet?.adapter.name ?? null,
    anchorWallet,
    balance,
    connecting,
    disconnect,
    sendTransaction,
    connection, // exposed so pages can destructure it directly
  };
}
