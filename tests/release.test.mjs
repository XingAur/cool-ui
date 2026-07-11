import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { releaseVersion } from './release-fixture.mjs';

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

test('golden manifests and local consumer packages use the release version', async () => {
  for (const path of [
    'goldens/swiftui/manifest.json',
    'goldens/compose/manifest.json',
    'goldens/arkui/manifest.json',
    'goldens/wechat/manifest.json',
  ]) {
    const manifest = JSON.parse(await read(path));
    assert.equal(manifest.version, releaseVersion, path);
  }

  assert.equal(JSON.parse(await read('docs/package.json')).version, releaseVersion);
  assert.equal(JSON.parse(await read('apps/catalog-arkui/entry/oh-package.json5')).version, releaseVersion);
});

test('local consumer installs the final cooL UI tarball names', async () => {
  const consumer = JSON.parse(await read('examples/npm-consumer/package.json'));
  assert.deepEqual(consumer.dependencies, {
    '@cool-ui/tokens': `file:../../artifacts/npm/cool-ui-tokens-${releaseVersion}.tgz`,
    '@cool-ui/wechat': `file:../../artifacts/npm/cool-ui-wechat-${releaseVersion}.tgz`,
  });

  const generated = spawnSync(process.execPath, ['scripts/generate-sbom.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
  });
  assert.equal(generated.status, 0, generated.stderr);
  const sbom = JSON.parse(await read('artifacts/sbom.cdx.json'));
  assert.equal(sbom.serialNumber, `urn:uuid:cool-ui-${releaseVersion}`);
  assert.equal(sbom.metadata.component.name, 'cool-ui');
  assert.equal(sbom.metadata.component.version, releaseVersion);
  assert.ok(sbom.components.every(({ version }) => version === releaseVersion));
});

test('generators and all four Catalogs derive release metadata from canonical sources', async () => {
  for (const path of [
    'packages/tokens/scripts/generate.mjs',
    'scripts/generate-components.mjs',
    'scripts/generate-sbom.mjs',
    'scripts/pack-local.mjs',
  ]) {
    assert.match(await read(path), /contracts[\\/]release\.json/, path);
  }

  assert.ok((await read('apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift')).includes('cooL UI \\(CoolTokens.metaVersion) / SWIFTUI'));
  assert.ok((await read('apps/catalog-android/src/main/kotlin/dev/coolui/catalog/MainActivity.kt')).includes('cooL UI ${CoolTokens.metaVersion} / COMPOSE'));
  assert.ok((await read('apps/catalog-arkui/entry/src/main/ets/pages/Index.ets')).includes('cooL UI ${CoolTokens.metaVersion} / ARKUI'));
  assert.match(await read('apps/catalog-wechat/pages/index/index.js'), new RegExp(`version: '${releaseVersion.replaceAll('.', '\\.')}'`));
  assert.ok((await read('apps/catalog-wechat/pages/index/index.wxml')).includes('cooL UI {{version}} / WECHAT'));
});

test('Android Catalog and Maven publication consume the canonical release version locally', async () => {
  const catalog = await read('apps/catalog-android/build.gradle.kts');
  assert.match(catalog, /contracts[\\/]release\.json/);
  assert.match(catalog, /versionName\s*=\s*releaseVersion/);

  const maven = await read('packages/android/build.gradle.kts');
  assert.match(maven, /contracts[\\/]release\.json/);
  assert.match(maven, /version\s*=\s*releaseVersion/);
  assert.match(maven, /version\s*=\s*project\.version\.toString\(\)/);
  assert.match(maven, /name\s*=\s*"localArtifacts"/);
  assert.doesNotMatch(maven, /mavenCentral|publishing\.sonatype/i);
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
