//! Arbitrage Tracker — entry point.
//!
//! Detects and executes multi-hop arbitrage opportunities on Solana via Jupiter.
//!
//! Strategy: Query Jupiter for multi-hop swap routes and identify profitable
//! cyclic paths (e.g. USDC → SOL → USDT → USDC) where execution yields profit.
//!
//! ## 0x402 Protocol
//! Optionally enriches detection with paid market intelligence agents (token
//! sentiment, volatility scores) via [`common::PaymentClient`].
//!
//! ## Pub-Sub
//! Every arbitrage execution publishes to QStash so dashboard/billing are
//! updated in real time via [`common::QStashPublisher`].
//!
//! ## Usage
//! ```
//! cp .env.template .env
//! SOLANA_AGENT_SECRET=<base58-key> cargo run --release --bin arbitrage_tracker
//! ```

mod config;
mod detector;
mod executor;

use anyhow::Result;
use common::{Keypair, PaymentClient, QStashPublisher};
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cfg = config::ArbConfig::from_env()?;

    tracing_subscriber::fmt()
        .with_env_filter(&cfg.common.log_level)
        .with_target(false)
        .compact()
        .init();

    info!(
        cluster  = %cfg.common.solana_cluster,
        rpc      = %cfg.common.solana_rpc_url,
        wallet   = %cfg.common.agent_wallet,
        "Arbitrage Tracker (Jupiter) starting"
    );

    let keypair = Keypair::from_secret(&cfg.common.agent_secret)?;

    let _payment_client = PaymentClient::new(
        keypair.clone(),
        &cfg.common.solana_rpc_url,
        "Solana",
    )?;

    let qstash = QStashPublisher::from_env();

    info!(address = %keypair.public_key, "Wallet loaded");
    info!("Jupiter routes + QStash enabled for real-time arbitrage detection");

    detector::run_detection_loop(&cfg, &keypair, &qstash).await
}
