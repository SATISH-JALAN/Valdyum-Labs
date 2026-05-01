//! Liquidity & Slippage Tracker — entry point.
//!
//! Continuously monitors the Stellar DEX order books for configured asset
//! pairs, computing:
//! - **Liquidity depth** at various price levels (in XLM equivalent)
//! - **Price impact / slippage** for a set of hypothetical trade sizes
//! - **Spread** between best bid and best ask
//! - **Market impact alerts** when depth drops below a safety threshold
//!
//! Events are published to QStash so the platform dashboard and other agents
//! can react in real-time.
//!
//! ## Usage
//! ```
//! cp .env.template .env
//! cargo run --release --bin liquidity_slippage_tracker
//! ```

mod config;
mod slippage;
mod tracker;

use anyhow::Result;
use common::{HorizonClient, QStashPublisher};
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cfg = config::LiquidityConfig::from_env()?;

    tracing_subscriber::fmt()
        .with_env_filter(&cfg.common.log_level)
        .with_target(false)
        .compact()
        .init();

    info!(
        pairs   = cfg.pairs.len(),
        horizon = %cfg.common.horizon_url,
        wallet  = %cfg.common.agent_wallet,
        "Liquidity Slippage Tracker starting"
    );

    let horizon = HorizonClient::new(&cfg.common.horizon_url)?;
    let qstash   = QStashPublisher::from_env();

    tracker::run(&cfg, &horizon, &qstash).await
}
