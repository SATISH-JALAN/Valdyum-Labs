use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111112");

#[program]
pub mod agent_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, validator: Pubkey) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.validator = validator;
        Ok(())
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        owner: Pubkey,
        agent_id: String,
        price_xlm: i64,
        metadata_hash: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.caller.key() == ctx.accounts.config.validator,
            RegistryError::UnauthorizedValidator
        );
        require!(price_xlm >= 0, RegistryError::InvalidPrice);

        let agent = &mut ctx.accounts.agent;
        agent.owner = owner;
        agent.agent_id = agent_id;
        agent.price_xlm = price_xlm;
        agent.request_count = 0;
        agent.is_active = true;
        agent.metadata_hash = metadata_hash;
        agent.registered_slot = Clock::get()?.slot;
        agent.total_earnings_lamports = 0;
        agent.version = 1;
        Ok(())
    }

    pub fn record_payment(ctx: Context<RecordPayment>, amount_lamports: i64) -> Result<()> {
        require!(amount_lamports > 0, RegistryError::InvalidPayment);
        let agent = &mut ctx.accounts.agent;
        require!(agent.is_active, RegistryError::AgentInactive);
        require!(
            amount_lamports >= agent.price_xlm.saturating_mul(LAMPORTS_PER_SOL_I64),
            RegistryError::InsufficientPayment
        );

        agent.request_count = agent.request_count.saturating_add(1);
        agent.total_earnings_lamports = agent
            .total_earnings_lamports
            .saturating_add(amount_lamports);
        Ok(())
    }

    pub fn deactivate_agent(ctx: Context<DeactivateAgent>) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.config.admin,
            RegistryError::UnauthorizedAdmin
        );
        let agent = &mut ctx.accounts.agent;
        require!(agent.is_active, RegistryError::AgentAlreadyInactive);
        agent.is_active = false;
        Ok(())
    }
}

const LAMPORTS_PER_SOL_I64: i64 = 1_000_000_000;

#[account]
pub struct RegistryConfig {
    pub admin: Pubkey,
    pub validator: Pubkey,
}

#[account]
pub struct AgentRecord {
    pub owner: Pubkey,
    pub agent_id: String,
    pub price_xlm: i64,
    pub request_count: u64,
    pub is_active: bool,
    pub metadata_hash: String,
    pub registered_slot: u64,
    pub total_earnings_lamports: i64,
    pub version: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = 8 + 32 + 32)]
    pub config: Account<'info, RegistryConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(owner: Pubkey, agent_id: String, price_xlm: i64, metadata_hash: String)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, RegistryConfig>,
    #[account(
        init,
        payer = caller,
        space = 8 + 32 + 4 + 64 + 8 + 8 + 1 + 4 + 128 + 8 + 8 + 8
    )]
    pub agent: Account<'info, AgentRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordPayment<'info> {
    pub payer: Signer<'info>,
    #[account(mut)]
    pub agent: Account<'info, AgentRecord>,
}

#[derive(Accounts)]
pub struct DeactivateAgent<'info> {
    pub admin: Signer<'info>,
    pub config: Account<'info, RegistryConfig>,
    #[account(mut)]
    pub agent: Account<'info, AgentRecord>,
}

#[error_code]
pub enum RegistryError {
    #[msg("Only configured validator can register agents")]
    UnauthorizedValidator,
    #[msg("Only admin can perform this action")]
    UnauthorizedAdmin,
    #[msg("Price must be non-negative")]
    InvalidPrice,
    #[msg("Payment amount invalid")]
    InvalidPayment,
    #[msg("Agent is inactive")]
    AgentInactive,
    #[msg("Insufficient payment")]
    InsufficientPayment,
    #[msg("Agent already inactive")]
    AgentAlreadyInactive,
}
