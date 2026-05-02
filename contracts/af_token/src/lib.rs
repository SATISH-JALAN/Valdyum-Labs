use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111114");

#[program]
pub mod af_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let token = &mut ctx.accounts.token;
        token.admin = ctx.accounts.admin.key();
        token.total_supply = TOTAL_SUPPLY;
        token.name = "Valdyum Token".to_string();
        token.symbol = "VALD$".to_string();
        token.decimals = 7;

        let admin_balance = &mut ctx.accounts.admin_balance;
        admin_balance.owner = ctx.accounts.admin.key();
        admin_balance.balance = TOTAL_SUPPLY;

        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>, amount: i64) -> Result<()> {
        require!(amount > 0, TokenError::InvalidAmount);
        require!(ctx.accounts.from_balance.balance >= amount, TokenError::InsufficientBalance);

        ctx.accounts.from_balance.balance -= amount;
        ctx.accounts.to_balance.balance = ctx.accounts.to_balance.balance.saturating_add(amount);
        Ok(())
    }

    pub fn faucet_claim(ctx: Context<FaucetClaim>) -> Result<()> {
        require!(
            ctx.accounts.claims.claim_count < FAUCET_MAX_CLAIMS,
            TokenError::FaucetLimitReached
        );
        require!(ctx.accounts.admin_balance.balance >= FAUCET_AMOUNT, TokenError::FaucetDepleted);

        ctx.accounts.admin_balance.balance -= FAUCET_AMOUNT;
        ctx.accounts.user_balance.balance = ctx.accounts.user_balance.balance.saturating_add(FAUCET_AMOUNT);
        ctx.accounts.claims.claim_count = ctx.accounts.claims.claim_count.saturating_add(1);
        Ok(())
    }

    pub fn mint(ctx: Context<MintTo>, amount: i64) -> Result<()> {
        require!(amount > 0, TokenError::InvalidAmount);
        let token = &mut ctx.accounts.token;
        token.total_supply = token.total_supply.saturating_add(amount);
        ctx.accounts.to_balance.balance = ctx.accounts.to_balance.balance.saturating_add(amount);
        Ok(())
    }
}

const FAUCET_AMOUNT: i64 = 5_000 * 10_000_000;
const FAUCET_MAX_CLAIMS: u32 = 3;
const TOTAL_SUPPLY: i64 = 100_000_000 * 10_000_000;

#[account]
pub struct TokenState {
    pub admin: Pubkey,
    pub total_supply: i64,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

#[account]
pub struct BalanceAccount {
    pub owner: Pubkey,
    pub balance: i64,
}

#[account]
pub struct FaucetClaims {
    pub owner: Pubkey,
    pub claim_count: u32,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = 8 + 32 + 8 + 4 + 32 + 4 + 8 + 1)]
    pub token: Account<'info, TokenState>,
    #[account(init, payer = admin, space = 8 + 32 + 8)]
    pub admin_balance: Account<'info, BalanceAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    pub owner: Signer<'info>,
    #[account(mut, constraint = from_balance.owner == owner.key())]
    pub from_balance: Account<'info, BalanceAccount>,
    #[account(mut)]
    pub to_balance: Account<'info, BalanceAccount>,
}

#[derive(Accounts)]
pub struct FaucetClaim<'info> {
    pub user: Signer<'info>,
    pub token: Account<'info, TokenState>,
    #[account(mut, constraint = admin_balance.owner == token.admin)]
    pub admin_balance: Account<'info, BalanceAccount>,
    #[account(mut, constraint = user_balance.owner == user.key())]
    pub user_balance: Account<'info, BalanceAccount>,
    #[account(mut, constraint = claims.owner == user.key())]
    pub claims: Account<'info, FaucetClaims>,
}

#[derive(Accounts)]
pub struct MintTo<'info> {
    pub admin: Signer<'info>,
    #[account(mut, constraint = token.admin == admin.key())]
    pub token: Account<'info, TokenState>,
    #[account(mut)]
    pub to_balance: Account<'info, BalanceAccount>,
}

#[error_code]
pub enum TokenError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Faucet limit reached")]
    FaucetLimitReached,
    #[msg("Faucet depleted")]
    FaucetDepleted,
}
