import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const pnpmEntrypoint = process.env.npm_execpath;
const executable = pnpmEntrypoint ? process.execPath : process.platform === 'win32' ? 'powershell.exe' : 'pnpm';
const args = pnpmEntrypoint
  ? [pnpmEntrypoint, 'generate']
  : process.platform === 'win32'
    ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resolve(process.env.APPDATA, 'npm/pnpm.ps1'), 'generate']
    : ['generate'];
const generated = spawnSync(executable, args, { cwd: root, stdio: 'inherit' });
if (generated.error) throw generated.error;
if (generated.status !== 0) process.exit(generated.status ?? 1);

const contract = JSON.parse(await readFile(resolve(root, 'contracts/components.json'), 'utf8'));
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const generatedPaths = [
  'packages/tokens/generated',
  'packages/swift/Sources/CoolUI/CoolTokens.swift',
  'packages/swift/Sources/CoolUI/GeneratedComponents.swift',
  'packages/android/src/main/kotlin/dev/coolui/tokens',
  'packages/android/src/main/kotlin/dev/coolui/compose/GeneratedComponents.kt',
  'packages/arkui/src/main/ets/tokens',
  'packages/arkui/src/main/ets/components/GeneratedComponents.ets',
  'packages/wechat/src/components',
  'packages/wechat/src/styles/tokens.wxss',
  'packages/wechat/component-manifest.json',
  ...contract.components.flatMap(({ name }) => [
    `docs/components/${kebab(name)}.md`,
    `docs/zh/components/${kebab(name)}.md`,
  ]),
  'apps/catalog-wechat/app.json',
  'apps/catalog-wechat/app.js',
  'apps/catalog-wechat/pages/index/index.json',
  'apps/catalog-wechat/pages/index/index.js',
  'apps/catalog-wechat/pages/index/index.wxml',
  'examples/npm-consumer/package.json',
];
const checked = spawnSync('git', ['diff', '--exit-code', '--', ...generatedPaths], { cwd: root, stdio: 'inherit' });
if (checked.error) throw checked.error;
if (checked.status !== 0) process.exit(checked.status ?? 1);
