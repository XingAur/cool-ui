import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('../../contracts/components.json', root), 'utf8'));

const buttonNativeProperties = [
  { name: 'openType', attribute: 'open-type', type: 'String', defaultValue: '' },
  { name: 'formType', attribute: 'form-type', type: 'String', defaultValue: '' },
  { name: 'lang', attribute: 'lang', type: 'String', defaultValue: 'en' },
  { name: 'sessionFrom', attribute: 'session-from', type: 'String', defaultValue: '' },
  { name: 'sendMessageTitle', attribute: 'send-message-title', type: 'String', defaultValue: '' },
  { name: 'sendMessagePath', attribute: 'send-message-path', type: 'String', defaultValue: '' },
  { name: 'sendMessageImg', attribute: 'send-message-img', type: 'String', defaultValue: '' },
  { name: 'appParameter', attribute: 'app-parameter', type: 'String', defaultValue: '' },
  { name: 'showMessageCard', attribute: 'show-message-card', type: 'Boolean', defaultValue: false },
  { name: 'phoneNumberNoQuotaToast', attribute: 'phone-number-no-quota-toast', type: 'Boolean', defaultValue: true },
];

const buttonOpenCapabilityEvents = [
  { name: 'getuserinfo', attribute: 'bindgetuserinfo' },
  { name: 'contact', attribute: 'bindcontact' },
  { name: 'getphonenumber', attribute: 'bindgetphonenumber' },
  { name: 'getrealtimephonenumber', attribute: 'bindgetrealtimephonenumber' },
  { name: 'createliveactivity', attribute: 'createliveactivity' },
  { name: 'error', attribute: 'binderror' },
  { name: 'opensetting', attribute: 'bindopensetting' },
  { name: 'launchapp', attribute: 'bindlaunchapp' },
  { name: 'chooseavatar', attribute: 'bindchooseavatar' },
  { name: 'agreeprivacyauthorization', attribute: 'bindagreeprivacyauthorization' },
];

async function loadGeneratedComponent(tag, globals = {}) {
  const source = await readFile(new URL(`src/components/${tag}/index.js`, root), 'utf8');
  let definition;
  vm.runInNewContext(source, {
    Component(value) { definition = value; },
    require() { return {}; },
    ...globals,
  }, { filename: `${tag}/index.js` });
  return { definition, source };
}

test('all component tags are generated', async () => {
  const manifest = JSON.parse(await readFile(new URL('component-manifest.json', root), 'utf8'));
  assert.equal(Object.keys(manifest).length, contract.components.length);
  assert.equal(manifest['cool-button'], './dist/components/cool-button/index');
  assert.equal(manifest['cool-month-calendar'], './dist/components/cool-month-calendar/index');
});

test('MonthCalendar declares controlled serializable properties', async () => {
  const { definition } = await loadGeneratedComponent('cool-month-calendar');
  assert.equal(definition.properties.year.type.name, 'Number');
  assert.equal(definition.properties.month.type.name, 'Number');
  assert.equal(definition.properties.days.type.name, 'Array');
  assert.equal(definition.properties.selectedDate.type.name, 'String');
  assert.equal(definition.properties.weekdays.type.name, 'Array');
  assert.equal(definition.properties.useCustomHeader.type.name, 'Boolean');
  assert.equal(definition.properties.useCustomHeader.value, false);
  assert.deepEqual(plainData(definition.properties.weekdays.value), ['一', '二', '三', '四', '五', '六', '日']);
});

test('shared behavior exposes controlled events and accessibility state inputs', async () => {
  const source = await readFile(new URL('src/behaviors/cool-ui.js', root), 'utf8');
  for (const property of ['themeMode', 'material', 'tone', 'size', 'contrastMode', 'motionMode', 'transparencyMode', 'accessibilityLabel']) {
    assert.match(source, new RegExp(`${property}:`));
  }
  assert.match(source, /triggerEvent\('change'/);
  assert.doesNotMatch(source, /setData\(\{\s*value:/);
});

test('generated native controls are valid WXML and overlays have presentation semantics', async () => {
  const stepper = await readFile(new URL('src/components/cool-stepper/index.wxml', root), 'utf8');
  assert.match(stepper, />−<\/button>/);
  assert.doesNotMatch(stepper, /鈭|\?\/button>/);

  const alert = await readFile(new URL('src/components/cool-alert-dialog/index.wxml', root), 'utf8');
  const sheet = await readFile(new URL('src/components/cool-bottom-sheet/index.wxml', root), 'utf8');
  assert.match(alert, /wx:if="\{\{open\}\}"[\s\S]*role="dialog"/);
  assert.match(sheet, /wx:if="\{\{open\}\}"[\s\S]*cool-overlay-backdrop/);
});

test('Button renders one native button with native attributes and slot content', async () => {
  const source = await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8');

  assert.match(source, /<button\b/);
  assert.equal(source.match(/<button\b/g)?.length, 1, 'Button must not nest another native button');
  assert.match(source, /open-type="\{\{openType\}\}"/);
  assert.match(source, /form-type="\{\{formType\}\}"/);
  assert.match(source, /disabled="\{\{disabled \|\| loading\}\}"/);
  assert.match(source, /loading="\{\{loading\}\}"/);
  assert.match(source, /aria-label="\{\{resolvedAccessibilityLabel\}\}"/);
  assert.match(source, /<slot name="icon"\s*\/>/);
  assert.match(source, /<text wx:if="\{\{label\}\}"[^>]*>\{\{label\}\}<\/text>/);
  assert.match(source, /<slot\s*\/>/);
  assert.match(source, /bindtap="handleButtonTap"/);
});

test('Button bridges its native form-type button to a consumer-owned outer form', async () => {
  const wxml = await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8');
  const generator = await readFile(new URL('../../scripts/generate-components.mjs', root), 'utf8');
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const { definition, source } = await loadGeneratedComponent('cool-button');

  assert.ok(definition.behaviors.includes('wx://form-field-button'));
  assert.match(generator, /behaviors:\s*\[coolBehavior,\s*'wx:\/\/form-field-button'\]/);
  assert.doesNotMatch(wxml, /<\/?form\b/);
  assert.equal(wxml.match(/<button\b/g)?.length, 1);
  assert.match(wxml, /form-type="\{\{formType\}\}"/);
  assert.doesNotMatch(source, /handleForm(?:Submit|Reset)/);
  assert.match(readme, /consumer-owned|outer form/i);
  assert.match(readme, /wx:\/\/form-field-button/);
  assert.doesNotMatch(readme, /cannot submit an outer form/i);
});

test('Button explicitly forwards every supported native event', async () => {
  const source = await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8');

  for (const { name, attribute } of buttonOpenCapabilityEvents) {
    assert.match(source, new RegExp(`${attribute}="forwardNativeEvent"`), name);
  }
});

test('Button declares the complete native property matrix', async () => {
  const wxml = await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8');
  const { definition } = await loadGeneratedComponent('cool-button');
  assert.deepEqual(Object.keys(definition.properties), buttonNativeProperties.map(({ name }) => name));

  for (const { name, attribute, type, defaultValue } of buttonNativeProperties) {
    assert.equal(definition.properties[name].type.name, type, name);
    assert.equal(definition.properties[name].value, defaultValue, name);
    assert.match(wxml, new RegExp(`${attribute}="\\{\\{${name}\\}\\}"`), name);
  }
});

test('Button suppresses disabled or loading taps', async () => {
  const { definition } = await loadGeneratedComponent('cool-button');

  for (const state of [{ disabled: true, loading: false }, { disabled: false, loading: true }]) {
    const events = [];
    definition.methods.handleButtonTap.call({
      data: { ...state, value: 'blocked' },
      triggerEvent(name, detail) { events.push({ name, detail }); },
    });
    assert.deepEqual(events, []);
  }

  for (const selected of [false, true]) {
    const events = [];
    definition.methods.handleButtonTap.call({
      data: { disabled: false, loading: false, value: 'primary', selected },
      triggerEvent(name, detail) { events.push({ name, detail }); },
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'tap');
    assert.equal(events[0].detail.value, 'primary');
    assert.equal(events[0].detail.selected, selected);
  }
});

test('Button forwardNativeEvent preserves the native event name and detail object', async () => {
  const { definition } = await loadGeneratedComponent('cool-button');

  for (const { name: eventName } of buttonOpenCapabilityEvents) {
    const detail = { eventName, marker: Symbol(eventName) };
    let forwarded;
    definition.methods.forwardNativeEvent.call({
      triggerEvent(name, forwardedDetail) { forwarded = { name, detail: forwardedDetail }; },
    }, { type: eventName, detail });
    assert.equal(forwarded.name, eventName);
    assert.equal(forwarded.detail, detail);
  }
});

test('Button styles use shared tokens for all native interaction states', async () => {
  const source = [
    await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8'),
    await readFile(new URL('src/components/cool-button/index.wxss', root), 'utf8'),
  ].join('\n');
  assert.match(source, /@import "\.\.\/\.\.\/styles\/glass\.wxss"/);
  assert.match(source, /\.cool-button-native::after\s*\{\s*border:\s*0;\s*\}/);
  for (const selector of ['cool-tone-', 'cool-size-', 'cool-material-', 'is-pressed', 'is-disabled', ':focus']) {
    assert.match(source, new RegExp(selector));
  }
  assert.doesNotMatch(source, /#[\da-f]{3,8}|rgba?\(/i);
  assert.doesNotMatch(source, /border-radius:\s*\d|backdrop-filter:\s*blur\(\d/i);
});

test('WeChat catalog showcases native Button states without replacing the component list', async () => {
  const source = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.wxml', root), 'utf8');
  const pageSource = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.js', root), 'utf8');
  assert.match(source, /Button native capabilities/);
  assert.match(source, /<cool-button label="Default"/);
  assert.match(source, /<cool-button label="Loading"[^>]*loading="\{\{true\}\}"/);
  assert.match(source, /<cool-button label="Disabled"[^>]*disabled="\{\{true\}\}"/);
  assert.match(source, /<cool-button label="Share"[^>]*open-type="share"/);
  assert.match(source, /<form\b[^>]*bindsubmit="handleButtonSubmit"[^>]*bindreset="handleButtonReset"[^>]*>[\s\S]*<cool-button label="Submit"[^>]*form-type="submit"[\s\S]*<cool-button label="Reset"[^>]*form-type="reset"[\s\S]*<\/form>/);
  assert.match(source, /\{\{buttonSubmitResult\}\}/);
  assert.match(pageSource, /handleButtonSubmit\(event\)[\s\S]*setData\(\{ buttonSubmitResult:/);
  assert.match(pageSource, /handleButtonReset\(\)[\s\S]*setData\(\{ buttonSubmitResult:/);
  assert.equal((source.match(/accessibility-label="Button example"/g) ?? []).length, 1);
});

test('selected WeChat calendar and option text use AA ink over accent', async () => {
  const [tokens, generator, calendar, tabBar, segmentedControl] = await Promise.all([
    readFile(new URL('../tokens/generated/wechat/cool-ui-tokens.wxss', root), 'utf8'),
    readFile(new URL('../../scripts/generate-components.mjs', root), 'utf8'),
    readFile(new URL('src/components/cool-month-calendar/index.wxss', root), 'utf8'),
    readFile(new URL('src/components/cool-tab-bar/index.wxss', root), 'utf8'),
    readFile(new URL('src/components/cool-segmented-control/index.wxss', root), 'utf8'),
  ]);
  const token = (name) => tokens.match(new RegExp(`--cool-color-light-${name}:\\s*(#[0-9A-F]{8});`))?.[1];
  const luminance = (argb) => {
    const channel = (start) => {
      const value = Number.parseInt(argb.slice(start, start + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return (0.2126 * channel(1)) + (0.7152 * channel(3)) + (0.0722 * channel(5));
  };
  const contrast = (foreground, background) => {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };

  assert.ok(contrast(token('text'), token('accent')) >= 4.5);
  for (const source of [generator, calendar, tabBar, segmentedControl]) assert.match(source, /color:\s*var\(--cool-color-light-text\)/);
  assert.doesNotMatch(generator, /is-active[\s\S]{0,120}color:\s*var\(--cool-color-light-background\)/);
  assert.doesNotMatch(calendar, /is-selected\s*\{[^}]*color:\s*var\(--cool-color-light-background\)/);
});

const controlledOptionTags = ['cool-tab-bar', 'cool-segmented-control'];
const plainData = (value) => JSON.parse(JSON.stringify(value));

async function loadCatalogPage() {
  const source = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.js', root), 'utf8');
  let definition;
  vm.runInNewContext(source, {
    Page(value) { definition = value; },
  }, { filename: 'catalog-wechat/pages/index/index.js' });
  return { definition, source };
}

test('controlled TabBar and SegmentedControl render option semantics from stable value keys', async () => {
  for (const tag of controlledOptionTags) {
    const wxml = await readFile(new URL(`src/components/${tag}/index.wxml`, root), 'utf8');
    assert.match(wxml, /wx:for="\{\{viewOptions\}\}"/, tag);
    assert.match(wxml, /wx:key="_key"/, tag);
    assert.match(wxml, /data-index="\{\{item\._index\}\}"/, tag);
    assert.match(wxml, /bindtap="handleOptionTap"/, tag);
    assert.match(wxml, /item\._index === selectedIndex/, `${tag} first-match active state`);
    assert.equal((wxml.match(/item\.disabled \|\| disabled \|\| loading/g) ?? []).length, 2, `${tag} visual and aria disabled state`);
    assert.match(wxml, /wx:if="\{\{item\.badge \|\| item\.badge === 0\}\}"/, `${tag} badge`);
    assert.match(wxml, /role="tablist"/, tag);
    assert.match(wxml, /role="tab"/, tag);
  }

  const tabWxml = await readFile(new URL('src/components/cool-tab-bar/index.wxml', root), 'utf8');
  assert.match(tabWxml, /<scroll-view\b[^>]*scroll-x="\{\{true\}\}"/);
  assert.match(tabWxml, /cool-page-tab/);

  const segmentWxml = await readFile(new URL('src/components/cool-segmented-control/index.wxml', root), 'utf8');
  assert.match(segmentWxml, /cool-segmented-options/);
});

test('controlled option components preserve loading and error presentation states', async () => {
  for (const tag of controlledOptionTags) {
    const wxml = await readFile(new URL(`src/components/${tag}/index.wxml`, root), 'utf8');
    assert.match(wxml, /\{\{loading \? 'is-loading' : ''\}\}/, `${tag} loading class`);
    assert.match(wxml, /\{\{error \? 'is-error' : ''\}\}/, `${tag} error class`);
    assert.match(wxml, /wx:if="\{\{loading\}\}" class="cool-loading" aria-label="loading"/, `${tag} spinner`);
    assert.match(wxml, /wx:if="\{\{errorMessage\}\}" class="cool-error" role="alert"/, `${tag} error message`);
  }
});

test('controlled option status nodes stay outside option flex and scroll tracks', async () => {
  const segmentWxml = await readFile(new URL('src/components/cool-segmented-control/index.wxml', root), 'utf8');
  const segmentStyles = await readFile(new URL('src/components/cool-segmented-control/index.wxss', root), 'utf8');
  assert.match(segmentWxml, /^<view class="[^"]*cool-segmented-control[^"]*"[^>]*>/);
  assert.match(segmentWxml, /class="cool-loading"[\s\S]*<view class="cool-segmented-options" role="tablist"[^>]*>[\s\S]*wx:for="\{\{viewOptions\}\}"[\s\S]*<\/view>\s*<text wx:if="\{\{errorMessage\}\}"/);
  assert.match(segmentStyles, /\.cool-segmented-options\s*\{[\s\S]*?display:\s*flex;/);
  assert.doesNotMatch(segmentStyles, /\.cool-segmented-control\s*\{[^}]*display:\s*flex;/);

  const tabWxml = await readFile(new URL('src/components/cool-tab-bar/index.wxml', root), 'utf8');
  assert.match(tabWxml, /class="cool-loading"[\s\S]*<view class="cool-tab-track">[\s\S]*wx:for="\{\{viewOptions\}\}"[\s\S]*<\/view>\s*<text wx:if="\{\{errorMessage\}\}"/);
});

test('controlled option components emit exact change details without writing value', async () => {
  for (const tag of controlledOptionTags) {
    const { definition, source } = await loadGeneratedComponent(tag);
    assert.doesNotMatch(source, /setData\(\{\s*value\s*:/, tag);

    const options = [
      { value: 'overview', label: 'Overview' },
      { value: 2, label: 'Two' },
      { value: 'blocked', label: 'Blocked', disabled: true },
    ];
    const invoke = (index, overrides = {}) => {
      const events = [];
      const writes = [];
      definition.methods.handleOptionTap.call({
        data: { options, value: 'overview', disabled: false, ...overrides },
        setData(update) { writes.push(update); },
        triggerEvent(name, detail) { events.push({ name, detail }); },
      }, { currentTarget: { dataset: { index } } });
      return { events, writes };
    };

    assert.deepEqual(plainData(invoke(1).events), [{ name: 'change', detail: { value: 2, index: 1 } }], tag);
    assert.deepEqual(invoke(0).events, [], `${tag} current selection`);
    assert.deepEqual(invoke(2).events, [], `${tag} disabled option`);
    assert.deepEqual(invoke(1, { disabled: true }).events, [], `${tag} disabled component`);
    assert.deepEqual(invoke(1, { loading: true }).events, [], `${tag} loading component`);
    assert.deepEqual(invoke(99).events, [], `${tag} out of range`);
    assert.deepEqual(invoke(-1).events, [], `${tag} negative index`);
    assert.deepEqual(invoke(undefined).events, [], `${tag} missing index`);
    assert.deepEqual(invoke(1).writes, [], `${tag} controlled value`);

    const stringResult = invoke(0, { value: 2 });
    assert.deepEqual(plainData(stringResult.events), [{ name: 'change', detail: { value: 'overview', index: 0 } }], `${tag} string value`);
    assert.deepEqual(plainData(invoke(1, { error: true }).events), [{ name: 'change', detail: { value: 2, index: 1 } }], `${tag} error remains selectable`);
  }
});

test('controlled option validation gives duplicates unique keys and preserves first-match selection', async () => {
  for (const tag of controlledOptionTags) {
    const { definition } = await loadGeneratedComponent(tag, {
      console: { warn() {} },
      wx: { getAccountInfoSync() { return { miniProgram: { envVersion: 'develop' } }; } },
    });
    const writes = [];
    const options = [
      { value: 1, label: 'First number' },
      { value: '1', label: 'String' },
      { value: 1, label: 'Duplicate number' },
    ];

    definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, options, 1);
    const firstUpdate = plainData(writes[0]);
    assert.equal(firstUpdate.selectedIndex, 0, tag);
    assert.deepEqual(firstUpdate.viewOptions.map(({ _key, _index }) => ({ _key, _index })), [
      { _key: '["number",1,0]', _index: 0 },
      { _key: '["string","1",0]', _index: 1 },
      { _key: '["number",1,1]', _index: 2 },
    ], tag);
    assert.equal(new Set(firstUpdate.viewOptions.map(({ _key }) => _key)).size, options.length, tag);

    const reordered = [options[1], options[0], { value: 2, label: 'Updated' }];
    definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, reordered, 1);
    const secondUpdate = plainData(writes[1]);
    assert.equal(secondUpdate.selectedIndex, 1, `${tag} first numeric match after reorder`);
    assert.deepEqual(secondUpdate.viewOptions.map(({ _key, _index }) => ({ _key, _index })), [
      { _key: '["string","1",0]', _index: 0 },
      { _key: '["number",1,0]', _index: 1 },
      { _key: '["number",2,0]', _index: 2 },
    ], `${tag} refreshed identities`);
    assert.equal(firstUpdate.viewOptions[0]._key, secondUpdate.viewOptions[1]._key, `${tag} unique numeric key survives reorder`);
    assert.equal(firstUpdate.viewOptions[1]._key, secondUpdate.viewOptions[0]._key, `${tag} unique string key survives reorder`);
  }
});

test('duplicate option warnings are silent in release and once per signature in develop', async () => {
  for (const tag of controlledOptionTags) {
    const options = [
      { value: 'same', label: 'First' },
      { value: 'same', label: 'Second' },
    ];
    for (const [envVersion, expectedWarnings] of [['release', 0], ['develop', 1], ['trial', 1], ['unknown', 0]]) {
      const warnings = [];
      const { definition } = await loadGeneratedComponent(tag, {
        console: { warn(...args) { warnings.push(args); } },
        wx: { getAccountInfoSync() { return { miniProgram: { envVersion } }; } },
      });
      const context = { setData() {} };
      definition.observers['options, value'].call(context, options, 'same');
      definition.observers['options, value'].call(context, options, 'same');
      assert.equal(warnings.length, expectedWarnings, `${tag} ${envVersion}`);
    }

    const collisionWarnings = [];
    const { definition: collisionDefinition } = await loadGeneratedComponent(tag, {
      console: { warn(...args) { collisionWarnings.push(args); } },
      wx: { getAccountInfoSync() { return { miniProgram: { envVersion: 'develop' } }; } },
    });
    const collisionContext = { setData() {} };
    collisionDefinition.observers['options, value'].call(collisionContext, [
      { value: 'a', label: 'A1' }, { value: 'a', label: 'A2' },
      { value: 'b', label: 'B1' }, { value: 'b', label: 'B2' },
    ], 'a');
    collisionDefinition.observers['options, value'].call(collisionContext, [
      { value: 'a|string:b', label: 'Combined 1' },
      { value: 'a|string:b', label: 'Combined 2' },
    ], 'a|string:b');
    assert.equal(collisionWarnings.length, 2, `${tag} structured duplicate signatures do not collide`);
  }
});

test('duplicate option validation keeps rendering when account environment lookup fails', async () => {
  for (const tag of controlledOptionTags) {
    const warnings = [];
    const { definition, source } = await loadGeneratedComponent(tag, {
      console: { warn(...args) { warnings.push(args); } },
      wx: { getAccountInfoSync() { throw new Error('account info unavailable'); } },
    });
    const writes = [];
    assert.match(source, /function shouldWarnForDuplicateValues\(\)/, tag);
    assert.doesNotThrow(() => definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, [
      { value: 1, label: 'First' },
      { value: 1, label: 'Second' },
    ], 1), tag);
    assert.deepEqual(plainData(writes), [{
      viewOptions: [
        { value: 1, label: 'First', _key: '["number",1,0]', _index: 0 },
        { value: 1, label: 'Second', _key: '["number",1,1]', _index: 1 },
      ],
      selectedIndex: 0,
    }], tag);
    assert.equal(warnings.length, 0, `${tag} account lookup failure is silent`);

    const fieldWrites = [];
    const { definition: fieldDefinition } = await loadGeneratedComponent(tag, {
      console: { warn() {} },
      wx: { getAccountInfoSync() { return { get miniProgram() { throw new Error('field unavailable'); } }; } },
    });
    assert.doesNotThrow(() => fieldDefinition.observers['options, value'].call({
      setData(update) { fieldWrites.push(update); },
    }, [
      { value: 'ready', label: 'First' },
      { value: 'ready', label: 'Second' },
    ], 'ready'), `${tag} field read`);
    assert.equal(plainData(fieldWrites)[0].selectedIndex, 0, `${tag} field read selection`);
  }
});

test('controlled option components treat invalid options as an empty safe list', async () => {
  for (const tag of controlledOptionTags) {
    const { definition } = await loadGeneratedComponent(tag);
    const writes = [];
    const events = [];

    assert.doesNotThrow(() => definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, { value: 'not-an-array' }, 'missing'));
    assert.deepEqual(plainData(writes), [{ options: [], viewOptions: [], selectedIndex: -1 }], tag);
    assert.doesNotThrow(() => definition.methods.handleOptionTap.call({
      data: { options: null, value: 'missing', disabled: false },
      triggerEvent(name, detail) { events.push({ name, detail }); },
    }, { currentTarget: { dataset: { index: 0 } } }));
    assert.deepEqual(events, [], tag);

    const mixedWrites = [];
    definition.observers['options, value'].call({
      setData(update) { mixedWrites.push(update); },
    }, [null, { value: { nested: true }, label: 'Invalid object' }, { value: 'ready', label: 'Ready' }, 7], 'ready');
    assert.deepEqual(plainData(mixedWrites), [{
      viewOptions: [{ value: 'ready', label: 'Ready', _key: '["string","ready",0]', _index: 2 }],
      selectedIndex: 2,
    }], `${tag} filters invalid entries and preserves original index`);
  }
});

test('controlled option surfaces use one glass group and token-only option fills and borders', async () => {
  for (const tag of controlledOptionTags) {
    const source = [
      await readFile(new URL(`src/components/${tag}/index.wxml`, root), 'utf8'),
      await readFile(new URL(`src/components/${tag}/index.wxss`, root), 'utf8'),
    ].join('\n');
    assert.equal((source.match(/cool-glass/g) ?? []).length, 1, `${tag} glass group`);
    assert.match(source, /background:\s*var\(--cool-/);
    assert.match(source, /border(?:-color)?:[^;]*var\(--cool-/);
    assert.doesNotMatch(source, /#[\da-f]{3,8}|rgba?\(|backdrop-filter|filter:\s*blur/i, tag);
  }
});

test('WeChat catalog controls TabBar and SegmentedControl with typed interactive examples', async () => {
  const wxml = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.wxml', root), 'utf8');
  const pageSource = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.js', root), 'utf8');

  assert.match(pageSource, /tabValue:\s*'overview'/);
  assert.match(pageSource, /segmentValue:\s*2/);
  assert.match(pageSource, /tabOptions:[\s\S]*badge:[\s\S]*disabled:/);
  assert.match(pageSource, /segmentOptions:[\s\S]*value:\s*1[\s\S]*value:\s*2/);
  assert.match(pageSource, /handleTabChange\(event\)[\s\S]*setData\(\{ tabValue: event\.detail\.value \}\)/);
  assert.match(pageSource, /handleSegmentChange\(event\)[\s\S]*setData\(\{ segmentValue: event\.detail\.value \}\)/);
  assert.match(wxml, /<cool-tab-bar[^>]*options="\{\{tabOptions\}\}"[^>]*value="\{\{tabValue\}\}"[^>]*bind:change="handleTabChange"/);
  assert.match(wxml, /<cool-segmented-control[^>]*options="\{\{segmentOptions\}\}"[^>]*value="\{\{segmentValue\}\}"[^>]*bind:change="handleSegmentChange"/);
  assert.equal((wxml.match(/accessibility-label="Button example"/g) ?? []).length, 1);
  assert.match(wxml, /43 components/);
});

test('MonthCalendar normalizes controlled days without mutating consumer input', async () => {
  const { definition } = await loadGeneratedComponent('cool-month-calendar');
  const observer = definition.observers['days, selectedDate'];
  const invalidWrites = [];
  observer.call({ setData(update) { invalidWrites.push(update); } }, null, '');
  assert.deepEqual(plainData(invalidWrites), [{ viewDays: [], viewWeeks: [] }]);

  const days = [
    null,
    { date: 'not-iso', day: 1 },
    { date: '2026-07-11', day: 11, isSelected: true, markers: 'invalid' },
    {
      date: '2026-07-12', day: 12, secondaryText: 'Today', accessibilityLabel: '',
      isToday: 1, isDisabled: 0, isSelected: false, tone: 'unknown', badge: '3',
      markers: [
        { tone: 'accent', accessibilityLabel: 'event' },
        { tone: 'invalid' },
        null,
        { tone: 'danger' },
      ],
    },
    { date: '2026-07-13', day: 13.5 },
    { date: '2026-07-14', day: 32 },
  ];
  const snapshot = structuredClone(days);
  const writes = [];
  observer.call({ setData(update) { writes.push(update); } }, days, '2026-07-12');
  assert.deepEqual(days, snapshot, 'consumer day objects remain immutable');
  const viewDays = plainData(writes[0].viewDays);
  assert.deepEqual(plainData(writes[0].viewWeeks), [viewDays]);
  assert.equal(viewDays.length, 2);
  assert.equal(viewDays[0]._index, 2);
  assert.equal(viewDays[0].isSelected, false, 'non-empty selectedDate is authoritative');
  assert.deepEqual(viewDays[0].markers, []);
  assert.equal(viewDays[1]._index, 3);
  assert.equal(viewDays[1].resolvedAccessibilityLabel, '2026-07-12 Today');
  assert.equal(viewDays[1].accessibilityLabel, '');
  assert.equal(viewDays[1].isSelected, true);
  assert.equal(viewDays[1].isToday, true);
  assert.equal(viewDays[1].isDisabled, false);
  assert.equal(viewDays[1].tone, 'neutral');
  assert.deepEqual(viewDays[1].markers, [
    { tone: 'accent', accessibilityLabel: 'event' },
    { tone: 'neutral' },
    { tone: 'neutral' },
  ]);

  const emptySelectionWrites = [];
  observer.call({ setData(update) { emptySelectionWrites.push(update); } }, [
    { date: '2026-07-12', day: 12, accessibilityLabel: '', isSelected: true },
  ], '');
  assert.deepEqual(plainData(emptySelectionWrites[0].viewDays), [{
    date: '2026-07-12', day: 12, markers: [], tone: 'neutral', isDisabled: false,
    isToday: false, isSelected: false, resolvedAccessibilityLabel: '2026-07-12', _index: 0,
    accessibilityLabel: '',
  }]);
  assert.deepEqual(plainData(emptySelectionWrites[0].viewWeeks), [plainData(emptySelectionWrites[0].viewDays)]);
});

test('MonthCalendar groups normalized days into seven-day viewWeeks and keeps a short final week', async () => {
  const { definition } = await loadGeneratedComponent('cool-month-calendar');
  const observer = definition.observers['days, selectedDate'];
  const makeDays = (length) => Array.from({ length }, (_, index) => {
    const date = new Date(Date.UTC(2026, 5, 1 + index));
    const iso = [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0')].join('-');
    return { date: iso, day: date.getUTCDate() };
  });
  for (const [length, weekSizes] of [[42, [7, 7, 7, 7, 7, 7]], [10, [7, 3]]]) {
    const writes = [];
    observer.call({ setData(update) { writes.push(update); } }, makeDays(length), '');
    const update = plainData(writes[0]);
    assert.equal(update.viewDays.length, length);
    assert.deepEqual(update.viewWeeks.map((week) => week.length), weekSizes);
    assert.deepEqual(update.viewWeeks.flat(), update.viewDays);
    assert.deepEqual(update.viewDays.map((day) => day._index), Array.from({ length }, (_, index) => index));
  }
});

test('MonthCalendar validates Gregorian ISO dates, matching day numbers, and selectedDate authority', async () => {
  const { definition, source } = await loadGeneratedComponent('cool-month-calendar');
  const observer = definition.observers['days, selectedDate'];
  const days = [
    { date: '0000-02-29', day: 29, isSelected: true },
    { date: '2024-02-29', day: 29, isSelected: false },
    { date: '2023-02-29', day: 29, isSelected: true },
    { date: '2026-02-31', day: 31, isSelected: true },
    { date: '2026-04-30', day: 30, isSelected: true },
    { date: '2026-04-31', day: 31, isSelected: true },
    { date: '2026-07-12', day: 11, isSelected: true },
    { date: '2026-13-01', day: 1, isSelected: true },
  ];
  const invalidSelectionWrites = [];
  observer.call({ setData(update) { invalidSelectionWrites.push(update); } }, days, '2026-02-31');
  const invalidSelectionDays = plainData(invalidSelectionWrites[0].viewDays);
  assert.deepEqual(invalidSelectionDays.map((day) => day.date), ['0000-02-29', '2024-02-29', '2026-04-30']);
  assert.equal(invalidSelectionDays[0].isSelected, false, 'invalid selectedDate means no selection');
  assert.equal(invalidSelectionDays[1].isSelected, false);
  assert.equal(invalidSelectionDays[2].isSelected, false, 'invalid selectedDate must not fall back to day.isSelected');

  const validSelectionWrites = [];
  observer.call({ setData(update) { validSelectionWrites.push(update); } }, days, '2024-02-29');
  const validSelectionDays = plainData(validSelectionWrites[0].viewDays);
  assert.equal(validSelectionDays[0].isSelected, false);
  assert.equal(validSelectionDays[1].isSelected, true);
  assert.equal(validSelectionDays[2].isSelected, false, 'valid selectedDate remains authoritative');
  assert.match(source, /function isGregorianLeapYear/);
  assert.match(source, /year % 400 === 0/);
  assert.match(source, /function daysInGregorianMonth/);
  assert.doesNotMatch(source, /new Date|Date\.UTC/);
});

test('MonthCalendar emits exact controlled select and monthchange details', async () => {
  const { definition, source } = await loadGeneratedComponent('cool-month-calendar');
  assert.doesNotMatch(source, /setData\(\{\s*selectedDate\s*:/);
  assert.doesNotMatch(source, /setData\(\{\s*(?:year|month)\s*:/);
  const normalizedDay = {
    date: '2026-07-12', day: 12, secondaryText: 'Today', markers: [{ tone: 'accent' }],
    tone: 'accent', isDisabled: false, isToday: true, isSelected: true,
    resolvedAccessibilityLabel: '2026-07-12 Today', _index: 8,
  };
  const invokeDay = (day = normalizedDay, overrides = {}, index = 8) => {
    const events = [];
    const writes = [];
    definition.methods.handleDayTap.call({
      data: { viewDays: [day], disabled: false, loading: false, ...overrides },
      setData(update) { writes.push(update); },
      triggerEvent(name, detail) { events.push({ name, detail }); },
    }, { currentTarget: { dataset: { index } } });
    return { events: plainData(events), writes };
  };
  assert.deepEqual(invokeDay().events, [{ name: 'select', detail: { day: {
    date: '2026-07-12', day: 12, secondaryText: 'Today', markers: [{ tone: 'accent' }],
    tone: 'accent', isDisabled: false, isToday: true, isSelected: true,
  } } }]);
  assert.deepEqual(invokeDay().writes, []);
  assert.deepEqual(invokeDay({ ...normalizedDay, isDisabled: true }).events, []);
  assert.deepEqual(invokeDay(normalizedDay, { disabled: true }).events, []);
  assert.deepEqual(invokeDay(normalizedDay, { loading: true }).events, []);
  assert.deepEqual(invokeDay(normalizedDay, {}, 99).events, []);

  const invokeMonth = (direction) => {
    const events = [];
    const writes = [];
    definition.methods.handleMonthChange.call({
      setData(update) { writes.push(update); },
      triggerEvent(name, detail) { events.push({ name, detail }); },
    }, { currentTarget: { dataset: { direction } } });
    return { events: plainData(events), writes };
  };
  assert.deepEqual(invokeMonth('previous').events, [{ name: 'monthchange', detail: { direction: 'previous' } }]);
  assert.deepEqual(invokeMonth('next').events, [{ name: 'monthchange', detail: { direction: 'next' } }]);
  assert.deepEqual(invokeMonth('later').events, []);
  assert.deepEqual(invokeMonth('next').writes, []);
});

test('MonthCalendar select exposes exactly the ten public CoolCalendarDay fields', async () => {
  const { definition } = await loadGeneratedComponent('cool-month-calendar');
  const writes = [];
  definition.observers['days, selectedDate'].call({ setData(update) { writes.push(update); } }, [{
    date: '2026-07-12',
    day: 12,
    secondaryText: 'Release day',
    accessibilityLabel: 'Sunday, July 12, release day',
    isToday: true,
    isSelected: false,
    isDisabled: false,
    tone: 'accent',
    badge: '3',
    markers: [{ tone: 'success', accessibilityLabel: 'Ready' }],
  }], '2026-07-12');

  let detail;
  definition.methods.handleDayTap.call({
    data: { viewDays: writes[0].viewDays, disabled: false, loading: false },
    triggerEvent(name, eventDetail) { assert.equal(name, 'select'); detail = eventDetail; },
  }, { currentTarget: { dataset: { index: 0 } } });

  assert.deepEqual(plainData(detail), { day: {
    date: '2026-07-12',
    day: 12,
    secondaryText: 'Release day',
    accessibilityLabel: 'Sunday, July 12, release day',
    isToday: true,
    isSelected: true,
    isDisabled: false,
    tone: 'accent',
    badge: '3',
    markers: [{ tone: 'success', accessibilityLabel: 'Ready' }],
  } });
  assert.deepEqual(Object.keys(detail.day), [
    'date', 'day', 'secondaryText', 'accessibilityLabel', 'isToday',
    'isSelected', 'isDisabled', 'tone', 'badge', 'markers',
  ]);
  assert.equal(Object.hasOwn(detail.day, 'resolvedAccessibilityLabel'), false);
  assert.equal(Object.hasOwn(detail.day, '_index'), false);
});

test('MonthCalendar select payload deep-clones the normalized day and marker records', async () => {
  const { definition } = await loadGeneratedComponent('cool-month-calendar');
  const writes = [];
  definition.observers['days, selectedDate'].call({ setData(update) { writes.push(update); } }, [{
    date: '2026-07-12', day: 12, markers: [{ tone: 'accent', accessibilityLabel: 'Event' }],
  }], '');
  const viewDay = writes[0].viewDays[0];
  let detail;
  definition.methods.handleDayTap.call({
    data: { viewDays: [viewDay], disabled: false, loading: false },
    triggerEvent(name, eventDetail) { assert.equal(name, 'select'); detail = eventDetail; },
  }, { currentTarget: { dataset: { index: 0 } } });
  assert.notEqual(detail.day, viewDay);
  assert.notEqual(detail.day.markers, viewDay.markers);
  assert.notEqual(detail.day.markers[0], viewDay.markers[0]);
  detail.day.markers[0].tone = 'danger';
  detail.day.markers.push({ tone: 'warning' });
  assert.deepEqual(plainData(viewDay.markers), [{ tone: 'accent', accessibilityLabel: 'Event' }]);
});

test('MonthCalendar renders grid rows with columnheaders and gridcells wrapping implicit native buttons', async () => {
  const wxml = await readFile(new URL('src/components/cool-month-calendar/index.wxml', root), 'utf8');
  const wxss = await readFile(new URL('src/components/cool-month-calendar/index.wxss', root), 'utf8');
  assert.equal((wxml.match(/cool-glass/g) ?? []).length, 1);
  assert.match(wxml, /cool-material-\{\{resolvedMaterial\}\}/);
  assert.match(wxml, /cool-tone-\{\{tone\}\}/);
  assert.match(wxml, /cool-size-\{\{size\}\}/);
  assert.match(wxml, /\{\{year\}\}[\s\S]*\{\{month\}\}/);
  assert.equal((wxml.match(/role="grid"/g) ?? []).length, 1);
  assert.match(wxml, /<view class="cool-calendar-grid" role="grid" aria-label="\{\{resolvedAccessibilityLabel\}\}">/);
  const gridStart = wxml.indexOf('<view class="cool-calendar-grid"');
  const gridEnd = wxml.lastIndexOf('</view>');
  const grid = wxml.slice(gridStart, gridEnd);
  assert.match(grid, /^<view[^>]*role="grid"[^>]*>\s*<view class="cool-calendar-weekday-row" role="row">\s*<text wx:for="\{\{weekdays\}\}"[^>]*role="columnheader"[^>]*>[^<]*<\/text>\s*<\/view>\s*<view wx:for="\{\{viewWeeks\}\}"[^>]*role="row"[^>]*>/);
  assert.match(grid, /role="row"[^>]*>\s*<view wx:for="\{\{week\}\}"[^>]*role="gridcell"[^>]*>\s*<button\b/);
  assert.equal((grid.match(/role="columnheader"/g) ?? []).length, 1);
  assert.equal((grid.match(/role="gridcell"/g) ?? []).length, 1);
  assert.equal((grid.match(/role="row"/g) ?? []).length, 2, 'weekday row and repeated week row templates');
  const buttonTags = [...wxml.matchAll(/<button\b[^>]*>/gs)].map((match) => match[0]);
  assert.equal(buttonTags.length, 3, 'two navigation controls and one repeated day button');
  assert.ok(buttonTags.every((tag) => !/\srole=/.test(tag)), 'native buttons keep implicit button semantics');
  assert.equal((wxml.match(/<button\b/g) ?? []).length, 3, 'two navigation controls and one repeated day button');
  assert.equal((wxml.match(/class="cool-calendar-nav"[^>]*disabled="\{\{disabled \|\| loading\}\}"/g) ?? []).length, 2);
  assert.match(wxml, /aria-label="\{\{item\.resolvedAccessibilityLabel\}\}"/);
  assert.match(wxml, /aria-disabled="\{\{item\.isDisabled \|\| disabled \|\| loading\}\}"/);
  assert.match(wxml, /disabled="\{\{item\.isDisabled \|\| disabled \|\| loading\}\}"/);
  assert.match(wxml, /item\.isDisabled \|\| disabled \|\| loading \? 'is-disabled'/);
  for (const state of ['is-selected', 'is-today', 'is-disabled', 'cool-calendar-day-tone-']) assert.match(wxml, new RegExp(state));
  assert.match(wxml, /wx:for="\{\{item\.markers\}\}"/);
  assert.match(wxss, /@import "\.\.\/\.\.\/styles\/glass\.wxss"/);
  assert.match(wxss, /\.cool-calendar-weekday-row,[\s\S]*\.cool-calendar-week\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(7,/);
  assert.match(wxss, /background:\s*var\(--cool-/);
  assert.match(wxss, /border(?:-color)?:[^;]*var\(--cool-/);
  assert.doesNotMatch(wxss, /#[\da-f]{3,8}|rgba?\(|(?:backdrop-filter|filter):\s*blur|border-radius:\s*\d/i);
});

test('MonthCalendar maps per-item day and marker semantics to componentGenerics with exclusive header fallback', async () => {
  const json = JSON.parse(await readFile(new URL('src/components/cool-month-calendar/index.json', root), 'utf8'));
  const wxml = await readFile(new URL('src/components/cool-month-calendar/index.wxml', root), 'utf8');
  assert.deepEqual(json.componentGenerics, {
    day: { default: './default-day/index' },
    marker: { default: './default-marker/index' },
  });
  assert.match(wxml, /<day day="\{\{item\}\}"\s*\/>/);
  assert.match(wxml, /<marker\b[^>]*marker="\{\{marker\}\}"[^>]*\/>/);
  assert.doesNotMatch(wxml, /<slot name="(?:day|marker)"/);
  assert.equal((wxml.match(/<slot\b[^>]*name="header"/g) ?? []).length, 1);
  assert.match(wxml, /<view wx:if="\{\{!useCustomHeader\}\}" class="cool-calendar-header-fallback">[\s\S]*<\/view>\s*<slot wx:else name="header"\s*\/>/);

  for (const [tag, property] of [['default-day', 'day'], ['default-marker', 'marker']]) {
    const { definition } = await loadGeneratedComponent(`cool-month-calendar/${tag}`);
    assert.equal(definition.properties[property].type.name, 'Object');
    for (const extension of ['js', 'json', 'wxml', 'wxss']) {
      await readFile(new URL(`src/components/cool-month-calendar/${tag}/index.${extension}`, root), 'utf8');
    }
  }
  const dayWxml = await readFile(new URL('src/components/cool-month-calendar/default-day/index.wxml', root), 'utf8');
  const markerWxml = await readFile(new URL('src/components/cool-month-calendar/default-marker/index.wxml', root), 'utf8');
  assert.match(dayWxml, /\{\{day\.day\}\}/);
  assert.match(dayWxml, /day\.secondaryText/);
  assert.match(dayWxml, /day\.badge/);
  assert.match(markerWxml, /marker\.tone/);
  const validator = await readFile(new URL('scripts/validate.mjs', root), 'utf8');
  assert.match(validator, /default-day/);
  assert.match(validator, /default-marker/);
});

test('WeChat Catalog owns the controlled 42-cell MonthCalendar fixture and month arithmetic', async () => {
  const wxml = await readFile(new URL('../../apps/catalog-wechat/pages/index/index.wxml', root), 'utf8');
  const { definition, source } = await loadCatalogPage();
  const initial = plainData(definition.data);
  assert.equal(initial.calendarYear, 2026);
  assert.equal(initial.calendarMonth, 7);
  assert.equal(initial.calendarSelectedDate, '2026-07-12');
  assert.equal(initial.calendarDays.length, 42);
  assert.ok(initial.calendarDays.some((day) => day.isToday));
  assert.ok(initial.calendarDays.some((day) => day.isDisabled));
  assert.ok(initial.calendarDays.some((day) => day.secondaryText));
  assert.ok(initial.calendarDays.some((day) => day.badge));
  assert.ok(initial.calendarDays.some((day) => day.tone === 'accent'));
  assert.ok(initial.calendarDays.some((day) => day.markers?.length === 3));
  assert.equal(new Set(initial.calendarDays.map((day) => day.date)).size, 42);
  for (let index = 1; index < initial.calendarDays.length; index += 1) {
    const previous = Date.parse(`${initial.calendarDays[index - 1].date}T00:00:00Z`);
    const current = Date.parse(`${initial.calendarDays[index].date}T00:00:00Z`);
    assert.equal(current - previous, 86400000, `calendar day ${index} is UTC-consecutive`);
  }
  assert.match(source, /function createCalendarDays\(year, month/);
  assert.match(source, /Date\.UTC\(year, month - 1, 1\)/);
  assert.match(source, /getUTCFullYear\(\)/);
  assert.match(source, /getUTCMonth\(\)/);
  assert.match(source, /getUTCDate\(\)/);
  assert.doesNotMatch(source, /new Date\(year, month - 1/);
  assert.match(source, /onCalendarSelect\(event\)[\s\S]*calendarSelectedDate: event\.detail\.day\.date/);
  assert.match(source, /onCalendarMonthChange\(event\)[\s\S]*createCalendarDays/);
  assert.match(wxml, /<cool-month-calendar[^>]*year="\{\{calendarYear\}\}"[^>]*month="\{\{calendarMonth\}\}"[^>]*days="\{\{calendarDays\}\}"[^>]*selected-date="\{\{calendarSelectedDate\}\}"[^>]*bind:select="onCalendarSelect"[^>]*bind:monthchange="onCalendarMonthChange"/);

  const writes = [];
  definition.onCalendarSelect.call({ setData(update) { writes.push(update); } }, { detail: { day: { date: '2026-07-20' } } });
  assert.deepEqual(plainData(writes), [{ calendarSelectedDate: '2026-07-20' }]);
  const monthWrites = [];
  definition.onCalendarMonthChange.call({
    data: initial,
    setData(update) { monthWrites.push(update); },
  }, { detail: { direction: 'next' } });
  assert.equal(monthWrites[0].calendarYear, 2026);
  assert.equal(monthWrites[0].calendarMonth, 8);
  assert.equal(monthWrites[0].calendarDays.length, 42);

  const rolloverWrites = [];
  definition.onCalendarMonthChange.call({
    data: { ...initial, calendarYear: 2026, calendarMonth: 12 },
    setData(update) { rolloverWrites.push(update); },
  }, { detail: { direction: 'next' } });
  assert.equal(rolloverWrites[0].calendarYear, 2027);
  assert.equal(rolloverWrites[0].calendarMonth, 1);
  assert.equal(rolloverWrites[0].calendarDays.length, 42);
});
