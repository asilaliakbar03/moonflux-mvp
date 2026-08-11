import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMoonWallet } from '@/components/WalletProvider';
import { supabase } from '@/lib/supabase';

export interface TokenDeployFormData {
  name: string;
  ticker: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
}

type ToastFn = (message: string, type?: 'success' | 'error' | 'info') => void;

export function useTokenDeploy(showToast?: ToastFn) {
  const router = useRouter();
  const { anchorWallet, connection } = useMoonWallet();
  const [isDeploying, setIsDeploying] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (showToast) showToast(msg, type);
    else if (type === 'error') alert(msg);
  };

  const deployToken = async (formData: TokenDeployFormData, imageFile: File | null) => {
    if (!anchorWallet) {
      notify('Connect your wallet first', 'error');
      return;
    }

    // Check SOL balance first
    try {
      const balance = await connection.getBalance(anchorWallet.publicKey);
      const solBalance = balance / 1_000_000_000;
      console.log(`[Deploy] Wallet balance: ${solBalance} SOL`);
      if (solBalance < 0.01) {
        notify(`Insufficient SOL (${solBalance.toFixed(4)} SOL). Need at least 0.01 SOL`, 'error');
        return;
      }
    } catch (e) {
      console.warn('[Deploy] Could not check balance:', e);
    }

    let metadataUri = '';
    try {
      const uploadForm = new FormData();
      if (imageFile) uploadForm.append('image', imageFile);
      uploadForm.append('name', formData.name);
      uploadForm.append('ticker', formData.ticker);
      uploadForm.append('description', formData.description);
      if (formData.website) uploadForm.append('website', formData.website);
      if (formData.twitter) uploadForm.append('twitter', formData.twitter);
      if (formData.telegram) uploadForm.append('telegram', formData.telegram);
      uploadForm.append('creatorAddress', anchorWallet.publicKey.toBase58());

      const uploadRes = await fetch('/api/upload-metadata', { method: 'POST', body: uploadForm });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        metadataUri = uploadData.metadataUri as string;
        console.log(`[Deploy] Metadata URI (${metadataUri.length} chars): ${metadataUri.substring(0, 80)}...`);
      } else {
        console.warn('[Deploy] Metadata upload returned:', uploadRes.status);
      }
    } catch (e) {
      console.warn('[Deploy] Metadata upload failed, continuing without URI:', e);
    }

    // Guard: smart contract has 200 char limit on metadataUri
    if (metadataUri.length > 200) {
      console.warn(`[Deploy] metadataUri too long (${metadataUri.length} chars), truncating`);
      metadataUri = metadataUri.substring(0, 200);
    }

    // Fallback if empty
    if (!metadataUri) {
      metadataUri = `https://moonflux.vercel.app/api/meta/${formData.ticker}`;
      console.log('[Deploy] Using fallback metadataUri:', metadataUri);
    }

    setIsDeploying(true);
    try {
      const { Keypair, SystemProgram, Transaction } = await import("@solana/web3.js");
      const {
        getMoonfluxProgram,
        getBondingCurvePDA,
        getSolVaultPDA,
        getGlobalConfigPDA,
      } = await import("@/lib/program");
      const {
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        getAssociatedTokenAddressSync,
        createInitializeMint2Instruction,
        MintLayout,
      } = await import("@solana/spl-token");

      const program     = getMoonfluxProgram(connection, anchorWallet);
      const mint        = Keypair.generate();
      const curvePda    = getBondingCurvePDA(mint.publicKey);
      const solVaultPda = getSolVaultPDA(mint.publicKey);
      const globalPda   = getGlobalConfigPDA();

      console.log('[Deploy] Mint:', mint.publicKey.toBase58());
      console.log('[Deploy] Curve PDA:', curvePda.toBase58());
      console.log('[Deploy] Global PDA:', globalPda.toBase58());

      const curveTokenAccount = getAssociatedTokenAddressSync(
        mint.publicKey,
        curvePda,
        true // allow PDA as owner (off-curve)
      );

      const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
      const createMintIx = SystemProgram.createAccount({
        fromPubkey:         anchorWallet.publicKey,
        newAccountPubkey:   mint.publicKey,
        space:              MintLayout.span,
        lamports:           lamportsForMint,
        programId:          TOKEN_PROGRAM_ID,
      });
      const initMintIx = createInitializeMint2Instruction(
        mint.publicKey,
        6,
        curvePda,
        null,
        TOKEN_PROGRAM_ID
      );

      console.log('[Deploy] Building createPool tx with metadataUri:', metadataUri);
      const createPoolTx = await program.methods.createPool(metadataUri, 0)
        .accounts({
          bondingCurve:           curvePda,
          solVault:               solVaultPda,
          curveTokenAccount,
          mint:                   mint.publicKey,
          creator:                anchorWallet.publicKey,
          quoteMint:              SystemProgram.programId,
          tokenProgram:           TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram:          SystemProgram.programId,
          globalConfig:           globalPda,
        })
        .transaction();

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const combinedTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer:        anchorWallet.publicKey,
      })
        .add(createMintIx)
        .add(initMintIx)
        .add(...createPoolTx.instructions);

      combinedTx.partialSign(mint);

      console.log('[Deploy] Requesting wallet signature...');
      const signedTx = await anchorWallet.signTransaction(combinedTx);
      console.log('[Deploy] Sending transaction...');
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log('[Deploy] Transaction sent:', signature);
      notify('Transaction sent! Confirming...', 'info');

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      console.log('[Deploy] Transaction confirmed!');
      notify('Token deployed successfully! 🚀', 'success');

      // Insert token into Supabase
      try {
        await supabase.from('tokens').insert({
          mint_address: mint.publicKey.toBase58(),
          name: formData.name,
          ticker: formData.ticker,
          description: formData.description,
          metadata_uri: metadataUri,
          bonding_curve_progress: 0,
        } as any);
      } catch (dbErr) {
        console.error("Failed to insert token into Supabase:", dbErr);
      }

      router.push(`/token/${mint.publicKey.toBase58()}`);
    } catch (err: any) {
      console.error("Deploy failed:", err);
      const msg = err.message || String(err);
      
      // Parse Solana/Anchor error codes
      if (msg.includes('User rejected') || msg.includes('rejected')) {
        notify('Transaction rejected in wallet', 'error');
      } else if (msg.includes('0x1') || msg.includes('insufficient') || msg.includes('Insufficient')) {
        notify('Insufficient SOL balance for this transaction', 'error');
      } else if (msg.includes('6009') || msg.includes('ProgramPaused')) {
        notify('Program is paused by admin', 'error');
      } else if (msg.includes('6014') || msg.includes('MetadataUriTooLong')) {
        notify('Metadata URI too long (max 200 chars)', 'error');
      } else if (msg.includes('6000') || msg.includes('CurveComplete')) {
        notify('Bonding curve already complete', 'error');
      } else if (msg.includes('Transaction simulation failed')) {
        // Extract the actual error from simulation
        const simMatch = msg.match(/Error Message: (.+?)(\.|$)/);
        notify(simMatch ? simMatch[1] : `Simulation failed: ${msg.slice(0, 100)}`, 'error');
      } else {
        notify(`Deploy failed: ${msg.slice(0, 120)}`, 'error');
      }
    } finally {
      setIsDeploying(false);
    }
  };

  return { deployToken, isDeploying };
}

