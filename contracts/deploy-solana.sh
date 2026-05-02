#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v solana >/dev/null 2>&1; then
  echo "solana CLI not found. Install: https://docs.solana.com/cli/install-solana-cli-tools"
  exit 1
fi

if ! command -v anchor >/dev/null 2>&1; then
  echo "anchor CLI not found. Install: cargo install --git https://github.com/coral-xyz/anchor avm --locked && avm install latest && avm use latest"
  exit 1
fi

export ANCHOR_PROVIDER_URL="${SOLANA_RPC_URL:-https://api.testnet.solana.com}"
export ANCHOR_WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"

echo "Using RPC: $ANCHOR_PROVIDER_URL"
echo "Using wallet: $ANCHOR_WALLET"

anchor build
anchor deploy --provider.cluster "$ANCHOR_PROVIDER_URL"

echo "Deployment complete. Update .env.local with deployed program IDs."
