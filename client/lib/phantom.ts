import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { PhantomProvider } from '../types/phantom';

function getPhantomProvider(): PhantomProvider | undefined {
  if (typeof window === 'undefined') {
    throw new Error('Window object not available');
  }

  const provider = window.phantom?.solana || window.solana;
  if (!provider) {
    throw new Error('Phantom provider not found');
  }
  return provider;
}

function rpcConfig() {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'testnet';
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    || (cluster === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.testnet.solana.com');
  return { cluster, rpcUrl };
}

export async function connectPhantom(): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider?.isPhantom) {
    throw new Error('Phantom extension not found. Install from https://phantom.app');
  }
  const result = await provider.connect();
  const pubKey = result?.publicKey?.toString() || provider.publicKey?.toString();
  if (!pubKey) {
    throw new Error('Could not retrieve Phantom public key. Please reconnect.');
  }
  return pubKey;
}

export async function sendSolTransfer(destination: string, amountSol: number): Promise<{ txHash: string; sender: string }> {
  const provider = getPhantomProvider();
  if (!provider?.isPhantom) {
    throw new Error('Phantom extension not found. Install from https://phantom.app');
  }

  const sender = await connectPhantom();
  const { rpcUrl } = rpcConfig();
  const connection = new Connection(rpcUrl, 'confirmed');

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({ feePayer: new PublicKey(sender), recentBlockhash: blockhash }).add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(sender),
      toPubkey: new PublicKey(destination),
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const signedTx = await provider.signTransaction(tx);
  const txHash = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction({ signature: txHash, blockhash, lastValidBlockHeight }, 'confirmed');
  return { txHash, sender };
}

export function solExplorerTx(txHash: string): string {
  const { cluster } = rpcConfig();
  return `https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`;
}
