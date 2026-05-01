//! Arbitrage Tracker — entry point.
//!
//! Detects and executes triangular arbitrage on the Stellar DEX (SDEX).
//!
//! Strategy: find a cycle `A → B → C → A` where the product of exchange
//! rates is > 1 (i.e. the round-trip yields more than you started with).
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
//! cargo run --release --bin arbitrage_tracker
//! ```

mod config;
mod detector;
mod executor;

use anyhow::Result;
use common::{HorizonClient, Keypair, PaymentClient, QStashPublisher};
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
        triangles = cfg.triangles.len(),
        horizon   = %cfg.common.horizon_url,
        wallet    = %cfg.common.agent_wallet,
        "Arbitrage Tracker starting"
    );

    let horizon  = HorizonClient::new(&cfg.common.horizon_url)?;
    let keypair  = Keypair::from_secret(&cfg.common.agent_secret)?;

    let _payment_client = PaymentClient::new(
        keypair.clone(),
        &cfg.common.horizon_url,
        &cfg.common.network_passphrase,
    )?;

    let qstash = QStashPublisher::from_env();

    info!(address = %keypair.public_key, "Wallet loaded");
    info!("0x402 + QStash enabled for real-time billing and A2A intelligence");

    detector::run_detection_loop(&cfg, &horizon, &keypair, &qstash).await
}
