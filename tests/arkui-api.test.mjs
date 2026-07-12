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

test('ArkUI validator rejects calls to the removed tokenNumber helper', async () => {
  const [core, validator] = await Promise.all([
    read('packages/arkui/src/main/ets/components/CoolCore.ets'),
    read('packages/arkui/scripts/validate.mjs'),
  ]);
  assert.doesNotMatch(core, /\btokenNumber\(/);
  assert.match(validator, /assert\.doesNotMatch\(core,\s*\/\\btokenNumber\\\(/);
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
  assert.match(calendar, /resolveCoolTone\(/);
  assert.match(calendar, /this\.markers\s*=\s*markers\.slice\(0,\s*3\)\.map\([\s\S]*new CoolCalendarMarker/);
  assert.match(calendar, /let selectedMatchFound\s*=\s*false/);
  assert.match(calendar, /const isSelected\s*=\s*hasControlledSelection\s*&&\s*!selectedMatchFound\s*&&\s*model\.date\s*===\s*selectedDate/);
  assert.match(calendar, /if\s*\(isSelected\)\s*selectedMatchFound\s*=\s*true/);
  assert.match(calendar, /marker\.accessibilityLabel[\s\S]*markerToneLabel\(marker\.tone\)/);
  assert.match(calendar, /secondaryText[\s\S]*badge[\s\S]*markers/);
  assert.doesNotMatch(calendar, /if\s*\(model\.accessibilityLabel[^\n]+\)\s*return model\.accessibilityLabel/);
  assert.match(calendar, /class CoolResolvedCalendarDayItem\b[\s\S]*spokenAccessibilityText:\s*string/);
  assert.match(calendar, /const spokenAccessibilityText\s*=\s*resolvedCoolAccessibilityLabel\(model,\s*labels,\s*markers\)/);
  assert.match(calendar, /new CoolCalendarDay\([\s\S]*model\.secondaryText,\s*model\.accessibilityLabel,\s*model\.isToday,\s*isSelected,/);
  assert.match(calendar, /new CoolResolvedCalendarDayItem\(day,\s*`\$\{model\.date\}#\$\{occurrence\}`,\s*spokenAccessibilityText\)/);
  const resolver = calendar.slice(calendar.indexOf('export function resolveCoolCalendarDays'), calendar.indexOf('const COOL_DEFAULT_WEEKDAYS'));
  assert.doesNotMatch(resolver, /model\.isSelected/);
  assert.doesNotMatch(calendar, /model\.(?:date|day|secondaryText|accessibilityLabel|isToday|isSelected|isDisabled|tone|badge|markers)\s*(?<!=)=(?!=)/);
});

test('ArkUI MonthCalendar preserves canonical callback payloads and separates spoken accessibility text', async () => {
  const calendar = await read('packages/arkui/src/main/ets/components/CoolMonthCalendar.ets');
  const defaultMarker = calendar.slice(calendar.indexOf('export function CoolMonthCalendarDefaultMarker'), calendar.indexOf('@Component'));
  const requestSelection = calendar.slice(calendar.indexOf('private requestSelection'), calendar.indexOf('private requestMonthChange'));

  assert.match(calendar, /this\.markers\s*=\s*markers\.slice\(0,\s*3\)\.map\([\s\S]*new CoolCalendarMarker\(marker\.tone,\s*marker\.accessibilityLabel\)/);
  assert.match(requestSelection, /this\.onSelect\(cloneCoolCalendarDay\(day\)\)/);
  assert.doesNotMatch(defaultMarker, /accessibilityText/);
  assert.match(calendar, /\.accessibilityText\(item\.spokenAccessibilityText\)/);
  assert.doesNotMatch(calendar, /\.accessibilityText\(item\.day\.accessibilityLabel/);
});

test('ArkUI MonthCalendar contrast candidates meet WCAG AA for every selected tone', async () => {
  const [calendar, generatedTokens] = await Promise.all([
    read('packages/arkui/src/main/ets/components/CoolMonthCalendar.ets'),
    read('packages/tokens/generated/arkts/CoolTokens.ets'),
  ]);
  const values = new Map([...generatedTokens.matchAll(/^\s+(\w+):\s*"(#[0-9A-F]{8})",$/gm)].map((match) => [match[1], match[2]]));
  const opaque = (argb) => `#FF${argb.slice(3)}`;
  const luminance = (argb) => {
    const channel = (start) => {
      const value = Number.parseInt(argb.slice(start, start + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return (0.2126 * channel(3)) + (0.7152 * channel(5)) + (0.0722 * channel(7));
  };
  const contrast = (foreground, background) => {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };
  const backgrounds = {
    neutral: opaque(values.get('colorLightSurface')),
    accent: opaque(values.get('colorLightAccent')),
    success: opaque(values.get('colorLightSuccess')),
    warning: opaque(values.get('colorLightWarning')),
    danger: opaque(values.get('colorLightDanger')),
  };
  const candidates = [opaque(values.get('colorPrimitiveInk900')), opaque(values.get('colorPrimitiveIce0'))];
  for (const [tone, background] of Object.entries(backgrounds)) {
    assert.ok(Math.max(...candidates.map((foreground) => contrast(foreground, background))) >= 4.5, tone);
  }

  assert.match(calendar, /export function coolRelativeLuminance\(/);
  assert.match(calendar, /export function coolContrastRatio\(/);
  assert.match(calendar, /CoolTokens\.colorPrimitiveInk900[\s\S]*CoolTokens\.colorPrimitiveIce0/);
  assert.match(calendar, /if\s*\(day\.tone\s*===\s*Tone\.neutral\)\s*return coolOpaqueColor\(CoolTokens\.colorLightSurface\)/);
  assert.match(calendar, /function coolDayForeground[\s\S]*if\s*\(day\.isSelected\)\s*return coolSelectedDayForeground\(day\)[\s\S]*return CoolTokens\.colorLightText/);
  assert.doesNotMatch(calendar, /day\.isSelected\s*\?\s*CoolTokens\.colorPrimitiveWhite92/);
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
  assert.match(calendar, /Button\(\)[\s\S]*accessibilityText\(item\.spokenAccessibilityText\)/);
  assert.match(calendar, /accessibilityText\(item\.spokenAccessibilityText\)[\s\S]*accessibilitySelected\(item\.day\.isSelected\)[\s\S]*enabled\(!item\.day\.isDisabled\)/);
  assert.match(calendar, /function coolDayOpacity[\s\S]*if\s*\(day\.isDisabled\)\s*return CoolTokens\.opacityDisabled[\s\S]*return 1/);
  assert.match(calendar, /constraintSize\(\{\s*minWidth:\s*coolTokenNumber\(CoolTokens\.sizeTouchTarget\),\s*minHeight:\s*coolTokenNumber\(CoolTokens\.sizeTouchTarget\)\s*\}\)/);
  assert.match(calendar, /private calendarGridMinimumWidth\(\):\s*number[\s\S]*coolTokenNumber\(CoolTokens\.sizeTouchTarget\)\s*\*\s*7[\s\S]*coolTokenNumber\(CoolTokens\.spaceXs\)\s*\*\s*6/);
  assert.match(calendar, /this\.header\([\s\S]*Scroll\(\)\s*\{\s*Column[\s\S]*this\.resolvedWeekdays\(\)[\s\S]*this\.resolvedDays\(\)[\s\S]*constraintSize\(\{\s*minWidth:\s*this\.calendarGridMinimumWidth\(\)\s*\}\)[\s\S]*scrollable\(ScrollDirection\.Horizontal\)/);
  assert.doesNotMatch(calendar, /\.maxLines\(|\.textOverflow\(/);
  assert.equal((calendar.match(/\.backdropBlur\(/g) ?? []).length, 1);
  assert.doesNotMatch(calendar, /(?:backgroundColor|fontColor|borderColor)\(['"]#/);
  assert.doesNotMatch(calendar, /(?:padding|margin|borderRadius|columnsGap|rowsGap|backdropBlur)\(\s*\d/);

  assert.doesNotMatch(calendar, /\.fontSize\(CoolTokens\./);
  assert.doesNotMatch(calendar, /\.constraintSize\(\{[^}]*:\s*CoolTokens\./);
  assert.doesNotMatch(calendar, /\.(?:columnsGap|rowsGap|padding|width|height)\(CoolTokens\./);
  assert.doesNotMatch(calendar, /\b(?:minWidth|minHeight|width|height|left|right|top|bottom|space):\s*CoolTokens\./);
  const dimensionLines = calendar.split('\n').filter((line) => (
    /\.(?:fontSize|padding|width|height|columnsGap|rowsGap|borderRadius|backdropBlur)\(|\b(?:minWidth|minHeight|width|height|left|right|top|bottom|space):/.test(line)
  ));
  for (const line of dimensionLines) {
    const parsedDimensions = line
      .replaceAll(/coolTokenNumber\(CoolTokens\.\w+\)/g, '')
      .replaceAll(/CoolTokens\.color\w+/g, '');
    assert.doesNotMatch(parsedDimensions, /CoolTokens\./, line.trim());
  }
  for (const parsedUsage of [
    /fontSize\(coolTokenNumber\(CoolTokens\.typographyTitle\)\)/,
    /width\(coolTokenNumber\(CoolTokens\.spaceSm\)\)/,
    /columnsGap\(coolTokenNumber\(CoolTokens\.spaceXs\)\)/,
    /padding\(coolTokenNumber\(CoolTokens\.spaceLg\)\)/,
    /width:\s*item\.day\.isToday\s*\?\s*coolTokenNumber\(CoolTokens\.borderFocus\)\s*:\s*coolTokenNumber\(CoolTokens\.borderHairline\)/,
  ]) {
    assert.match(calendar, parsedUsage);
  }
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
  assert.match(catalog, /@State displayedMonth:\s*string\s*=\s*'2026-07'/);
  assert.match(catalog, /function shiftMonth\(displayedMonth:\s*string,\s*direction:\s*CoolMonthDirection\):\s*string/);
  assert.match(catalog, /createCalendarDays\(displayedMonth:\s*string\):\s*CoolCalendarDay\[\]/);
  assert.match(catalog, /for\s*\(let index = 0; index < 42; index \+= 1\)/);
  assert.match(catalog, /selectedDate:\s*this\.selectedDate/);
  assert.match(catalog, /displayedMonth:\s*this\.displayedMonth/);
  assert.match(catalog, /days:\s*createCalendarDays\(this\.displayedMonth\)/);
  assert.doesNotMatch(catalog, /displayedMonth:\s*'2026-07'|days:\s*createCalendarDays\('2026-07'\)/);
  assert.match(catalog, /onSelect:\s*\(day:\s*CoolCalendarDay\)/);
  assert.match(catalog, /this\.selectedDate\s*=\s*day\.date/);
  assert.match(catalog, /onMonthChange:[\s\S]*CoolMonthDirection[\s\S]*this\.displayedMonth\s*=\s*shiftMonth\(this\.displayedMonth,\s*direction\)/);
  assert.match(catalog, /new Date\(Date\.UTC\([\s\S]*getUTCDay\(\)[\s\S]*getUTCDate\(\)/);
  for (const fixture of ['A deliberately long secondary', "'2026-07-05'", "'2026-07-12'", "'2026-07-20'", 'Release ready']) {
    assert.match(catalog, new RegExp(fixture));
  }

  const fixtureDates = (displayedMonth) => {
    const [year, month] = displayedMonth.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1, 1 - first.getUTCDay() + index));
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    });
  };
  for (const month of ['2026-06', '2026-07', '2026-08']) {
    const dates = fixtureDates(month);
    assert.equal(dates.length, 42);
    assert.ok(dates.every(Boolean));
  }
});

test('ArkUI package validator accepts the native MonthCalendar source', () => {
  const output = execFileSync(
    process.execPath,
    ['packages/arkui/scripts/validate.mjs'],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8', stdio: 'pipe' },
  );
  assert.match(output, /ArkUI source validation passed/);
  assert.doesNotMatch(output, /build (?:passed|succeeded|successful)/i);
});

test('HarmonyOS CI performs and uploads a real Catalog HAP build after the HAR', async () => {
  const [workflow, appHvigor, entryHvigor, appProfile, entryProfile, appConfig, entryPackage] = await Promise.all([
    read('.github/workflows/harmony.yml'),
    read('apps/catalog-arkui/hvigorfile.ts'),
    read('apps/catalog-arkui/entry/hvigorfile.ts'),
    read('apps/catalog-arkui/build-profile.json5'),
    read('apps/catalog-arkui/entry/build-profile.json5'),
    read('apps/catalog-arkui/AppScope/app.json5'),
    read('apps/catalog-arkui/entry/oh-package.json5'),
  ]);

  assert.match(appHvigor, /appTasks/);
  assert.match(entryHvigor, /hapTasks/);
  assert.match(appProfile, /"name"\s*:\s*"entry"[\s\S]*"srcPath"\s*:\s*"\.\/entry"/);
  assert.match(entryProfile, /"apiType"\s*:\s*"stageMode"[\s\S]*"name"\s*:\s*"default"/);
  assert.match(appConfig, /"bundleName"\s*:\s*"dev\.coolui\.catalog"/);
  assert.match(entryPackage, /"@cool-ui\/arkui"\s*:\s*"file:\.\.\/\.\.\/\.\.\/packages\/arkui"/);
  const harIndex = workflow.indexOf('name: Build HAR');
  const hapIndex = workflow.indexOf('name: Build Catalog HAP');
  assert.ok(harIndex >= 0 && hapIndex > harIndex);
  const hapWorkflow = workflow.slice(hapIndex);
  assert.match(hapWorkflow, /working-directory:\s*apps\/catalog-arkui/);
  assert.match(hapWorkflow, /run:\s*hvigorw assembleHap --mode module -p product=default/);
  assert.match(hapWorkflow, /name:\s*coolui-arkui-catalog-hap/);
  assert.match(hapWorkflow, /path:\s*apps\/catalog-arkui\/entry\/build\/\*\*\/outputs\/\*\*\/\*\.hap/);
});
