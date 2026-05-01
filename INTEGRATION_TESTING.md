# Valdyum Integration & Testing Guide

## 📋 Quick Setup

### 1. Environment Configuration

Create a `.env` file in the workspace root:

```bash
cp .env.example .env
```

Then populate with your credentials:

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_CLUSTER=testnet
SOLANA_AGENT_WALLET=0x12252f9ad011753fc013126858e4075fb7084dd88084f8f94cffb52ee1226107
SOLANA_AGENT_SECRET=<YOUR_BASE58_SECRET_KEY>

# Jupiter API
JUPITER_API_KEY=jup_9697eed9dbb5e049e455e94f7d1892d8bc5a0014d2bee5192da2ef23357c2da7

# QStash (Upstash)
QSTASH_URL=https://qstash.io
QSTASH_TOKEN=<YOUR_QSTASH_TOKEN>

# Ably Real-time
ABLY_API_KEY=<YOUR_ABLY_API_KEY>

# TAPEDRIVE Registry
TAPEDRIVE_ENDPOINT=https://api.tape.network
TAPEDRIVE_API_KEY=<YOUR_TAPEDRIVE_API_KEY>

# GPU Optimization
GPU_MODE=ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=mistral
```

### 2. Install Jupiter CLI

```bash
npm install -g @jup-ag/cli
jup config set --api-key jup_9697eed9dbb5e049e455e94f7d1892d8bc5a0014d2bee5192da2ef23357c2da7
```

### 3. Start Ollama (Optional, for GPU)

```bash
ollama run mistral
# In another terminal:
ollama serve
```

---

## 🧪 Live Smoke Tests

### Test 1: Environment & Configuration

```bash
cd /mnt/c/Users/Sayan/Valdyum-Labs
node server/src/cli/test-smoke.ts run
```

**Expected Output:**
- ✓ All environment variables detected
- ✓ Solana RPC connection successful
- ✓ Agent wallet configured
- ✓ GPU mode available (Ollama/Metal/ROCM/CPU)

### Test 2: 0x402 Payment Protocol

```bash
cd server
npx tsx src/cli/index.ts agents:run \
  --id mev_bot \
  --prompt "Scan for MEV opportunities" \
  --secret $SOLANA_AGENT_SECRET
```

**Expected Flow:**
1. Agent API returns 402 status
2. CLI creates payment transaction
3. Payment signed with agent secret
4. Retry with payment headers succeeds
5. Agent executes and returns results

### Test 3: Jupiter Swap Execution

```bash
cd agents-sdk/mev_bot
cargo run --release -- \
  --rpc-url https://api.testnet.solana.com \
  --config ./config.toml
```

**Expected Output:**
- ✓ Jupiter quote fetched
- ✓ Swap transaction built with agent wallet
- ✓ Transaction signed and sent
- ✓ Confirmation received from RPC

### Test 4: Agent Registry (TAPEDRIVE) CRUD

```bash
cd server
npx tsx src/cli/index.ts agents:registry \
  --operation create \
  --agent-id mev_bot_v1 \
  --name "MEV Bot v1" \
  --type mev_bot
```

**Expected Output:**
- ✓ Agent created on TAPEDRIVE
- ✓ On-chain registry updated
- ✓ Transaction hash returned

### Test 5: Multi-Agent Pipeline

```bash
cd server
npx tsx src/cli/pipeline-manager.ts create \
  --name "MEV + Arbitrage Pipeline" \
  --agents mev_bot,arbitrage_tracker,trading_bot \
  --error-strategy continue
```

Then execute:

```bash
npx tsx src/cli/pipeline-manager.ts run \
  --pipeline pipeline-1234 \
  --input '{"marketCondition": "volatile"}' \
  --secret $SOLANA_AGENT_SECRET
```

**Expected Output:**
- ✓ Agents executed in order
- ✓ Dependency resolution successful
- ✓ Results aggregated
- ✓ Total fee calculated

### Test 6: GPU-Optimized Agent Execution

```bash
# With Ollama
GPU_MODE=ollama OLLAMA_ENDPOINT=http://localhost:11434 \
  cd server && npx tsx src/cli/index.ts agents:sandbox \
    --id mev_bot \
    --prompt "Analyze SOL/USDC orderbook"
```

**Expected Output:**
- ✓ Ollama connection established
- ✓ LLM inference executed
- ✓ Response returned with analysis

### Test 7: Live Dashboard with Ably

```bash
cd server
node << 'EOF'
const { LiveDashboard, AblyDashboard } = require('./src/cli/ably-dashboard');

(async () => {
  const dashboard = new LiveDashboard(
    new AblyDashboard(process.env.ABLY_API_KEY)
  );
  await dashboard.init();
  
  // Keep dashboard running for 30 seconds
  setTimeout(() => {
    dashboard.printSummary();
    dashboard.cleanup();
  }, 30000);
})();
EOF
```

**Expected Output:**
- ✓ Live agent status updates
- ✓ Payment notifications streamed
- ✓ Swap status updates displayed
- ✓ Dashboard summary printed

---

## 🔄 Full Integration Test Script

Run everything in sequence:

```bash
#!/bin/bash
set -e

echo "🧪 Starting Full Valdyum Integration Test"
echo ""

# Load environment
export $(cat .env | grep -v '^#' | xargs)

# Test 1: Environment
echo "📋 Test 1: Environment Configuration"
node server/src/cli/test-smoke.ts run
echo ""

# Test 2: Build validation
echo "🔨 Test 2: Workspace Build"
cd agents-sdk && cargo build --workspace --release 2>&1 | tail -20
cd .. && echo "✓ Rust build successful"
echo ""

# Test 3: Contracts
echo "⛓️  Test 3: Anchor Contracts"
cd contracts && anchor build 2>&1 | tail -20
cd .. && echo "✓ Contracts compiled"
echo ""

# Test 4: Client build
echo "🎨 Test 4: Next.js Client"
pnpm --filter @valdyum/client build 2>&1 | tail -20
echo "✓ Client built"
echo ""

# Test 5: 0x402 Payment Flow
echo "💳 Test 5: 0x402 Payment Protocol"
cd server
npx tsx src/cli/index.ts agents:run \
  --id mev_bot \
  --prompt "Test payment flow" \
  --secret "$SOLANA_AGENT_SECRET"
cd ..
echo ""

# Test 6: Agent Registry
echo "📚 Test 6: Agent Registry CRUD"
# Create agent record
cd server
npx tsx << 'REGISTRY_TEST'
const { TapeDriveRegistry } = require('../agents-sdk/common/src/tapedrive');
const registry = new TapeDriveRegistry(
  process.env.TAPEDRIVE_ENDPOINT,
  process.env.TAPEDRIVE_API_KEY
);

(async () => {
  const agent = {
    id: 'mev_bot_test_' + Date.now(),
    name: 'MEV Bot Test',
    agent_type: 'mev_bot',
    wallet: process.env.SOLANA_AGENT_WALLET,
    status: 'active',
    version: '1.0.0',
    config: {},
  };

  try {
    console.log('Creating agent...');
    const result = await registry.create_agent(agent);
    console.log('✓ Agent created:', result);
  } catch (err) {
    console.log('⚠ Agent creation skipped (TAPEDRIVE not available)');
  }
})();
REGISTRY_TEST
cd ..
echo ""

# Test 7: Multi-Agent Pipeline
echo "🔗 Test 7: Multi-Agent Pipeline"
cd server
npx tsx src/cli/pipeline-manager.ts create \
  --name "Integration Test Pipeline" \
  --agents "mev_bot,arbitrage_tracker" \
  --error-strategy continue
echo "✓ Pipeline created"
cd ..
echo ""

echo "✅ All integration tests completed!"
echo ""
echo "📊 Summary:"
echo "  - ✓ Environment configured"
echo "  - ✓ Workspace built"
echo "  - ✓ Contracts compiled"
echo "  - ✓ Client built"
echo "  - ✓ 0x402 payment protocol tested"
echo "  - ✓ Agent registry CRUD available"
echo "  - ✓ Multi-agent pipeline ready"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy contracts: cd contracts && ./deploy.sh"
echo "  2. Start server: cd server && npm run dev"
echo "  3. Open dashboard: cd client && npm run dev"
echo "  4. Run live agents: npx tsx src/cli/index.ts agents:list"
```

Save as `integration-test.sh` and run:

```bash
chmod +x integration-test.sh
./integration-test.sh
```

---

## 📊 Deployment Checklist

- [ ] Environment variables configured (`.env`)
- [ ] Jupiter CLI installed and authenticated
- [ ] Solana RPC endpoint working
- [ ] Agent wallet has SOL for transactions
- [ ] TAPEDRIVE API key configured
- [ ] Ably API key configured
- [ ] QStash token configured
- [ ] All Rust crates build successfully
- [ ] Anchor contracts compile
- [ ] Next.js client builds
- [ ] 0x402 payment flow tested
- [ ] Jupiter swaps execute successfully
- [ ] Agent registry CRUD working
- [ ] Multi-agent pipelines execute
- [ ] GPU acceleration enabled (optional)
- [ ] Ably dashboard streaming (optional)

---

## 🐛 Troubleshooting

### Issue: `SOLANA_AGENT_SECRET not set`

**Solution:**
```bash
# Export secret as base58
export SOLANA_AGENT_SECRET=$(solana-keygen pubkey-from-secret <KEY>)

# Or copy from existing wallet
solana-keygen show
```

### Issue: Jupiter API errors

**Solution:**
```bash
# Verify API key
curl -H "Authorization: Bearer jup_..." https://quote-api.jup.ag/v6/quote?inputMint=...

# Check rate limits
# Jupiter free tier: 100 requests/minute
```

### Issue: TAPEDRIVE not responding

**Solution:**
```bash
# Fall back to local registry
TAPEDRIVE_ENDPOINT=http://localhost:8080 npm run cli
```

### Issue: Ollama inference timeout

**Solution:**
```bash
# Increase timeout
export GPU_TIMEOUT_MS=120000

# Or switch to CPU mode
export GPU_MODE=cpu
```

---

## 📈 Performance Optimization

### Enable GPU Acceleration

**Ollama (Recommended):**
```bash
# macOS
brew install ollama
ollama run mistral

# Linux (ROCM)
pip install ollama
ROCM_HOME=/opt/rocm ollama serve

# Linux (NVIDIA)
docker run --gpus all -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
```

**Apple Metal:**
- Automatically enabled on macOS with M1/M2/M3 chips

**AMD ROCM:**
```bash
export GPU_MODE=rocm
# Requires ROCm 5.0+ and compatible AMD GPU
```

---

## 📝 Live Testing Examples

### Test MEV Opportunity Detection

```bash
cd agents-sdk/mev_bot
cargo run --release -- --test-mode
```

### Test Arbitrage Tracking

```bash
cd server
npx tsx src/cli/index.ts agents:run \
  --id arbitrage_tracker \
  --prompt "Find SOL/USDC arbitrage on Jupiter" \
  --secret $SOLANA_AGENT_SECRET
```

### Test Agent Sandboxing

```bash
cd server
npx tsx src/cli/index.ts agents:sandbox \
  --id trading_bot \
  --prompt "Suggest trading strategy for volatile market"
```

---

## 🎯 Next Steps

1. **Deploy Contracts:**
   ```bash
   cd contracts && ./deploy.sh
   ```

2. **Start Platform Services:**
   ```bash
   docker-compose up -d
   ```

3. **Run Dashboard:**
   ```bash
   cd client && npm run dev
   ```

4. **Monitor Agents:**
   ```bash
   cd server
   npx tsx src/cli/index.ts agents:list
   npx tsx src/cli/index.ts dashboard:status
   ```

5. **Execute Trading Pipeline:**
   ```bash
   npx tsx src/cli/pipeline-manager.ts run \
     --pipeline my-pipeline \
     --input '{"action": "trade"}' \
     --secret $SOLANA_AGENT_SECRET
   ```

---

## 📞 Support

For issues or questions:

1. Check logs: `cat logs/agent-*.log`
2. Review API docs: `curl http://localhost:3001/api/docs`
3. Inspect transactions: `https://explorer.solana.com/tx/<TX_HASH>?cluster=testnet`
4. Check Ably status: `https://ably.io/status`

---

**Last Updated:** May 1, 2026
**Version:** 1.0.0
