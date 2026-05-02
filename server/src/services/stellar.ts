import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

type VerifyResult = {
  valid: boolean;
  error?: string;
};

function getConnection(): Connection {
  const cluster = process.env.SOLANA_CLUSTER || process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'testnet';
  const endpoint = process.env.SOLANA_RPC_URL
    || process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    || (cluster === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.testnet.solana.com');
  return new Connection(endpoint, 'confirmed');
}

export async function verifyPaymentTransaction(
  txHash: string,
  expectedDestination: string,
  expectedAmount: number,
  _expectedMemo = '',
  expectedFrom?: string
): Promise<VerifyResult> {
  try {
    if (!txHash) {
      return { valid: false, error: 'Missing transaction hash' };
    }

    const conn = getConnection();
    let tx = await conn.getParsedTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!tx) {
      const confirmed = await waitForTransaction(txHash, 30_000);
      if (!confirmed) {
        return { valid: false, error: 'Transaction not found' };
      }

      tx = await conn.getParsedTransaction(txHash, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });

      if (!tx) {
        return { valid: false, error: 'Transaction not found after confirmation' };
      }
    }

    if (!tx.meta || tx.meta.err) {
      return { valid: false, error: 'Transaction failed on-chain' };
    }

    const expectedLamports = Math.round(expectedAmount * LAMPORTS_PER_SOL);
    let matched = false;

    const dest = expectedDestination ? new PublicKey(expectedDestination).toBase58() : '';
    const from = expectedFrom ? new PublicKey(expectedFrom).toBase58() : '';

    for (const ix of tx.transaction.message.instructions) {
      if (!('parsed' in ix) || !ix.parsed || !ix.program) continue;
      if (ix.program !== 'system') continue;
      const parsed = ix.parsed as any;
      if (parsed?.type !== 'transfer') continue;

      const info = parsed.info || {};
      const toOk = !dest || info.destination === dest;
      const fromOk = !from || info.source === from;
      const amountOk = typeof info.lamports === 'number' && info.lamports >= expectedLamports;
      if (toOk && fromOk && amountOk) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      return { valid: false, error: 'No matching transfer instruction found' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `Verification error: ${String(err)}` };
  }
}

export async function waitForTransaction(txHash: string, timeoutMs = 120_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  const conn = getConnection();

  while (Date.now() < deadline) {
    const status = await conn.getSignatureStatus(txHash);
    if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  return false;
}
