//! MEV executor — Solana Jupiter version.

use crate::{config::MevBotConfig, strategy::Opportunity};
use anyhow::{anyhow, bail, Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use reqwest::Client;
use serde::Deserialize;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::VersionedTransaction,
};
use std::str::FromStr;
use tracing::{debug, info};

const JUPITER_QUOTE_URL: &str = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP_URL: &str = "https://quote-api.jup.ag/v6/swap";

#[derive(Debug, Deserialize)]
struct QuoteRoute {
    #[serde(flatten)]
    _raw: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct QuoteResponse {
    data: Vec<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct SwapResponse {
    #[serde(rename = "swapTransaction")]
    swap_transaction: String,
}

/// Execute MEV sandwich trade (entry + exit swap)
pub async fn execute(
    cfg: &MevBotConfig,
    rpc: &crate::rpc::RpcClient,
    keypair: &Keypair,
    opp: &Opportunity,
    pair_idx: usize,
) -> Result<String> {
    let pair = &cfg.pairs[pair_idx];

    let sell_mint = Pubkey::from_str(&pair.sell_mint)?;
    let buy_mint  = Pubkey::from_str(&pair.buy_mint)?;

    // ── Compute size ─────────────────────────────────────────────
    let size = opp.opportunity_size;
    if size <= 0.0 {
        bail!("Opportunity size too small");
    }

    let entry_price = opp.detected_price;
    let exit_price  = entry_price * (1.0 + (cfg.common.max_slippage_bps as f64 / 20_000.0));

    debug!(
        size,
        entry_price,
        exit_price,
        agent_wallet = %cfg.common.agent_wallet,
        "Building Solana MEV transaction"
    );

    let entry_sig = execute_jupiter_swap(
        rpc,
        keypair,
        &sell_mint,
        &buy_mint,
        size as u64,
        &cfg.common.agent_wallet,
    )
    .await
    .context("entry swap failed")?;
    let exit_sig = execute_jupiter_swap(
        rpc,
        keypair,
        &buy_mint,
        &sell_mint,
        size as u64,
        &cfg.common.agent_wallet,
    )
    .await
    .context("exit swap failed")?;

    info!(entry_sig = %entry_sig, exit_sig = %exit_sig, "MEV swaps confirmed");

    Ok(exit_sig)
}

/// Build and submit a Jupiter swap transaction with agent wallet metadata.
pub async fn execute_jupiter_swap(
    rpc: &crate::rpc::RpcClient,
    keypair: &Keypair,
    input_mint: &Pubkey,
    output_mint: &Pubkey,
    amount: u64,
    agent_wallet: &str,
) -> Result<String> {
    let client = Client::new();
    let quote_url = format!(
        "{JUPITER_QUOTE_URL}?inputMint={}&outputMint={}&amount={amount}&slippageBps={}",
        input_mint,
        output_mint,
        50
    );

    let quote: QuoteResponse = client.get(&quote_url).send().await?.json().await?;
    let route = quote
        .data
        .first()
        .ok_or_else(|| anyhow!("No Jupiter route found"))?;

    // Include agent wallet identifier and 0x402 protocol metadata in swap request
    let swap_body = serde_json::json!({
        "quoteResponse": route,
        "userPublicKey": keypair.pubkey().to_string(),
        "wrapAndUnwrapSol": true,
        // Agent wallet and 0x402 protocol metadata
        "agentWallet": agent_wallet,
        "protocol": "0x402",
    });

    let swap: SwapResponse = client
        .post(JUPITER_SWAP_URL)
        .json(&swap_body)
        .send()
        .await?
        .json()
        .await?;

    let tx_bytes = BASE64.decode(swap.swap_transaction.as_bytes())?;
    let tx: VersionedTransaction = bincode::deserialize(&tx_bytes)?;
    let tx = VersionedTransaction::try_new(tx.message, &[keypair])?;

    let sig = rpc.send_and_confirm_transaction(&tx).await?;
    Ok(sig.to_string())
}