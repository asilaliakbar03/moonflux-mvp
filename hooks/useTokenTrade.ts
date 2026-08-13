"use client";

import { useCallback, useState } from "react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import BN from "bn.js";
import { useMoonWallet } from "@/components/WalletProvider";
import {
  getMoonfluxProgram,
  getBondingCurvePDA,
  getSolVaultPDA,
  getGlobalConfigPDA,
  FEE_RECIPIENT,
  simulateBuy,
  simulateSell,
} from "@/lib/program";

/**
 * useTokenTrade — Real Anchor buy/sell hook for MoonFluxx bonding curve tokens.
 * 
 * This replaces the mock setTimeout trade with actual on-chain transactions
 * using the same pattern as useTokenDeploy (build tx → sign → send → confirm).
 */
export function useTokenTrade() {
  const { anchorWallet, connection, connected } = useMoonWallet();
  const [isTrading, setIsTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  /**
   * Buy tokens from the bonding curve.
   * @param mintAddress - The token mint public key (string or PublicKey)
   * @param solAmount - Amount of SOL to spend (in human-readable units, e.g. 0.5)
   * @param slippageBps - Slippage tolerance in basis points (e.g. 100 = 1%)
   * @param curveState - Current on-chain curve state (virtualSolReserves, virtualTokenReserves in raw units)
   */
  const buyTokens = useCallback(
    async (
      mintAddress: string,
      solAmount: number,
      slippageBps: number = 100,
      curveState: { virtualSolReserves: number; virtualTokenReserves: number }
    ): Promise<string | null> => {
      if (!connected || !anchorWallet || !connection) {
        setError("Wallet not connected");
        return null;
      }

      setIsTrading(true);
      setError(null);
      setTxSignature(null);

      try {
        const mint = new PublicKey(mintAddress);
        const program = getMoonfluxProgram(connection, anchorWallet);

        // Derive all PDAs
        const bondingCurve = getBondingCurvePDA(mint);
        const solVault = getSolVaultPDA(mint);
        const globalConfig = getGlobalConfigPDA();

        // Get/create associated token accounts
        const userTokenAccount = await getAssociatedTokenAddress(mint, anchorWallet.publicKey);
        const curveTokenAccount = await getAssociatedTokenAddress(mint, bondingCurve, true); // PDA allowOwnerOffCurve

        // Convert SOL to lamports
        const solInLamports = new BN(Math.floor(solAmount * 1e9));

        // Simulate to get minimum tokens out (with slippage)
        const { tokensOut } = simulateBuy(
          new BN(curveState.virtualSolReserves),
          new BN(curveState.virtualTokenReserves),
          solInLamports,
          100 // 1% fee (100 bps)
        );

        // Apply slippage tolerance
        const minTokensOut = tokensOut.mul(new BN(10000 - slippageBps)).div(new BN(10000));

        // Build the buy instruction via Anchor
        const buyTx = await (program.methods as any)
          .buy(solInLamports, minTokensOut)
          .accounts({
            bondingCurve,
            solVault,
            curveTokenAccount,
            userTokenAccount,
            mint,
            user: anchorWallet.publicKey,
            globalConfig,
            feeRecipient: FEE_RECIPIENT,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        // Check if user ATA exists, create if not
        const userAtaInfo = await connection.getAccountInfo(userTokenAccount);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        const combinedTx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: anchorWallet.publicKey,
        });

        if (!userAtaInfo) {
          combinedTx.add(
            createAssociatedTokenAccountInstruction(
              anchorWallet.publicKey,
              userTokenAccount,
              anchorWallet.publicKey,
              mint
            )
          );
        }

        combinedTx.add(...buyTx.instructions);

        // Sign and send
        const signedTx = await anchorWallet.signTransaction(combinedTx);
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        );

        setTxSignature(signature);
        return signature;
      } catch (err: any) {
        console.error("Buy failed:", err);
        const msg = err?.message || "Transaction failed";
        // Parse common Anchor/Solana errors
        if (msg.includes("Insufficient")) setError("Insufficient SOL balance");
        else if (msg.includes("slippage") || msg.includes("Slippage")) setError("Slippage exceeded — try increasing tolerance");
        else if (msg.includes("rejected")) setError("Transaction rejected by wallet");
        else setError(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
        return null;
      } finally {
        setIsTrading(false);
      }
    },
    [anchorWallet, connection, connected]
  );

  /**
   * Sell tokens back to the bonding curve.
   * @param mintAddress - The token mint public key
   * @param tokenAmount - Amount of tokens to sell (in human-readable units, e.g. 50000)
   * @param slippageBps - Slippage tolerance in basis points (e.g. 100 = 1%)
   * @param curveState - Current on-chain curve state
   */
  const sellTokens = useCallback(
    async (
      mintAddress: string,
      tokenAmount: number,
      slippageBps: number = 100,
      curveState: { virtualSolReserves: number; virtualTokenReserves: number }
    ): Promise<string | null> => {
      if (!connected || !anchorWallet || !connection) {
        setError("Wallet not connected");
        return null;
      }

      setIsTrading(true);
      setError(null);
      setTxSignature(null);

      try {
        const mint = new PublicKey(mintAddress);
        const program = getMoonfluxProgram(connection, anchorWallet);

        // Derive all PDAs
        const bondingCurve = getBondingCurvePDA(mint);
        const solVault = getSolVaultPDA(mint);
        const globalConfig = getGlobalConfigPDA();

        // Get associated token accounts
        const userTokenAccount = await getAssociatedTokenAddress(mint, anchorWallet.publicKey);
        const curveTokenAccount = await getAssociatedTokenAddress(mint, bondingCurve, true);

        // Convert token amount to raw units (6 decimals)
        const tokensInRaw = new BN(Math.floor(tokenAmount * 1e6));

        // Simulate to get minimum SOL out (with slippage)
        const { solOut } = simulateSell(
          new BN(curveState.virtualSolReserves),
          new BN(curveState.virtualTokenReserves),
          tokensInRaw,
          100 // 1% fee
        );

        // Apply slippage tolerance
        const minSolOut = solOut.mul(new BN(10000 - slippageBps)).div(new BN(10000));

        // Build the sell instruction via Anchor
        const sellTx = await (program.methods as any)
          .sell(tokensInRaw, minSolOut)
          .accounts({
            bondingCurve,
            solVault,
            curveTokenAccount,
            userTokenAccount,
            mint,
            user: anchorWallet.publicKey,
            globalConfig,
            feeRecipient: FEE_RECIPIENT,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        const combinedTx = new Transaction({
          recentBlockhash: blockhash,
          feePayer: anchorWallet.publicKey,
        });

        combinedTx.add(...sellTx.instructions);

        // Sign and send
        const signedTx = await anchorWallet.signTransaction(combinedTx);
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        );

        setTxSignature(signature);
        return signature;
      } catch (err: any) {
        console.error("Sell failed:", err);
        const msg = err?.message || "Transaction failed";
        if (msg.includes("Insufficient")) setError("Insufficient token balance");
        else if (msg.includes("slippage") || msg.includes("Slippage")) setError("Slippage exceeded — try increasing tolerance");
        else if (msg.includes("rejected")) setError("Transaction rejected by wallet");
        else setError(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
        return null;
      } finally {
        setIsTrading(false);
      }
    },
    [anchorWallet, connection, connected]
  );

  return {
    buyTokens,
    sellTokens,
    isTrading,
    error,
    txSignature,
    clearError: () => setError(null),
    clearTx: () => setTxSignature(null),
  };
}
