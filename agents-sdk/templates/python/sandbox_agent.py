"""Generic local sandbox runner for Python agent templates."""

from __future__ import annotations

import argparse
import importlib
import json
import os
from pathlib import Path


AGENT_RUNNERS = {
    "arbitrage_tracker": ("arbitrage_tracker_agent", "run_arbitrage_tracker"),
    "liquidity_tracker": ("liquidity_tracker_agent", "run_liquidity_tracker"),
    "mempool_monitor": ("mempool_monitor_agent", "run_mempool_monitor"),
    "mev_bot": ("mev_bot_agent", "run_mev_bot"),
    "relayer": ("relayer_agent", "run_relayer"),
    "trading_bot": ("trading_bot_agent", "run_trading_bot"),
}


def run_agent(agent_name: str, prompt: str, wallet: str = "", tx_hash: str | None = None):
    module_name, fn_name = AGENT_RUNNERS[agent_name]
    module = importlib.import_module(module_name)
    runner = getattr(module, fn_name)
    return runner(prompt, wallet_address=wallet, tx_hash=tx_hash)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a Valdyum agent template locally")
    parser.add_argument("--agent", choices=sorted(AGENT_RUNNERS.keys()), required=True)
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--wallet", default=os.getenv("SOLANA_AGENT_WALLET", ""))
    parser.add_argument("--tx-hash", default=None)
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent
    os.chdir(repo_root)
    result = run_agent(args.agent, args.prompt, wallet=args.wallet, tx_hash=args.tx_hash)
    print(json.dumps(result, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())