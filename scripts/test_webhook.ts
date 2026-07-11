/**
 * test_webhook.ts
 * 
 * Run with: npx ts-node scripts/test_webhook.ts
 * 
 * Simulates a Helius Webhook payload hitting the local Next.js server.
 */

// @ts-ignore
import fetch from "node-fetch";

// Simulated Helius payload
const mockPayload = [
  {
    description: "User bought 1,500 MoonFluxx tokens",
    type: "UNKNOWN",
    source: "MOONFLUXX_PROGRAM",
    fee: 5000,
    feePayer: "USER_WALLET_123456789",
    signature: "simulated_tx_signature_" + Date.now(),
    slot: 123456789,
    timestamp: Date.now() / 1000,
    tokenTransfers: [
      {
        fromUserAccount: "CURVE_VAULT_123",
        toUserAccount: "USER_WALLET_123456789",
        fromTokenAccount: "VAULT_ATA",
        toTokenAccount: "USER_ATA",
        tokenAmount: 1500, // They received 1500 tokens
        mint: "MOCK_TOKEN_MINT_123",
        tokenStandard: "Fungible",
      },
    ],
    nativeTransfers: [
      {
        fromUserAccount: "USER_WALLET_123456789",
        toUserAccount: "CURVE_SOL_VAULT_123",
        amount: 250000000, // They spent 0.25 SOL
      },
    ],
    accountData: [],
    transactionError: null,
    instructions: [
      {
        accounts: [],
        data: "",
        // This program ID matches what's expected in the API route
        programId: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
        innerInstructions: [],
      },
    ],
    events: {},
  },
];

async function run() {
  console.log("Sending simulated Helius payload to http://localhost:3000/api/webhooks/helius");
  
  try {
    const res = await fetch("http://localhost:3000/api/webhooks/helius", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPayload),
    });

    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log("Response Body:", data);
  } catch (e: any) {
    console.error("Error connecting to localhost. Make sure `npm run dev` is running!");
    console.error(e.message);
  }
}

run();
