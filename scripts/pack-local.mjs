import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnPnpm } from './lib/portable-pnpm.mjs';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const destination = resolve(process.env.COOL_UI_PACK_DESTINATION ?? resolve(root, 'artifacts/npm'));
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
await mkdir(destination, { recursive: true });

function runPnpm(pnpmArgs) {
  const result = spawnPnpm(pnpmArgs, { cwd: root });
  if (result.error) throw result.error;
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout;
}

const manifestPaths = [
  'package.json',
  'docs/package.json',
  'packages/tokens/package.json',
  'packages/wechat/package.json',
  'packages/arkui/package.json',
  'packages/arkui/oh-package.json5',
  'apps/catalog-arkui/entry/oh-package.json5',
];
for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(await readFile(resolve(root, manifestPath), 'utf8'));
  if (manifest.version !== release.version) {
    throw new Error(`${manifestPath} version ${manifest.version} does not match release ${release.version}`);
  }
}

runPnpm(['--dir', 'packages/wechat', 'build']);

const staging = await mkdtemp(join(tmpdir(), 'cool-ui-pack-stage-'));
if (dirname(staging) !== resolve(tmpdir())) throw new Error(`Unsafe staging directory: ${staging}`);
try {
  for (const packagePath of ['packages/tokens', 'packages/wechat']) {
    const pkg = JSON.parse(await readFile(resolve(root, packagePath, 'package.json'), 'utf8'));
    const archiveName = `${pkg.name.replace(/^@/, '').replace('/', '-')}-${release.version}.tgz`;
    const output = runPnpm(['--dir', packagePath, 'pack', '--pack-destination', staging]);
    const packedLine = output.split(/\r?\n/).map((line) => line.trim()).findLast((line) => line.endsWith('.tgz'));
    if (!packedLine) throw new Error(`pnpm pack did not report a tarball for ${packagePath}`);
    const packedPath = resolve(packedLine);
    if (dirname(packedPath) !== staging || basename(packedPath) !== archiveName) {
      throw new Error(`Unexpected pnpm pack output for ${packagePath}: ${packedPath}`);
    }
    const target = resolve(destination, archiveName);
    await rm(target, { force: true });
    await copyFile(packedPath, target);
    console.log(target);
  }
} finally {
  await rm(staging, { recursive: true, force: true });
}
