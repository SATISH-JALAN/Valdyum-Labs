/*
  Minimal integration test for 0x402 agent micropayment flow.
  Usage:
    pnpm --filter @valdyum/server exec tsx src/scripts/test-agent-micropayment.ts --agent <agentId> --input "hello"
*/

const args = process.argv.slice(2);
const arg = (name: string) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
};

const AGENT_ID = arg('--agent') || process.env.TEST_AGENT_ID || '';
const INPUT = arg('--input') || 'Test micropayment request';
const API_BASE = process.env.VALDYUM_API_URL || 'http://localhost:4000';
const FACILITATOR_URL = process.env.PAYAI_FACILITATOR_URL || 'https://facilitator.payai.network';

async function main() {
  if (!AGENT_ID) {
    throw new Error('Missing --agent <agentId> or TEST_AGENT_ID env var');
  }

  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`API: ${API_BASE}`);

  const first = await fetch(`${API_BASE}/api/agents/${AGENT_ID}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: INPUT }),
  });

  const firstJson = await first.json().catch(() => ({} as any));
  if (first.status !== 402) {
    console.log('Agent responded without payment requirement:');
    console.log(firstJson);
    return;
  }

  const pd = (firstJson as any)?.payment_details;
  if (!pd) {
    throw new Error('402 returned without payment_details');
  }

  // In production this should call facilitator for challenge/session and execute wallet payment.
  // This script verifies request contract + API behavior only.
  console.log('402 payment details:');
  console.log(pd);

  const fakeTxHash = `simulated-${Date.now()}`;
  const second = await fetch(`${API_BASE}/api/agents/${AGENT_ID}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Tx-Hash': fakeTxHash,
      'X-Payment-Wallet': pd.address,
      'X-Payment-Facilitator': FACILITATOR_URL,
    },
    body: JSON.stringify({ input: INPUT }),
  });

  const secondJson = await second.json().catch(() => ({}));
  console.log(`Second response status: ${second.status}`);
  console.log(secondJson);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
