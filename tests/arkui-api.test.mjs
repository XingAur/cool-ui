import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('ArkUI generated APIs select native primitives at generation time', async () => {
  const source = await read('packages/arkui/src/main/ets/components/GeneratedComponents.ets');
  assert.doesNotMatch(source, /CoolGeneratedComponent\(\{\s*name:/);
  for (const primitive of ['TextInput', 'TextArea', 'Toggle', 'Checkbox', 'Slider', 'DatePicker', 'TimePicker', 'Progress']) {
    assert.match(source, new RegExp(`\\b${primitive}\\b`), primitive);
  }
});

test('ArkUI Catalog does not render every entry as a button', async () => {
  const catalog = await read('apps/catalog-arkui/entry/src/main/ets/pages/Index.ets');
  for (const component of ['CoolButton', 'CoolTextField', 'CoolToggle', 'CoolSlider', 'CoolCard']) {
    assert.match(catalog, new RegExp(`\\b${component}\\b`), component);
  }
  assert.doesNotMatch(catalog, /ForEach\([\s\S]*CoolButton/);
});

test('ArkUI exposes native serializable MonthCalendar models and pure resolvers', async () => {
  const calendar = await read('packages/arkui/src/main/ets/components/CoolMonthCalendar.ets');

  assert.match(calendar, /export enum CoolMonthDirection\s*\{[\s\S]*previous\s*=\s*'previous'[\s\S]*next\s*=\s*'next'/);
  assert.match(calendar, /export class CoolCalendarMarker\b[\s\S]*tone:\s*Tone[\s\S]*accessibilityLabel\?:\s*string/);
  assert.match(calendar, /export class CoolCalendarDay\b[\s\S]*date:\s*string[\s\S]*day:\s*number[\s\S]*secondaryText\?:\s*string[\s\S]*accessibilityLabel\?:\s*string[\s\S]*isToday:\s*boolean[\s\S]*isSelected:\s*boolean[\s\S]*isDisabled:\s*boolean[\s\S]*tone:\s*Tone[\s\S]*badge\?:\s*string[\s\S]*markers:\s*CoolCalendarMarker\[\]/);
  for (const helper of ['isCoolGregorianDate', 'isCoolGregorianLeapYear', 'daysInCoolGregorianMonth']) {
    assert.match(calendar, new RegExp(`export function ${helper}\\b`));
  }
  assert.match(calendar, /function isCoolDateDigit\b/);
  assert.match(calendar, /for\s*\(let index = 0; index < value\.length; index \+= 1\)[\s\S]*isCoolDateDigit/);
  assert.match(calendar, /export function resolveCoolCalendarDays\b/);
  assert.match(calendar, /gregorianDay\s*!==\s*model\.day/);
  assert.match(calendar, /\.slice\(0,\s*3\)/);
  assert.match(calendar, /resolveCoolTone\(/);
  assert.match(calendar, /hasControlledSelection\s*\?\s*model\.date\s*===\s*selectedDate\s*:\s*model\.isSelected/);
  assert.match(calendar, /marker\.accessibilityLabel[\s\S]*markerToneLabel\(marker\.tone\)/);
  assert.match(calendar, /secondaryText[\s\S]*badge[\s\S]*markers/);
  assert.doesNotMatch(calendar, /if\s*\(model\.accessibilityLabel[^\n]+\)\s*return model\.accessibilityLabel/);
  assert.match(calendar, /new CoolCalendarDay\(/);
  assert.match(calendar, /model\.markers\.slice\(0,\s*3\)\.map\([\s\S]*new CoolCalendarMarker/);
  assert.doesNotMatch(calendar, /model\.(?:date|day|secondaryText|accessibilityLabel|isToday|isSelected|isDisabled|tone|badge|markers)\s*(?<!=)=(?!=)/);
});

test('ArkUI MonthCalendar is strictly controlled and validates emitted requests', async () => {
  const calendar = await read('packages/arkui/src/main/ets/components/CoolMonthCalendar.ets');
  const component = calendar.slice(calendar.indexOf('@Component\nexport struct CoolMonthCalendar'));

  assert.match(calendar, /@Component\s+export struct CoolMonthCalendar\b/);
  assert.match(calendar, /@Prop selectedDate:\s*string/);
  assert.match(calendar, /@Prop displayedMonth:\s*string/);
  assert.match(calendar, /@Prop days:\s*CoolCalendarDay\[\]/);
  assert.match(calendar, /@Prop weekdays:\s*string\[\]/);
  assert.match(calendar, /onSelect:\s*\(day:\s*CoolCalendarDay\)\s*=>\s*void/);
  assert.match(calendar, /onMonthChange:\s*\(direction:\s*CoolMonthDirection\)\s*=>\s*void/);
  assert.match(calendar, /if\s*\(day\.isDisabled\)\s*return/);
  assert.match(calendar, /direction\s*!==\s*CoolMonthDirection\.previous\s*&&\s*direction\s*!==\s*CoolMonthDirection\.next/);
  assert.doesNotMatch(component, /@State\b/);
  assert.doesNotMatch(component, /new Date\(|setMonth|getMonth|plusMonths|minusMonths/);
  assert.doesNotMatch(component, /this\.(?:selectedDate|displayedMonth)\s*(?<!=)=(?!=)/);
});

test('ArkUI MonthCalendar uses typed defaultable slots and a single token-driven glass layer', async () => {
  const calendar = await read('packages/arkui/src/main/ets/components/CoolMonthCalendar.ets');

  assert.match(calendar, /export class CoolMonthCalendarHeaderContext\b[\s\S]*displayedMonth:\s*string[\s\S]*requestMonthChange:\s*\(direction:\s*CoolMonthDirection\)\s*=>\s*void/);
  assert.match(calendar, /@Builder\s+export function CoolMonthCalendarDefaultHeader\(/);
  assert.match(calendar, /@Builder\s+export function CoolMonthCalendarDefaultDay\(/);
  assert.match(calendar, /@Builder\s+export function CoolMonthCalendarDefaultMarker\(/);
  assert.match(calendar, /@BuilderParam header:\s*\(context:\s*CoolMonthCalendarHeaderContext\)\s*=>\s*void\s*=\s*CoolMonthCalendarDefaultHeader/);
  assert.match(calendar, /@BuilderParam day:\s*\(day:\s*CoolCalendarDay\)\s*=>\s*void\s*=\s*CoolMonthCalendarDefaultDay/);
  assert.match(calendar, /@BuilderParam marker:\s*\(marker:\s*CoolCalendarMarker\)\s*=>\s*void\s*=\s*CoolMonthCalendarDefaultMarker/);
  assert.equal((calendar.match(/this\.header\(/g) ?? []).length, 1);
  assert.equal((calendar.match(/this\.day\(/g) ?? []).length, 1);
  assert.equal((calendar.match(/this\.marker\(/g) ?? []).length, 1);
  assert.match(calendar, /Grid\(\)[\s\S]*columnsTemplate\([^\n]*1fr[^\n]*1fr[^\n]*1fr[^\n]*1fr[^\n]*1fr[^\n]*1fr[^\n]*1fr/);
  assert.match(calendar, /ForEach\(this\.resolvedDays\(\),[\s\S]*item\.key/);
  assert.match(calendar, /resolvedWeekdays\(\)[\s\S]*length\s*===\s*7/);
  assert.match(calendar, /Button\(\)[\s\S]*accessibilityText\(item\.day\.accessibilityLabel/);
  assert.match(calendar, /constraintSize\(\{\s*minHeight:\s*CoolTokens\.sizeTouchTarget/);
  assert.doesNotMatch(calendar, /\.maxLines\(|\.textOverflow\(/);
  assert.equal((calendar.match(/\.backdropBlur\(/g) ?? []).length, 1);
  assert.doesNotMatch(calendar, /(?:backgroundColor|fontColor|borderColor)\(['"]#/);
  assert.doesNotMatch(calendar, /(?:padding|margin|borderRadius|columnsGap|rowsGap|backdropBlur)\(\s*\d/);
});

test('ArkUI native generation, exports, validation, and Catalog fixture stay integrated', async () => {
  const [capabilities, generator, generated, index, validator, catalog] = await Promise.all([
    read('contracts/component-capabilities.json'),
    read('scripts/generate-components.mjs'),
    read('packages/arkui/src/main/ets/components/GeneratedComponents.ets'),
    read('packages/arkui/Index.ets'),
    read('packages/arkui/scripts/validate.mjs'),
    read('apps/catalog-arkui/entry/src/main/ets/pages/Index.ets'),
  ]);

  assert.match(capabilities, /"MonthCalendar"\s*:\s*\{[\s\S]*"arkui"\s*:\s*"native"/);
  assert.match(generator, /generationMode\(name, 'arkui'\)\s*===\s*'generated'/);
  assert.match(generated, /"MonthCalendar"/);
  assert.doesNotMatch(generated, /export struct CoolMonthCalendar\b/);
  assert.match(index, /export \* from ['"]\.\/src\/main\/ets\/components\/CoolMonthCalendar['"]/);
  assert.match(validator, /const fileName = `\$\{api\}\.ets`/);
  assert.match(validator, /mode\s*===\s*'native'[\s\S]*assert\.doesNotMatch\(generated/);
  assert.match(catalog, /\bCoolMonthCalendar\b/);
  assert.match(catalog, /@State selectedDate:\s*string/);
  assert.match(catalog, /createCalendarDays\(displayedMonth:\s*string\):\s*CoolCalendarDay\[\]/);
  assert.match(catalog, /for\s*\(let index = 0; index < 42; index \+= 1\)/);
  assert.match(catalog, /selectedDate:\s*this\.selectedDate/);
  assert.match(catalog, /onSelect:\s*\(day:\s*CoolCalendarDay\)/);
  assert.match(catalog, /this\.selectedDate\s*=\s*day\.date/);
  assert.match(catalog, /onMonthChange:[\s\S]*CoolMonthDirection/);
  for (const fixture of ['A deliberately long secondary', "'2026-07-05'", "'2026-07-12'", "'2026-07-20'", 'Release ready']) {
    assert.match(catalog, new RegExp(fixture));
  }
});

test('ArkUI package validator accepts the native MonthCalendar source', () => {
  assert.doesNotThrow(() => execFileSync(
    process.execPath,
    ['packages/arkui/scripts/validate.mjs'],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8', stdio: 'pipe' },
  ));
});
