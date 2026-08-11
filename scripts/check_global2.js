const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, Idl } = require('@coral-xyz/anchor');
const idl = require('./lib/idl.json');

async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const PROGRAM_ID = new PublicKey('DrVK92avUZvKHbyxd3StwX9c3zkZf5nDNoBrgU32e1NE');
  
  const [globalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('global')],
    PROGRAM_ID
  );

  const provider = new AnchorProvider(connection, { publicKey: PublicKey.default, signTransaction: () => {} }, {});
  const program = new Program(idl, provider);

  const globalData = await program.account.globalConfig.fetch(globalPda);
  console.log('Global Config:');
  console.log('admin:', globalData.admin.toBase58());
  console.log('feeRecipient:', globalData.feeRecipient.toBase58());
  console.log('paused:', globalData.paused);
  console.log('feeBps:', globalData.feeBps);
}

main().catch(console.error);
