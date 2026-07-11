export interface HeliusEnrichedTransaction {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers: TokenTransfer[];
  nativeTransfers: NativeTransfer[];
  accountData: AccountData[];
  transactionError: any | null;
  instructions: Instruction[];
  events: any;
}

export interface TokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  fromTokenAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface NativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

export interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: any[];
}

export interface Instruction {
  accounts: string[];
  data: string;
  programId: string;
  innerInstructions: InnerInstruction[];
}

export interface InnerInstruction {
  accounts: string[];
  data: string;
  programId: string;
}

export type ParsedTradeEvent = {
  type: "buy" | "sell";
  wallet_address: string;
  sol_amount: number;
  token_amount: number;
  token_mint: string;
  tx_signature: string;
};

/**
 * Extracts trade details from a Helius Enriched Transaction involving the MoonFluxx Bonding Curve program.
 */
export function parseMoonfluxTrade(
  tx: HeliusEnrichedTransaction,
  programId: string
): ParsedTradeEvent | null {
  // If the transaction failed, ignore it
  if (tx.transactionError) return null;

  // Check if our program is involved
  const involvesProgram = tx.instructions.some(
    (ix) => ix.programId === programId
  );
  
  if (!involvesProgram) return null;

  // Extract the main token transfer
  if (tx.tokenTransfers.length === 0) return null;
  const tokenTransfer = tx.tokenTransfers[0];

  const isBuy = tx.nativeTransfers.some((nt) => nt.fromUserAccount === tx.feePayer);
  
  let solAmount = 0;
  if (isBuy) {
    solAmount = tx.nativeTransfers
      .filter((nt) => nt.fromUserAccount === tx.feePayer)
      .reduce((acc, curr) => acc + curr.amount, 0);
  } else {
    solAmount = tx.nativeTransfers
      .filter((nt) => nt.toUserAccount === tx.feePayer)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }

  const tokenAmount = tokenTransfer.tokenAmount;

  if (solAmount === 0 || tokenAmount === 0) return null;

  return {
    type: isBuy ? "buy" : "sell",
    wallet_address: tx.feePayer,
    sol_amount: solAmount / 1_000_000_000, // Convert lamports to SOL
    token_amount: tokenAmount,
    token_mint: tokenTransfer.mint,
    tx_signature: tx.signature,
  };
}
