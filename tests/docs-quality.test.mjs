import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const mojibake = /鏄|灞|锛|鈥|寰俊|€|鈭|灞炰簬|鍥涚|绀轰緥|鍙|鎴愮啛|鍘熺敓鐜荤拑/;

test('English and Chinese entry points contain no encoding corruption', async () => {
  for (const path of ['README.md', 'README.zh-CN.md']) assert.doesNotMatch(await read(path), mojibake, path);
  assert.doesNotMatch(await read('docs/zh/index.md'), mojibake, 'docs/zh/index.md');
  for (const file of await readdir(new URL('docs/zh/components/', root))) {
    assert.doesNotMatch(await read(`docs/zh/components/${file}`), mojibake, file);
  }
});

test('component docs report contract maturity instead of unconditional support', async () => {
  const contract = JSON.parse(await read('contracts/components.json'));
  for (const component of contract.components) {
    const file = component.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const english = await read(`docs/components/${file}.md`);
    const chinese = await read(`docs/zh/components/${file}.md`);
    for (const platform of ['swiftui', 'compose', 'arkui', 'wechat']) {
      assert.match(english, new RegExp(`\\b${component.maturity[platform]}\\b`, 'i'), `${component.name} ${platform}`);
      assert.match(chinese, new RegExp(`\\b${component.maturity[platform]}\\b`, 'i'), `${component.name} ${platform} zh`);
    }
  }
});

test('MonthCalendar has explicit bilingual controlled-data guidance instead of generic placeholders', async () => {
  const pages = [
    ['docs/components/month-calendar.md', /selectedDate.*authoritative selection/],
    ['docs/zh/components/month-calendar.md', /selectedDate.*唯一权威的选中值/],
  ];
  const dayFields = [
    'date', 'day', 'secondaryText', 'accessibilityLabel', 'isToday',
    'isSelected', 'isDisabled', 'tone', 'badge', 'markers',
  ];

  for (const [path, controlledStatement] of pages) {
    const source = await read(path);
    assert.match(source, controlledStatement, `${path} controlled selection`);
    assert.match(source, /empty|invalid|空值|非法值/i, `${path} empty and invalid selection`);
    assert.match(source, /consumer|parent|调用方|父级/i, `${path} parent-owned updates`);
    for (const field of dayFields) assert.match(source, new RegExp(`\\b${field}\\b`), `${path} ${field}`);
    assert.match(source, /markers[^\n]*(?:3|three|三个|最多)/i, `${path} marker limit`);

    for (const api of [
      'Binding<Date>', 'CoolMonthCalendarHeaderContext', 'CoolCalendarDay', 'CoolCalendarMarker',
      'LocalDate', 'YearMonth', '@BuilderParam', 'selected-date', 'bind:select', 'bind:monthchange',
    ]) assert.ok(source.includes(api), `${path} documents ${api}`);

    assert.match(source, /select[^\n]*\{\s*day\s*:\s*CoolCalendarDay\s*\}/i, `${path} select payload`);
    assert.match(source, /monthchange[^\n]*\{\s*direction\s*:\s*['"]previous['"]\s*\|\s*['"]next['"]\s*\}/i, `${path} monthchange payload`);
    assert.match(source, /header[^\n]*(?:named slot|具名插槽)/i, `${path} header slot`);
    assert.match(source, /componentGenerics[^\n]*day[^\n]*marker/i, `${path} generic slot mapping`);
    assert.match(source, /accessibilityLabel[^\n]*(?:date|日期)/i, `${path} accessibility fallback`);
    assert.match(source, /(?:single|one|一个|单一)[^\n]*(?:glass|玻璃)[^\n]*(?:surface|表面)/i, `${path} single glass surface`);
    assert.match(source, /Gregorian|公历/i, `${path} Gregorian ownership`);
    assert.match(source, /lunar|农历/i, `${path} lunar ownership`);
    assert.match(source, /holiday|节假日/i, `${path} holiday ownership`);
    assert.match(source, /work(?:day|[- ]rest)|调休/i, `${path} work-rest ownership`);
    assert.match(source, /HAR[^\n]*(?:pending|待验证)/i, `${path} honest ArkUI maturity`);
    assert.doesNotMatch(source, /typed platform parameters|类型安全的平台参数|placeholder|TODO|TBD/i, `${path} copyable examples`);
  }
});

test('root and platform READMEs describe the 0.2.0 local-only 43-component boundary honestly', async () => {
  const roots = [await read('README.md'), await read('README.zh-CN.md')];
  for (const source of roots) {
    assert.match(source, /0\.2\.0/);
    assert.match(source, /43\s*(?:components|个组件|个具名|个原生)/i);
    assert.match(source, /local-only|not published to public|不发布到公共|仅本地/i);
    assert.match(source, /SwiftPM/i);
    assert.match(source, /Maven/i);
    assert.match(source, /HAR/i);
    assert.match(source, /tarball|tgz|压缩包/i);
    assert.match(source, /Liquid Glass/i);
    assert.match(source, /equivalent|等价/i);
    assert.match(source, /not affiliated|无隶属/i);
    assert.match(source, /proprietary platform assets|专有平台素材/i);
    assert.match(source, /planned/i);
    assert.doesNotMatch(source, /\b42\b/);
  }
  assert.match(roots[0], /README\.zh-CN\.md/);
  assert.match(roots[1], /README\.md/);

  const packageReadmes = {
    swift: await read('packages/swift/README.md'),
    android: await read('packages/android/README.md'),
    arkui: await read('packages/arkui/README.md'),
    wechat: await read('packages/wechat/README.md'),
  };
  for (const [platform, source] of Object.entries(packageReadmes)) {
    assert.match(source, /0\.2\.0/, `${platform} version`);
    assert.match(source, /43\s+components/i, `${platform} count`);
    assert.match(source, /planned/i, `${platform} maturity`);
  }
  assert.match(packageReadmes.swift, /SwiftPM|Swift Package Manager/i);
  assert.match(packageReadmes.android, /local Maven/i);
  assert.match(packageReadmes.arkui, /HAR[^\n]*(?:pending|not yet|unverified)/i);
  assert.match(packageReadmes.wechat, /local[^\n]*(?:tarball|tgz)/i);
});

test('WeChat README states native Button form and open-type boundaries', async () => {
  const source = await read('packages/wechat/README.md');
  assert.match(source, /native `<button>`/i);
  assert.match(source, /open-type/i);
  assert.match(source, /form-type/i);
  assert.match(source, /internal `<form>`/i);
  assert.match(source, /cannot submit an outer form/i);
  assert.match(source, /platform|base library|微信/i);
});
