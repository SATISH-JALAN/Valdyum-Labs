#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

const program = new Command();
const apiBaseDefault = process.env.VALDYUM_API_URL || 'http://localhost:3000';
const cluster = process.env.SOLANA_CLUSTER || process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'testnet';
const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || (cluster === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.testnet.solana.com');
const dashboardUrl = process.env.PLATFORM_API_URL || process.env.VALDYUM_DASHBOARD_URL || 'http://localhost:3000';
const agentWallet = process.env.SOLANA_AGENT_WALLET || process.env.AGENT_WALLET || '';

function explorerUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=${cluster}`;
}

function parseSecret(secret: string): Keypair {
  if (secret.trim().startsWith('[')) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret) as number[]));
  }
  return Keypair.fromSecretKey(bs58.decode(secret.trim()));
}

async function paySol(secret: string, destination: string, amountSol: number) {
  const kp = parseSecret(secret);
  const conn = new Connection(rpcUrl, 'confirmed');
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
  const tx = new Transaction({ feePayer: kp.publicKey, recentBlockhash: blockhash }).add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: new PublicKey(destination),
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );
  tx.sign(kp);
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
  return sig;
}

async function listAgents(apiBase: string) {
  const res = await fetch(`${apiBase}/api/agents/list`);
  const data = await res.json() as any;
  const agents = Array.isArray(data?.agents) ? data.agents : [];
  if (!agents.length) {
    console.log(chalk.yellow('No agents found.'));
    return;
  }
  for (const a of agents) {
    console.log(`${chalk.cyan(a.id)}  ${chalk.white(a.name)}  ${chalk.yellow(`${a.price_xlm} SOL`)}  ${chalk.gray(a.wallet_address || '')}`);
  }
}

async function sandboxAgent(apiBase: string, agentId: string, input: string) {
  const res = await fetch(`${apiBase}/api/agents/${agentId}/sandbox`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(agentWallet ? { 'X-Solana-Payment-Wallet': agentWallet } : {}),
      'X-Agent-Sandbox': 'true',
    },
    body: JSON.stringify({ input }),
  });
  const out = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    throw new Error((out as any)?.error || `Sandbox failed: ${res.status}`);
  }
  console.log(chalk.green('Sandbox response:'));
  console.log(JSON.stringify(out, null, 2));
}

async function runAgent(apiBase: string, agentId: string, input: string, secret?: string) {
  let res = await fetch(`${apiBase}/api/agents/${agentId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (res.status === 402) {
    const details = await res.json() as any;
    const pd = details?.payment_details;
    if (!pd) throw new Error('Payment required but payment_details missing');
    if (!secret) throw new Error('SOLANA_AGENT_SECRET or --secret is required for paid requests');

    const spinner = ora(`Paying ${pd.amount_xlm} SOL to ${pd.address}`).start();
    const sig = await paySol(secret, pd.address, Number(pd.amount_xlm || 0));
    spinner.succeed(`Payment confirmed: ${sig}`);
    console.log(chalk.gray(explorerUrl(sig)));

    res = await fetch(`${apiBase}/api/agents/${agentId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Tx-Hash': sig,
        'X-Solana-Payment-Signature': sig,
        'X-Payment-Wallet': parseSecret(secret).publicKey.toBase58(),
        'X-Solana-Payment-Wallet': parseSecret(secret).publicKey.toBase58(),
      },
      body: JSON.stringify({ input }),
    });
  }

  const out = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    throw new Error((out as any)?.error || `Request failed: ${res.status}`);
  }

  console.log(chalk.green('Agent response:'));
  console.log((out as any).output || JSON.stringify(out, null, 2));
}

program
  .name('valdyum')
  .description('Valdyum CLI (Solana)')
  .option('-a, --api <url>', 'API base URL', apiBaseDefault);

program
  .command('agents:list')
  .description('List available agents')
  .action(async () => {
    const opts = program.opts();
    await listAgents(opts.api);
  });

program
  .command('agents:sandbox')
  .description('Run an agent in sandbox mode before deployment')
  .requiredOption('-i, --id <agentId>', 'Agent id')
  .requiredOption('-p, --prompt <input>', 'Prompt/input')
  .action(async (opts) => {
    const globalOpts = program.opts();
    await sandboxAgent(globalOpts.api, opts.id, opts.prompt);
  });

program
  .command('agents:run')
  .description('Run an agent and auto-handle 402 SOL payment')
  .requiredOption('-i, --id <agentId>', 'Agent id')
  .requiredOption('-p, --prompt <input>', 'Prompt/input')
  .option('-s, --secret <secret>', 'Solana secret key (base58 or JSON array)', process.env.SOLANA_AGENT_SECRET)
  .action(async (opts) => {
    const globalOpts = program.opts();
    await runAgent(globalOpts.api, opts.id, opts.prompt, opts.secret);
  });

program
  .command('tx:status')
  .description('Check Solana transaction confirmation status')
  .requiredOption('-h, --hash <txHash>', 'Transaction hash/signature')
  .action(async (opts) => {
    const conn = new Connection(rpcUrl, 'confirmed');
    const status = await conn.getSignatureStatus(opts.hash);
    console.log(status.value || 'not found');
    console.log(explorerUrl(opts.hash));
  });

program
  .command('dashboard:open')
  .description('Show the dashboard URL and live infrastructure settings')
  .action(async () => {
    console.log(chalk.cyan(`Dashboard: ${dashboardUrl}`));
    console.log(chalk.gray(`Cluster: ${cluster}`));
    console.log(chalk.gray(`RPC: ${rpcUrl}`));
    console.log(chalk.gray(`Wallet: ${agentWallet || 'unset'}`));
  });

program
  .command('dashboard:status')
  .description('Print a dashboard-ready Solana/QStash status summary')
  .action(async () => {
    console.log(JSON.stringify({
      dashboardUrl,
      rpcUrl,
      cluster,
      agentWallet: agentWallet || null,
      qstashConfigured: Boolean(process.env.QSTASH_TOKEN),
      ablyConfigured: Boolean(process.env.ABLY_API_KEY),
      jupiterKeyConfigured: Boolean(process.env.JUPITER_API_KEY),
    }, null, 2));
  });

program.parseAsync().catch((err) => {
  console.error(chalk.red(String(err)));
  process.exit(1);
});
