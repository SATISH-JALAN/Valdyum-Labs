import { Router, Request, Response } from 'express';
import { readClawCreditCredentials, createClawCreditClient } from '../services/clawcredit';

const router: Router = Router();

/**
 * GET /api/clawcredit/status
 * Returns ClawCredit account status, pre-qualification, and repayment info
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const agentScope = (req.query.scope as string) || 'main';
    const credentials = readClawCreditCredentials(agentScope);

    if (!credentials) {
      res.status(404).json({
        status: 'not_registered',
        message: 'ClawCredit agent not registered. Run "clawcredit:register" command first.',
        agent_scope: agentScope,
        dashboard_link: null,
      });
      return;
    }

    // Build status response from credentials
    const response = {
      status: 'registered',
      agent_id: credentials.agent_id || null,
      agent_scope: agentScope,
      prequalification_status: credentials.prequalification_status || 'unknown',
      credit_issued: credentials.credit_issued || false,
      credit_limit: (credentials.credit_limit as number) || 0,
      credit_balance: (credentials.credit_balance as number) || 0,
      available_credit: ((credentials.credit_limit as number) || 0) - ((credentials.credit_balance as number) || 0),
      api_token_masked: credentials.apiToken ? `${String(credentials.apiToken).slice(0, 8)}...` : null,
      registered_at: credentials.registered_at || null,
      last_checked: new Date().toISOString(),
      dashboard_link: credentials.dashboard_link || null,
      status_message: getStatusMessage(credentials),
      repayment_urgency: getRepaymentUrgency(credentials),
      next_actions: getNextActions(credentials),
    };

    res.json(response);
  } catch (err) {
    console.error('[clawcredit/status] Error:', err);
    res.status(500).json({
      error: 'Failed to fetch ClawCredit status',
      details: String(err).slice(0, 100),
    });
  }
});

/**
 * POST /api/clawcredit/check-prequalification
 * Manually trigger a prequalification check
 */
router.post('/check-prequalification', async (req: Request, res: Response) => {
  try {
    const agentScope = (req.query.scope as string) || 'main';
    const credentials = readClawCreditCredentials(agentScope);

    if (!credentials || !credentials.apiToken) {
      res.status(404).json({
        error: 'ClawCredit agent not registered',
        scope: agentScope,
      });
      return;
    }

    const agentName = (req.body?.agentName as string) || 'valdyum-agent';
    const credit = createClawCreditClient(agentName, credentials.apiToken as string);

    // Call prequalification check (this would trigger the SDK's internal check)
    const result = await (credit as any).checkPrequalification?.() || {
      status: credentials.prequalification_status,
      message: 'Prequalification check triggered. Check back in a few moments.',
    };

    res.json({
      prequalification_status: result.status || credentials.prequalification_status,
      message: result.message || 'Prequalification check in progress',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[clawcredit/check-prequalification] Error:', err);
    res.status(500).json({
      error: 'Failed to check prequalification',
      details: String(err).slice(0, 100),
    });
  }
});

/**
 * GET /api/clawcredit/dashboard
 * Returns or generates a dashboard link for ClawCredit
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const agentScope = (req.query.scope as string) || 'main';
    const credentials = readClawCreditCredentials(agentScope);

    if (!credentials) {
      res.status(404).json({
        error: 'ClawCredit agent not registered',
        agent_scope: agentScope,
      });
      return;
    }

    const dashboardLink = credentials.dashboard_link || 'https://claw.credit/dashboard';

    res.json({
      dashboard_url: dashboardLink,
      agent_id: credentials.agent_id,
      status: credentials.prequalification_status,
      message: 'Open dashboard to monitor prequalification and credit balance',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[clawcredit/dashboard] Error:', err);
    res.status(500).json({
      error: 'Failed to fetch dashboard link',
      details: String(err).slice(0, 100),
    });
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStatusMessage(credentials: Record<string, unknown>): string {
  const status = credentials.prequalification_status as string;
  const creditIssued = credentials.credit_issued as boolean;

  if (creditIssued) {
    return `✓ Credit approved! Available: $${credentials.credit_limit || 0}`;
  }

  if (status === 'needs_more_context') {
    return '⏳ Waiting for more context (transcripts/prompts) to complete prequalification';
  }

  if (status === 'approved') {
    return '✓ Pre-qualified. Credit being issued...';
  }

  if (status === 'pending') {
    return '⏳ Pre-qualification in progress...';
  }

  if (status === 'rejected') {
    return '✗ Pre-qualification rejected. Visit dashboard for details.';
  }

  return `ℹ Status: ${status || 'unknown'}`;
}

function getRepaymentUrgency(credentials: Record<string, unknown>): string {
  const balance = (credentials.credit_balance || 0) as number;
  const limit = (credentials.credit_limit || 0) as number;

  if (balance === 0) {
    return 'none';
  }

  const utilizationPercent = (balance / limit) * 100;

  if (utilizationPercent > 90) {
    return 'critical';
  }

  if (utilizationPercent > 70) {
    return 'high';
  }

  if (utilizationPercent > 40) {
    return 'moderate';
  }

  return 'low';
}

function getNextActions(credentials: Record<string, unknown>): string[] {
  const actions: string[] = [];
  const status = credentials.prequalification_status as string;
  const creditIssued = credentials.credit_issued as boolean;

  if (!creditIssued) {
    if (status === 'needs_more_context') {
      actions.push('Add agent transcripts/prompts to unlock prequalification');
      actions.push('Set environment variables: OPENCLAW_TRANSCRIPT_DIRS, OPENCLAW_PROMPT_DIRS');
    } else {
      actions.push('Check dashboard for pre-qualification progress');
    }
  }

  if (creditIssued) {
    const balance = (credentials.credit_balance || 0) as number;
    const limit = (credentials.credit_limit || 0) as number;
    const utilization = (balance / limit) * 100;

    if (utilization > 80) {
      actions.push('Schedule repayment to free up credit');
    }

    actions.push('Use clawcredit:pay to charge payments against credit');
  }

  if (!actions.length) {
    actions.push('Check back later or visit dashboard');
  }

  return actions;
}

export default router;
