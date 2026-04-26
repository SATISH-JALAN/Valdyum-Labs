import { Router, Request, Response } from 'express';
import * as StellarSdk from 'stellar-sdk';
import crypto from 'node:crypto';
import {
  buildValidationTransaction,
  buildConfirmationTransaction,
  logDeploymentEvent,
  validateWalletAddress,
  validateAgentId,
  persistDeploymentToDatabase,
  getDeploymentStatus,
} from '../services/soroban-deployment';

const router: Router = Router();

const VALIDATOR_CONTRACT_ID = process.env.SOROBAN_VALIDATOR_ID || process.env.NEXT_PUBLIC_SOROBAN_VALIDATOR_ID || '';
const HORIZON_URL = process.env.HORIZON_URL || process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = (process.env.STELLAR_NETWORK || process.env.NEXT_PUBLIC_STELLAR_NETWORK) === 'mainnet' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;

router.post('/validate-deploy', async (req: Request, res: Response) => {
  try {
    const { deployer_wallet, agent_id, metadata_hash, price_xlm } = req.body;

    console.log(`[validate-deploy] using VALIDATOR_CONTRACT_ID: ${VALIDATOR_CONTRACT_ID}`);

    if (!deployer_wallet || !agent_id || !metadata_hash || price_xlm === undefined) {
      res.status(400).json({ error: 'Missing required fields: deployer_wallet, agent_id, metadata_hash, price_xlm' });
      return;
    }

    if (!validateWalletAddress(deployer_wallet)) {
      res.status(400).json({ error: 'Invalid Stellar wallet address' });
      return;
    }

    if (!validateAgentId(agent_id)) {
      res.status(400).json({ error: 'Invalid agent_id (must be alphanumeric + underscore, max 32 chars)' });
      return;
    }

    if (price_xlm < 0 || !Number.isFinite(price_xlm)) {
      res.status(400).json({ error: 'Price must be a non-negative number' });
      return;
    }

    await logDeploymentEvent('validate_deploy_requested', agent_id, deployer_wallet, { price_xlm, metadata_hash });

    if (!VALIDATOR_CONTRACT_ID) {
      console.warn('[validate-deploy] NEXT_PUBLIC_SOROBAN_VALIDATOR_ID not set — running in dev mode');
      await logDeploymentEvent('validate_deploy_dev_mode', agent_id, deployer_wallet, { message: 'On-chain validation skipped in dev mode' });

      res.status(200).json({
        status: 'dev_mode',
        message: 'Dev mode: On-chain validation skipped',
        confirmation_message: `Confirm Agent Deployment\n========================\n\nAgent ID: ${agent_id}\nOwner Wallet: ${deployer_wallet}\nPrice: ${price_xlm} XLM per request\nMetadata Hash: ${metadata_hash}\n\nValidation Fee: 5 XLM\nNetwork: Stellar Testnet\n\nBy signing, you authorize:\n1. Agent registration on AgentValidator\n2. Fee collection (5 XLM) for validation\n3. Permanent agent entry in AgentRegistry\n4. Public marketplace listing`,
        validation_fee_xlm: 5,
        network: 'testnet',
      });
      return;
    }

    const priceStroops = Math.floor(price_xlm * 10_000_000);

    try {
      const { xdr, validationFee, networkPassphrase } = await buildValidationTransaction(
        deployer_wallet,
        agent_id,
        metadata_hash,
        priceStroops
      );

      res.json({
        status: 'pending_validation_signature',
        validation_tx_xdr: xdr,
        network_passphrase: networkPassphrase,
        validation_fee_xlm: validationFee / 10_000_000,
        validation_fee_stroops: validationFee,
        agent_id,
        deployer_wallet,
        confirmation_message: `Confirm Agent Deployment on Stellar Soroban\n=============================================\n\nAgent ID:        ${agent_id}\nOwner Wallet:    ${deployer_wallet}\nPrice per Request: ${price_xlm} XLM\nMetadata Hash:   ${metadata_hash}\n\nValidation Fee:  5 XLM (0.00000000 in stroops)\nTotal Cost:      5 XLM upfront\n\nNetwork:         Stellar Testnet\nSmart Contracts:\n  - AgentValidator: ${VALIDATOR_CONTRACT_ID}\n\nBy signing this transaction, you authorize:\n  ✓ Verification of your Stellar wallet ownership\n  ✓ Duplicate agent ID check in AgentRegistry\n  ✓ Reservation of this agent_id on-chain\n  ✓ Fee commitment (5 XLM non-refundable)\n  ✓ Progression to agent registration step\n\nThis is Step 1 of 2. After signing, you will\nconfirm final deployment with your signature.`,
        instructions: [
          'Step 1 of 3: Sign this validation transaction in your Freighter wallet',
          'Step 2: After signing, submit it to /api/agents/confirm-deploy',
          'Step 3: Sign and submit the final confirmation transaction',
          'Result: Agent deployed on-chain and registered in marketplace',
        ],
        next_step: 'Sign the validation_tx_xdr in Freighter, then POST the signed XDR to /api/agents/confirm-deploy',
      });
      return;
    } catch (txErr) {
      const errMsg = txErr instanceof Error ? txErr.message : String(txErr);
      console.error('[validate-deploy] Transaction building error:', errMsg);
      await logDeploymentEvent('validate_deploy_error', agent_id, deployer_wallet, { error: errMsg, phase: 'transaction_building' });

      res.status(500).json({
        error: 'Failed to build validation transaction',
        details: errMsg,
        hint: 'Ensure NEXT_PUBLIC_SOROBAN_VALIDATOR_ID is set and deployer wallet is funded',
      });
      return;
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[validate-deploy] Unexpected error:', errMsg);
    res.status(500).json({ error: 'Internal server error', details: errMsg });
  }
});

router.post('/confirm-deploy', async (req: Request, res: Response) => {
  try {
    const { deployer_wallet, agent_id, price_xlm, metadata_hash } = req.body;
    const signedRequestTxXdr = req.body.signed_request_tx_xdr || req.body.signed_tx_xdr || '';
    const validationMessage = req.body.validation_message || req.body.confirmation_message || '';

    if ((VALIDATOR_CONTRACT_ID && !signedRequestTxXdr) || !deployer_wallet || !agent_id || !validationMessage) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!validateWalletAddress(deployer_wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    if (!validateAgentId(agent_id)) {
      res.status(400).json({ error: 'Invalid agent_id' });
      return;
    }

    await logDeploymentEvent('confirm_deploy_requested', agent_id, deployer_wallet, { price_xlm, metadata_hash });

    const server = new StellarSdk.Horizon.Server(HORIZON_URL);

    if (VALIDATOR_CONTRACT_ID) {
      try {
        const tx = StellarSdk.TransactionBuilder.fromXDR(signedRequestTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction;
        await server.submitTransaction(tx);
        console.log(`[confirm-deploy] request_deploy tx submitted: ${agent_id}`);
      } catch (submitErr) {
        console.warn(`[confirm-deploy] Request TX submission warning: ${submitErr instanceof Error ? submitErr.message : String(submitErr)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const sigHashBytes = crypto.createHash('sha256').update(validationMessage, 'utf8').digest();
    const sigHashHex = sigHashBytes.toString('hex');

    let responseData: any = {
      status: 'pending_confirm_signature',
      agent_id,
      deployer_wallet,
      signature_hash: sigHashHex,
      message: 'Sign the confirm_deploy transaction to finalize agent registration on Soroban.',
    };

    if (!VALIDATOR_CONTRACT_ID) {
      await persistDeploymentToDatabase(deployer_wallet, agent_id, metadata_hash, price_xlm, 50_000_000);
      await logDeploymentEvent('confirm_deploy_dev_mode', agent_id, deployer_wallet, { signature_hash: sigHashHex });

      res.status(200).json({
        status: 'confirmed_dev_mode',
        signature_hash: sigHashHex,
        message: 'Dev mode: Agent deployed locally (NEXT_PUBLIC_SOROBAN_VALIDATOR_ID not configured)',
      });
      return;
    }

    try {
      const { xdr: confirmTxXdr } = await buildConfirmationTransaction(deployer_wallet, agent_id, sigHashHex);
      responseData = {
        ...responseData,
        confirm_tx_xdr: confirmTxXdr,
        network_passphrase: NETWORK_PASSPHRASE,
        next_step: 'Sign confirm_tx_xdr in your Freighter wallet, then submit via /api/agents/submit-confirmation',
      };
    } catch (txErr) {
      const errMsg = txErr instanceof Error ? txErr.message : String(txErr);
      await logDeploymentEvent('confirm_deploy_error', agent_id, deployer_wallet, { error: errMsg });
      res.status(500).json({ error: 'Failed to build confirmation transaction', details: errMsg });
      return;
    }

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) });
  }
});

router.post('/submit-confirmation', async (req: Request, res: Response) => {
  try {
    const { deployer_wallet, agent_id, price_xlm, metadata_hash, signature_hash, transaction_hash } = req.body;

    if (!deployer_wallet || !agent_id || !metadata_hash || !signature_hash) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!validateWalletAddress(deployer_wallet)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    if (!validateAgentId(agent_id)) {
      res.status(400).json({ error: 'Invalid agent_id' });
      return;
    }

    const feeStroops = 50_000_000;
    const dbResult = await persistDeploymentToDatabase(deployer_wallet, agent_id, metadata_hash, price_xlm, feeStroops);

    if (!dbResult.success) {
      await logDeploymentEvent('submit_confirmation_db_error', agent_id, deployer_wallet, { error: dbResult.error });
      res.status(500).json({ error: 'Failed to persist deployment', details: dbResult.error });
      return;
    }

    await logDeploymentEvent('submit_confirmation_success', agent_id, deployer_wallet, { signature_hash, transaction_hash, price_xlm, fee_stroops: feeStroops });

    const status = await getDeploymentStatus(agent_id);

    res.status(200).json({
      status: 'confirmed',
      agent_id,
      deployer_wallet,
      message: 'Agent successfully deployed',
      deployment_status: status,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
