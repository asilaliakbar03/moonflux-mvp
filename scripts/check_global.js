const { Connection, PublicKey } = require('@solana/web3.js');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const PROGRAM_ID = new PublicKey('DrVK92avUZvKHbyxd3StwX9c3zkZf5nDNoBrgU32e1NE');
  
  const [globalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('global')],
    PROGRAM_ID
  );

  console.log('Global PDA:', globalPda.toBase58());

  const accountInfo = await connection.getAccountInfo(globalPda);
  if (accountInfo) {
    console.log('Global PDA exists, size:', accountInfo.data.length);
  } else {
    console.log('Global PDA DOES NOT EXIST. The program is either not deployed or not initialized.');
  }
}

main().catch(console.error);
