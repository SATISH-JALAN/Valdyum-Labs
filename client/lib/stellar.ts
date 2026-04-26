/**
 * client/lib/stellar.ts
 *
 * Browser-safe Stellar utilities. These functions call Horizon directly
 * and are safe to run in the browser (no secret keys, no server-only deps).
 */

/**
 * Truncate a Stellar address for display.
 * Example: "GABCD...WXYZ"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

import * as StellarSdk from 'stellar-sdk';

const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

/**
 * Fetch the native XLM balance for a Stellar account.
 */
export async function getXlmBalance(address: string): Promise<string> {
  try {
    const account = await server.loadAccount(address);
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );
    return xlmBalance ? xlmBalance.balance : '0';
  } catch {
    return '0';
  }
}

/**
 * Fund a testnet account via Friendbot.
 */
export async function fundTestAccount(address: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    return res.ok;
  } catch {
    return false;
  }
}
