//! Common environment-variable configuration shared across all agents.

use anyhow::{Context, Result};
use crate::wallet::Keypair;

/// Lamports per SOL (1 SOL = 1_000_000_000 lamports).
pub const LAMPORTS_PER_SOL: i64 = 1_000_000_000;
/// Backward-compatible alias for legacy wallet math.
pub const STROOPS_PER_XLM: i64 = LAMPORTS_PER_SOL;

pub const MAINNET_CLUSTER: &str = "mainnet-beta";
pub const TESTNET_CLUSTER: &str = "testnet";

/// Configuration loaded from the environment (via `.env` / shell).
///
/// Fields that are not provided use sensible production defaults.
#[derive(Debug, Clone)]
pub struct CommonConfig {
    /// Solana RPC endpoint.
    pub solana_rpc_url: String,
    /// Solana cluster (`mainnet-beta`, `testnet`, `devnet`).
    pub solana_cluster: String,
    /// Explicit agent wallet identifier used in logs, dashboards, and event payloads.
    pub agent_wallet: String,
    /// Backward-compatible alias for legacy components.
    pub horizon_url: String,
    /// Backward-compatible alias for legacy components.
    pub network_passphrase: String,
    /// Backward-compatible alias for legacy components.
    pub soroban_rpc_url: String,
    /// AgentRegistry contract ID deployed via `contracts/deploy.sh`.
    pub contract_id: String,
    /// Agent's Solana secret key (base58 or JSON array).
    pub agent_secret: String,
    /// QStash endpoint URL.
    pub qstash_url: String,
    /// QStash auth token.
    pub qstash_token: String,
    /// Platform API URL used by QStash consumer routing.
    pub platform_api_url: String,
    /// Priority fee in lamports.
    pub base_fee_lamports: u32,
    /// Backward-compatible alias for legacy components.
    pub base_fee_stroops: u32,
    /// Maximum acceptable slippage in basis points (default: 50 = 0.5%).
    pub max_slippage_bps: u32,
    /// Jupiter quote API URL.
    pub jupiter_quote_url: String,
    /// Jupiter swap API URL.
    pub jupiter_swap_url: String,
    /// Jupiter API key.
    pub jupiter_api_key: String,
    /// Log level (default: `info`).
    pub log_level: String,
}

impl CommonConfig {
    /// Load configuration from the process environment.
    ///
    /// Call `dotenvy::dotenv().ok()` before this to pick up a `.env` file.
    pub fn from_env() -> Result<Self> {
        let solana_cluster = std::env::var("SOLANA_CLUSTER")
            .or_else(|_| std::env::var("NEXT_PUBLIC_SOLANA_CLUSTER"))
            .unwrap_or_else(|_| TESTNET_CLUSTER.to_string());

        let solana_rpc_url = std::env::var("SOLANA_RPC_URL")
            .or_else(|_| std::env::var("NEXT_PUBLIC_SOLANA_RPC_URL"))
            .unwrap_or_else(|_| "https://api.testnet.solana.com".to_string());

        let agent_secret = std::env::var("SOLANA_AGENT_SECRET")
            .or_else(|_| std::env::var("AGENT_SECRET_KEY"))
            .or_else(|_| std::env::var("AGENT_SECRET"))
            .context("SOLANA_AGENT_SECRET (or AGENT_SECRET_KEY) env var is required")?;

        let agent_wallet = std::env::var("SOLANA_AGENT_WALLET")
            .or_else(|_| std::env::var("AGENT_WALLET"))
            .or_else(|_| std::env::var("AGENT_WALLET_ADDRESS"))
            .unwrap_or_else(|_| {
                Keypair::from_secret(&agent_secret)
                    .map(|k| k.public_key)
                    .unwrap_or_default()
            });

        let qstash_url = std::env::var("QSTASH_URL")
            .unwrap_or_else(|_| "https://qstash.upstash.io".to_string());

        let qstash_token = std::env::var("QSTASH_TOKEN").unwrap_or_default();

        let platform_api_url = std::env::var("PLATFORM_API_URL")
            .or_else(|_| std::env::var("VALDYUM_API_URL"))
            .unwrap_or_else(|_| "http://localhost:3000".to_string());

        let jupiter_quote_url = std::env::var("JUPITER_QUOTE_URL")
            .unwrap_or_else(|_| "https://quote-api.jup.ag/v6/quote".to_string());

        let jupiter_swap_url = std::env::var("JUPITER_SWAP_URL")
            .unwrap_or_else(|_| "https://quote-api.jup.ag/v6/swap".to_string());

        let jupiter_api_key = std::env::var("JUPITER_API_KEY").unwrap_or_default();

        let contract_id = std::env::var("SOLANA_PROGRAM_ID")
            .or_else(|_| std::env::var("NEXT_PUBLIC_SOLANA_PROGRAM_ID"))
            .or_else(|_| std::env::var("CONTRACT_ID"))
            .unwrap_or_default();

        let base_fee_lamports = std::env::var("BASE_FEE_LAMPORTS")
            .or_else(|_| std::env::var("BASE_FEE_STROOPS"))
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(100);

        let max_slippage_bps = std::env::var("MAX_SLIPPAGE_BPS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(50);

        let log_level = std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

        Ok(Self {
            solana_rpc_url,
            solana_cluster,
            agent_wallet,
            horizon_url: "https://api.testnet.solana.com".to_string(),
            network_passphrase: TESTNET_CLUSTER.to_string(),
            soroban_rpc_url: "https://api.testnet.solana.com".to_string(),
            contract_id,
            agent_secret,
            qstash_url,
            qstash_token,
            platform_api_url,
            base_fee_lamports,
            base_fee_stroops: base_fee_lamports,
            max_slippage_bps,
            jupiter_quote_url,
            jupiter_swap_url,
            jupiter_api_key,
            log_level,
        })
    }

    /// Returns `true` when running against Solana mainnet.
    pub fn is_mainnet(&self) -> bool {
        self.solana_cluster == MAINNET_CLUSTER
    }
}
