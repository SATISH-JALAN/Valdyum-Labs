#!/usr/bin/env node
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createClawCreditClient, getClawCreditCredentialPath, registerClawCreditAgent } from '../services/clawcredit';

for (const candidate of [
  '.env.local',
  '.env',
  '.env.example',
  '../.env.local',
  '../.env',
  '../.env.example',
]) {
  dotenv.config({ path: candidate, override: false });
}

async function main() {
  const agentName = process.env.CLAWCREDIT_AGENT_NAME || 'Valdyum';
  const inviteCode = process.env.CLAWCREDIT_INVITE_CODE || 'CLAW-W2IH-GI2M';
  const runtimeEnv = process.env.CLAWCREDIT_RUNTIME_ENV || 'node-v22';
  const model = process.env.CLAWCREDIT_MODEL || 'gpt-5.2';

  console.log(chalk.cyan(`ClawCredit agent: ${agentName}`));
  console.log(chalk.cyan(`Invite code: ${inviteCode}`));

  const { credit, result } = await registerClawCreditAgent({
    agentName,
    inviteCode,
    runtimeEnv,
    model,
  });

  console.log(chalk.green('Registration result:'));
  console.log(JSON.stringify(result, null, 2));
  console.log(chalk.gray(`Credentials saved at: ${getClawCreditCredentialPath()}`));

  const dashboard = await credit.getDashboardLink();
  console.log(chalk.cyan(`Dashboard: ${dashboard.url}`));

  try {
    const prequal = await credit.getPrequalificationStatus();
    console.log(chalk.green('Pre-qualification status:'));
    console.log(JSON.stringify(prequal, null, 2));
  } catch (err) {
    console.warn(chalk.yellow(`Pre-qualification status unavailable: ${String(err)}`));
  }

  try {
    const urgency = await credit.getRepaymentUrgency();
    console.log(chalk.green('Repayment urgency:'));
    console.log(JSON.stringify(urgency, null, 2));
  } catch (err) {
    console.warn(chalk.yellow(`Repayment urgency unavailable: ${String(err)}`));
  }

  try {
    const balance = await credit.getBalance();
    console.log(chalk.green('Balance:'));
    console.log(JSON.stringify(balance, null, 2));
  } catch (err) {
    console.warn(chalk.yellow(`Balance unavailable: ${String(err)}`));
  }
}

main().catch((err) => {
  console.error(chalk.red(String(err)));
  process.exit(1);
});
