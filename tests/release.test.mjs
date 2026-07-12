import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { releaseVersion } from './release-fixture.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

function tarEntries(tarball) {
  const result = spawnSync('tar', ['-tf', tarball], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim().split(/\r?\n/);
}

function tarText(tarball, entry) {
  const result = spawnSync('tar', ['-xOf', tarball, entry], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || `Missing ${entry}`);
  return result.stdout;
}

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
  assert.equal(consumer.scripts.test, 'node verify.mjs');

  const generated = spawnSync(process.execPath, ['scripts/generate-sbom.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
  });
  assert.equal(generated.status, 0, generated.stderr);
  const sbom = JSON.parse(await read('artifacts/sbom.cdx.json'));
  assert.match(sbom.serialNumber, /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(sbom.serialNumber, 'urn:uuid:d39319ec-2014-537f-8b7b-f30a49a1803d');
  assert.equal(sbom.metadata.component.name, 'cool-ui');
  assert.equal(sbom.metadata.component.version, releaseVersion);
  assert.equal(sbom.bomFormat, 'CycloneDX');
  assert.equal(sbom.specVersion, '1.6');
  assert.ok(sbom.components.length >= 4);
  assert.ok(sbom.components.every(({ name, version, purl }) => name && version === releaseVersion && purl.includes(`@${releaseVersion}`)));

  const repeated = spawnSync(process.execPath, ['scripts/generate-sbom.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
  });
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.equal(JSON.parse(await read('artifacts/sbom.cdx.json')).serialNumber, sbom.serialNumber);
});

test('local consumer verifier inspects both package manifests and release-critical content', async () => {
  const verifier = await read('examples/npm-consumer/verify.mjs');
  for (const expected of [
    'generated/tokens.json',
    'component-manifest.json',
    'cool-month-calendar/',
    'cool-button',
    'cool-tab-bar',
    'cool-segmented-control',
  ]) {
    assert.ok(verifier.includes(expected), expected);
  }
});

test('local pack replaces stale tarballs and publishes the complete canonical package boundary', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'cool-ui-pack-'));
  const tokensTarball = join(destination, `cool-ui-tokens-${releaseVersion}.tgz`);
  const wechatTarball = join(destination, `cool-ui-wechat-${releaseVersion}.tgz`);
  try {
    await writeFile(tokensTarball, 'stale tarball');
    await writeFile(wechatTarball, 'stale tarball');
    const packed = spawnSync(process.execPath, ['scripts/pack-local.mjs'], {
      cwd: fileURLToPath(root),
      env: { ...process.env, COOL_UI_PACK_DESTINATION: destination },
      encoding: 'utf8',
    });
    assert.equal(packed.status, 0, packed.stderr);
    assert.notEqual(await readFile(tokensTarball, 'utf8').catch(() => ''), 'stale tarball');
    assert.notEqual(await readFile(wechatTarball, 'utf8').catch(() => ''), 'stale tarball');
    assert.match(packed.stdout, new RegExp(`cool-ui-tokens-${releaseVersion.replaceAll('.', '\\.')}\\.tgz`));
    assert.match(packed.stdout, new RegExp(`cool-ui-wechat-${releaseVersion.replaceAll('.', '\\.')}\\.tgz`));

    const extracted = spawnSync('tar', ['-xOf', tokensTarball, 'package/generated/tokens.json'], { encoding: 'utf8' });
    assert.equal(extracted.status, 0, extracted.stderr);
    const tokens = JSON.parse(extracted.stdout);
    assert.equal(tokens.meta.version.$value, releaseVersion);

    const manifest = JSON.parse(tarText(wechatTarball, 'package/component-manifest.json'));
    assert.equal(Object.keys(manifest).length, 43);
    assert.equal(manifest['cool-month-calendar'], './dist/components/cool-month-calendar/index');

    const entries = tarEntries(wechatTarball);
    for (const relative of [
      'index.js', 'index.json', 'index.wxml', 'index.wxss',
      'default-day/index.js', 'default-day/index.json', 'default-day/index.wxml', 'default-day/index.wxss',
      'default-marker/index.js', 'default-marker/index.json', 'default-marker/index.wxml', 'default-marker/index.wxss',
    ]) {
      assert.ok(entries.includes(`package/dist/components/cool-month-calendar/${relative}`), relative);
    }

    const calendarJson = JSON.parse(tarText(wechatTarball, 'package/dist/components/cool-month-calendar/index.json'));
    assert.deepEqual(calendarJson.componentGenerics, {
      day: { default: './default-day/index' },
      marker: { default: './default-marker/index' },
    });
    assert.match(tarText(wechatTarball, 'package/dist/components/cool-button/index.wxml'), /<button\b/);

    for (const component of ['cool-tab-bar', 'cool-segmented-control']) {
      const source = tarText(wechatTarball, `package/dist/components/${component}/index.js`);
      assert.match(source, /triggerEvent\('change', \{ value: option\.value, index \}\)/, component);
      assert.doesNotMatch(source, /setData\(\{\s*value:/, component);
    }
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
});

test('artifact build removes stale packages and checksums every distributable file', async () => {
  const artifacts = new URL('artifacts/', root);
  const stale = new URL('npm/cool-ui-wechat-0.1.0.tgz', artifacts);
  await mkdir(new URL('npm/', artifacts), { recursive: true });
  await writeFile(stale, 'must be removed');

  const built = spawnSync(process.execPath, ['scripts/build-artifacts.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
  });
  assert.equal(built.status, 0, built.stderr);
  await assert.rejects(access(stale));

  const expectedFiles = [
    'LICENSE',
    'NOTICE',
    'licenses.json',
    'native-validation.json',
    `npm/cool-ui-tokens-${releaseVersion}.tgz`,
    `npm/cool-ui-wechat-${releaseVersion}.tgz`,
    'sbom.cdx.json',
  ];
  const checksumLines = (await read('artifacts/SHA256SUMS')).trim().split(/\r?\n/);
  const checksums = new Map(checksumLines.map((line) => {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    assert.ok(match, line);
    return [match[2], match[1]];
  }));
  assert.deepEqual([...checksums.keys()].sort(), expectedFiles.sort());
  for (const [path, digest] of checksums) {
    const actual = createHash('sha256').update(await readFile(new URL(`artifacts/${path}`, root))).digest('hex');
    assert.equal(actual, digest, path);
  }

  const licenses = JSON.parse(await read('artifacts/licenses.json'));
  const sbom = JSON.parse(await read('artifacts/sbom.cdx.json'));
  assert.equal(licenses.project, 'Apache-2.0');
  assert.deepEqual(
    licenses.packages.map(({ name, version }) => ({ name, version })),
    sbom.components.map(({ name, version }) => ({ name, version })),
  );
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

test('0.2.0 release notes describe canonical local-only delivery without a pending bump', async () => {
  const changelog = await read('CHANGELOG.md');
  const releaseNote = await read('docs/releases/0.2.0.md');
  for (const source of [changelog, releaseNote]) {
    assert.match(source, /0\.2\.0/);
    assert.match(source, /MonthCalendar/);
    assert.match(source, /WeChat[^\n]*Button/i);
    assert.match(source, /0\.x[^\n]*breaking/i);
    assert.match(source, /TabBar[^\n]*SegmentedControl|SegmentedControl[^\n]*TabBar/i);
    assert.match(source, /controlled/i);
    assert.match(source, /canonical[^\n]*release/i);
    assert.match(source, /ARGB/i);
    assert.match(source, /local-only|not published|not publicly published/i);
  }
  assert.match(releaseNote, /Changesets[^\n]*0\.2\.0/i);
});

test('docs package exposes a bilingual VitePress build boundary', async () => {
  const pkg = JSON.parse(await read('docs/package.json'));
  assert.equal(pkg.scripts.build, 'vitepress build .');
  assert.match(await read('docs/index.md'), /\/components\//);
  assert.match(await read('docs/zh/index.md'), /\/zh\/components\//);
});

test('WeChat MonthCalendar treats selectedDate as the only selection authority', async () => {
  const source = await read('packages/wechat/src/components/cool-month-calendar/index.js');
  assert.match(source, /isSelected:\s*hasControlledSelection\s*&&\s*item\.date\s*===\s*selectedDate/);
  assert.doesNotMatch(source, /Boolean\(item\.isSelected\)/);
});

test('changelog assigns typed and WeChat calendar customization to the correct platforms', async () => {
  const source = await read('CHANGELOG.md');
  assert.match(source, /typed customization slots[^\n]*SwiftUI[^\n]*Compose[^\n]*ArkUI/i);
  assert.doesNotMatch(source, /typed customization slots[^\n]*WeChat/i);
  assert.match(source, /WeChat[^\n]*named slot[^\n]*componentGenerics/i);
});
