use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111113");

#[program]
pub mod agent_validator {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        registry: Pubkey,
        fee_lamports: i64,
    ) -> Result<()> {
        require!(fee_lamports > 0, ValidatorError::InvalidFee);
        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.registry = registry;
        cfg.validation_fee_lamports = fee_lamports;
        cfg.treasury_balance = 0;
        Ok(())
    }

    pub fn set_validation_fee(ctx: Context<AdminOnly>, new_fee_lamports: i64) -> Result<()> {
        require!(new_fee_lamports > 0, ValidatorError::InvalidFee);
        ctx.accounts.config.validation_fee_lamports = new_fee_lamports;
        Ok(())
    }

    pub fn request_deploy(
        ctx: Context<RequestDeploy>,
        agent_id: String,
        metadata_hash: String,
        price_lamports: i64,
    ) -> Result<()> {
        let pending = &mut ctx.accounts.pending;
        pending.deployer = ctx.accounts.deployer.key();
        pending.agent_id = agent_id;
        pending.metadata_hash = metadata_hash;
        pending.price_lamports = price_lamports;
        pending.fee_lamports = ctx.accounts.config.validation_fee_lamports;
        pending.created_slot = Clock::get()?.slot;
        pending.confirmed = false;
        Ok(())
    }

    pub fn confirm_deploy(
        ctx: Context<ConfirmDeploy>,
        signature_hash: [u8; 32],
    ) -> Result<()> {
        let pending = &mut ctx.accounts.pending;
        require!(!pending.confirmed, ValidatorError::AlreadyConfirmed);

        let fee = ctx.accounts.config.validation_fee_lamports;
        ctx.accounts.config.treasury_balance = ctx.accounts.config.treasury_balance.saturating_add(fee);

        let confirmed = &mut ctx.accounts.confirmed;
        confirmed.deployer = pending.deployer;
        confirmed.agent_id = pending.agent_id.clone();
        confirmed.signature_hash = signature_hash;
        confirmed.fee_collected = fee;
        confirmed.confirmed_slot = Clock::get()?.slot;

        pending.confirmed = true;
        Ok(())
    }

    pub fn withdraw_treasury(ctx: Context<AdminOnly>, amount_lamports: i64) -> Result<()> {
        require!(amount_lamports > 0, ValidatorError::InvalidAmount);
        require!(
            ctx.accounts.config.treasury_balance >= amount_lamports,
            ValidatorError::InsufficientTreasury
        );
        ctx.accounts.config.treasury_balance -= amount_lamports;
        Ok(())
    }
}

#[account]
pub struct ValidatorConfig {
    pub admin: Pubkey,
    pub registry: Pubkey,
    pub validation_fee_lamports: i64,
    pub treasury_balance: i64,
}

#[account]
pub struct PendingDeployment {
    pub deployer: Pubkey,
    pub agent_id: String,
    pub metadata_hash: String,
    pub price_lamports: i64,
    pub fee_lamports: i64,
    pub created_slot: u64,
    pub confirmed: bool,
}

#[account]
pub struct ConfirmedDeployment {
    pub deployer: Pubkey,
    pub agent_id: String,
    pub signature_hash: [u8; 32],
    pub fee_collected: i64,
    pub confirmed_slot: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = 8 + 32 + 32 + 8 + 8)]
    pub config: Account<'info, ValidatorConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminOnly<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut, has_one = admin)]
    pub config: Account<'info, ValidatorConfig>,
}

#[derive(Accounts)]
#[instruction(agent_id: String, metadata_hash: String, price_lamports: i64)]
pub struct RequestDeploy<'info> {
    #[account(mut)]
    pub deployer: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, ValidatorConfig>,
    #[account(init, payer = deployer, space = 8 + 32 + 4 + 64 + 4 + 128 + 8 + 8 + 8 + 1)]
    pub pending: Account<'info, PendingDeployment>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmDeploy<'info> {
    #[account(mut)]
    pub deployer: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, ValidatorConfig>,
    #[account(mut, constraint = pending.deployer == deployer.key())]
    pub pending: Account<'info, PendingDeployment>,
    #[account(init, payer = deployer, space = 8 + 32 + 4 + 64 + 32 + 8 + 8)]
    pub confirmed: Account<'info, ConfirmedDeployment>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ValidatorError {
    #[msg("Invalid fee")]
    InvalidFee,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Deployment already confirmed")]
    AlreadyConfirmed,
    #[msg("Insufficient treasury balance")]
    InsufficientTreasury,
}
