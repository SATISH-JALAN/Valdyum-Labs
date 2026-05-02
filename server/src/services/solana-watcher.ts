import { Connection, PublicKey } from '@solana/web3.js';

export function watchAccountTransactions(programId: string, handler: (tx: any) => Promise<void>) {
  const cluster = process.env.SOLANA_CLUSTER || 'testnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || (cluster === 'testnet' ? 'https://api.testnet.solana.com' : 'https://api.mainnet-beta.solana.com');
  const conn = new Connection(rpcUrl);

  let closed = false;

  // Simple poller for demonstration. In production use websockets / subscriptions.
  const interval = setInterval(async () => {
    if (closed) return;
    try {
      // placeholder: fetch recent confirmed signatures for programId
      // Real implementation would query program accounts or use program logs
      // We call handler with a trivial event to keep interface consistent.
      await handler({ id: `${programId}:${Date.now()}`, hash: `${programId}-placeholder`, memo: null, fee_charged: 0, operation_count: 0, successful: true, created_at: new Date().toISOString() });
    } catch (err) {
      console.error('[solana-watcher] handler error', err);
    }
  }, 30000);

  return () => {
    closed = true;
    clearInterval(interval);
  };
}
