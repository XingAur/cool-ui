import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const destination = resolve(root, 'artifacts/npm');
await mkdir(destination, { recursive: true });
const pnpmEntrypoint = process.env.npm_execpath;
const executable = pnpmEntrypoint ? process.execPath : process.platform === 'win32' ? 'powershell.exe' : 'pnpm';

function runPnpm(pnpmArgs) {
  const args = pnpmEntrypoint
    ? [pnpmEntrypoint, ...pnpmArgs]
    : process.platform === 'win32'
      ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resolve(process.env.APPDATA, 'npm/pnpm.ps1'), ...pnpmArgs]
      : pnpmArgs;
  const result = spawnSync(executable, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

runPnpm(['--dir', 'packages/wechat', 'build']);

for (const packagePath of ['packages/tokens', 'packages/wechat']) {
  runPnpm(['--dir', packagePath, 'pack', '--pack-destination', destination]);
}
