//! MEV Bot — Solana entry point

mod config;
mod executor;
mod rpc;
mod strategy;

use anyhow::Result;
use common::HorizonClient;
use solana_sdk::signature::{Keypair, Signer};
use tracing::info;

use common::QStashPublisher;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cfg = config::MevBotConfig::from_env()?;

    tracing_subscriber::fmt()
        .with_env_filter(&cfg.common.log_level)
        .with_target(false)
        .compact()
        .init();

    info!(
        network = if cfg.common.is_mainnet() { "mainnet" } else { "devnet" },
        rpc     = %cfg.common.solana_rpc_url,
        pairs   = cfg.pairs.len(),
        "MEV Bot starting (Solana)"
    );

    // ── Solana RPC client ───────────────────────────────────────
    let rpc = rpc::RpcClient::new(cfg.common.solana_rpc_url.clone());

    // ── Legacy order-book source (temporary compatibility) ──────
    let horizon = HorizonClient::new(cfg.common.horizon_url.clone())?;

    // ── Load wallet ─────────────────────────────────────────────
    let keypair = Keypair::from_bytes(
        &bs58::decode(&cfg.common.agent_secret).into_vec()?
    )?;

    info!(address = %keypair.pubkey(), "Loaded wallet");

    // ── QStash publisher ───────────────────────────────────────
    let qstash = QStashPublisher::from_env();

    info!("QStash publisher ready — trades will stream");

    // ── Optional: integrate 0x402 flow on top of Solana payments ──
    info!("0x402 payment flow enabled via platform sidecar / QStash events");

    // ── Start strategy loop ─────────────────────────────────────
    strategy::scan_loop(
        &cfg,
        &horizon,
        &rpc,
        &keypair,
        &qstash,
    ).await
}