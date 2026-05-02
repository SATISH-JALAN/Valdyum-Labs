//! Xylem AgentForge — shared SDK utilities
//!
//! Provides the building blocks used by every agent:
//!
//! - [`wallet`]      — Solana/Stellar wallet helpers and signing utilities
//! - [`horizon`]     — Async Horizon REST + SSE client (legacy compatibility layer)
//! - [`stellar_tx`]  — Transaction envelope builder & fee-bump helpers (legacy compatibility)
//! - [`config`]      — Common environment-variable configuration
//! - [`payment`]     — 0x402 protocol client: pay-per-request HTTP with auto payment dance
//! - [`pubsub`]      — Upstash QStash producer for publishing agent events to the platform
//! - [`tapedrive`]   — TAPEDRIVE on-chain agent registry for CRUD operations
//! - [`gpu`]         — GPU-optimized agent execution (Ollama, Metal, ROCM, CPU)

pub mod config;
pub mod horizon;
pub mod payment;
pub mod pubsub;
pub mod stellar_tx;
pub mod wallet;
pub mod tapedrive;
pub mod gpu;

// Re-export the most commonly used types at crate root for ergonomic imports.
pub use config::CommonConfig;
pub use horizon::{Asset, HorizonClient, OrderBook, OrderBookLevel};
pub use payment::PaymentClient;
pub use pubsub::{
    now_iso, AgentActionEvent, ChainEvent, PaymentReceivedEvent, QStashPublisher,
    TOPIC_A2A_REQUEST, TOPIC_A2A_RESPONSE, TOPIC_AGENT_COMPLETED, TOPIC_BILLING_UPDATED,
    TOPIC_CHAIN_SYNCED, TOPIC_MARKETPLACE_ACTIVITY, TOPIC_PAYMENT_CONFIRMED,
};
pub use stellar_tx::{OperationBody, TransactionBuilder};
pub use wallet::{Keypair, WalletError};
pub use tapedrive::{TapeDriveRegistry, AgentMetadata, AgentRegistryResponse};
pub use gpu::{GpuEngine, GpuConfig, GpuMode, GpuMetrics};
