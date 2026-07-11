import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
const contract = JSON.parse(await readFile(resolve(root, 'contracts/components.json'), 'utf8'));
const capabilities = JSON.parse(await readFile(resolve(root, 'contracts/component-capabilities.json'), 'utf8'));
if (contract.version !== release.version) throw new Error(`Component contract ${contract.version} does not match release ${release.version}`);
const components = contract.components;
const generationModes = capabilities.generationModes ?? {};
const generationMode = (name, platform) => generationModes[name]?.[platform] ?? 'generated';
const componentApiName = (name) => name;
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const controlledOptionComponents = new Set(['TabBar', 'SegmentedControl']);

async function output(path, contents) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${contents.trim()}\n`, 'utf8');
}

function controlledOptionScript(componentName) {
  return `
const coolBehavior = require('../../behaviors/cool-ui');

function isOptionValue(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function firstSelectedIndex(options, value) {
  if (!Array.isArray(options)) return -1;
  return options.findIndex((option) => option && isOptionValue(option.value) && option.value === value);
}

function warnForDuplicateValues(options) {
  const seen = new Set();
  const duplicates = new Set();
  for (const option of options) {
    if (!option || !isOptionValue(option.value)) continue;
    const identity = typeof option.value + ':' + String(option.value);
    if (seen.has(identity)) duplicates.add(identity);
    seen.add(identity);
  }
  if (duplicates.size > 0 && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn('[cooL UI] ${componentName} options contain duplicate values; the first match is selected.', [...duplicates]);
  }
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: '${componentName}', interactive: true, selectedIndex: -1 },
  observers: {
    'options, value': function validateOptions(options, value) {
      if (!Array.isArray(options)) {
        this.setData({ options: [], selectedIndex: -1 });
        return;
      }
      warnForDuplicateValues(options);
      this.setData({ selectedIndex: firstSelectedIndex(options, value) });
    },
  },
  methods: {
    handleOptionTap(event) {
      if (this.data.disabled) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const index = dataset ? Number(dataset.index) : Number.NaN;
      const options = Array.isArray(this.data.options) ? this.data.options : [];
      if (!Number.isInteger(index) || index < 0 || index >= options.length) return;
      const option = options[index];
      if (!option || !isOptionValue(option.value) || option.disabled || option.value === this.data.value) return;
      this.triggerEvent('change', { value: option.value, index });
    },
  },
});`;
}

function controlledOptionTemplate(componentName) {
  if (componentName === 'TabBar') return `
<scroll-view class="cool-component cool-glass cool-tab-bar cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{disabled ? 'is-disabled' : ''}}" data-component="TabBar" scroll-x="{{true}}" enhanced="{{true}}" show-scrollbar="{{false}}" role="tablist" aria-label="{{resolvedAccessibilityLabel}}">
  <view class="cool-tab-track">
    <view wx:for="{{options}}" wx:key="value" class="cool-page-tab {{index === selectedIndex ? 'is-active' : ''}} {{item.disabled || disabled ? 'is-disabled' : ''}}" data-index="{{index}}" role="tab" aria-selected="{{index === selectedIndex}}" aria-disabled="{{item.disabled || disabled}}" bindtap="handleOptionTap">
      <text class="cool-option-label">{{item.label}}</text>
      <text wx:if="{{item.badge || item.badge === 0}}" class="cool-option-badge">{{item.badge}}</text>
    </view>
  </view>
</scroll-view>`;

  return `
<view class="cool-component cool-glass cool-segmented-control cool-segmented-group cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{disabled ? 'is-disabled' : ''}}" data-component="SegmentedControl" role="tablist" aria-label="{{resolvedAccessibilityLabel}}">
  <view wx:for="{{options}}" wx:key="value" class="cool-segmented-option {{index === selectedIndex ? 'is-active' : ''}} {{item.disabled || disabled ? 'is-disabled' : ''}}" data-index="{{index}}" role="tab" aria-selected="{{index === selectedIndex}}" aria-disabled="{{item.disabled || disabled}}" bindtap="handleOptionTap">
    <text class="cool-option-label">{{item.label}}</text>
    <text wx:if="{{item.badge || item.badge === 0}}" class="cool-option-badge">{{item.badge}}</text>
  </view>
</view>`;
}

function controlledOptionStyles(componentName) {
  const shared = `
@import "../../styles/glass.wxss";

.cool-page-tab,
.cool-segmented-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--cool-space-xs);
  box-sizing: border-box;
  min-height: var(--cool-size-touchTarget);
  color: var(--cool-color-light-textSecondary);
  background: var(--cool-color-light-surface);
  border: var(--cool-border-hairline) solid var(--cool-color-light-surfaceTint);
  transition: background var(--cool-motion-fast), border-color var(--cool-motion-fast), color var(--cool-motion-fast);
}

.cool-page-tab.is-active,
.cool-segmented-option.is-active {
  color: var(--cool-color-light-background);
  background: var(--cool-color-light-accent);
  border-color: var(--cool-color-light-accent);
}

.cool-page-tab.is-disabled,
.cool-segmented-option.is-disabled,
.cool-tab-bar.is-disabled,
.cool-segmented-control.is-disabled { opacity: var(--cool-opacity-disabled); }

.cool-option-label { font-size: var(--cool-typography-caption); }
.cool-option-badge {
  min-width: var(--cool-space-md);
  padding: var(--cool-space-xs);
  color: var(--cool-color-light-text);
  font-size: var(--cool-typography-caption);
  line-height: 1;
  text-align: center;
  background: var(--cool-color-light-surfaceTint);
  border: var(--cool-border-hairline) solid var(--cool-color-light-surfaceTint);
  border-radius: var(--cool-radius-pill);
}`;

  if (componentName === 'TabBar') return `${shared}

.cool-tab-bar { width: 100%; box-sizing: border-box; }
.cool-tab-track {
  display: flex;
  gap: var(--cool-space-xs);
  min-width: 100%;
  padding: var(--cool-space-xs);
  box-sizing: border-box;
}
.cool-page-tab {
  flex: none;
  padding: 0 var(--cool-space-md);
  border-radius: var(--cool-radius-pill);
}`;

  return `${shared}

.cool-segmented-group {
  display: flex;
  gap: var(--cool-space-xs);
  width: 100%;
  padding: var(--cool-space-xs);
  box-sizing: border-box;
}
.cool-segmented-option {
  flex: 1;
  min-width: 0;
  padding: 0 var(--cool-space-sm);
  border-radius: var(--cool-radius-medium);
}`;
}

const swift = `
// Generated from contracts/components.json. Do not edit.
public enum CoolComponentRegistry {
  public static let names: [String] = [
${components.map(({ name }) => `    "${name}",`).join('\n')}
  ]
}
`;

const kotlin = `
// Generated from contracts/components.json. Do not edit.
package dev.coolui.compose

object CoolComponentRegistry {
  val names: List<String> = listOf(
${components.map(({ name }) => `    "${name}",`).join('\n')}
  )
}
`;

function arkBuild({ name, interactive }) {
  if (name === 'TextField' || name === 'SearchField') return `TextInput({ text: this.config.value, placeholder: this.config.placeholder }).enabled(!this.config.disabled).onChange((value: string) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'TextArea') return `TextArea({ text: this.config.value, placeholder: this.config.placeholder }).enabled(!this.config.disabled).onChange((value: string) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'Toggle') return `Toggle({ type: ToggleType.Switch, isOn: this.config.selected }).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'Checkbox') return `Checkbox({ name: this.config.label, group: 'coolui' }).select(this.config.selected).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'RadioGroup') return `Radio({ value: this.config.value, group: 'coolui' }).checked(this.config.selected).enabled(!this.config.disabled).onChange((value: boolean) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'Slider') return `Slider({ value: Number(this.config.value), min: this.config.minimumValue, max: this.config.maximumValue }).enabled(!this.config.disabled).onChange((value: number) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'Stepper') return `Row() { Button('−').onClick(() => this.onEvent(\`valueChanged:\${Number(this.config.value) - 1}\`)); Text(this.config.value); Button('+').onClick(() => this.onEvent(\`valueChanged:\${Number(this.config.value) + 1}\`)) }`;
  if (name === 'Select') return `Select(this.config.options.map((value: string) => ({ value }))).selected(this.config.options.indexOf(this.config.value)).onSelect((index: number, value: string) => this.onEvent(\`valueChanged:\${value}\`))`;
  if (name === 'DatePicker') return `DatePicker().enabled(!this.config.disabled).onChange((value: DatePickerResult) => this.onEvent(\`valueChanged:\${value.year}-\${value.month + 1}-\${value.day}\`))`;
  if (name === 'TimePicker') return `TimePicker().enabled(!this.config.disabled).onChange((value: TimePickerResult) => this.onEvent(\`valueChanged:\${value.hour}:\${value.minute}\`))`;
  if (name === 'Progress') return `Progress({ value: Number(this.config.value), total: this.config.maximumValue, type: ProgressType.Linear })`;
  if (name === 'CircularProgress') return `Progress({ value: Number(this.config.value), total: this.config.maximumValue, type: ProgressType.Ring })`;
  if (name === 'Divider') return `Divider()`;
  if (name === 'LoadingOverlay') return `LoadingProgress().accessibilityText(this.config.accessibilityLabel)`;
  if (interactive) return `Button(this.config.label).enabled(!this.config.disabled && !this.config.loading).accessibilityText(this.config.accessibilityLabel).onClick(() => this.onEvent('activate'))`;
  return `Text(this.config.label).accessibilityText(this.config.accessibilityLabel)`;
}

const ark = `
// Generated from contracts/components.json. Do not edit.
import { CoolComponentConfig } from './CoolCore'

export const CoolComponentRegistry: string[] = [
${components.map(({ name }) => `  "${name}",`).join('\n')}
]

${components.filter(({ name }) => generationMode(name, 'arkui') !== 'registryOnly').map(({ name, interactive }) => `
@Component
export struct Cool${componentApiName(name)} {
  @Prop config: CoolComponentConfig = new CoolComponentConfig("${name}")
  onEvent: (event: string) => void = () => {}

  build() {
    ${arkBuild({ name, interactive })}
  }
}`).join('\n')}
`;

await output('packages/swift/Sources/CoolUI/GeneratedComponents.swift', swift);
await output('packages/android/src/main/kotlin/dev/coolui/compose/GeneratedComponents.kt', kotlin);
await output('packages/arkui/src/main/ets/components/GeneratedComponents.ets', ark);

const manifest = {};
for (const component of components) {
  const tag = `cool-${kebab(component.name)}`;
  manifest[tag] = `./dist/components/${tag}/index`;
  const dir = `packages/wechat/src/components/${tag}`;
  if (generationMode(component.name, 'wechat') === 'reserved') {
    await output(`${dir}/index.js`, `
Component({
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: '${component.name}', generationMode: 'reserved' },
});`);
    await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/index.wxml`, `
<view class="cool-component cool-${kebab(component.name)} cool-reserved-placeholder" data-component="${component.name}" data-generation-mode="reserved">
  <slot/>
</view>`);
    await output(`${dir}/index.wxss`, `@import "../../styles/glass.wxss";`);
    continue;
  }
  if (component.name === 'Button') {
    await output(`${dir}/index.js`, `
const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  properties: {
    openType: { type: String, value: '' },
    formType: { type: String, value: '' },
    lang: { type: String, value: 'en' },
    sessionFrom: { type: String, value: '' },
    sendMessageTitle: { type: String, value: '' },
    sendMessagePath: { type: String, value: '' },
    sendMessageImg: { type: String, value: '' },
    appParameter: { type: String, value: '' },
    showMessageCard: { type: Boolean, value: false },
    phoneNumberNoQuotaToast: { type: Boolean, value: true },
  },
  data: { componentName: 'Button', interactive: true },
  methods: {
    handleButtonTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap', { value: this.data.value, selected: this.data.selected });
    },
    handleFormSubmit(event) {
      this.triggerEvent('submit', event.detail);
    },
    handleFormReset(event) {
      this.triggerEvent('reset', event.detail);
    },
    forwardNativeEvent(event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});`);
    await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/index.wxml`, `
<form bindsubmit="handleFormSubmit" bindreset="handleFormReset">
<button
  class="cool-component cool-glass cool-button-native cool-button cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{selected ? 'is-selected' : ''}} {{disabled || loading ? 'is-disabled' : ''}} {{error ? 'is-error' : ''}}"
  data-component="Button"
  open-type="{{openType}}"
  form-type="{{formType}}"
  lang="{{lang}}"
  session-from="{{sessionFrom}}"
  send-message-title="{{sendMessageTitle}}"
  send-message-path="{{sendMessagePath}}"
  send-message-img="{{sendMessageImg}}"
  app-parameter="{{appParameter}}"
  show-message-card="{{showMessageCard}}"
  phone-number-no-quota-toast="{{phoneNumberNoQuotaToast}}"
  disabled="{{disabled || loading}}"
  loading="{{loading}}"
  aria-label="{{resolvedAccessibilityLabel}}"
  hover-class="is-pressed"
  bindtap="handleButtonTap"
  bindgetuserinfo="forwardNativeEvent"
  bindcontact="forwardNativeEvent"
  bindgetphonenumber="forwardNativeEvent"
  bindgetrealtimephonenumber="forwardNativeEvent"
  createliveactivity="forwardNativeEvent"
  binderror="forwardNativeEvent"
  bindopensetting="forwardNativeEvent"
  bindlaunchapp="forwardNativeEvent"
  bindchooseavatar="forwardNativeEvent"
  bindagreeprivacyauthorization="forwardNativeEvent"
>
  <view class="cool-button-content">
    <slot name="icon"/>
    <text wx:if="{{label}}" class="cool-label">{{label}}</text>
    <slot/>
  </view>
  <text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text>
</button>
</form>`);
    await output(`${dir}/index.wxss`, `
@import "../../styles/glass.wxss";

.cool-button-native {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  color: var(--cool-color-light-text);
  font-size: var(--cool-typography-body);
  line-height: normal;
  text-align: center;
}

.cool-button-native::after { border: 0; }
.cool-button-native.cool-size-medium { min-height: var(--cool-size-controlMedium); }
.cool-button-native.is-pressed { background: var(--cool-color-light-surface); }
.cool-button-native.is-disabled { opacity: var(--cool-opacity-disabled); }
.cool-button-native:focus {
  border-width: var(--cool-border-focus);
  border-color: var(--cool-color-light-accent);
}

.cool-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--cool-space-sm);
  min-height: inherit;
}`);
    continue;
  }
  if (controlledOptionComponents.has(component.name)) {
    await output(`${dir}/index.js`, controlledOptionScript(component.name));
    await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/index.wxml`, controlledOptionTemplate(component.name));
    await output(`${dir}/index.wxss`, controlledOptionStyles(component.name));
    continue;
  }
  const role = /Button|Chip|Item|Card|Navigation|TabBar|Segmented|Banner|Dialog|Sheet|Popover/.test(component.name) ? 'button' : 'none';
  const inputType = /TextField|SearchField/.test(component.name) ? 'input'
    : component.name === 'TextArea' ? 'textarea'
    : component.name === 'Toggle' ? 'switch'
    : component.name === 'Checkbox' ? 'checkbox'
    : component.name === 'RadioGroup' ? 'radio'
    : component.name === 'Slider' ? 'slider'
    : component.name === 'Stepper' ? 'stepper'
    : /Select|DatePicker|TimePicker/.test(component.name) ? 'picker'
    : 'view';
  const pickerMode = component.name === 'DatePicker' ? 'date' : component.name === 'TimePicker' ? 'time' : 'selector';
  const control = inputType === 'input'
    ? `<input class="cool-native-input" value="{{value}}" placeholder="{{placeholder}}" disabled="{{disabled}}" bindinput="handleInput" aria-label="{{accessibilityLabel}}" />`
    : inputType === 'textarea'
      ? `<textarea class="cool-native-input cool-native-textarea" value="{{value}}" placeholder="{{placeholder}}" disabled="{{disabled}}" bindinput="handleInput" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'switch'
        ? `<switch checked="{{selected}}" disabled="{{disabled}}" bindchange="handleNativeChange" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'checkbox'
        ? `<checkbox-group bindchange="handleNativeChange"><label><checkbox value="true" checked="{{selected}}" disabled="{{disabled}}" />{{label}}</label></checkbox-group>`
      : inputType === 'radio'
        ? `<radio-group bindchange="handleNativeChange"><label wx:for="{{options}}" wx:key="*this"><radio value="{{item}}" checked="{{item === value}}" disabled="{{disabled}}" />{{item}}</label></radio-group>`
      : inputType === 'slider'
        ? `<slider value="{{value}}" min="{{min}}" max="{{max}}" disabled="{{disabled}}" bindchange="handleNativeChange" aria-label="{{accessibilityLabel}}" />`
      : inputType === 'stepper'
        ? `<view class="cool-stepper"><button size="mini" data-delta="-1" disabled="{{disabled}}" bindtap="handleStep">−</button><text>{{value}}</text><button size="mini" data-delta="1" disabled="{{disabled}}" bindtap="handleStep">+</button></view>`
      : inputType === 'picker'
        ? `<picker mode="${pickerMode}" range="{{options}}" value="{{value}}" disabled="{{disabled}}" bindchange="handleNativeChange"><view class="cool-picker-value">{{displayValue || label}}</view></picker>`
      : `<view class="cool-content" role="${role}" aria-label="{{accessibilityLabel}}" bindtap="handleTap"><text wx:if="{{label}}" class="cool-label">{{label}}</text><slot/></view>`;
  await output(`${dir}/index.js`, `
const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: '${component.name}', interactive: ${component.interactive} },
});`);
  await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
  const standardTemplate = `<view class="cool-component cool-glass cool-${kebab(component.name)} cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{selected ? 'is-selected' : ''}} {{disabled ? 'is-disabled' : ''}} {{error ? 'is-error' : ''}}" data-component="${component.name}">
  <view wx:if="{{loading}}" class="cool-loading" aria-label="loading"></view>
  <slot name="icon"/>
  ${control}
  <text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text>
</view>`;
  const template = component.name === 'AlertDialog'
    ? `<view wx:if="{{open}}" class="cool-overlay-backdrop" bindtap="requestDismiss"><view class="cool-component cool-glass cool-alert-dialog cool-material-{{resolvedMaterial}} cool-tone-{{tone}}" role="dialog" aria-modal="true" aria-label="{{resolvedAccessibilityLabel}}" catchtap="noop"><text wx:if="{{label}}" class="cool-label">{{label}}</text><slot/><text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text></view></view>`
    : component.name === 'BottomSheet'
      ? `<view wx:if="{{open}}" class="cool-overlay-backdrop cool-bottom-sheet-backdrop" bindtap="requestDismiss"><view class="cool-component cool-glass cool-bottom-sheet cool-material-{{resolvedMaterial}} cool-tone-{{tone}}" role="dialog" aria-modal="true" aria-label="{{resolvedAccessibilityLabel}}" catchtap="noop"><slot/></view></view>`
      : standardTemplate;
  await output(`${dir}/index.wxml`, template);
  await output(`${dir}/index.wxss`, `@import "../../styles/glass.wxss";`);
}
await output('packages/wechat/component-manifest.json', JSON.stringify(manifest, null, 2));

const usingComponents = Object.fromEntries(Object.keys(manifest).map((tag) => [tag, `../../../packages/wechat/dist/components/${tag}/index`]));
const catalogComponentExample = ({ name }) => {
  if (name === 'TabBar') return '<cool-tab-bar options="{{tabOptions}}" value="{{tabValue}}" bind:change="handleTabChange" accessibility-label="TabBar example" />';
  if (name === 'SegmentedControl') return '<cool-segmented-control options="{{segmentOptions}}" value="{{segmentValue}}" bind:change="handleSegmentChange" accessibility-label="SegmentedControl example" />';
  return `<cool-${kebab(name)} label="${name}" accessibility-label="${name} example" />`;
};
await output('apps/catalog-wechat/app.json', JSON.stringify({ pages: ['pages/index/index'], window: { navigationStyle: 'custom', backgroundColor: '#071018' }, style: 'v2', lazyCodeLoading: 'requiredComponents' }, null, 2));
await output('apps/catalog-wechat/app.js', `App({ globalData: { catalogVersion: '${release.version}' } });`);
await output('apps/catalog-wechat/pages/index/index.json', JSON.stringify({ usingComponents }, null, 2));
await output('apps/catalog-wechat/pages/index/index.js', `
Page({
  data: {
    version: '${release.version}',
    buttonSubmitResult: 'Not submitted',
    tabValue: 'overview',
    tabOptions: [
      { value: 'overview', label: 'Overview' },
      { value: 'updates', label: 'Updates', badge: 3 },
      { value: 'settings', label: 'Settings', disabled: true },
    ],
    segmentValue: 2,
    segmentOptions: [
      { value: 1, label: 'Day' },
      { value: 2, label: 'Week' },
      { value: 3, label: 'Month', badge: 'New' },
    ],
  },
  handleButtonSubmit(event) {
    this.setData({ buttonSubmitResult: JSON.stringify(event.detail) });
  },
  handleTabChange(event) {
    this.setData({ tabValue: event.detail.value });
  },
  handleSegmentChange(event) {
    this.setData({ segmentValue: event.detail.value });
  },
});`);
await output('apps/catalog-wechat/pages/index/index.wxml', `
<view class="catalog-shell cool-theme">
  <view class="catalog-orb catalog-orb-cyan"></view><view class="catalog-orb catalog-orb-amber"></view>
  <view class="catalog-header"><text class="catalog-eyebrow">cooL UI {{version}} / WECHAT</text><text class="catalog-title">Native glass catalog</text><text class="catalog-copy">${components.length} components · 7 interaction states · semantic fallbacks</text></view>
  <view class="catalog-section"><text class="catalog-section-title">Button native capabilities</text><view class="catalog-grid">
    <cool-button label="Default" accessibility-label="Default button example" />
    <cool-button label="Loading" loading="{{true}}" accessibility-label="Loading button example" />
    <cool-button label="Disabled" disabled="{{true}}" accessibility-label="Disabled button example" />
    <cool-button label="Share" open-type="share" accessibility-label="Share button example" />
    <cool-button label="Submit" form-type="submit" bind:submit="handleButtonSubmit" accessibility-label="Submit button example" />
    <text class="catalog-copy">Submit detail: {{buttonSubmitResult}}</text>
  </view></view>
${['foundations', 'actions-inputs', 'navigation', 'content', 'feedback-overlays'].map((category) => `
  <view class="catalog-section"><text class="catalog-section-title">${category}</text><view class="catalog-grid">
    ${components.filter((component) => component.category === category).map(catalogComponentExample).join('\n    ')}
  </view></view>`).join('\n')}
</view>`);

await output('examples/npm-consumer/package.json', JSON.stringify({
  name: 'cool-ui-npm-consumer',
  version: '0.0.0',
  private: true,
  dependencies: {
    '@cool-ui/tokens': `file:../../artifacts/npm/cool-ui-tokens-${release.version}.tgz`,
    '@cool-ui/wechat': `file:../../artifacts/npm/cool-ui-wechat-${release.version}.tgz`,
  },
}, null, 2));

for (const component of components) {
  const swiftName = `Cool${componentApiName(component.name)}`;
  const nativeName = `Cool${componentApiName(component.name)}`;
  const tag = `cool-${kebab(component.name)}`;
  const maturity = component.maturity;
  const stateRows = component.interactive
    ? component.states.map((state) => `| ${state} | ${maturity.swiftui} | ${maturity.compose} | ${maturity.arkui} | ${maturity.wechat} |`).join('\n')
    : `| display | ${maturity.swiftui} | ${maturity.compose} | ${maturity.arkui} | ${maturity.wechat} |`;
  await output(`docs/components/${kebab(component.name)}.md`, `
# ${component.name}

${component.name} is a ${component.category} component. Its contract aligns geometry and semantics while each implementation preserves platform-native behavior.

## API matrix

| SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- |
| \`${swiftName}\` | \`${nativeName}\` | \`${nativeName}\` | \`<${tag}>\` |

Maturity: SwiftUI **${maturity.swiftui}**, Compose **${maturity.compose}**, ArkUI **${maturity.arkui}**, WeChat **${maturity.wechat}**.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
${stateRows}

## Accessibility

Provide a localized accessibility label. Beta and planned capabilities still require the platform verification listed in the repository readiness matrix.

## Examples

\`\`\`swift
${swiftName}(/* typed platform parameters */)
\`\`\`

\`\`\`kotlin
${nativeName}(/* typed platform parameters */)
\`\`\`

\`\`\`html
<${tag} label="${component.name}" accessibility-label="${component.name}" />
\`\`\`
`);
  await output(`docs/zh/components/${kebab(component.name)}.md`, `
# ${component.name}

${component.name} 属于 ${component.category} 组件。组件契约统一几何与语义，各端实现保留平台原生行为。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| \`${swiftName}\` | \`${nativeName}\` | \`${nativeName}\` | \`<${tag}>\` |

成熟度：SwiftUI **${maturity.swiftui}**、Compose **${maturity.compose}**、ArkUI **${maturity.arkui}**、微信小程序 **${maturity.wechat}**。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
${stateRows}

## 可访问性

请提供本地化无障碍标签。标为 beta 或 planned 的能力仍需完成仓库就绪度矩阵列出的平台验证。

## 示例

\`\`\`swift
${swiftName}(/* 类型安全的平台参数 */)
\`\`\`

\`\`\`kotlin
${nativeName}(/* 类型安全的平台参数 */)
\`\`\`

\`\`\`html
<${tag} label="${component.name}" accessibility-label="${component.name}" />
\`\`\`
`);
}

const tokenSource = resolve(root, 'packages/tokens/generated/swift/CoolTokens.swift');
await cp(tokenSource, resolve(root, 'packages/swift/Sources/CoolUI/CoolTokens.swift'));
const kotlinToken = await readFile(resolve(root, 'packages/tokens/generated/kotlin/CoolTokens.kt'), 'utf8');
await output('packages/android/src/main/kotlin/dev/coolui/tokens/CoolTokens.kt', kotlinToken);
const arkToken = await readFile(resolve(root, 'packages/tokens/generated/arkts/CoolTokens.ets'), 'utf8');
await output('packages/arkui/src/main/ets/tokens/CoolTokens.ets', arkToken);
const wechatToken = await readFile(resolve(root, 'packages/tokens/generated/wechat/cool-ui-tokens.wxss'), 'utf8');
await output('packages/wechat/src/styles/tokens.wxss', wechatToken);

await rm(resolve(root, 'packages/wechat/dist'), { recursive: true, force: true });
