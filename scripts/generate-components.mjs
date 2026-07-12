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
const warnedDuplicateSignatures = new Set();

function isOptionValue(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function firstSelectedIndex(options, value) {
  if (!Array.isArray(options)) return -1;
  return options.findIndex((option) => option && isOptionValue(option.value) && option.value === value);
}

function createViewOptions(options) {
  const occurrences = new Map();
  const viewOptions = [];
  options.forEach((option, index) => {
    if (!option || typeof option !== 'object' || !isOptionValue(option.value)) return;
    const identity = JSON.stringify([typeof option.value, option.value]);
    const occurrence = occurrences.get(identity) || 0;
    occurrences.set(identity, occurrence + 1);
    viewOptions.push({
      ...option,
      _key: JSON.stringify([typeof option.value, option.value, occurrence]),
      _index: index,
    });
  });
  return viewOptions;
}

function duplicateValueIdentities(options) {
  const seen = new Set();
  const duplicates = new Map();
  for (const option of options) {
    if (!option || !isOptionValue(option.value)) continue;
    const typedValue = [typeof option.value, option.value];
    const identity = JSON.stringify(typedValue);
    if (seen.has(identity)) duplicates.set(identity, typedValue);
    seen.add(identity);
  }
  return [...duplicates.values()].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function shouldWarnForDuplicateValues() {
  try {
    const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
    return envVersion === 'develop' || envVersion === 'trial';
  } catch {
    return false;
  }
}

function warnForDuplicateValues(options) {
  const duplicates = duplicateValueIdentities(options);
  if (duplicates.length === 0) return;
  if (!shouldWarnForDuplicateValues()) return;
  const signature = JSON.stringify(duplicates);
  if (warnedDuplicateSignatures.has(signature)) return;
  warnedDuplicateSignatures.add(signature);
  console.warn('[cooL UI] ${componentName} options contain duplicate values; the first match is selected.', duplicates);
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  data: { componentName: '${componentName}', interactive: true, viewOptions: [], selectedIndex: -1 },
  observers: {
    'options, value': function validateOptions(options, value) {
      if (!Array.isArray(options)) {
        this.setData({ options: [], viewOptions: [], selectedIndex: -1 });
        return;
      }
      this.setData({ viewOptions: createViewOptions(options), selectedIndex: firstSelectedIndex(options, value) });
      warnForDuplicateValues(options);
    },
  },
  methods: {
    handleOptionTap(event) {
      if (this.data.disabled || this.data.loading) return;
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
<scroll-view class="cool-component cool-glass cool-tab-bar cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{disabled ? 'is-disabled' : ''}} {{loading ? 'is-loading' : ''}} {{error ? 'is-error' : ''}}" data-component="TabBar" scroll-x="{{true}}" enhanced="{{true}}" show-scrollbar="{{false}}" role="tablist" aria-label="{{resolvedAccessibilityLabel}}">
  <view wx:if="{{loading}}" class="cool-loading" aria-label="loading"></view>
  <view class="cool-tab-track">
    <view wx:for="{{viewOptions}}" wx:key="_key" class="cool-page-tab {{item._index === selectedIndex ? 'is-active' : ''}} {{item.disabled || disabled || loading ? 'is-disabled' : ''}}" data-index="{{item._index}}" role="tab" aria-selected="{{item._index === selectedIndex}}" aria-disabled="{{item.disabled || disabled || loading}}" bindtap="handleOptionTap">
      <text class="cool-option-label">{{item.label}}</text>
      <text wx:if="{{item.badge || item.badge === 0}}" class="cool-option-badge">{{item.badge}}</text>
    </view>
  </view>
  <text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text>
</scroll-view>`;

  return `
<view class="cool-component cool-glass cool-segmented-control cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{disabled ? 'is-disabled' : ''}} {{loading ? 'is-loading' : ''}} {{error ? 'is-error' : ''}}" data-component="SegmentedControl">
  <view wx:if="{{loading}}" class="cool-loading" aria-label="loading"></view>
  <view class="cool-segmented-options" role="tablist" aria-label="{{resolvedAccessibilityLabel}}">
    <view wx:for="{{viewOptions}}" wx:key="_key" class="cool-segmented-option {{item._index === selectedIndex ? 'is-active' : ''}} {{item.disabled || disabled || loading ? 'is-disabled' : ''}}" data-index="{{item._index}}" role="tab" aria-selected="{{item._index === selectedIndex}}" aria-disabled="{{item.disabled || disabled || loading}}" bindtap="handleOptionTap">
      <text class="cool-option-label">{{item.label}}</text>
      <text wx:if="{{item.badge || item.badge === 0}}" class="cool-option-badge">{{item.badge}}</text>
    </view>
  </view>
  <text wx:if="{{errorMessage}}" class="cool-error" role="alert">{{errorMessage}}</text>
</view>`;
}

function controlledOptionStylesPrefix() {
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
`;
  return shared;
}

function monthCalendarScript() {
  return `
const coolBehavior = require('../../behaviors/cool-ui');
const calendarTones = new Set(['neutral', 'accent', 'success', 'warning', 'danger']);

function normalizedTone(tone) {
  return calendarTones.has(tone) ? tone : 'neutral';
}

function normalizeMarker(marker) {
  const value = marker && typeof marker === 'object' ? marker : {};
  const normalized = { tone: normalizedTone(value.tone) };
  if (typeof value.accessibilityLabel === 'string' && value.accessibilityLabel) {
    normalized.accessibilityLabel = value.accessibilityLabel;
  }
  return normalized;
}

function isGregorianLeapYear(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function daysInGregorianMonth(year, month) {
  if (month < 1 || month > 12) return 0;
  const monthLengths = [31, isGregorianLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return monthLengths[month - 1];
}

function gregorianDayFromISO(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (day < 1 || day > daysInGregorianMonth(year, month)) return null;
  return day;
}

function groupCalendarWeeks(viewDays) {
  const viewWeeks = [];
  for (let index = 0; index < viewDays.length; index += 7) viewWeeks.push(viewDays.slice(index, index + 7));
  return viewWeeks;
}

function normalizeDays(days, selectedDate) {
  if (!Array.isArray(days)) return [];
  const hasControlledSelection = gregorianDayFromISO(selectedDate) !== null;
  const viewDays = [];
  days.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const gregorianDay = gregorianDayFromISO(item.date);
    if (gregorianDay === null || !Number.isInteger(item.day) || item.day !== gregorianDay) return;
    const secondaryText = typeof item.secondaryText === 'string' ? item.secondaryText : '';
    const accessibilityLabel = typeof item.accessibilityLabel === 'string' ? item.accessibilityLabel : '';
    const normalized = {
      date: item.date,
      day: item.day,
      markers: Array.isArray(item.markers) ? item.markers.slice(0, 3).map(normalizeMarker) : [],
      tone: normalizedTone(item.tone),
      isDisabled: Boolean(item.isDisabled),
      isToday: Boolean(item.isToday),
      isSelected: hasControlledSelection && item.date === selectedDate,
      resolvedAccessibilityLabel: accessibilityLabel || [item.date, secondaryText].filter(Boolean).join(' ') || String(item.day),
      _index: index,
    };
    if (typeof item.accessibilityLabel === 'string') normalized.accessibilityLabel = item.accessibilityLabel;
    if (secondaryText) normalized.secondaryText = secondaryText;
    if (typeof item.badge === 'string' || typeof item.badge === 'number') normalized.badge = item.badge;
    viewDays.push(normalized);
  });
  return viewDays;
}

function eventDay(viewDay) {
  return {
    date: viewDay.date,
    day: viewDay.day,
    secondaryText: viewDay.secondaryText,
    accessibilityLabel: viewDay.accessibilityLabel,
    isToday: viewDay.isToday,
    isSelected: viewDay.isSelected,
    isDisabled: viewDay.isDisabled,
    tone: viewDay.tone,
    badge: viewDay.badge,
    markers: viewDay.markers.map((marker) => ({ ...marker })),
  };
}

Component({
  behaviors: [coolBehavior],
  options: { multipleSlots: true, styleIsolation: 'apply-shared' },
  properties: {
    year: { type: Number, value: 1970 },
    month: { type: Number, value: 1 },
    days: { type: Array, value: [] },
    selectedDate: { type: String, value: '' },
    weekdays: { type: Array, value: ['一', '二', '三', '四', '五', '六', '日'] },
    useCustomHeader: { type: Boolean, value: false },
  },
  data: { componentName: 'MonthCalendar', interactive: true, viewDays: [], viewWeeks: [] },
  observers: {
    'days, selectedDate': function resolveDays(days, selectedDate) {
      if (!Array.isArray(days)) {
        this.setData({ viewDays: [], viewWeeks: [] });
        return;
      }
      const viewDays = normalizeDays(days, selectedDate);
      this.setData({ viewDays, viewWeeks: groupCalendarWeeks(viewDays) });
    },
  },
  methods: {
    handleDayTap(event) {
      if (this.data.disabled || this.data.loading) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const index = dataset ? Number(dataset.index) : Number.NaN;
      if (!Number.isInteger(index)) return;
      const day = (Array.isArray(this.data.viewDays) ? this.data.viewDays : []).find((item) => item._index === index);
      if (!day || day.isDisabled) return;
      this.triggerEvent('select', { day: eventDay(day) });
    },
    handleMonthChange(event) {
      if (this.data && (this.data.disabled || this.data.loading)) return;
      const dataset = event && event.currentTarget && event.currentTarget.dataset;
      const direction = dataset && dataset.direction;
      if (direction !== 'previous' && direction !== 'next') return;
      this.triggerEvent('monthchange', { direction });
    },
  },
});`;
}

function monthCalendarTemplate() {
  return `
<view class="cool-component cool-glass cool-month-calendar cool-material-{{resolvedMaterial}} cool-tone-{{tone}} cool-size-{{size}} {{disabled ? 'is-disabled' : ''}}" data-component="MonthCalendar">
  <view class="cool-calendar-header">
    <view wx:if="{{!useCustomHeader}}" class="cool-calendar-header-fallback">
      <button class="cool-calendar-nav" data-direction="previous" disabled="{{disabled || loading}}" aria-label="Previous month" bindtap="handleMonthChange">‹</button>
      <text class="cool-calendar-title">{{year}} / {{month}}</text>
      <button class="cool-calendar-nav" data-direction="next" disabled="{{disabled || loading}}" aria-label="Next month" bindtap="handleMonthChange">›</button>
    </view>
    <slot wx:else name="header"/>
  </view>
  <view class="cool-calendar-grid" role="grid" aria-label="{{resolvedAccessibilityLabel}}">
    <view class="cool-calendar-weekday-row" role="row">
      <text wx:for="{{weekdays}}" wx:key="*this" class="cool-calendar-weekday" role="columnheader">{{item}}</text>
    </view>
    <view wx:for="{{viewWeeks}}" wx:for-item="week" wx:key="index" class="cool-calendar-week" role="row">
      <view wx:for="{{week}}" wx:for-item="item" wx:key="_index" class="cool-calendar-cell" role="gridcell" aria-selected="{{item.isSelected}}" aria-disabled="{{item.isDisabled || disabled || loading}}">
        <button
          class="cool-calendar-day cool-calendar-day-tone-{{item.tone}} {{item.isSelected ? 'is-selected' : ''}} {{item.isToday ? 'is-today' : ''}} {{item.isDisabled || disabled || loading ? 'is-disabled' : ''}}"
          data-index="{{item._index}}"
          disabled="{{item.isDisabled || disabled || loading}}"
          aria-disabled="{{item.isDisabled || disabled || loading}}"
          aria-selected="{{item.isSelected}}"
          aria-label="{{item.resolvedAccessibilityLabel}}"
          bindtap="handleDayTap"
        >
          <day day="{{item}}"/>
          <view class="cool-calendar-markers">
            <marker wx:for="{{item.markers}}" wx:for-item="marker" wx:key="index" marker="{{marker}}"/>
          </view>
        </button>
      </view>
    </view>
  </view>
</view>`;
}

function monthCalendarStyles() {
  return `
@import "../../styles/glass.wxss";

.cool-month-calendar {
  width: 100%;
  box-sizing: border-box;
}

.cool-calendar-header,
.cool-calendar-header-fallback {
  display: flex;
  align-items: center;
  width: 100%;
}

.cool-calendar-header { flex-direction: column; gap: var(--cool-space-xs); }
.cool-calendar-header-fallback { justify-content: space-between; gap: var(--cool-space-sm); }
.cool-calendar-title { font-size: var(--cool-typography-title); }

.cool-calendar-nav {
  min-width: var(--cool-size-touchTarget);
  min-height: var(--cool-size-touchTarget);
  margin: 0;
  padding: var(--cool-space-xs);
  color: var(--cool-color-light-text);
  font-size: var(--cool-typography-title);
  line-height: normal;
  background: var(--cool-color-light-surface);
  border: var(--cool-border-hairline) solid var(--cool-color-light-surfaceTint);
  border-radius: var(--cool-radius-pill);
}

.cool-calendar-nav::after,
.cool-calendar-day::after { border: 0; }

.cool-calendar-grid {
  display: flex;
  flex-direction: column;
  gap: var(--cool-space-xs);
  width: 100%;
}

.cool-calendar-grid { margin-top: var(--cool-space-md); }
.cool-calendar-weekday-row,
.cool-calendar-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--cool-space-xs);
  width: 100%;
}
.cool-calendar-cell { min-width: 0; }
.cool-calendar-weekday {
  color: var(--cool-color-light-textSecondary);
  font-size: var(--cool-typography-caption);
  text-align: center;
}

.cool-calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--cool-space-xs);
  width: 100%;
  min-width: 0;
  min-height: var(--cool-size-touchTarget);
  margin: 0;
  padding: var(--cool-space-xs);
  color: var(--cool-color-light-text);
  font-size: var(--cool-typography-body);
  line-height: normal;
  background: var(--cool-color-light-surface);
  border: var(--cool-border-hairline) solid var(--cool-color-light-surfaceTint);
  border-radius: var(--cool-radius-medium);
}

.cool-calendar-day.is-selected { color: var(--cool-color-light-text); background: var(--cool-color-light-accent); border-color: var(--cool-color-light-accent); }
.cool-calendar-day.is-today { border-width: var(--cool-border-focus); border-color: var(--cool-color-light-accent); }
.cool-calendar-day.is-disabled { opacity: var(--cool-opacity-disabled); }
.cool-calendar-day-tone-accent { border-color: var(--cool-color-light-accent); }
.cool-calendar-day-tone-success { border-color: var(--cool-color-light-success); }
.cool-calendar-day-tone-warning { border-color: var(--cool-color-light-warning); }
.cool-calendar-day-tone-danger { border-color: var(--cool-color-light-danger); }

.cool-calendar-markers { display: flex; align-items: center; justify-content: center; gap: var(--cool-space-xs); }`;
}

function controlledOptionStyles(componentName) {
  const shared = `${controlledOptionStylesPrefix()}
.cool-page-tab.is-active,
.cool-segmented-option.is-active {
  color: var(--cool-color-light-text);
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

.cool-segmented-control {
  width: 100%;
  padding: var(--cool-space-xs);
  box-sizing: border-box;
}
.cool-segmented-options {
  display: flex;
  gap: var(--cool-space-xs);
  width: 100%;
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

${components.filter(({ name }) => generationMode(name, 'arkui') === 'generated').map(({ name, interactive }) => `
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
  if (component.name === 'MonthCalendar') {
    await output(`${dir}/index.js`, monthCalendarScript());
    await output(`${dir}/index.json`, JSON.stringify({
      component: true,
      styleIsolation: 'apply-shared',
      componentGenerics: {
        day: { default: './default-day/index' },
        marker: { default: './default-marker/index' },
      },
    }, null, 2));
    await output(`${dir}/index.wxml`, monthCalendarTemplate());
    await output(`${dir}/index.wxss`, monthCalendarStyles());
    await output(`${dir}/default-day/index.js`, `
Component({
  options: { styleIsolation: 'apply-shared' },
  properties: { day: { type: Object, value: null } },
});`);
    await output(`${dir}/default-day/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/default-day/index.wxml`, `
<view class="cool-calendar-day-fallback">
  <text class="cool-calendar-day-number">{{day.day}}</text>
  <text wx:if="{{day.secondaryText}}" class="cool-calendar-secondary">{{day.secondaryText}}</text>
  <text wx:if="{{day.badge || day.badge === 0}}" class="cool-calendar-badge">{{day.badge}}</text>
</view>`);
    await output(`${dir}/default-day/index.wxss`, `
@import "../../../styles/glass.wxss";
.cool-calendar-day-fallback { display: flex; flex-direction: column; align-items: center; gap: var(--cool-space-xs); }
.cool-calendar-day-number { font-size: var(--cool-typography-body); }
.cool-calendar-secondary { color: var(--cool-color-light-textSecondary); font-size: var(--cool-typography-caption); }
.cool-calendar-badge {
  padding: var(--cool-space-xs);
  color: var(--cool-color-light-text);
  font-size: var(--cool-typography-caption);
  background: var(--cool-color-light-surfaceTint);
  border-radius: var(--cool-radius-pill);
}`);
    await output(`${dir}/default-marker/index.js`, `
Component({
  options: { styleIsolation: 'apply-shared' },
  properties: { marker: { type: Object, value: null } },
});`);
    await output(`${dir}/default-marker/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/default-marker/index.wxml`, `
<view class="cool-calendar-marker cool-calendar-marker-{{marker.tone}}" aria-label="{{marker.accessibilityLabel}}"></view>`);
    await output(`${dir}/default-marker/index.wxss`, `
@import "../../../styles/glass.wxss";
.cool-calendar-marker {
  width: var(--cool-space-xs);
  height: var(--cool-space-xs);
  background: var(--cool-color-light-surfaceTint);
  border-radius: var(--cool-radius-pill);
}
.cool-calendar-marker-accent { background: var(--cool-color-light-accent); }
.cool-calendar-marker-success { background: var(--cool-color-light-success); }
.cool-calendar-marker-warning { background: var(--cool-color-light-warning); }
.cool-calendar-marker-danger { background: var(--cool-color-light-danger); }`);
    continue;
  }
  if (component.name === 'Button') {
    await output(`${dir}/index.js`, `
const coolBehavior = require('../../behaviors/cool-ui');

Component({
  behaviors: [coolBehavior, 'wx://form-field-button'],
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
    forwardNativeEvent(event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});`);
    await output(`${dir}/index.json`, JSON.stringify({ component: true, styleIsolation: 'apply-shared' }, null, 2));
    await output(`${dir}/index.wxml`, `
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
</button>`);
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
  if (name === 'MonthCalendar') return '<cool-month-calendar year="{{calendarYear}}" month="{{calendarMonth}}" days="{{calendarDays}}" selected-date="{{calendarSelectedDate}}" bind:select="onCalendarSelect" bind:monthchange="onCalendarMonthChange" accessibility-label="MonthCalendar example" />';
  return `<cool-${kebab(name)} label="${name}" accessibility-label="${name} example" />`;
};
await output('apps/catalog-wechat/app.json', JSON.stringify({ pages: ['pages/index/index'], window: { navigationStyle: 'custom', backgroundColor: '#071018' }, style: 'v2', lazyCodeLoading: 'requiredComponents' }, null, 2));
await output('apps/catalog-wechat/app.js', `App({ globalData: { catalogVersion: '${release.version}' } });`);
await output('apps/catalog-wechat/pages/index/index.json', JSON.stringify({ usingComponents }, null, 2));
await output('apps/catalog-wechat/pages/index/index.js', `
function padCalendarPart(value) {
  return String(value).padStart(2, '0');
}

function calendarISODate(date) {
  return [date.getUTCFullYear(), padCalendarPart(date.getUTCMonth() + 1), padCalendarPart(date.getUTCDate())].join('-');
}

function createCalendarDays(year, month) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, 1 - mondayOffset + index));
    const iso = calendarISODate(date);
    const day = {
      date: iso,
      day: date.getUTCDate(),
      isDisabled: date.getUTCMonth() !== month - 1,
      tone: iso === '2026-07-12' ? 'accent' : 'neutral',
    };
    if (iso === '2026-07-05') day.isDisabled = true;
    if (iso === '2026-07-12') {
      day.isToday = true;
      day.secondaryText = 'Today';
      day.badge = '3';
    }
    if (iso === '2026-07-16') {
      day.markers = [{ tone: 'accent' }, { tone: 'success' }, { tone: 'warning' }];
    }
    return day;
  });
}

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
    calendarYear: 2026,
    calendarMonth: 7,
    calendarSelectedDate: '2026-07-12',
    calendarDays: createCalendarDays(2026, 7),
  },
  handleButtonSubmit(event) {
    this.setData({ buttonSubmitResult: JSON.stringify(event.detail) });
  },
  handleButtonReset() {
    this.setData({ buttonSubmitResult: 'Reset' });
  },
  handleTabChange(event) {
    this.setData({ tabValue: event.detail.value });
  },
  handleSegmentChange(event) {
    this.setData({ segmentValue: event.detail.value });
  },
  onCalendarSelect(event) {
    this.setData({ calendarSelectedDate: event.detail.day.date });
  },
  onCalendarMonthChange(event) {
    const direction = event && event.detail && event.detail.direction;
    if (direction !== 'previous' && direction !== 'next') return;
    const offset = direction === 'previous' ? -1 : 1;
    const displayedMonth = new Date(Date.UTC(this.data.calendarYear, this.data.calendarMonth - 1 + offset, 1));
    const calendarYear = displayedMonth.getUTCFullYear();
    const calendarMonth = displayedMonth.getUTCMonth() + 1;
    this.setData({ calendarYear, calendarMonth, calendarDays: createCalendarDays(calendarYear, calendarMonth) });
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
    <form bindsubmit="handleButtonSubmit" bindreset="handleButtonReset">
      <cool-button label="Submit" form-type="submit" accessibility-label="Submit button example" />
      <cool-button label="Reset" form-type="reset" accessibility-label="Reset button example" />
    </form>
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
  scripts: { test: 'node verify.mjs' },
  dependencies: {
    '@cool-ui/tokens': `file:../../artifacts/npm/cool-ui-tokens-${release.version}.tgz`,
    '@cool-ui/wechat': `file:../../artifacts/npm/cool-ui-wechat-${release.version}.tgz`,
  },
}, null, 2));

function monthCalendarEnglishDocs(maturity, stateRows) {
  return `
# MonthCalendar

MonthCalendar is a strictly controlled month-grid renderer. The consumer owns the displayed month, selected date, and visible day records. Selection and navigation callbacks are requests: the parent must update its state and pass the new value back.

## Controlled data contract

SwiftUI \`Binding<Date>\` and Compose \`LocalDate\` values are always non-empty and valid typed dates; each passed value is authoritative. Only ArkUI and WeChat string APIs treat an empty or invalid string as no selection. No platform falls back to \`CoolCalendarDay.isSelected\`.

| CoolCalendarDay field | Meaning |
| --- | --- |
| \`date\` | Swift \`Date\`, Compose \`LocalDate\`, or ISO \`YYYY-MM-DD\` on ArkUI and WeChat |
| \`day\` | Gregorian day number, 1–31 |
| \`secondaryText\` | Optional consumer-provided secondary label |
| \`accessibilityLabel\` | Optional localized complete override for spoken output |
| \`isToday\` | Consumer-provided today state |
| \`isSelected\` | Serialized field; controlled selection still wins |
| \`isDisabled\` | Prevents selection requests |
| \`tone\` | Semantic tone |
| \`badge\` | Optional compact badge |
| \`markers\` | Zero to 3 \`CoolCalendarMarker\` values; extra markers are clipped |

cooL UI does not calculate Gregorian grids, lunar dates, holidays, or work-rest/shift-day schedules. Those policies and localized strings belong to the consumer.

## Four-platform API

| Platform | Controlled API | Requests and slots |
| --- | --- | --- |
| SwiftUI | \`Binding<Date> selection\`, \`Binding<Date> displayedMonth\`, \`[CoolCalendarDay]\` | \`onSelect\`, \`onMonthChange\`; typed \`CoolMonthCalendarHeaderContext\`, day, and \`CoolCalendarMarker\` builders |
| Compose | \`LocalDate selectedDate\`, \`YearMonth displayedMonth\`, \`List<CoolCalendarDay>\` | \`onDaySelected\`, \`onMonthChange\`; \`header\`, \`dayContent\`, and \`markerContent\` lambdas |
| ArkUI | ISO \`selectedDate\`, \`displayedMonth\` (\`YYYY-MM\`), \`CoolCalendarDay[]\` | \`onSelect\`, \`onMonthChange\`; typed \`@BuilderParam\` \`header\`, \`day\`, and \`marker\` |
| WeChat | \`year\`, \`month\`, \`days\`, \`selected-date\` | \`bind:select\`, \`bind:monthchange\`; \`header\` named slot; \`componentGenerics\` maps \`day\` and \`marker\` |

WeChat payloads are exactly \`select: { day: CoolCalendarDay }\` and \`monthchange: { direction: 'previous' | 'next' }\`.

Maturity: SwiftUI **${maturity.swiftui}**, Compose **${maturity.compose}**, ArkUI **${maturity.arkui}**, WeChat **${maturity.wechat}**. ArkUI source contracts are verified, but the HarmonyOS 6 HAR build is still **pending**; documentation alone does not make a platform stable.

## State matrix

| State | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
${stateRows}

## Accessibility and rendering

When \`accessibilityLabel\` is non-empty, SwiftUI and ArkUI treat it as a complete override and append no secondary text, badge, today state, or marker details. Otherwise native implementations start with a localized or ISO date and append the supported secondary details. WeChat falls back to the ISO date plus \`secondaryText\`, so provide a localized label when badges, today state, or markers must be read.

Use a single glass surface around the header and grid. Do not add a blur layer to every day cell.

## SwiftUI

\`\`\`swift
@State private var selectedDate = Date()
@State private var displayedMonth = Date()

CoolMonthCalendar(
  selection: $selectedDate,
  displayedMonth: $displayedMonth,
  days: calendarDays,
  onSelect: { selectedDate = $0.date },
  onMonthChange: { direction in
    let offset = direction == .previous ? -1 : 1
    if let month = Calendar.autoupdatingCurrent.date(byAdding: .month, value: offset, to: displayedMonth) {
      displayedMonth = month
    }
  }
)
\`\`\`

The full initializer supplies \`CoolMonthCalendarHeaderContext\`, \`CoolCalendarDay\`, and \`CoolCalendarMarker\` to custom builders. \`context.requestMonthChange(_:)\` emits a request; the parent still updates the binding.

## Compose

\`\`\`kotlin
var selectedDate by remember { mutableStateOf(LocalDate.of(2026, 7, 12)) }
var displayedMonth by remember { mutableStateOf(YearMonth.of(2026, 7)) }

CoolMonthCalendar(
  selectedDate = selectedDate,
  displayedMonth = displayedMonth,
  days = calendarDays,
  onDaySelected = { selectedDate = it.date },
  onMonthChange = { direction ->
    displayedMonth = if (direction == CoolMonthDirection.Previous) displayedMonth.minusMonths(1) else displayedMonth.plusMonths(1)
  },
)
\`\`\`

## ArkUI

\`\`\`ts
@State selectedDate: string = '2026-07-12'
@State displayedMonth: string = '2026-07'

CoolMonthCalendar({
  selectedDate: this.selectedDate,
  displayedMonth: this.displayedMonth,
  days: createCalendarDays(this.displayedMonth),
  onSelect: (day: CoolCalendarDay) => { this.selectedDate = day.date },
  onMonthChange: (direction: CoolMonthDirection) => {
    this.displayedMonth = shiftMonth(this.displayedMonth, direction)
  }
})
\`\`\`

## WeChat Mini Program

\`\`\`json
{
  "usingComponents": {
    "cool-month-calendar": "@cool-ui/wechat/components/cool-month-calendar/index",
    "calendar-day": "/components/calendar-day/index",
    "calendar-marker": "/components/calendar-marker/index"
  }
}
\`\`\`

\`\`\`html
<cool-month-calendar
  year="{{calendarYear}}"
  month="{{calendarMonth}}"
  days="{{calendarDays}}"
  selected-date="{{calendarSelectedDate}}"
  use-custom-header="{{true}}"
  generic:day="calendar-day"
  generic:marker="calendar-marker"
  bind:select="onCalendarSelect"
  bind:monthchange="onCalendarMonthChange"
>
  <view slot="header">{{calendarYear}} / {{calendarMonth}}</view>
</cool-month-calendar>
\`\`\`

\`\`\`js
Page({
  onCalendarSelect(event) {
    this.setData({ calendarSelectedDate: event.detail.day.date })
  },
  onCalendarMonthChange(event) {
    const offset = event.detail.direction === 'previous' ? -1 : 1
    const next = new Date(Date.UTC(this.data.calendarYear, this.data.calendarMonth - 1 + offset, 1))
    const calendarYear = next.getUTCFullYear()
    const calendarMonth = next.getUTCMonth() + 1
    this.setData({ calendarYear, calendarMonth, calendarDays: createCalendarDays(calendarYear, calendarMonth) })
  },
})
\`\`\`
`;
}

function monthCalendarChineseDocs(maturity, stateRows) {
  return `
# MonthCalendar

MonthCalendar 是严格受控的月历网格。调用方拥有展示月份、选中日期和所有可见日期数据；选择与月份切换回调只表达请求，父级必须更新状态并把新值传回组件。

## 受控数据契约

SwiftUI \`Binding<Date>\` 与 Compose \`LocalDate\` 都是非空且合法的类型化日期；传入值是权威选中值。只有 ArkUI 与微信的字符串 API 把空字符串或非法字符串解释为无选中。任何平台都不会回退到 \`CoolCalendarDay.isSelected\`。

| CoolCalendarDay 字段 | 含义 |
| --- | --- |
| \`date\` | Swift 使用 \`Date\`，Compose 使用 \`LocalDate\`，ArkUI 与微信使用 ISO \`YYYY-MM-DD\` |
| \`day\` | 1–31 的公历日序号 |
| \`secondaryText\` | 调用方提供的可选次级文本 |
| \`accessibilityLabel\` | 可选的本地化朗读完整覆盖文本 |
| \`isToday\` | 调用方提供的“今天”状态 |
| \`isSelected\` | 序列化字段；受控选中值仍优先 |
| \`isDisabled\` | 禁止发送选择请求 |
| \`tone\` | 语义色调 |
| \`badge\` | 可选的紧凑徽标 |
| \`markers\` | 0 至 3 个 \`CoolCalendarMarker\`，超出的标记会被截断 |

cooL UI 不计算公历网格、农历、节假日或调休/工作日安排。这些业务规则和本地化文字由调用方负责。

## 四端 API 对照

| 平台 | 受控 API | 请求与插槽 |
| --- | --- | --- |
| SwiftUI | \`Binding<Date> selection\`、\`Binding<Date> displayedMonth\`、\`[CoolCalendarDay]\` | \`onSelect\`、\`onMonthChange\`；类型化 \`CoolMonthCalendarHeaderContext\`、日期和 \`CoolCalendarMarker\` Builder |
| Compose | \`LocalDate selectedDate\`、\`YearMonth displayedMonth\`、\`List<CoolCalendarDay>\` | \`onDaySelected\`、\`onMonthChange\`；\`header\`、\`dayContent\`、\`markerContent\` lambda |
| ArkUI | ISO \`selectedDate\`、\`displayedMonth\`（\`YYYY-MM\`）、\`CoolCalendarDay[]\` | \`onSelect\`、\`onMonthChange\`；类型化 \`@BuilderParam\`：\`header\`、\`day\`、\`marker\` |
| 微信小程序 | \`year\`、\`month\`、\`days\`、\`selected-date\` | \`bind:select\`、\`bind:monthchange\`；\`header\` 具名插槽；\`componentGenerics\` 映射 \`day\` 和 \`marker\` |

微信事件详情严格为 \`select: { day: CoolCalendarDay }\` 与 \`monthchange: { direction: 'previous' | 'next' }\`。

成熟度：SwiftUI **${maturity.swiftui}**、Compose **${maturity.compose}**、ArkUI **${maturity.arkui}**、微信小程序 **${maturity.wechat}**。ArkUI 已完成源码契约验证，但 HarmonyOS 6 HAR 构建仍为**待验证（pending）**；仅凭文档不会把平台标为 stable。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
${stateRows}

## 无障碍与渲染

当 \`accessibilityLabel\` 非空时，SwiftUI 与 ArkUI 将其作为朗读内容的完整覆盖，不再追加次级文本、徽标、今天状态或标记详情。否则各原生实现从本地化日期或 ISO 日期开始并追加支持的次级信息；微信回退为 ISO 日期加 \`secondaryText\`。

日历整体只使用一个玻璃表面，包住头部和网格。不要给每个日期单元添加独立模糊层。

## SwiftUI

\`\`\`swift
@State private var selectedDate = Date()
@State private var displayedMonth = Date()

CoolMonthCalendar(
  selection: $selectedDate,
  displayedMonth: $displayedMonth,
  days: calendarDays,
  onSelect: { selectedDate = $0.date },
  onMonthChange: { direction in
    let offset = direction == .previous ? -1 : 1
    if let month = Calendar.autoupdatingCurrent.date(byAdding: .month, value: offset, to: displayedMonth) {
      displayedMonth = month
    }
  }
)
\`\`\`

完整初始化器会把 \`CoolMonthCalendarHeaderContext\`、\`CoolCalendarDay\`、\`CoolCalendarMarker\` 传给自定义 Builder。\`context.requestMonthChange(_:)\` 只发送请求，父级仍需更新 Binding。

## Compose

\`\`\`kotlin
var selectedDate by remember { mutableStateOf(LocalDate.of(2026, 7, 12)) }
var displayedMonth by remember { mutableStateOf(YearMonth.of(2026, 7)) }

CoolMonthCalendar(
  selectedDate = selectedDate,
  displayedMonth = displayedMonth,
  days = calendarDays,
  onDaySelected = { selectedDate = it.date },
  onMonthChange = { direction ->
    displayedMonth = if (direction == CoolMonthDirection.Previous) displayedMonth.minusMonths(1) else displayedMonth.plusMonths(1)
  },
)
\`\`\`

## ArkUI

\`\`\`ts
@State selectedDate: string = '2026-07-12'
@State displayedMonth: string = '2026-07'

CoolMonthCalendar({
  selectedDate: this.selectedDate,
  displayedMonth: this.displayedMonth,
  days: createCalendarDays(this.displayedMonth),
  onSelect: (day: CoolCalendarDay) => { this.selectedDate = day.date },
  onMonthChange: (direction: CoolMonthDirection) => {
    this.displayedMonth = shiftMonth(this.displayedMonth, direction)
  }
})
\`\`\`

## 微信小程序

\`\`\`json
{
  "usingComponents": {
    "cool-month-calendar": "@cool-ui/wechat/components/cool-month-calendar/index",
    "calendar-day": "/components/calendar-day/index",
    "calendar-marker": "/components/calendar-marker/index"
  }
}
\`\`\`

\`\`\`html
<cool-month-calendar
  year="{{calendarYear}}"
  month="{{calendarMonth}}"
  days="{{calendarDays}}"
  selected-date="{{calendarSelectedDate}}"
  use-custom-header="{{true}}"
  generic:day="calendar-day"
  generic:marker="calendar-marker"
  bind:select="onCalendarSelect"
  bind:monthchange="onCalendarMonthChange"
>
  <view slot="header">{{calendarYear}} / {{calendarMonth}}</view>
</cool-month-calendar>
\`\`\`

\`\`\`js
Page({
  onCalendarSelect(event) {
    this.setData({ calendarSelectedDate: event.detail.day.date })
  },
  onCalendarMonthChange(event) {
    const offset = event.detail.direction === 'previous' ? -1 : 1
    const next = new Date(Date.UTC(this.data.calendarYear, this.data.calendarMonth - 1 + offset, 1))
    const calendarYear = next.getUTCFullYear()
    const calendarMonth = next.getUTCMonth() + 1
    this.setData({ calendarYear, calendarMonth, calendarDays: createCalendarDays(calendarYear, calendarMonth) })
  },
})
\`\`\`
`;
}

const englishComponentLinks = components
  .map((component) => `- [${component.name}](./${kebab(component.name)}.md) — ${component.category}`)
  .join('\n');
const chineseComponentLinks = components
  .map((component) => `- [${component.name}](./${kebab(component.name)}.md) — ${component.category} 类组件`)
  .join('\n');

await output('docs/components/index.md', `
# cooL UI components

All ${components.length} components follow the shared naming and state contract. SwiftUI, Compose, and ArkUI APIs use the \`Cool\` prefix; WeChat components use the \`cool-\` element prefix.

## API matrix

| Concept | SwiftUI | Compose | ArkUI | WeChat |
| --- | --- | --- | --- | --- |
| Button | \`CoolButton\` | \`CoolButton\` | \`CoolButton\` | \`<cool-button>\` |
| Surface | \`CoolGlassSurface\` | \`CoolGlassSurface\` | \`CoolGlassSurface\` | \`<cool-glass-surface>\` |
| Theme | \`CoolThemeProvider\` | \`CoolTheme\` | \`CoolThemeProvider\` | \`<cool-theme-provider>\` |

## State matrix

Interactive values are controlled and changes are emitted through native platform events.

## Accessibility

Every interactive component exposes an accessibility label, preserves native focus semantics, and uses a minimum platform touch target.

## Component reference

${englishComponentLinks}
`);

await output('docs/zh/components/index.md', `
# cooL UI 组件

全部 ${components.length} 个组件遵循共享的命名和状态契约。SwiftUI、Compose 与 ArkUI API 使用 \`Cool\` 前缀，微信组件使用 \`cool-\` 标签前缀。

## 四端 API 对照

| 规范名 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
| Button | \`CoolButton\` | \`CoolButton\` | \`CoolButton\` | \`<cool-button>\` |
| GlassSurface | \`CoolGlassSurface\` | \`CoolGlassSurface\` | \`CoolGlassSurface\` | \`<cool-glass-surface>\` |
| ThemeProvider | \`CoolThemeProvider\` | \`CoolTheme\` | \`CoolThemeProvider\` | \`<cool-theme-provider>\` |

## 状态矩阵

交互值由调用方控制，变化通过平台原生事件返回。

## 无障碍与可访问性

每个交互组件都提供无障碍标签、保留原生焦点语义，并使用平台最小触控目标。

## 组件参考

${chineseComponentLinks}
`);

for (const component of components) {
  const swiftName = `Cool${componentApiName(component.name)}`;
  const nativeName = `Cool${componentApiName(component.name)}`;
  const tag = `cool-${kebab(component.name)}`;
  const maturity = component.maturity;
  const stateRows = component.interactive
    ? component.states.map((state) => `| ${state} | ${maturity.swiftui} | ${maturity.compose} | ${maturity.arkui} | ${maturity.wechat} |`).join('\n')
    : `| display | ${maturity.swiftui} | ${maturity.compose} | ${maturity.arkui} | ${maturity.wechat} |`;
  if (component.name === 'MonthCalendar') {
    await output('docs/components/month-calendar.md', monthCalendarEnglishDocs(maturity, stateRows));
    await output('docs/zh/components/month-calendar.md', monthCalendarChineseDocs(maturity, stateRows));
    continue;
  }
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

${component.name} 是 ${component.category} 类组件。组件契约统一几何和语义，各端实现保留平台原生行为。

## 四端 API 对照

| SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- |
| \`${swiftName}\` | \`${nativeName}\` | \`${nativeName}\` | \`<${tag}>\` |

成熟度：SwiftUI **${maturity.swiftui}**、Compose **${maturity.compose}**、ArkUI **${maturity.arkui}**、微信小程序 **${maturity.wechat}**。

## 状态矩阵

| 状态 | SwiftUI | Compose | ArkUI | 微信小程序 |
| --- | --- | --- | --- | --- |
${stateRows}

## 无障碍

请提供本地化的无障碍标签。标为 beta 或 planned 的能力仍需完成仓库就绪度矩阵列出的原生平台验证。

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
