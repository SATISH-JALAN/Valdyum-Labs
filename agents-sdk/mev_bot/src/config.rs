//! MEV Bot configuration for Solana (converted from Stellar version)

use anyhow::{Context, Result};
use common::config::CommonConfig;

/// A single trading pair watched by the MEV bot.
#[derive(Debug, Clone)]
pub struct TradingPair {
    pub sell_mint: String, // Token mint address
    pub buy_mint:  String,
}

/// Full MEV bot configuration.
#[derive(Debug, Clone)]
pub struct MevBotConfig {
    pub common:                   CommonConfig,
    pub pairs:                    Vec<TradingPair>,
    pub imbalance_threshold:      f64,
    pub min_profit_sol:           f64,
    pub max_position_sol:         f64,
    pub poll_interval_ms:         u64,
    pub depth_levels:             usize,
    pub tx_expiry_secs:           u64,
    pub priority_fee_lamports:    u64, // replaces stroops
}

impl MevBotConfig {
    pub fn from_env() -> Result<Self> {
        let common = CommonConfig::from_env()?;

        // Example:
        // TRADING_PAIRS=SOL:USDC;USDC:RAY
        let pairs_env = std::env::var("TRADING_PAIRS")
            .unwrap_or_else(|_| {
                "So11111111111111111111111111111111111111112:EPjFWdd5AufqSSqeM2q8bW8o6Z9z7z5vFhFfJpQv5h5"
                    .to_string()
            });

        let pairs = parse_pairs(&pairs_env)
            .context("TRADING_PAIRS format: 'mintA:mintB;mintC:mintD'")?;

        let imbalance_threshold = std::env::var("IMBALANCE_THRESHOLD")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(3.0);

        let min_profit_sol = std::env::var("MIN_PROFIT_SOL")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(0.01);

        let max_position_sol = std::env::var("MAX_POSITION_SOL")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(1.0);

        let poll_interval_ms = std::env::var("POLL_INTERVAL_MS")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(500);

        let depth_levels = std::env::var("DEPTH_LEVELS")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(10);

        let tx_expiry_secs = std::env::var("TX_EXPIRY_SECS")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(30);

        let priority_fee_lamports = std::env::var("PRIORITY_FEE_LAMPORTS")
            .ok().and_then(|v| v.parse().ok()).unwrap_or(5000);

        Ok(Self {
            common,
            pairs,
            imbalance_threshold,
            min_profit_sol,
            max_position_sol,
            poll_interval_ms,
            depth_levels,
            tx_expiry_secs,
            priority_fee_lamports,
        })
    }
}

/// Parse trading pairs from string
/// Format: mintA:mintB;mintC:mintD
fn parse_pairs(raw: &str) -> Result<Vec<TradingPair>> {
    raw.split(';')
        .filter(|s| !s.is_empty())
        .map(|pair_str| {
            let parts: Vec<&str> = pair_str.trim().split(':').collect();
            if parts.len() != 2 {
                anyhow::bail!("Invalid pair: {pair_str}");
            }

            Ok(TradingPair {
                sell_mint: parts[0].to_string(),
                buy_mint: parts[1].to_string(),
            })
        })
        .collect()
}