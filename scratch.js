const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'server', 'src', 'routes', 'api', 'agents');
const routes = ['validate-deploy', 'confirm-deploy', 'submit-confirmation', 'compose'];

let out = `import { Router, Request, Response } from 'express';
import * as StellarSdk from 'stellar-sdk';
import crypto from 'node:crypto';
import {
  buildValidationTransaction,
  buildConfirmationTransaction,
  logDeploymentEvent,
  validateWalletAddress,
  validateAgentId,
  persistDeploymentToDatabase,
} from '../services/soroban-deployment';
import { createClient } from '@supabase/supabase-js';

const router: Router = Router();

const VALIDATOR_CONTRACT_ID = process.env.NEXT_PUBLIC_SOROBAN_VALIDATOR_ID || '';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
`;

for (const route of routes) {
  const filePath = path.join(baseDir, route, 'route.ts');
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove imports and global constants
  content = content.replace(/import .*?from .*?;/gs, '');
  content = content.replace(/const [A-Z_]+ = .*?;/g, '');
  
  // Replace function signature
  content = content.replace(/export async function POST\(req: NextRequest\) {/g, `router.post('/${route}', async (req: Request, res: Response) => {`);
  content = content.replace(/export async function GET\(req: NextRequest\) {/g, `router.get('/${route}', async (req: Request, res: Response) => {`);
  
  // Replace req.json()
  content = content.replace(/const body = await req\.json\(\)( as {[\s\S]*?})?;/g, (match, cast) => {
    return `const body = req.body${cast ? cast : ''};`;
  });
  content = content.replace(/await req\.json\(\)/g, 'req.body');
  
  // Replace req.url searchParams
  content = content.replace(/const { searchParams } = new URL\(req\.url\);/g, '');
  content = content.replace(/searchParams\.get\('([^']+)'\)/g, "req.query['$1'] as string");
  
  // Replace NextResponse.json({ ... }, { status: XXX })
  content = content.replace(/return NextResponse\.json\(\s*([\s\S]*?)\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\);/g, (match, body, status) => {
    return `res.status(${status}).json(${body});\n    return;`;
  });
  
  // Replace NextResponse.json({ ... })
  content = content.replace(/return NextResponse\.json\(\s*([\s\S]*?)\s*\);/g, (match, body) => {
    return `res.json(${body});\n    return;`;
  });
  
  out += `\n${content}\n`;
}

out += `\nexport default router;\n`;

fs.writeFileSync(path.join(__dirname, 'server', 'src', 'routes', 'agents-deploy.ts'), out);
console.log('Done!');
