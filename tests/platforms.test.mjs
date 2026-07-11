import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const contract = JSON.parse(await read('contracts/components.json'));
const capabilities = JSON.parse(await read('contracts/component-capabilities.json'));

const componentApiName = (name) => name;
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const platforms = ['swiftui', 'compose', 'arkui', 'wechat'];
const nonRenderedModes = new Set(['registryOnly', 'reserved']);
const platformExpectation = (generationModes, name, platform) => (
  nonRenderedModes.has(generationModes[name]?.[platform])
    ? 'reservation'
    : 'native'
);

test('mixed generation modes keep implemented platforms under native API checks', () => {
  const mixedModes = {
    MonthCalendar: {
      swiftui: 'native',
      compose: 'native',
      arkui: 'registryOnly',
      wechat: 'reserved',
    },
  };
  assert.deepEqual(
    Object.fromEntries(platforms
      .map((platform) => [platform, platformExpectation(mixedModes, 'MonthCalendar', platform)])),
    { swiftui: 'native', compose: 'native', arkui: 'reservation', wechat: 'reservation' },
  );
});

test('every component is checked independently against each platform generation mode', async () => {
  const swiftFiles = await readdir(new URL('packages/swift/Sources/CoolUI/', root));
  const swiftSources = (await Promise.all(
    swiftFiles.filter((file) => file.endsWith('.swift')).map((file) => read(`packages/swift/Sources/CoolUI/${file}`)),
  )).join('\n');
  const composeSources = (await Promise.all((await readdir(new URL('packages/android/src/main/kotlin/dev/coolui/compose/', root))).filter((file) => file.endsWith('.kt')).map((file) => read(`packages/android/src/main/kotlin/dev/coolui/compose/${file}`)))).join('\n');
  const arkSources = await read('packages/arkui/src/main/ets/components/GeneratedComponents.ets');
  const wechatManifest = await read('packages/wechat/component-manifest.json');
  const sources = {
    swiftui: swiftSources,
    compose: composeSources,
    arkui: arkSources,
    wechat: wechatManifest,
  };
  const registries = {
    swiftui: await read('packages/swift/Sources/CoolUI/GeneratedComponents.swift'),
    compose: await read('packages/android/src/main/kotlin/dev/coolui/compose/GeneratedComponents.kt'),
    arkui: arkSources,
    wechat: wechatManifest,
  };

  for (const { name } of contract.components) {
    for (const platform of platforms) {
      const expectation = platformExpectation(capabilities.generationModes ?? {}, name, platform);
      const pattern = platform === 'wechat'
        ? new RegExp(`cool-${kebab(name)}`)
        : expectation === 'reservation'
          ? new RegExp(`"${name}"`)
          : platform === 'arkui'
            ? new RegExp(`export struct Cool${componentApiName(name)}\\b`)
            : new RegExp(`\\bCool${componentApiName(name)}\\b`);
      assert.match(expectation === 'reservation' ? registries[platform] : sources[platform], pattern, `${platform} ${name} ${expectation}`);
    }
  }
});

test('MonthCalendar is native only in WeChat and reserved in other platform registries', async () => {
  const swiftRegistry = await read('packages/swift/Sources/CoolUI/GeneratedComponents.swift');
  const kotlinRegistry = await read('packages/android/src/main/kotlin/dev/coolui/compose/GeneratedComponents.kt');
  const arkRegistry = await read('packages/arkui/src/main/ets/components/GeneratedComponents.ets');
  const wechatManifest = JSON.parse(await read('packages/wechat/component-manifest.json'));
  const wechatCalendar = [
    await read('packages/wechat/src/components/cool-month-calendar/index.js'),
    await read('packages/wechat/src/components/cool-month-calendar/index.wxml'),
  ].join('\n');

  assert.deepEqual(
    Object.fromEntries(platforms.map((platform) => [
      platform,
      platformExpectation(capabilities.generationModes ?? {}, 'MonthCalendar', platform),
    ])),
    { swiftui: 'reservation', compose: 'reservation', arkui: 'reservation', wechat: 'native' },
  );
  assert.match(swiftRegistry, /"MonthCalendar"/);
  assert.match(kotlinRegistry, /"MonthCalendar"/);
  assert.match(arkRegistry, /"MonthCalendar"/);
  assert.doesNotMatch(arkRegistry, /export struct CoolMonthCalendar\b/);
  assert.equal(wechatManifest['cool-month-calendar'], './dist/components/cool-month-calendar/index');
  assert.match(wechatCalendar, /handleDayTap/);
  assert.match(wechatCalendar, /handleMonthChange/);
  assert.match(wechatCalendar, /triggerEvent\('select'/);
  assert.match(wechatCalendar, /triggerEvent\('monthchange'/);
  assert.doesNotMatch(wechatCalendar, /data-generation-mode="reserved"/);
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
