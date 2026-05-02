#!/bin/bash
# deploy.sh - Deploy AgentRegistry, AgentValidator, and AF token on Solana testnet

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 Building Anchor workspace..."
anchor build

REGISTRY_KEYPAIR="target/deploy/agent_registry-keypair.json"
VALIDATOR_KEYPAIR="target/deploy/agent_validator-keypair.json"
TOKEN_KEYPAIR="target/deploy/af_token-keypair.json"

if [[ ! -f "$REGISTRY_KEYPAIR" || ! -f "$VALIDATOR_KEYPAIR" || ! -f "$TOKEN_KEYPAIR" ]]; then
  echo "❌ Missing deploy keypairs in target/deploy. Run 'anchor build' first or create the program keypairs."
  exit 1
fi

REGISTRY_ID=$(solana address -k "$REGISTRY_KEYPAIR")
VALIDATOR_ID=$(solana address -k "$VALIDATOR_KEYPAIR")
TOKEN_ID=$(solana address -k "$TOKEN_KEYPAIR")

echo "⬆️  Deploying Solana programs via Anchor..."
anchor deploy

echo "✅ AgentRegistry deployed: $REGISTRY_ID"
echo "✅ AgentValidator deployed: $VALIDATOR_ID"
echo "✅ AF token deployed: $TOKEN_ID"

echo ""
echo "📝 Add to your .env.local or .env:"
echo "NEXT_PUBLIC_SOLANA_CONTRACT_ID=$REGISTRY_ID"
echo "NEXT_PUBLIC_SOLANA_VALIDATOR_ID=$VALIDATOR_ID"
echo "NEXT_PUBLIC_SOLANA_TOKEN_ID=$TOKEN_ID"
echo "SOLANA_REGISTRY_ID=$REGISTRY_ID"
echo "SOLANA_VALIDATOR_ID=$VALIDATOR_ID"
echo "SOLANA_TOKEN_ID=$TOKEN_ID"

echo ""
echo "🧪 Verifying deployed program addresses..."
solana program show "$REGISTRY_ID" || true
solana program show "$VALIDATOR_ID" || true
solana program show "$TOKEN_ID" || true

echo "🎉 Solana deployment flow completed."
