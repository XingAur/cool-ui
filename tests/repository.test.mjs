import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { release, releaseVersion } from './release-fixture.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('root workspace pins the approved toolchain and release policy', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.version, releaseVersion);
  assert.equal(release.publicRegistryPublishing, false);
  assert.equal(pkg.private, true);
  assert.equal(pkg.packageManager, 'pnpm@10.13.1');
  assert.match(pkg.engines.node, /^>=22/);
  assert.ok(pkg.scripts.test);
  assert.ok(pkg.scripts['pack:local']);

  assert.match(await read('pnpm-workspace.yaml'), /packages\/\*/);
  assert.match(await read('turbo.json'), /docs:build/);
});

test('repository governance is Apache-2.0 and protects unpublished packages', async () => {
  assert.match(await read('LICENSE'), /Apache License[\s\S]*Version 2\.0/);
  assert.match(await read('README.md'), /not affiliated with Apple/i);
  assert.match(await read('README.zh-CN.md'), /Apple.*无隶属关系/);
  for (const file of ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'NOTICE', '.gitignore']) {
    assert.ok((await read(file)).trim().length > 20, file);
  }
});

test('docs have bilingual entry points and API/state/accessibility sections', async () => {
  for (const path of ['docs/index.md', 'docs/zh/index.md', 'docs/components/index.md', 'docs/zh/components/index.md']) {
    const content = await read(path);
    assert.match(content, /cooL UI/);
  }
  const en = await read('docs/components/index.md');
  const zh = await read('docs/zh/components/index.md');
  assert.match(en, /API matrix/i);
  assert.match(en, /Accessibility/i);
  assert.match(zh, /API 对照/);
  assert.match(zh, /可访问性/);
});

test('every package is version-aligned and local-only', async () => {
  const versionedPackagePaths = [
    'package.json',
    'docs/package.json',
    'packages/tokens/package.json',
    'packages/wechat/package.json',
    'packages/arkui/package.json',
    'packages/arkui/oh-package.json5',
    'apps/catalog-arkui/entry/oh-package.json5',
  ];
  const privatePackagePaths = [...versionedPackagePaths, 'examples/npm-consumer/package.json'];
  for (const path of privatePackagePaths) {
    const pkg = JSON.parse(await read(path));
    assert.equal(pkg.private, true, `${path} must be private`);
    assert.equal(pkg.publishConfig, undefined, `${path} must not configure public publishing`);
  }
  for (const path of versionedPackagePaths) {
    assert.equal(JSON.parse(await read(path)).version, releaseVersion, `${path} version`);
  }

  const tokens = JSON.parse(await read('packages/tokens/package.json'));
  const wechat = JSON.parse(await read('packages/wechat/package.json'));
  const harmony = JSON.parse(await read('packages/arkui/oh-package.json5').then((value) => value.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1')));
  assert.deepEqual([tokens.name, tokens.version], ['@cool-ui/tokens', releaseVersion]);
  assert.deepEqual([wechat.name, wechat.version], ['@cool-ui/wechat', releaseVersion]);
  assert.equal(harmony.name, '@cool-ui/arkui');

  const changesets = JSON.parse(await read('.changeset/config.json'));
  assert.equal(changesets.access, 'restricted');
  assert.doesNotMatch(await read('.npmrc'), /(^|\n)\s*(registry|@[^:]+:registry)\s*=/i);

  const releaseAutomation = [
    JSON.stringify(JSON.parse(await read('package.json')).scripts),
    await read('scripts/pack-local.mjs'),
    await read('scripts/build-artifacts.mjs'),
    await read('.github/workflows/ci.yml'),
    await read('.github/workflows/apple.yml'),
    await read('.github/workflows/harmony.yml'),
  ].join('\n');
  assert.doesNotMatch(releaseAutomation, /(?:npm|pnpm|yarn|ohpm)\s+publish|mavenCentral|publishing\.sonatype|registry\.npmjs/i);

  const android = await read('packages/android/build.gradle.kts');
  assert.match(android, /contracts[\\/]release\.json/);
  assert.match(android, /version\s*=\s*releaseVersion/);
  assert.match(android, /version\s*=\s*project\.version\.toString\(\)/);
});
