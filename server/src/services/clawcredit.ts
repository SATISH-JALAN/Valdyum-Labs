import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ClawCredit } from '@t54-labs/clawcredit-sdk';

export type ClawCreditRegistrationOptions = {
  agentName: string;
  inviteCode: string;
  runtimeEnv?: string;
  model?: string;
  apiToken?: string;
};

export type OpenClawContext = {
  stateDir?: string;
  agentId?: string;
  workspaceDir?: string;
  transcriptDirs?: string[];
  promptDirs?: string[];
};

export type MerchantPaymentOptions = {
  merchantUrl: string;
  amountUsd: number;
  requestBody?: Record<string, unknown>;
  traceEnabled?: boolean;
  description?: string;
};

export function getClawCreditCredentialPath(agentScope = 'default'): string {
  return path.join(os.homedir(), '.openclaw', 'agents', agentScope, 'agent', 'clawcredit.json');
}

export function readClawCreditCredentials(agentScope = 'default'): Record<string, unknown> | null {
  const credentialPath = getClawCreditCredentialPath(agentScope);
  if (!fs.existsSync(credentialPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(credentialPath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function createClawCreditClient(agentName: string, apiToken?: string): ClawCredit {
  const credit = new ClawCredit({
    agentName,
    ...(apiToken ? { apiToken } : {}),
  });

  const stateDir = process.env.OPENCLAW_STATE_DIR;
  const agentId = process.env.OPENCLAW_AGENT_ID;
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR;
  const transcriptDirs = process.env.OPENCLAW_TRANSCRIPT_DIRS;
  const promptDirs = process.env.OPENCLAW_PROMPT_DIRS;

  if (typeof (credit as any).setOpenClawContext === 'function' && (stateDir || agentId || workspaceDir || transcriptDirs || promptDirs)) {
    (credit as any).setOpenClawContext({
      ...(stateDir ? { stateDir } : {}),
      ...(agentId ? { agentId } : {}),
      ...(workspaceDir ? { workspaceDir } : {}),
      ...(transcriptDirs ? { transcriptDirs: transcriptDirs.split(',').map((value) => value.trim()).filter(Boolean) } : {}),
      ...(promptDirs ? { promptDirs: promptDirs.split(',').map((value) => value.trim()).filter(Boolean) } : {}),
    } satisfies OpenClawContext);
  }

  return credit;
}

export async function registerClawCreditAgent(options: ClawCreditRegistrationOptions): Promise<{ credit: ClawCredit; result: any }> {
  const credit = createClawCreditClient(options.agentName, options.apiToken);
  const result = await credit.register({
    inviteCode: options.inviteCode,
    runtimeEnv: options.runtimeEnv || 'node-v22',
    ...(options.model ? { model: options.model } : {}),
  });

  return { credit, result };
}

/**
 * Pay a merchant using ClawCredit with optional LLM tracing
 */
export async function payMerchantWithCredit(
  agentName: string,
  options: MerchantPaymentOptions,
  apiToken?: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const credit = createClawCreditClient(agentName, apiToken);

    // Prepare payment request with optional LLM tracing
    const paymentRequest = {
      merchant_url: options.merchantUrl,
      amount_usd: options.amountUsd,
      description: options.description || `Payment via ${agentName}`,
      ...(options.traceEnabled && typeof (credit as any).withTrace === 'function'
        ? { traced: true }
        : {}),
      ...options.requestBody,
    };

    // Attempt payment
    const result = await (credit as any).pay?.(paymentRequest) || {
      success: false,
      error: 'ClawCredit.pay() not available on this SDK version',
    };

    return result;
  } catch (err) {
    return {
      success: false,
      error: `Merchant payment failed: ${String(err).slice(0, 100)}`,
    };
  }
}

/**
 * Get ClawCredit status with credit availability check
 */
export async function getClawCreditStatus(
  agentName: string,
  apiToken?: string,
): Promise<{
  creditAvailable: boolean;
  creditBalance: number;
  creditLimit: number;
  prequalificationStatus: string;
  lastUpdated: string;
}> {
  try {
    const credentials = readClawCreditCredentials();

    if (!credentials) {
      return {
        creditAvailable: false,
        creditBalance: 0,
        creditLimit: 0,
        prequalificationStatus: 'not_registered',
        lastUpdated: new Date().toISOString(),
      };
    }

    return {
      creditAvailable: (credentials.credit_issued as boolean) === true,
      creditBalance: (credentials.credit_balance as number) || 0,
      creditLimit: (credentials.credit_limit as number) || 0,
      prequalificationStatus: (credentials.prequalification_status as string) || 'unknown',
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    return {
      creditAvailable: false,
      creditBalance: 0,
      creditLimit: 0,
      prequalificationStatus: 'error',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Check if sufficient credit is available for a payment
 */
export async function hasSufficientCredit(
  amountUsd: number,
  agentName: string,
  apiToken?: string,
): Promise<boolean> {
  const status = await getClawCreditStatus(agentName, apiToken);
  const availableCredit = status.creditLimit - status.creditBalance;
  return status.creditAvailable && availableCredit >= amountUsd;
}

/**
 * Get dashboard link for ClawCredit prequalification monitoring
 */
export function getDashboardLink(agentScope = 'default'): string | null {
  const credentials = readClawCreditCredentials(agentScope);
  if (!credentials) return null;
  return (credentials.dashboard_link as string) || null;
}
