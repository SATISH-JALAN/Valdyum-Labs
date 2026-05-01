//! Agent Registry wrapper for TAPEDRIVE on-chain registry
//! 
//! Provides CRUD operations for managing agents on the TAPEDRIVE network.
//! Reference: https://tape.network/

use serde::{Deserialize, Serialize};
use serde_json::json;
use anyhow::{Result, Context};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetadata {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub agent_type: String,  // e.g., "mev_bot", "arbitrage_tracker"
    pub wallet: String,      // Solana public key
    pub program_id: Option<String>,
    pub status: String,      // "active", "paused", "deprecated"
    pub version: String,
    pub config: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentRegistryResponse {
    pub success: bool,
    pub data: Option<AgentMetadata>,
    pub error: Option<String>,
    pub tx_hash: Option<String>,
}

/// TAPEDRIVE Registry Client
pub struct TapeDriveRegistry {
    endpoint: String,
    api_key: String,
    http_client: reqwest::Client,
}

impl TapeDriveRegistry {
    /// Initialize a new TAPEDRIVE registry client
    pub fn new(endpoint: String, api_key: String) -> Self {
        Self {
            endpoint,
            api_key,
            http_client: reqwest::Client::new(),
        }
    }

    /// Create a new agent record on TAPEDRIVE
    pub async fn create_agent(&self, agent: &AgentMetadata) -> Result<AgentRegistryResponse> {
        let url = format!("{}/agents", self.endpoint);
        
        let resp = self.http_client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&json!({
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "type": agent.agent_type,
                "wallet": agent.wallet,
                "programId": agent.program_id,
                "status": agent.status,
                "version": agent.version,
                "config": agent.config,
            }))
            .send()
            .await
            .context("Failed to create agent on TAPEDRIVE")?;

        let json: AgentRegistryResponse = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }

    /// Read an agent record from TAPEDRIVE
    pub async fn read_agent(&self, agent_id: &str) -> Result<AgentRegistryResponse> {
        let url = format!("{}/agents/{}", self.endpoint, agent_id);
        
        let resp = self.http_client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .context("Failed to read agent from TAPEDRIVE")?;

        let json: AgentRegistryResponse = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }

    /// Update an agent record on TAPEDRIVE
    pub async fn update_agent(&self, agent: &AgentMetadata) -> Result<AgentRegistryResponse> {
        let url = format!("{}/agents/{}", self.endpoint, agent.id);
        
        let resp = self.http_client
            .put(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&json!({
                "name": agent.name,
                "description": agent.description,
                "status": agent.status,
                "version": agent.version,
                "config": agent.config,
                "updatedAt": agent.updated_at,
            }))
            .send()
            .await
            .context("Failed to update agent on TAPEDRIVE")?;

        let json: AgentRegistryResponse = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }

    /// Delete an agent record from TAPEDRIVE
    pub async fn delete_agent(&self, agent_id: &str) -> Result<AgentRegistryResponse> {
        let url = format!("{}/agents/{}", self.endpoint, agent_id);
        
        let resp = self.http_client
            .delete(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .context("Failed to delete agent from TAPEDRIVE")?;

        let json: AgentRegistryResponse = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }

    /// List all agents of a specific type
    pub async fn list_agents_by_type(&self, agent_type: &str) -> Result<Vec<AgentMetadata>> {
        let url = format!("{}/agents?type={}", self.endpoint, agent_type);
        
        let resp = self.http_client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .context("Failed to list agents from TAPEDRIVE")?;

        #[derive(Deserialize)]
        struct ListResponse {
            agents: Vec<AgentMetadata>,
        }

        let data: ListResponse = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(data.agents)
    }

    /// Get agent deployment status
    pub async fn get_agent_status(&self, agent_id: &str) -> Result<serde_json::Value> {
        let url = format!("{}/agents/{}/status", self.endpoint, agent_id);
        
        let resp = self.http_client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .context("Failed to get agent status from TAPEDRIVE")?;

        let json: serde_json::Value = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }

    /// Register agent performance metrics on-chain
    pub async fn record_metrics(
        &self,
        agent_id: &str,
        metrics: &serde_json::Value,
    ) -> Result<serde_json::Value> {
        let url = format!("{}/agents/{}/metrics", self.endpoint, agent_id);
        
        let resp = self.http_client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(metrics)
            .send()
            .await
            .context("Failed to record metrics on TAPEDRIVE")?;

        let json: serde_json::Value = resp
            .json()
            .await
            .context("Failed to parse TAPEDRIVE response")?;

        Ok(json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_metadata_serialization() {
        let agent = AgentMetadata {
            id: "mev_bot_1".to_string(),
            name: "MEV Bot v1".to_string(),
            description: Some("Solana Jupiter MEV execution".to_string()),
            agent_type: "mev_bot".to_string(),
            wallet: "EhYXq3bJsqKuT6F9Mq3w5Gy7k2V8L4qB3T9v6C2w8N".to_string(),
            program_id: Some("11111111111111111111111111111111".to_string()),
            status: "active".to_string(),
            version: "1.0.0".to_string(),
            config: json!({
                "pairs": ["SOL:USDC"],
                "minProfit": 0.1,
                "maxPosition": 10.0,
            }),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&agent).unwrap();
        assert!(json.contains("mev_bot_1"));
        assert!(json.contains("Solana Jupiter MEV execution"));
    }
}
