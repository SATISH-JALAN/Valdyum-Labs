import { execSync } from 'node:child_process';
import path from 'node:path';

const cwd = path.resolve(__dirname);

function run(cmd: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

run('bash ./deploy-solana.sh');
