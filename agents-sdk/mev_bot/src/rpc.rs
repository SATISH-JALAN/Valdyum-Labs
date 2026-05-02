use anyhow::{anyhow, Context, Result};
use base64::Engine as _;
use reqwest::Client;
use serde::Deserialize;
use solana_sdk::{hash::Hash, transaction::VersionedTransaction};

#[derive(Clone)]
pub struct RpcClient {
    url: String,
    client: Client,
}

#[derive(Debug, Deserialize)]
struct RpcValue<T> {
    value: T,
}

#[derive(Debug, Deserialize)]
struct BlockhashResponse {
    result: RpcValue<BlockhashValue>,
}

#[derive(Debug, Deserialize)]
struct BlockhashValue {
    blockhash: String,
}

#[derive(Debug, Deserialize)]
struct SendTxResponse {
    result: String,
}

impl RpcClient {
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            client: Client::new(),
        }
    }

    pub async fn get_latest_blockhash(&self) -> Result<Hash> {
        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getLatestBlockhash",
            "params": [{"commitment": "confirmed"}],
        });

        let resp: BlockhashResponse = self
            .client
            .post(&self.url)
            .json(&body)
            .send()
            .await?
            .json()
            .await
            .context("failed to decode getLatestBlockhash response")?;

        Ok(resp.result.value.blockhash.parse()?)
    }

    pub async fn send_and_confirm_transaction(&self, tx: &VersionedTransaction) -> Result<String> {
        let tx_bytes = bincode::serialize(tx)?;
        let encoded = base64::engine::general_purpose::STANDARD.encode(tx_bytes);

        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendTransaction",
            "params": [
                encoded,
                {
                    "encoding": "base64",
                    "skipPreflight": false,
                    "preflightCommitment": "confirmed"
                }
            ],
        });

        let resp: SendTxResponse = self
            .client
            .post(&self.url)
            .json(&body)
            .send()
            .await?
            .json()
            .await
            .context("failed to decode sendTransaction response")?;

        Ok(resp.result)
    }
}