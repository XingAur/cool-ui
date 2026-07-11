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

test('reserved MonthCalendar placeholder has no interaction semantics', async () => {
  const source = [
    await readFile(new URL('src/components/cool-month-calendar/index.js', root), 'utf8'),
    await readFile(new URL('src/components/cool-month-calendar/index.wxml', root), 'utf8'),
  ].join('\n');
  assert.match(source, /generationMode: 'reserved'/);
  assert.match(source, /data-generation-mode="reserved"/);
  assert.doesNotMatch(source, /handleTap|bindtap=|triggerEvent|activate|role="button"/);
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

test('Button owns form semantics and forwards original submit and reset detail', async () => {
  const wxml = await readFile(new URL('src/components/cool-button/index.wxml', root), 'utf8');
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const { definition } = await loadGeneratedComponent('cool-button');

  assert.match(wxml, /^<form\b[^>]*bindsubmit="handleFormSubmit"[^>]*bindreset="handleFormReset"/);
  assert.equal(wxml.match(/<button\b/g)?.length, 1);

  for (const [methodName, eventName] of [['handleFormSubmit', 'submit'], ['handleFormReset', 'reset']]) {
    const detail = { eventName, marker: Symbol(eventName) };
    let forwarded;
    definition.methods[methodName].call({
      triggerEvent(name, forwardedDetail) { forwarded = { name, detail: forwardedDetail }; },
    }, { detail });
    assert.equal(forwarded.name, eventName);
    assert.equal(forwarded.detail, detail);
  }

  assert.match(readme, /internal `<form>`/i);
  assert.match(readme, /cross-component form[\s\S]*native button/i);
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
  assert.doesNotMatch(source, /<form\b/);
  assert.match(source, /<cool-button label="Submit"[^>]*form-type="submit"[^>]*bind:submit="handleButtonSubmit"/);
  assert.match(source, /\{\{buttonSubmitResult\}\}/);
  assert.match(pageSource, /handleButtonSubmit\(event\)[\s\S]*setData\(\{ buttonSubmitResult:/);
  assert.equal((source.match(/accessibility-label="Button example"/g) ?? []).length, 1);
});

const controlledOptionTags = ['cool-tab-bar', 'cool-segmented-control'];
const plainData = (value) => JSON.parse(JSON.stringify(value));

test('controlled TabBar and SegmentedControl render option semantics from stable value keys', async () => {
  for (const tag of controlledOptionTags) {
    const wxml = await readFile(new URL(`src/components/${tag}/index.wxml`, root), 'utf8');
    assert.match(wxml, /wx:for="\{\{viewOptions\}\}"/, tag);
    assert.match(wxml, /wx:key="_key"/, tag);
    assert.match(wxml, /data-index="\{\{index\}\}"/, tag);
    assert.match(wxml, /bindtap="handleOptionTap"/, tag);
    assert.match(wxml, /index === selectedIndex/, `${tag} first-match active state`);
    assert.match(wxml, /item\.disabled \|\| disabled/, `${tag} disabled state`);
    assert.match(wxml, /wx:if="\{\{item\.badge \|\| item\.badge === 0\}\}"/, `${tag} badge`);
    assert.match(wxml, /role="tablist"/, tag);
    assert.match(wxml, /role="tab"/, tag);
  }

  const tabWxml = await readFile(new URL('src/components/cool-tab-bar/index.wxml', root), 'utf8');
  assert.match(tabWxml, /<scroll-view\b[^>]*scroll-x="\{\{true\}\}"/);
  assert.match(tabWxml, /cool-page-tab/);

  const segmentWxml = await readFile(new URL('src/components/cool-segmented-control/index.wxml', root), 'utf8');
  assert.match(segmentWxml, /cool-segmented-group/);
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
    assert.deepEqual(invoke(99).events, [], `${tag} out of range`);
    assert.deepEqual(invoke(-1).events, [], `${tag} negative index`);
    assert.deepEqual(invoke(undefined).events, [], `${tag} missing index`);
    assert.deepEqual(invoke(1).writes, [], `${tag} controlled value`);

    const stringResult = invoke(0, { value: 2 });
    assert.deepEqual(plainData(stringResult.events), [{ name: 'change', detail: { value: 'overview', index: 0 } }], `${tag} string value`);
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
    assert.deepEqual(firstUpdate.viewOptions.map(({ _key }) => _key), [
      'number:1:0',
      'string:1:1',
      'number:1:2',
    ], tag);
    assert.equal(new Set(firstUpdate.viewOptions.map(({ _key }) => _key)).size, options.length, tag);

    const reordered = [options[1], options[0], { value: 2, label: 'Updated' }];
    definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, reordered, 1);
    const secondUpdate = plainData(writes[1]);
    assert.equal(secondUpdate.selectedIndex, 1, `${tag} first numeric match after reorder`);
    assert.deepEqual(secondUpdate.viewOptions.map(({ _key }) => _key), [
      'string:1:0',
      'number:1:1',
      'number:2:2',
    ], `${tag} refreshed identities`);
  }
});

test('duplicate option warnings are silent in release and once per signature in develop', async () => {
  for (const tag of controlledOptionTags) {
    const options = [
      { value: 'same', label: 'First' },
      { value: 'same', label: 'Second' },
    ];
    for (const [envVersion, expectedWarnings] of [['release', 0], ['develop', 1], ['trial', 1]]) {
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
    assert.match(source, /function isReleaseEnvironment\(\)/, tag);
    assert.doesNotThrow(() => definition.observers['options, value'].call({
      setData(update) { writes.push(update); },
    }, [
      { value: 1, label: 'First' },
      { value: 1, label: 'Second' },
    ], 1), tag);
    assert.deepEqual(plainData(writes), [{
      viewOptions: [
        { value: 1, label: 'First', _key: 'number:1:0' },
        { value: 1, label: 'Second', _key: 'number:1:1' },
      ],
      selectedIndex: 0,
    }], tag);

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
