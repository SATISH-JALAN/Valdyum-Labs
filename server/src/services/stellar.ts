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
