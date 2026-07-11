import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(release.version)) throw new Error(`Invalid release version: ${release.version}`);

const versionedPaths = [
  'package.json',
  'docs/package.json',
  'packages/tokens/package.json',
  'packages/wechat/package.json',
  'packages/arkui/package.json',
  'packages/arkui/oh-package.json5',
  'apps/catalog-arkui/entry/oh-package.json5',
  'contracts/components.json',
  'contracts/component-capabilities.json',
  'contracts/accessibility.json',
  'contracts/performance.json',
  'goldens/swiftui/manifest.json',
  'goldens/compose/manifest.json',
  'goldens/arkui/manifest.json',
  'goldens/wechat/manifest.json',
];

async function replaceVersion(path, pattern) {
  const target = resolve(root, path);
  const source = await readFile(target, 'utf8');
  if (!pattern.test(source)) throw new Error(`${path} does not declare a replaceable version`);
  const updated = source.replace(pattern, `$1${release.version}$2`);
  await writeFile(target, updated, 'utf8');
}

for (const path of versionedPaths) {
  await replaceVersion(path, /(\"version\"\s*:\s*\")[^\"]+(\")/);
}
await replaceVersion('contracts/components.schema.json', /(\"version\"\s*:\s*\{\s*\"const\"\s*:\s*\")[^\"]+(\")/);
console.log(`Synchronized handwritten release manifests to ${release.version}.`);
