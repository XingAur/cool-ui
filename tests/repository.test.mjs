import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { release, releaseVersion } from './release-fixture.mjs';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);
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
  assert.equal(pkg.scripts['version-packages'], 'node scripts/sync-release-version.mjs && pnpm generate');
  assert.equal(pkg.scripts['tokens:check'], 'node scripts/check-generated.mjs');
  assert.equal(pkg.scripts.prepublishOnly, 'node scripts/guard-public-publish.mjs');
  assert.equal(pkg.scripts['publish:ohpm'], 'node scripts/guard-public-publish.mjs && ohpm publish packages/arkui');

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
  const privatePackagePaths = [
    'package.json',
    'docs/package.json',
    'packages/tokens/package.json',
    'packages/wechat/package.json',
    'packages/arkui/package.json',
    'examples/npm-consumer/package.json',
  ];
  for (const path of privatePackagePaths) {
    const pkg = JSON.parse(await read(path));
    assert.equal(pkg.private, true, `${path} must be private`);
    assert.equal(pkg.publishConfig, undefined, `${path} must not configure public publishing`);
  }
  for (const path of versionedPackagePaths) {
    assert.equal(JSON.parse(await read(path)).version, releaseVersion, `${path} version`);
  }
  for (const path of ['packages/arkui/oh-package.json5', 'apps/catalog-arkui/entry/oh-package.json5']) {
    assert.equal(JSON.parse(await read(path)).private, undefined, `${path} uses unsupported private metadata`);
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
  assert.doesNotMatch(releaseAutomation, /(?:npm|pnpm|yarn)\s+publish|mavenCentral|publishing\.sonatype|registry\.npmjs/i);

  const ohpm = JSON.parse(await read('packages/arkui/oh-package.json5'));
  assert.equal(ohpm.scripts?.prePublish, 'node ../../scripts/guard-public-publish.mjs');
  const prePublish = spawnSync(ohpm.scripts.prePublish, {
    cwd: resolve(rootPath, 'packages/arkui'),
    shell: true,
    encoding: 'utf8',
  });
  assert.notEqual(prePublish.status, 0);
  assert.match(prePublish.stderr, /publicRegistryPublishing=false/);

  const ohpmEntrypoints = Object.values(JSON.parse(await read('package.json')).scripts).filter((command) => /ohpm\s+publish/i.test(command));
  assert.deepEqual(ohpmEntrypoints, ['node scripts/guard-public-publish.mjs && ohpm publish packages/arkui']);
  const harmonyWorkflow = await read('.github/workflows/harmony.yml');
  assert.match(harmonyWorkflow, /ohpm prepublish/i);
  assert.match(harmonyWorkflow, /OHPM prepublish validation pending/i);

  const android = await read('packages/android/build.gradle.kts');
  assert.match(android, /contracts[\\/]release\.json/);
  assert.match(android, /version\s*=\s*releaseVersion/);
  assert.match(android, /version\s*=\s*project\.version\.toString\(\)/);
});

test('Changesets records notes but cannot calculate the release version', async () => {
  await assert.rejects(access(new URL('.changeset/bright-glass-foundation.md', root)));
  assert.match(await read('.changeset/README.md'), /release\.json/i);
  assert.match(await read('.changeset/README.md'), /record/i);

  const statusPath = join(await mkdtemp(join(tmpdir(), 'cool-ui-changeset-')), 'status.json');
  try {
    const status = spawnSync(process.execPath, [resolve(rootPath, 'node_modules/@changesets/cli/bin.js'), 'status', '--output', statusPath], {
      cwd: rootPath,
      encoding: 'utf8',
    });
    if (status.status === 0) {
      assert.deepEqual(JSON.parse(await readFile(statusPath, 'utf8')).releases, []);
    } else {
      assert.match(status.stderr, /no changesets were found/i);
      await assert.rejects(access(statusPath));
    }
  } finally {
    await rm(dirname(statusPath), { recursive: true, force: true });
  }
});

test('release sync uses only contracts/release.json and never applies a changeset bump', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'cool-ui-release-sync-'));
  const versionedPaths = [
    'package.json', 'docs/package.json', 'packages/tokens/package.json', 'packages/wechat/package.json',
    'packages/arkui/package.json', 'packages/arkui/oh-package.json5', 'apps/catalog-arkui/entry/oh-package.json5',
    'contracts/components.json', 'contracts/component-capabilities.json', 'contracts/accessibility.json',
    'contracts/performance.json', 'goldens/swiftui/manifest.json', 'goldens/compose/manifest.json',
    'goldens/arkui/manifest.json', 'goldens/wechat/manifest.json',
  ];
  try {
    await mkdir(join(fixture, 'contracts'), { recursive: true });
    await writeFile(join(fixture, 'contracts/release.json'), JSON.stringify({ version: '0.2.0', publicRegistryPublishing: false }));
    for (const path of versionedPaths) {
      await mkdir(dirname(join(fixture, path)), { recursive: true });
      await writeFile(join(fixture, path), JSON.stringify({ version: '9.9.9' }));
    }
    await mkdir(join(fixture, 'contracts'), { recursive: true });
    await writeFile(join(fixture, 'contracts/components.schema.json'), JSON.stringify({ properties: { version: { const: '9.9.9' } } }));
    await mkdir(join(fixture, '.changeset'), { recursive: true });
    await writeFile(join(fixture, '.changeset/ignored-major.md'), '---\n"@cool-ui/tokens": major\n---\nignored');

    const synced = spawnSync(process.execPath, [resolve(rootPath, 'scripts/sync-release-version.mjs')], {
      cwd: fixture,
      encoding: 'utf8',
    });
    assert.equal(synced.status, 0, synced.stderr);
    for (const path of versionedPaths) {
      assert.equal(JSON.parse(await readFile(join(fixture, path), 'utf8')).version, '0.2.0', path);
    }
    const schema = JSON.parse(await readFile(join(fixture, 'contracts/components.schema.json'), 'utf8'));
    assert.equal(schema.properties.version.const, '0.2.0');
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('generated-output check covers components, docs, Catalog and consumer manifests', async () => {
  const checker = await read('scripts/check-generated.mjs');
  for (const path of [
    'packages/tokens/generated',
    'packages/swift/Sources/CoolUI',
    'packages/android/src/main/kotlin/dev/coolui',
    'packages/arkui/src/main/ets',
    'packages/wechat/src',
    'docs/components',
    'docs/zh/components',
    'apps/catalog-wechat',
    'examples/npm-consumer/package.json',
  ]) assert.match(checker, new RegExp(path.replaceAll('/', '[\\\\/]')), path);
});

test('public publishing guard rejects the local-only release policy', async () => {
  const guarded = spawnSync(process.execPath, [resolve(rootPath, 'scripts/guard-public-publish.mjs')], {
    cwd: rootPath,
    encoding: 'utf8',
  });
  assert.notEqual(guarded.status, 0);
  assert.match(guarded.stderr, /publicRegistryPublishing=false/);
});
