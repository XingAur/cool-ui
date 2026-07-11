import { access, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const destination = resolve(root, 'artifacts/npm');
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
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
  const pkg = JSON.parse(await readFile(resolve(root, packagePath, 'package.json'), 'utf8'));
  if (pkg.version !== release.version) throw new Error(`${packagePath} version ${pkg.version} does not match release ${release.version}`);
  const archiveName = `${pkg.name.replace(/^@/, '').replace('/', '-')}-${release.version}.tgz`;
  await access(resolve(destination, archiveName));
}
