# Valdyum Labs Python Agent Templates (LangGraph)

These templates provide LangGraph-powered agent workflows for all 6 Valdyum agent types.

## Prerequisites

```bash
pip install -r requirements.txt
```

Set environment variables in `.env`:
```
VALDYUM_API_URL=http://localhost:3000
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
SOLANA_RPC_URL=https://api.testnet.solana.com
HELIUS_RPC_URL=https://rpc.helius.xyz/?api-key=your_key
HELIUS_API_KEY=your_key
SOLANA_CLUSTER=testnet
SOLANA_AGENT_SECRET=your_secret
SOLANA_AGENT_WALLET=your_wallet_address
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_qstash_token
PLATFORM_API_URL=http://localhost:3000
JUPITER_API_KEY=your_key
ABLY_API_KEY=your_key
WEBHOOK_URL=your_webhook_url
```

## Agents

| Template | Agent | Description |
|----------|-------|-------------|
| `mev_bot_agent.py` | MEV Bot | Front-running & sandwich detection |
| `arbitrage_tracker_agent.py` | Arbitrage Tracker | Triangular cross-path arbitrage |
| `trading_bot_agent.py` | Trading Bot | Grid, DCA, trend strategies |
| `mempool_monitor_agent.py` | Mempool Monitor | Real-time transaction stream analysis |
| `relayer_agent.py` | Relayer | Fee-bump relay with 0x402 charging |
| `liquidity_tracker_agent.py` | Liquidity Tracker | Order-book depth & slippage simulation |

## Multi-Agent (A2A) Example

```python
from base_agent import build_a2a_graph

# Chain MEV Bot → Trading Bot
app = build_a2a_graph(
    agent1_id="mev_bot",
    agent2_id="trading_bot",
    system_prompt1="MEV detection prompt...",
    system_prompt2="Trading execution prompt...",
)
result = app.invoke({"input": "Find and execute best MEV opportunity", ...})
```

## 0x402 Payment Flow

When an agent requires payment:
1. First call returns `payment_required=True` with `payment_amount` and `payment_address`
2. Use your Solana wallet flow to submit the required payment and capture the signature
3. Retry with `tx_hash` set to the payment signature

## CLI Integration

```bash
valdyum agents:run --id mev_bot --prompt "scan for opportunities" --secret $SOLANA_AGENT_SECRET
python sandbox_agent.py --agent mev_bot --prompt "scan for opportunities"
```

## Sandbox Runner

Use `sandbox_agent.py` to launch any template locally before deployment:

```bash
python sandbox_agent.py --agent trading_bot --prompt "test a grid strategy"
```
