import { PublicKey } from '@solana/web3.js';

export function isValidSolanaAddress(address: string): boolean {
  try {
    // PublicKey will throw for invalid addresses
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pk = new PublicKey(address);
    return true;
  } catch (e) {
    return false;
  }
}

export function clusterFromEnv(): 'mainnet-beta' | 'testnet' | 'devnet' {
  const env = process.env.SOLANA_CLUSTER || process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'testnet';
  if (env === 'mainnet-beta') return 'mainnet-beta';
  if (env === 'devnet') return 'devnet';
  return 'testnet';
}

export function truncateAddress(addr: string, len = 6): string {
  if (!addr || addr.length <= len * 2 + 3) return addr;
  return `${addr.slice(0, len)}...${addr.slice(-len)}`;
}
