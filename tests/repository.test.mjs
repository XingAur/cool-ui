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
  assert.match(await read('.changeset/config.json'), /0\.1\.0|access/);
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

test('every publishing unit uses the canonical release version', async () => {
  const tokens = JSON.parse(await read('packages/tokens/package.json'));
  const wechat = JSON.parse(await read('packages/wechat/package.json'));
  const arkuiWorkspace = JSON.parse(await read('packages/arkui/package.json'));
  const harmony = JSON.parse(await read('packages/arkui/oh-package.json5').then((value) => value.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1')));
  assert.deepEqual([tokens.name, tokens.version], ['@cool-ui/tokens', releaseVersion]);
  assert.deepEqual([wechat.name, wechat.version], ['@cool-ui/wechat', releaseVersion]);
  assert.equal(arkuiWorkspace.version, releaseVersion);
  assert.equal(harmony.name, '@cool-ui/arkui');
  assert.equal(harmony.version, releaseVersion);
  assert.equal(tokens.publishConfig.access, 'public');
  assert.equal(wechat.publishConfig.access, 'public');

  const android = await read('packages/android/build.gradle.kts');
  assert.match(android, /contracts[\\/]release\.json/);
  assert.match(android, /version\s*=\s*releaseVersion/);
  assert.match(android, /version\s*=\s*project\.version\.toString\(\)/);
});
