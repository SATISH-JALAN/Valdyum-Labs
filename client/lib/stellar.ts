import { Horizon } from "stellar-sdk";

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";

export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getXlmBalance(address: string): Promise<string> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native?.balance ?? "0";
  } catch {
    return "0";
  }
}

export async function fundTestAccount(address: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`,
    );
    return response.ok;
  } catch {
    return false;
  }
}
