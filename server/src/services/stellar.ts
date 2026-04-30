/*
 * DEPRECATED: Stellar service removed for Solana migration.
 * This file has been completely replaced by services/solana.ts.
 * All stellar-sdk imports and functions have been removed.
 *
 * Migration Reference:
 * - Use verifyPaymentTransaction() from services/solana.ts for tx verification
 * - Use connection.onLogs() instead of Horizon SSE for account watching
 * - Use connection.getBalance() for SOL balance or getParsedTokenAccountsByOwner() for SPL tokens
 *
 * This stub exists only to prevent import errors during the migration phase.
 */

export function noop(): void {
  // This file is deprecated.
}

export async function verifyPaymentTransaction(
  txHash: string,
  expectedDestination?: string,
  expectedAmount?: number
): Promise<{ verified: boolean; error?: string }> {
  console.warn('[stellar] verifyPaymentTransaction is deprecated — use solana service');
  return { verified: false, error: 'Stellar service deprecated' };
}

export function watchAccountTransactions(
  accountId: string,
  callback: (tx: any) => void
): () => void {
  console.warn('[stellar] watchAccountTransactions is deprecated — use solana service');
  return () => {};
}

export async function waitForTransaction(
  txHash: string,
  timeoutMs?: number
): Promise<{ success: boolean; error?: string; memo?: string }> {
  console.warn('[stellar] waitForTransaction is deprecated — use solana service');
  return { success: false, error: 'Stellar service deprecated', memo: undefined };
}
