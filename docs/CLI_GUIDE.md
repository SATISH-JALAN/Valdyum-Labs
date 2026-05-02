# Valdyum Labs CLI Guide

A comprehensive guide to using the Valdyum Labs command-line interface for agent management, payment workflows, and agentic finance operations.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Commands](#core-commands)
3. [Agent Management](#agent-management)
4. [Payment Operations](#payment-operations)
5. [ClawCredit Integration](#clawcredit-integration)
6. [Dashboard & Monitoring](#dashboard--monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Environment Variables](#environment-variables)

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- Solana CLI (for advanced operations)

### Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
pnpm install

# Configure environment variables
cp ../.env.example .env.local
# Edit .env.local with your API keys and wallet details
```

### Quick Test

```bash
# Run smoke tests to verify setup
pnpm exec tsx src/cli/test-smoke.ts run

# Expected output: 8/9 tests passing (GPU optional)
```

---

## Core Commands

### `agents:list`
List all available agents in the marketplace.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts agents:list
```

**Output:**
```
agent-1234      MEV Bot                    0.05 SOL
agent-5678      Trading Bot               0.10 SOL
agent-9012      Arbitrage Tracker         0.01 SOL
```

**Options:**
- `-a, --api <url>` - Override API base URL (default: http://localhost:3001)

---

### `agents:sandbox`
Run an agent in sandbox mode before paying for execution.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts agents:sandbox \
  --id agent-1234 \
  --prompt "What are the current SOL/USDC arbitrage opportunities?"
```

**Response Example:**
```json
{
  "output": "Based on current market data, the best opportunities are...",
  "timestamp": "2026-05-02T12:34:56Z",
  "executionTimeMs": 1234
}
```

**When to Use:**
- Test agent behavior before committing payment
- Verify agent output format matches your expectations
- No cost to run

---

### `agents:run`
Execute an agent with automatic 0x402 payment handling.

**Usage (with automatic payment):**
```bash
pnpm exec tsx src/cli/index.ts agents:run \
  --id agent-1234 \
  --prompt "Execute MEV arbitrage on SOL/USDC pair" \
  --secret "$SOLANA_AGENT_SECRET"
```

**Usage (in pipeline):**
```bash
# Set secret once to avoid repeating
export SOLANA_AGENT_SECRET="your-base58-secret"

pnpm exec tsx src/cli/index.ts agents:run \
  --id agent-1234 \
  --prompt "Your prompt here"
```

**Payment Flow (Automatic):**
1. Agent returns 402 payment required response
2. CLI automatically signs payment transaction
3. Transaction broadcasted to Solana network
4. Agent execution resumed with payment proof
5. Results returned to CLI

**Example with Concurrent Actions:**
```
$ pnpm exec tsx src/cli/index.ts agents:run -i agent-1234 -p "trade"

⠦ Executing agent...
✓ Agent execution started
⠦ Checking payment requirement...
✓ Payment required (0.05 SOL)
⠦ Signing transaction...
✓ Transaction signed
⠦ Broadcasting to network...
✓ Payment confirmed: 7BzRz6CZ...
⠦ Running agent with payment proof...
✓ Agent execution complete

Agent response:
{
  "trade": "executed",
  "profit": 0.0234,
  "timestamp": "2026-05-02T12:34:56Z"
}
```

**Options:**
- `-i, --id <agentId>` - Agent ID (required)
- `-p, --prompt <input>` - Prompt/input (required)
- `-s, --secret <secret>` - Solana secret (uses SOLANA_AGENT_SECRET env var if not provided)
- `-a, --api <url>` - API base URL

---

### `tx:status`
Check transaction confirmation status on Solana.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts tx:status \
  --hash 7BzRz6CZ1evWnfXcb4Nk4ovYAtGwgKdnTqQXgE4fUjcu
```

**Output:**
```
{
  "slot": 245000000,
  "confirmations": 32,
  "err": null,
  "confirmationStatus": "finalized"
}

Explorer: https://explorer.solana.com/tx/7BzRz6CZ...?cluster=devnet
```

**Use Cases:**
- Verify agent payment was confirmed
- Track multi-agent pipeline execution status
- Debug transaction issues

---

## Agent Management

### Multi-Agent Pipelines

Execute multiple agents in sequence or parallel with automatic payment handling.

**Sequence Pipeline (Recommended for data dependencies):**
```bash
pnpm exec tsx src/cli/index.ts agents:run \
  --id pipeline-mev-arbitrage \
  --prompt "Execute: 1) Find MEV opportunities 2) Execute arbitrage 3) Report gains"
```

**Concurrent Execution Display:**
```
🔄 Multi-Agent Pipeline Started

Agent 1: MEV Bot
⠦ Analyzing mempool...
✓ 5 opportunities found

Agent 2: Arbitrage Tracker (running concurrently)
⠦ Comparing prices...
✓ Best spread: 0.23%

Agent 3: Reporting
⠦ Generating report...
✓ Report complete

✓ Pipeline execution finished in 4.2s
Total earned: 0.0512 SOL
```

### Agent Status Monitoring

```bash
# Watch agent execution logs in real-time
pnpm exec tsx src/cli/index.ts agents:run \
  --id agent-1234 \
  --prompt "Run continuous monitoring"
```

---

## Payment Operations

### 0x402 Payment Protocol

The CLI automatically handles 0x402 payments (HTTP status code indicating payment required).

**How It Works:**
1. Agent endpoint returns `402 Payment Required`
2. Payment details included in response headers
3. CLI signs transaction with your wallet
4. Payment sent to agent wallet
5. Proof included in retry request

**Manual Payment Verification:**

```bash
pnpm exec tsx src/cli/index.ts tx:status \
  --hash <transaction-signature>
```

### Multi-Agent Payment Aggregation

```bash
# Run 3 agents with concurrent payment processing
pnpm exec tsx src/cli/index.ts agents:run \
  --id pipeline-trading \
  --prompt "Execute full trading pipeline"

# CLI output shows:
# ✓ Agent 1 payment confirmed (0.05 SOL)
# ✓ Agent 2 payment confirmed (0.03 SOL)
# ✓ Agent 3 payment confirmed (0.02 SOL)
# Total cost: 0.10 SOL
```

---

## ClawCredit Integration

### ClawCredit Status

View your pre-qualification status, credit balance, and available credit.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts clawcredit:status
```

**Output Example:**
```
📊 ClawCredit Status

✓ Pre-qualification Status         approved
✓ Credit Issued                    Yes
✓ Credit Limit                     $5,000
- Credit Balance                   $1,200
💳 Available Credit                $3,800

🔗 Dashboard: https://claw.credit/dashboard/dash_...

📝 Next Actions:
  • Use clawcredit:pay to make purchases
  • Monitor credit usage
```

**Status Meanings:**
- `needs_more_context` - Add transcripts/prompts to complete pre-qual
- `approved` - Pre-qualified, waiting for credit issuance
- `active` - Credit issued and available
- `pending` - Pre-qualification in progress
- `rejected` - Pre-qualification denied

---

### ClawCredit Payments

Use ClawCredit to pay merchants with automatic LLM tracing and concurrent action display.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts clawcredit:pay \
  --url "https://api.merchant.com/charges" \
  --amount 150.50 \
  --description "API usage - May 2026"
```

**Concurrent Payment Processing:**
```
⠦ Processing ClawCredit payment...
✓ Status loaded
⠦ Checking available credit...
✓ Sufficient credit available
⠦ Paying $150.50 to https://api.merchant.com/charges...
✓ Payment successful
Transaction ID: tx_1234567890abcdef

💳 Updated balance: $4,200 available
```

**Options:**
- `-u, --url <merchantUrl>` - Merchant URL (required)
- `-a, --amount <usd>` - Amount in USD (required)
- `-d, --description <desc>` - Payment description (optional)
- `--trace` - Enable LLM execution tracing (optional)

**LLM Tracing:**
When `--trace` is enabled, the CLI captures:
- LLM API calls and responses
- Token usage (input/output)
- Inference time
- Cost estimation

Example traced output:
```json
{
  "traces": [
    {
      "timestamp": "2026-05-02T12:34:56Z",
      "model": "gpt-4",
      "tokens": { "input": 156, "output": 234 },
      "cost_usd": 0.0234
    }
  ]
}
```

---

### ClawCredit Dashboard

Access your ClawCredit dashboard for detailed pre-qualification and repayment tracking.

**Usage:**
```bash
# Open dashboard (or display link)
pnpm exec tsx src/cli/index.ts clawcredit:dashboard
```

**Output:**
```
✓ Dashboard link ready
🔗 Opening: https://claw.credit/dashboard/dash_7f07d7b1faf1468fb2126f3dd531a2a4
Copy the link above to open in your browser
```

**Options:**
- `-s, --scope <scope>` - Agent scope (default: main)
- `--print-only` - Print link instead of attempting to open

**Dashboard Features:**
- Real-time credit balance tracking
- Prequalification progress
- Repayment schedules
- LLM usage analytics
- Payment history

---

## Dashboard & Monitoring

### `dashboard:open`
Show dashboard URL and current infrastructure settings.

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts dashboard:open
```

**Output:**
```
Dashboard: http://localhost:3000
Cluster: devnet
RPC: https://api.devnet.solana.com
Wallet: 8nD1jMsRYEc8qCauqbKbWaoVmF8wsf13baDzQcfaJLUv
```

---

### `dashboard:status`
Print infrastructure status as JSON (useful for automation).

**Usage:**
```bash
pnpm exec tsx src/cli/index.ts dashboard:status
```

**Output:**
```json
{
  "dashboardUrl": "http://localhost:3000",
  "rpcUrl": "https://api.devnet.solana.com",
  "cluster": "devnet",
  "agentWallet": "8nD1jMsRYEc8qCauqbKbWaoVmF8wsf13baDzQcfaJLUv",
  "qstashConfigured": true,
  "ablyConfigured": true,
  "jupiterKeyConfigured": true
}
```

---

## Concurrent Action Display

The CLI automatically displays concurrent actions with spinners and progress indicators.

### Spinner States

- `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏` - Loading/processing
- `✓` (green) - Completed successfully
- `✗` (red) - Failed
- `⊘` (yellow) - Skipped/warning
- `💳` - ClawCredit specific
- `🔗` - Links/external resources
- `📊` - Status/metrics
- `📝` - Actions/notes

### Example Multi-Step Execution

```bash
$ pnpm exec tsx src/cli/index.ts agents:run -i agent-1234 -p "execute"

⠋ Executing agent...
  ⠋ Validating credentials...
  ✓ Credentials valid
  ⠋ Preparing request...
  ✓ Request ready
⠙ Sending to agent...
⠹ Checking for 402 payment...
✓ Payment required detected
⠸ Signing transaction...
✓ Transaction signed
⠼ Broadcasting payment...
✓ Payment confirmed: 7BzRz...
⠴ Retrying with payment proof...
✓ Agent processing complete

Agent response:
{
  "status": "success",
  "result": "..."
}
```

---

## Troubleshooting

### Issue: "SOLANA_AGENT_SECRET not set"

**Solution:**
```bash
# Set the environment variable
export SOLANA_AGENT_SECRET="your-base58-secret"

# Or pass it directly
pnpm exec tsx src/cli/index.ts agents:run \
  --id agent-1234 \
  --prompt "your prompt" \
  --secret "your-base58-secret"
```

### Issue: "Payment failed: Insufficient funds"

**Solution:**
```bash
# Check wallet balance
solana balance $SOLANA_AGENT_WALLET

# Request testnet SOL
solana airdrop 2 $SOLANA_AGENT_WALLET

# Or use the faucet endpoint
curl -X POST http://localhost:3001/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"wallet":"your-wallet-address"}'
```

### Issue: "Ollama endpoint unreachable"

**Solution:**
```bash
# Start Ollama
ollama serve

# In another terminal, pull a model
ollama pull llama2

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### Issue: "ClawCredit not registered"

**Solution:**
```bash
# Register ClawCredit with invite code
pnpm --filter @valdyum/server exec tsx src/scripts/clawcredit-register.ts

# Or manually with CLI (coming soon):
pnpm exec tsx src/cli/index.ts clawcredit:register \
  --invite-code CLAW-W2IH-GI2M
```

### Issue: "RPC endpoint timeout"

**Solution:**
```bash
# Use a different RPC endpoint
export SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"

# Or specify in .env.local
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SOLANA_AGENT_SECRET` | Agent's Solana private key (base58 encoded) | `3Kp...` |
| `JUPITER_API_KEY` | Jupiter swap API key | `jup_abc123...` |
| `QSTASH_TOKEN` | Upstash QStash token for job scheduling | `qstash_...` |
| `ABLY_API_KEY` | Ably real-time messaging API key | `ably_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_CLUSTER` | Solana cluster (devnet/testnet/mainnet-beta) | `testnet` |
| `SOLANA_RPC_URL` | Custom Solana RPC endpoint | Cluster-specific default |
| `VALDYUM_API_URL` | API base URL | `http://localhost:3001` |
| `VALDYUM_DASHBOARD_URL` | Dashboard URL | `http://localhost:3000` |
| `SOLANA_AGENT_WALLET` | Agent's public wallet address | Derived from secret |
| `GPU_MODE` | GPU acceleration mode (ollama/metal/rocm/cpu) | `ollama` |
| `OLLAMA_ENDPOINT` | Ollama LLM endpoint | `http://localhost:11434` |
| `CLAWCREDIT_INVITE_CODE` | ClawCredit registration invite code | - |
| `TAPEDRIVE_API_KEY` | TapeDrive API key | - |
| `TAPEDRIVE_ENDPOINT` | TapeDrive endpoint | `https://api.tape.network` |

### Setup Example (.env.local)

```bash
# Solana Configuration
SOLANA_AGENT_SECRET=3Kp4B9d8...vF2xQ1z
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_AGENT_WALLET=8nD1jMsRYEc8qCauqbKbWaoVmF8wsf13baDzQcfaJLUv

# API Keys
JUPITER_API_KEY=jup_abc123def456...
QSTASH_TOKEN=qstash_xyzabc123...
ABLY_API_KEY=ably_1234567890...
TAPEDRIVE_API_KEY=tape_abcdef...

# URLs
VALDYUM_API_URL=http://localhost:3001
VALDYUM_DASHBOARD_URL=http://localhost:3000

# GPU & LLM
GPU_MODE=ollama
OLLAMA_ENDPOINT=http://localhost:11434

# ClawCredit
CLAWCREDIT_INVITE_CODE=CLAW-W2IH-GI2M
OPENCLAW_TRANSCRIPT_DIRS=/path/to/transcripts
OPENCLAW_PROMPT_DIRS=/path/to/prompts
```

---

## Common Workflows

### Workflow 1: Test Agent → Sandbox → Execute

```bash
# 1. List available agents
pnpm exec tsx src/cli/index.ts agents:list

# 2. Test in sandbox (no cost)
pnpm exec tsx src/cli/index.ts agents:sandbox \
  --id agent-1234 \
  --prompt "test prompt"

# 3. Run with payment
pnpm exec tsx src/cli/index.ts agents:run \
  --id agent-1234 \
  --prompt "production prompt"
```

### Workflow 2: Multi-Agent Pipeline with Tracking

```bash
# Execute and monitor
pnpm exec tsx src/cli/index.ts agents:run \
  --id pipeline-trading-bot \
  --prompt "Execute complete trading strategy"

# Track payment
pnpm exec tsx src/cli/index.ts tx:status \
  --hash <transaction-hash>

# View dashboard
pnpm exec tsx src/cli/index.ts dashboard:open
```

### Workflow 3: ClawCredit Payment Flow

```bash
# 1. Check credit availability
pnpm exec tsx src/cli/index.ts clawcredit:status

# 2. Make payment
pnpm exec tsx src/cli/index.ts clawcredit:pay \
  --url "https://merchant.api/charge" \
  --amount 250.00

# 3. View dashboard
pnpm exec tsx src/cli/index.ts clawcredit:dashboard
```

---

## API Endpoints (HTTP Alternative)

For programmatic access or web integration:

```bash
# List agents (GET)
curl http://localhost:3001/api/agents/list

# Run agent (POST)
curl -X POST http://localhost:3001/api/agents/agent-1234/run \
  -H "Content-Type: application/json" \
  -d '{"input":"your prompt"}'

# Get ClawCredit status (GET)
curl http://localhost:3001/api/clawcredit/status

# Pay with ClawCredit (POST)
curl -X POST http://localhost:3001/api/clawcredit/pay \
  -H "Content-Type: application/json" \
  -d '{
    "merchantUrl":"https://merchant.api/charge",
    "amountUsd":250.00
  }'
```

---

## Support & Resources

- **Documentation:** https://valdyum.labs/docs
- **Issues:** https://github.com/valdyum-labs/issues
- **Chat:** Discord server (link in repo)
- **Twitter:** @ValdyumLabs

---

**Last Updated:** May 2, 2026
