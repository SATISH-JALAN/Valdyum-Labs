/**
 * Pure string utility — zero runtime dependencies.
 * Safe to use in both client (browser) and server (Node.js).
 */

/**
 * Truncate a Stellar address for display.
 * Example: "GABCD...WXYZ"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}
