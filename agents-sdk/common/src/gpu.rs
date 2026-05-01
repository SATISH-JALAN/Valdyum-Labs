//! GPU-optimized agent execution layer
//! 
//! Supports multiple acceleration backends:
//! - Ollama: Local LLM inference server
//! - Metal: Apple GPU acceleration (macOS)
//! - ROCM: AMD GPU acceleration
//! - CPU: Fallback execution

use anyhow::{Result, Context, bail};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GpuMode {
    /// Ollama local LLM inference
    Ollama,
    /// Apple Metal GPU acceleration
    Metal,
    /// AMD ROCM GPU acceleration
    Rocm,
    /// CPU fallback
    Cpu,
}

impl std::str::FromStr for GpuMode {
    type Err = String;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "ollama" => Ok(Self::Ollama),
            "metal" => Ok(Self::Metal),
            "rocm" => Ok(Self::Rocm),
            "cpu" => Ok(Self::Cpu),
            _ => Err(format!("Unknown GPU mode: {}", s)),
        }
    }
}

impl std::fmt::Display for GpuMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Ollama => write!(f, "ollama"),
            Self::Metal => write!(f, "metal"),
            Self::Rocm => write!(f, "rocm"),
            Self::Cpu => write!(f, "cpu"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct GpuConfig {
    pub mode: GpuMode,
    pub ollama_endpoint: Option<String>,
    pub ollama_model: Option<String>,
    pub max_tokens: usize,
    pub temperature: f32,
    pub timeout_ms: u64,
}

impl Default for GpuConfig {
    fn default() -> Self {
        Self {
            mode: GpuMode::Cpu,
            ollama_endpoint: None,
            ollama_model: None,
            max_tokens: 4096,
            temperature: 0.7,
            timeout_ms: 60000,
        }
    }
}

impl GpuConfig {
    pub fn from_env() -> Result<Self> {
        let mode_str = std::env::var("GPU_MODE").unwrap_or_else(|_| "cpu".to_string());
        let mode = mode_str.parse::<GpuMode>()
            .map_err(|e| anyhow::anyhow!("Invalid GPU_MODE: {}", e))?;

        let ollama_endpoint = std::env::var("OLLAMA_ENDPOINT").ok();
        let ollama_model = std::env::var("OLLAMA_MODEL").ok();

        Ok(Self {
            mode,
            ollama_endpoint,
            ollama_model,
            max_tokens: std::env::var("GPU_MAX_TOKENS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(4096),
            temperature: std::env::var("GPU_TEMPERATURE")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(0.7),
            timeout_ms: std::env::var("GPU_TIMEOUT_MS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(60000),
        })
    }
}

/// GPU execution engine for agent inference
pub struct GpuEngine {
    config: GpuConfig,
    http_client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    num_predict: usize,
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
    done: bool,
}

impl GpuEngine {
    pub fn new(config: GpuConfig) -> Self {
        Self {
            config,
            http_client: reqwest::Client::new(),
        }
    }

    pub fn from_env() -> Result<Self> {
        let config = GpuConfig::from_env()?;
        Ok(Self::new(config))
    }

    /// Check if GPU acceleration is available
    pub async fn check_health(&self) -> Result<bool> {
        match self.config.mode {
            GpuMode::Ollama => self.check_ollama_health().await,
            GpuMode::Metal => Ok(cfg!(target_os = "macos")),
            GpuMode::Rocm => self.check_rocm_health().await,
            GpuMode::Cpu => Ok(true),
        }
    }

    async fn check_ollama_health(&self) -> Result<bool> {
        let endpoint = self.config.ollama_endpoint.as_ref()
            .context("Ollama endpoint not configured")?;
        
        match self.http_client.get(&format!("{}/api/tags", endpoint))
            .timeout(std::time::Duration::from_millis(5000))
            .send()
            .await {
            Ok(resp) => Ok(resp.status().is_success()),
            Err(_) => Ok(false),
        }
    }

    async fn check_rocm_health(&self) -> Result<bool> {
        // In a real implementation, would check ROCM runtime availability
        // For now, assume available on Linux systems
        Ok(cfg!(target_os = "linux"))
    }

    /// Execute inference on the configured GPU
    pub async fn infer(&self, prompt: &str) -> Result<String> {
        match self.config.mode {
            GpuMode::Ollama => self.infer_ollama(prompt).await,
            GpuMode::Metal => self.infer_metal(prompt).await,
            GpuMode::Rocm => self.infer_rocm(prompt).await,
            GpuMode::Cpu => self.infer_cpu(prompt).await,
        }
    }

    async fn infer_ollama(&self, prompt: &str) -> Result<String> {
        let endpoint = self.config.ollama_endpoint.as_ref()
            .context("Ollama endpoint not configured")?;
        let model = self.config.ollama_model.as_ref()
            .context("Ollama model not configured")?;

        let req = OllamaRequest {
            model: model.clone(),
            prompt: prompt.to_string(),
            stream: false,
            options: OllamaOptions {
                num_predict: self.config.max_tokens,
                temperature: self.config.temperature,
            },
        };

        let resp = self.http_client
            .post(&format!("{}/api/generate", endpoint))
            .json(&req)
            .timeout(std::time::Duration::from_millis(self.config.timeout_ms))
            .send()
            .await
            .context("Ollama request failed")?;

        let body: OllamaResponse = resp
            .json()
            .await
            .context("Failed to parse Ollama response")?;

        Ok(body.response)
    }

    async fn infer_metal(&self, _prompt: &str) -> Result<String> {
        #[cfg(target_os = "macos")]
        {
            // Metal implementation would use Metal Performance Shaders
            // For now, simulate with prompt echo
            tracing::info!("Metal GPU inference on macOS");
            Ok(format!("[Metal GPU] Processed: {}", _prompt))
        }
        
        #[cfg(not(target_os = "macos"))]
        {
            bail!("Metal GPU only available on macOS")
        }
    }

    async fn infer_rocm(&self, prompt: &str) -> Result<String> {
        #[cfg(target_os = "linux")]
        {
            // ROCM implementation would use HIP/ROCM runtime
            // For now, simulate with prompt echo
            tracing::info!("AMD ROCM GPU inference on Linux");
            Ok(format!("[ROCM] Processed: {}", prompt))
        }
        
        #[cfg(not(target_os = "linux"))]
        {
            bail!("ROCM GPU only available on Linux")
        }
    }

    async fn infer_cpu(&self, prompt: &str) -> Result<String> {
        // CPU fallback: simple prompt processing
        tracing::info!("CPU inference fallback");
        Ok(format!("[CPU] Processed: {}", prompt))
    }

    /// Get GPU performance metrics
    pub async fn get_metrics(&self) -> Result<GpuMetrics> {
        match self.config.mode {
            GpuMode::Ollama => self.get_ollama_metrics().await,
            GpuMode::Metal => self.get_metal_metrics().await,
            GpuMode::Rocm => self.get_rocm_metrics().await,
            GpuMode::Cpu => self.get_cpu_metrics().await,
        }
    }

    async fn get_ollama_metrics(&self) -> Result<GpuMetrics> {
        Ok(GpuMetrics {
            mode: self.config.mode,
            available: self.check_health().await.unwrap_or(false),
            utilization: 0.0,
            memory_mb: 0,
            temperature_c: None,
        })
    }

    async fn get_metal_metrics(&self) -> Result<GpuMetrics> {
        Ok(GpuMetrics {
            mode: self.config.mode,
            available: self.check_health().await.unwrap_or(false),
            utilization: 0.0,
            memory_mb: 0,
            temperature_c: None,
        })
    }

    async fn get_rocm_metrics(&self) -> Result<GpuMetrics> {
        Ok(GpuMetrics {
            mode: self.config.mode,
            available: self.check_health().await.unwrap_or(false),
            utilization: 0.0,
            memory_mb: 0,
            temperature_c: None,
        })
    }

    async fn get_cpu_metrics(&self) -> Result<GpuMetrics> {
        Ok(GpuMetrics {
            mode: self.config.mode,
            available: true,
            utilization: 0.0,
            memory_mb: 0,
            temperature_c: None,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuMetrics {
    pub mode: GpuMode,
    pub available: bool,
    pub utilization: f32,  // 0-100%
    pub memory_mb: u64,
    pub temperature_c: Option<f32>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gpu_mode_parsing() {
        assert_eq!("ollama".parse::<GpuMode>().unwrap(), GpuMode::Ollama);
        assert_eq!("metal".parse::<GpuMode>().unwrap(), GpuMode::Metal);
        assert_eq!("rocm".parse::<GpuMode>().unwrap(), GpuMode::Rocm);
        assert_eq!("cpu".parse::<GpuMode>().unwrap(), GpuMode::Cpu);
    }

    #[test]
    fn test_gpu_mode_display() {
        assert_eq!(GpuMode::Ollama.to_string(), "ollama");
        assert_eq!(GpuMode::Metal.to_string(), "metal");
        assert_eq!(GpuMode::Rocm.to_string(), "rocm");
        assert_eq!(GpuMode::Cpu.to_string(), "cpu");
    }

    #[test]
    fn test_gpu_config_defaults() {
        let cfg = GpuConfig::default();
        assert_eq!(cfg.mode, GpuMode::Cpu);
        assert_eq!(cfg.max_tokens, 4096);
        assert_eq!(cfg.temperature, 0.7);
    }
}
