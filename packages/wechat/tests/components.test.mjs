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

async function loadGeneratedComponent(tag) {
  const source = await readFile(new URL(`src/components/${tag}/index.js`, root), 'utf8');
  let definition;
  vm.runInNewContext(source, {
    Component(value) { definition = value; },
    require() { return {}; },
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
