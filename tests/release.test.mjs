import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnPnpm } from '../scripts/lib/portable-pnpm.mjs';
import { releaseVersion } from './release-fixture.mjs';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);
const read = (path) => readFile(new URL(path, root), 'utf8');

async function createTrackedFixture() {
  const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: rootPath, encoding: 'buffer' });
  assert.equal(listed.status, 0, listed.stderr?.toString('utf8'));
  const fixture = await mkdtemp(join(tmpdir(), 'cool-ui-release-fixture-'));
  assert.equal(dirname(fixture), resolve(tmpdir()), `Unsafe fixture path: ${fixture}`);
  const excluded = new Set(['node_modules', 'build', 'artifacts']);
  try {
    for (const path of listed.stdout.toString('utf8').split('\0').filter(Boolean)) {
      if (path.split('/').some((segment) => excluded.has(segment))) continue;
      const source = resolve(rootPath, path);
      const target = resolve(fixture, path);
      assert.ok(target.startsWith(`${fixture}${sep}`), `Unsafe fixture target: ${target}`);
      try {
        await access(source);
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      await mkdir(dirname(target), { recursive: true });
      await copyFile(source, target);
    }
    return fixture;
  } catch (error) {
    await rm(fixture, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    throw error;
  }
}

async function directoryFingerprint(directory) {
  const absolute = resolve(fileURLToPath(directory));
  const digest = createHash('sha256');
  async function visit(path) {
    const metadata = await lstat(path);
    digest.update(`${relative(absolute, path).replaceAll('\\', '/')}\0${metadata.isDirectory() ? 'd' : 'f'}\0${metadata.size}\0${metadata.mtimeMs}\0`);
    if (metadata.isDirectory()) {
      for (const name of (await readdir(path)).sort()) await visit(resolve(path, name));
    } else {
      digest.update(await readFile(path));
    }
  }
  try {
    await visit(absolute);
    return digest.digest('hex');
  } catch (error) {
    if (error.code === 'ENOENT') return 'missing';
    throw error;
  }
}

const repositoryOutputsBefore = {
  artifacts: await directoryFingerprint(new URL('artifacts/', root)),
  wechatDist: await directoryFingerprint(new URL('packages/wechat/dist/', root)),
};

after(async () => {
  assert.equal(await directoryFingerprint(new URL('artifacts/', root)), repositoryOutputsBefore.artifacts, 'release tests must not modify repository artifacts');
  assert.equal(await directoryFingerprint(new URL('packages/wechat/dist/', root)), repositoryOutputsBefore.wechatDist, 'release tests must not modify repository WeChat dist');
});

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
  const sharedCommands = [
    'pnpm tokens:check',
    'pnpm test',
    'pnpm docs:build',
    'pnpm artifacts',
    'node --test tests/release.test.mjs',
    'sha256sum --check SHA256SUMS',
    'actions/upload-artifact@v4',
  ];
  let previousIndex = -1;
  for (const command of sharedCommands) {
    const index = shared.indexOf(command);
    assert.ok(index > previousIndex, `${command} must appear in shared-job order`);
    previousIndex = index;
  }
  assert.doesNotMatch(shared, /pnpm pack:local/);
  assert.match(shared, /path:\s*artifacts\/\*\*/);
  assert.match(shared, /packages\/android/);
  assert.match(shared, /gradle -p packages\/android test compileDebugAndroidTestKotlin publishReleasePublicationToLocalArtifactsRepository/);

  const apple = await read('.github/workflows/apple.yml');
  assert.match(apple, /runs-on: macos-26/);
  assert.match(apple, /grep -E '\^Xcode 26/);
  assert.match(apple, /swift test/);
  assert.match(apple, /tee swift-test\.log/);
  assert.match(apple, /::error title=Swift test failed/);
  assert.match(apple, /xcodebuild/);

  const harmony = await read('.github/workflows/harmony.yml');
  assert.match(harmony, /self-hosted/);
  assert.match(harmony, /Windows/);
  assert.match(harmony, /assembleHar/);
  assert.match(harmony, /Get-Command hvigorw[\s\S]*hvigorw --version/);
  assert.match(harmony, /working-directory:\s*packages\/arkui[\s\S]*ohpm install --all[\s\S]*assembleHar/);
  assert.match(harmony, /assembleHar[\s\S]*working-directory:\s*apps\/catalog-arkui[\s\S]*ohpm install --all[\s\S]*assembleHap/);
});

test('HarmonyOS projects pin the stable Harmony 6 Hvigor model and plugin', async () => {
  for (const directory of ['packages/arkui', 'apps/catalog-arkui']) {
    const manifest = JSON.parse(await read(`${directory}/oh-package.json5`));
    const config = JSON.parse(await read(`${directory}/hvigor/hvigor-config.json5`));
    assert.equal(manifest.modelVersion, '5.0.0', `${directory} modelVersion`);
    assert.equal(config.hvigorVersion, '6.0.6', `${directory} hvigorVersion`);
    assert.equal(config.dependencies['@ohos/hvigor-ohos-plugin'], '6.0.6', `${directory} plugin`);
    assert.doesNotMatch(`${config.hvigorVersion} ${config.dependencies['@ohos/hvigor-ohos-plugin']}`, /(?:alpha|beta|rc)/i);
  }
  const readme = await read('packages/arkui/README.md');
  assert.match(readme, /Hvigor 6\.0\.6[\s\S]*@ohos\/hvigor-ohos-plugin[^\n]*6\.0\.6/);
  assert.match(readme, /HAR[\s\S]*pending/i);
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
});

test('isolated artifact build verifies packages and an offline consumer without changing repository outputs', { timeout: 120_000 }, async () => {
  const fixture = await createTrackedFixture();
  const artifacts = resolve(fixture, 'artifacts');
  const npmArtifacts = resolve(artifacts, 'npm');
  const tokensName = `cool-ui-tokens-${releaseVersion}.tgz`;
  const wechatName = `cool-ui-wechat-${releaseVersion}.tgz`;
  const tokensTarball = resolve(npmArtifacts, tokensName);
  const wechatTarball = resolve(npmArtifacts, wechatName);
  const staleSentinel = resolve(artifacts, 'stale-sentinel.txt');
  const staleVersion = resolve(npmArtifacts, 'cool-ui-wechat-0.1.0.tgz');
  try {
    await mkdir(npmArtifacts, { recursive: true });
    await writeFile(staleSentinel, 'must be removed');
    await writeFile(staleVersion, 'must be removed');
    await writeFile(tokensTarball, 'stale tarball');
    await writeFile(wechatTarball, 'stale tarball');

    const fakeNpmEnvironment = { ...process.env, npm_execpath: resolve(fixture, 'fake/npm-cli.js') };
    const built = spawnSync(process.execPath, ['scripts/build-artifacts.mjs'], { cwd: fixture, env: fakeNpmEnvironment, encoding: 'utf8' });
    assert.equal(built.status, 0, built.stderr || built.stdout);
    await assert.rejects(access(staleSentinel));
    await assert.rejects(access(staleVersion));
    assert.notEqual(await readFile(tokensTarball, 'utf8').catch(() => ''), 'stale tarball');
    assert.notEqual(await readFile(wechatTarball, 'utf8').catch(() => ''), 'stale tarball');

    const extracted = spawnSync('tar', ['-xOf', tokensTarball, 'package/generated/tokens.json'], { encoding: 'utf8' });
    assert.equal(extracted.status, 0, extracted.stderr);
    assert.equal(JSON.parse(extracted.stdout).meta.version.$value, releaseVersion);

    const manifest = JSON.parse(tarText(wechatTarball, 'package/component-manifest.json'));
    assert.equal(Object.keys(manifest).length, 43);
    assert.equal(manifest['cool-month-calendar'], './dist/components/cool-month-calendar/index');

    const entries = tarEntries(wechatTarball);
    const tokensArchive = await readFile(tokensTarball);
    const wechatArchive = await readFile(wechatTarball);
    assert.equal(tokensArchive[9], 3, 'tokens tgz must use a canonical Unix gzip OS byte');
    assert.equal(wechatArchive[9], 3, 'WeChat tgz must use a canonical Unix gzip OS byte');
    const tokensSha256 = createHash('sha256').update(tokensArchive).digest('hex');
    const wechatSha256 = createHash('sha256').update(wechatArchive).digest('hex');
    for (const relativePath of [
      'index.js', 'index.json', 'index.wxml', 'index.wxss',
      'default-day/index.js', 'default-day/index.json', 'default-day/index.wxml', 'default-day/index.wxss',
      'default-marker/index.js', 'default-marker/index.json', 'default-marker/index.wxml', 'default-marker/index.wxss',
    ]) {
      assert.ok(entries.includes(`package/dist/components/cool-month-calendar/${relativePath}`), relativePath);
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

    const sbom = JSON.parse(await readFile(resolve(artifacts, 'sbom.cdx.json'), 'utf8'));
    assert.match(sbom.serialNumber, /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(sbom.serialNumber, 'urn:uuid:d39319ec-2014-537f-8b7b-f30a49a1803d');
    assert.equal(sbom.bomFormat, 'CycloneDX');
    assert.equal(sbom.specVersion, '1.6');
    assert.equal(sbom.metadata.component.version, releaseVersion);
    const expectedComponents = [
      { name: '@cool-ui/tokens', purl: `pkg:npm/%40cool-ui/tokens@${releaseVersion}` },
      { name: '@cool-ui/wechat', purl: `pkg:npm/%40cool-ui/wechat@${releaseVersion}` },
      { name: 'CoolUI', purl: `pkg:swift/github.com/XingAur/cool-ui@${releaseVersion}` },
      { name: 'dev.coolui:coolui-compose', purl: `pkg:maven/dev.coolui/coolui-compose@${releaseVersion}` },
      { name: '@cool-ui/arkui', purl: `pkg:ohpm/%40cool-ui/arkui@${releaseVersion}` },
    ];
    assert.deepEqual(
      sbom.components.map(({ name, version, purl }) => ({ name, version, purl })),
      expectedComponents.map((component) => ({ ...component, version: releaseVersion })),
    );
    assert.equal(sbom.metadata.component.name, 'cool-ui');
    assert.ok(sbom.components.every(({ name }) => name !== 'cool-ui'), 'root application belongs only in metadata');

    const report = await readFile(resolve(fixture, 'docs/releases/0.2.0-verification.md'), 'utf8');
    assert.match(report, new RegExp(tokensSha256));
    assert.match(report, new RegExp(wechatSha256));
    assert.match(report, new RegExp(`${entries.length} entries`));
    assert.match(report, new RegExp(`component count: ${sbom.components.length}`, 'i'));
    assert.match(report, new RegExp(sbom.serialNumber));
    assert.match(report, /### Swift[\s\S]*pending/i);
    assert.match(report, /### HarmonyOS[\s\S]*HAR[\s\S]*HAP[\s\S]*pending/i);
    assert.match(report, /no public[\s\S]{0,120}(?:publish|publication)/i);
    assert.doesNotMatch(report, /\b\d+\/\d+\b/);
    assert.match(report, /node --test tests\/release\.test\.mjs` \| PASS; all release tests passed/i);

    const expectedFiles = [
      'LICENSE',
      'NOTICE',
      'licenses.json',
      `npm/${tokensName}`,
      `npm/${wechatName}`,
      'sbom.cdx.json',
    ];
    const checksumLines = (await readFile(resolve(artifacts, 'SHA256SUMS'), 'utf8')).trim().split(/\r?\n/);
    const checksums = new Map(checksumLines.map((line) => {
      const match = line.match(/^([0-9a-f]{64})  (.+)$/);
      assert.ok(match, line);
      return [match[2], match[1]];
    }));
    assert.equal(checksums.size, 6);
    assert.equal(checksums.has('native-validation.json'), false);
    assert.deepEqual([...checksums.keys()].sort(), [...expectedFiles].sort());
    for (const [path, digest] of checksums) {
      const actual = createHash('sha256').update(await readFile(resolve(artifacts, path))).digest('hex');
      assert.equal(actual, digest, path);
    }

    const licenses = JSON.parse(await readFile(resolve(artifacts, 'licenses.json'), 'utf8'));
    assert.equal(licenses.project, 'Apache-2.0');
    assert.deepEqual(
      licenses.packages.map(({ name, version, license }) => ({ name, version, license })),
      expectedComponents.map(({ name }) => ({ name, version: releaseVersion, license: 'Apache-2.0' })),
    );
    assert.match(report, /native-validation\.json[^\n]*excluded[^\n]*host-specific/i);
    assert.match(report, /exactly six distributable files/i);

    const consumer = resolve(fixture, 'examples/npm-consumer');
    const lockfile = spawnPnpm(['--dir', consumer, '--ignore-workspace', 'install', '--offline', '--no-frozen-lockfile', '--lockfile-only', '--config.node-linker=hoisted'], { cwd: fixture, env: fakeNpmEnvironment });
    assert.equal(lockfile.status, 0, lockfile.stderr || lockfile.stdout);
    const installed = spawnPnpm(['--dir', consumer, '--ignore-workspace', 'install', '--offline', '--frozen-lockfile', '--config.node-linker=hoisted'], { cwd: fixture, env: fakeNpmEnvironment });
    assert.equal(installed.status, 0, installed.stderr || installed.stdout);
    const consumed = spawnPnpm(['--dir', consumer, '--ignore-workspace', 'test'], { cwd: fixture, env: fakeNpmEnvironment });
    assert.equal(consumed.status, 0, consumed.stderr || consumed.stdout);
    assert.match(consumed.stdout, /Verified npm tarballs in a clean local consumer\./);
  } finally {
    assert.ok(basename(fixture).startsWith('cool-ui-release-fixture-'), `Unsafe fixture cleanup: ${fixture}`);
    await rm(fixture, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
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

test('local verification report uses reproducible commands and stable evidence', async () => {
  const report = await read('docs/releases/0.2.0-verification.md');
  assert.doesNotMatch(report, /<all generated paths>|\$consumer/);
  assert.doesNotMatch(report, /\([\d,]+ bytes\)/);
  assert.match(report, /node --test tests\/release\.test\.mjs/);
  assert.match(report, /0b03d23806913501b3c5334748511a8581d0f0fd/);
  assert.match(report, /8e5a2d09029a03d5796d846378ef18b0710f6026/);
  assert.match(report, /Verified functional\/docs source commit:\s*`[0-9a-f]{40}`/i);
  assert.match(report, /report-only commit[^\n]*does not alter[^\n]*verified source/i);
  assert.doesNotMatch(report, /cannot self-reference[^\n]*Git history/i);
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
