import { Transaction } from '@solana/web3.js';

export type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect: () => Promise<{ publicKey?: { toString(): string } | null }>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  disconnect?: () => Promise<void>;
};

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solana?: PhantomProvider;
  }
}

export {};
