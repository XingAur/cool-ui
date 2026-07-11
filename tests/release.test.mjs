import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('CI separates shared, Apple and HarmonyOS toolchains', async () => {
  const shared = await read('.github/workflows/ci.yml');
  assert.match(shared, /ubuntu-latest/);
  assert.match(shared, /pnpm test/);
  assert.match(shared, /packages\/android/);

  const apple = await read('.github/workflows/apple.yml');
  assert.match(apple, /runs-on: macos-26/);
  assert.match(apple, /grep -E '\^Xcode 26/);
  assert.match(apple, /swift test/);
  assert.match(apple, /xcodebuild/);

  const harmony = await read('.github/workflows/harmony.yml');
  assert.match(harmony, /self-hosted/);
  assert.match(harmony, /Windows/);
  assert.match(harmony, /assembleHar/);
});

test('artifact workflow produces metadata without public registry commands', async () => {
  const pack = await read('scripts/pack-local.mjs');
  const artifacts = await read('scripts/build-artifacts.mjs');
  assert.match(pack, /pnpm/);
  assert.match(pack, /packages\/wechat[\s\S]*build/, 'WeChat dist must be built before packing');
  assert.match(artifacts, /sbom/i);
  assert.match(artifacts, /sha256/i);
  assert.doesNotMatch(`${pack}\n${artifacts}`, /npm\s+publish|mavenCentral|ohpm\s+publish/i);
  for (const path of ['scripts/generate-sbom.mjs', 'scripts/write-checksums.mjs']) await access(new URL(path, root));
});

test('each component has complete bilingual generated documentation', async () => {
  const contract = JSON.parse(await read('contracts/components.json'));
  const en = (await readdir(new URL('docs/components/', root))).filter((name) => name.endsWith('.md') && name !== 'index.md');
  const zh = (await readdir(new URL('docs/zh/components/', root))).filter((name) => name.endsWith('.md') && name !== 'index.md');
  assert.equal(en.length, contract.components.length);
  assert.equal(zh.length, contract.components.length);
});

test('golden, accessibility and consumer verification contracts are versioned', async () => {
  for (const path of [
    'goldens/swiftui/manifest.json', 'goldens/compose/manifest.json', 'goldens/arkui/manifest.json', 'goldens/wechat/manifest.json',
    'contracts/accessibility.json', 'contracts/performance.json', 'examples/npm-consumer/package.json',
    'apps/catalog-arkui/entry/oh-package.json5',
  ]) await access(new URL(path, root));
});

test('local consumer installs the final cooL UI tarball names', async () => {
  const consumer = JSON.parse(await read('examples/npm-consumer/package.json'));
  assert.deepEqual(consumer.dependencies, {
    '@cool-ui/tokens': 'file:../../artifacts/npm/cool-ui-tokens-0.1.0.tgz',
    '@cool-ui/wechat': 'file:../../artifacts/npm/cool-ui-wechat-0.1.0.tgz',
  });
  assert.match(await read('scripts/generate-sbom.mjs'), /name: 'cool-ui'/);
});

test('repository root is directly consumable by Swift Package Manager', async () => {
  const manifest = await read('Package.swift');
  assert.match(manifest, /name: "CoolUI"/);
  assert.match(manifest, /path: "packages\/swift\/Sources\/CoolUI"/);
  assert.match(manifest, /\.macOS\("26\.1"\)/);
  const consumer = await read('examples/swift-consumer/Package.swift');
  assert.match(consumer, /\.package\(path: "\.\.\/\.\."\)/);
  assert.match(consumer, /package: "cool-ui"/);
  assert.match(await read('examples/swift-consumer/Sources/Demo/main.swift'), /import CoolUI/);
});
