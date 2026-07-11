import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const contract = JSON.parse(await read('contracts/components.json'));

const componentApiName = (name) => name;
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

test('every component has its idiomatic public name on all four platforms', async () => {
  const swiftFiles = await readdir(new URL('packages/swift/Sources/CoolUI/', root));
  const swiftSources = (await Promise.all(
    swiftFiles.filter((file) => file.endsWith('.swift')).map((file) => read(`packages/swift/Sources/CoolUI/${file}`)),
  )).join('\n');
  const sources = {
    swiftui: swiftSources,
    compose: (await Promise.all((await readdir(new URL('packages/android/src/main/kotlin/dev/coolui/compose/', root))).filter((file) => file.endsWith('.kt')).map((file) => read(`packages/android/src/main/kotlin/dev/coolui/compose/${file}`)))).join('\n'),
    arkui: await read('packages/arkui/src/main/ets/components/GeneratedComponents.ets'),
    wechat: await read('packages/wechat/component-manifest.json'),
  };

  for (const { name } of contract.components) {
    assert.match(sources.swiftui, new RegExp(`\\bCool${componentApiName(name)}\\b`), `Swift ${name}`);
    assert.match(sources.compose, new RegExp(`\\bCool${componentApiName(name)}\\b`), `Compose ${name}`);
    assert.match(sources.arkui, new RegExp(`\\bCool${componentApiName(name)}\\b`), `ArkUI ${name}`);
    assert.match(sources.wechat, new RegExp(`cool-${kebab(name)}`), `WeChat ${name}`);
  }
});

test('platform foundations use native glass capabilities and generated tokens', async () => {
  const swift = `${await read('packages/swift/Sources/CoolUI/CoolCore.swift')}\n${await read('packages/swift/Sources/CoolUI/CoolGlass.swift')}`;
  assert.match(swift, /GlassEffectContainer/);
  assert.match(swift, /glassEffect/);
  assert.match(swift, /public struct CoolGlassSurface<Content: View>/);
  assert.match(swift, /CoolTokens/);

  const android = (await Promise.all((await readdir(new URL('packages/android/src/main/kotlin/dev/coolui/compose/', root))).filter((file) => file.endsWith('.kt')).map((file) => read(`packages/android/src/main/kotlin/dev/coolui/compose/${file}`)))).join('\n');
  assert.match(android, /RenderEffect|\.blur\(/);
  assert.match(android, /CoolTokens/);
  assert.match(android, /Build\.VERSION_CODES\.S/);

  const arkui = await read('packages/arkui/src/main/ets/components/CoolCore.ets');
  assert.match(arkui, /backdropBlur/);
  assert.match(arkui, /CoolTokens/);

  const wxss = await read('packages/wechat/src/styles/glass.wxss');
  assert.match(wxss, /backdrop-filter/);
  assert.match(wxss, /--cool-/);
  assert.match(wxss, /solid-fallback/);
});

test('semantic icons map to platform-owned systems without bundled proprietary files', async () => {
  const icons = JSON.parse(await read('contracts/icons.json'));
  assert.ok(Object.keys(icons).length >= 16);
  for (const [name, mapping] of Object.entries(icons)) {
    assert.deepEqual(Object.keys(mapping), ['sfSymbol', 'materialSymbol', 'harmonySymbol', 'lucide']);
    assert.ok(Object.values(mapping).every(Boolean), name);
  }
});

test('all four runnable Catalog entry points exist', async () => {
  for (const path of [
    'apps/catalog-wechat/app.json',
    'apps/catalog-swift/CoolUICatalog/CoolUICatalogApp.swift',
    'apps/catalog-android/src/main/AndroidManifest.xml',
    'apps/catalog-arkui/entry/src/main/module.json5',
  ]) await access(new URL(path, root));

  const swiftCatalog = await read('apps/catalog-swift/project.yml');
  assert.match(swiftCatalog, /GENERATE_INFOPLIST_FILE: YES/);
});

test('platform package metadata pins the agreed minimums and coordinates', async () => {
  const swiftPackage = await read('packages/swift/Package.swift');
  assert.match(swiftPackage, /swift-tools-version: 6\.2/);
  assert.match(swiftPackage, /\.iOS\(\.v26\)/);
  const gradle = await read('packages/android/build.gradle.kts');
  assert.match(gradle, /namespace = "dev\.coolui\.compose"/);
  assert.match(gradle, /minSdk = 31/);
  assert.match(gradle, /artifactId = "coolui-compose"/);
  assert.match(await read('packages/arkui/src/main/module.json5'), /"type": "har"/);
  assert.match(await read('packages/wechat/package.json'), /3\.14\.3/);
});
