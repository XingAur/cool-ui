import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('Compose exposes type-safe controlled inputs and actions', async () => {
  const files = await readdir(new URL('packages/android/src/main/kotlin/dev/coolui/compose/', root));
  const source = (await Promise.all(files.filter((file) => file.endsWith('.kt')).map((file) => read(`packages/android/src/main/kotlin/dev/coolui/compose/${file}`)))).join('\n');
  assert.match(source, /fun CoolButton\([\s\S]*onClick: \(\) -> Unit/);
  assert.match(source, /fun CoolTextField\([\s\S]*value: String[\s\S]*onValueChange: \(String\) -> Unit/);
  assert.match(source, /fun CoolToggle\([\s\S]*checked: Boolean[\s\S]*onCheckedChange: \(Boolean\) -> Unit/);
  assert.match(source, /fun <T> CoolSelect\([\s\S]*selected: T/);
  assert.match(source, /fun CoolDatePicker\([\s\S]*value: LocalDate/);
  assert.doesNotMatch(source, /fun CoolGeneratedComponent/);
});

test('Compose uses native navigation and presentation primitives', async () => {
  const files = await readdir(new URL('packages/android/src/main/kotlin/dev/coolui/compose/', root));
  const source = (await Promise.all(files.filter((file) => file.endsWith('.kt')).map((file) => read(`packages/android/src/main/kotlin/dev/coolui/compose/${file}`)))).join('\n');
  for (const primitive of ['NavigationBar', 'NavigationRail', 'TabRow', 'AlertDialog', 'ModalBottomSheet', 'TooltipBox']) {
    assert.match(source, new RegExp(`\\b${primitive}\\b`), primitive);
  }
  assert.doesNotMatch(source, /\.fluidGlass\(material\)/, 'glass surface must not blur its own content');
  assert.doesNotMatch(source, /graphicsLayer\s*\{[\s\S]{0,500}LocalCoolTheme\.current/, 'composition locals must be resolved before draw lambdas');
});

test('Compose Catalog exercises public components instead of a string renderer', async () => {
  const catalog = await read('apps/catalog-android/src/main/kotlin/dev/coolui/catalog/MainActivity.kt');
  assert.doesNotMatch(catalog, /CoolGeneratedComponent|CoolComponentProps/);
  for (const component of ['CoolButton', 'CoolTextField', 'CoolToggle', 'CoolBottomNavigation', 'CoolCard', 'CoolAlertDialog']) {
    assert.match(catalog, new RegExp(`\\b${component}\\b`), component);
  }
});

test('Compose MonthCalendar exposes controlled typed models and native grid composition', async () => {
  const calendar = await read('packages/android/src/main/kotlin/dev/coolui/compose/CoolMonthCalendar.kt');
  assert.match(calendar, /enum class CoolMonthDirection\s*\{\s*Previous,\s*Next\s*\}/);
  assert.match(calendar, /data class CoolCalendarMarker\([\s\S]*tone: Tone[\s\S]*accessibilityLabel: String\?/);
  assert.match(calendar, /data class CoolCalendarDay\([\s\S]*date: LocalDate[\s\S]*isSelected: Boolean[\s\S]*markers: List<CoolCalendarMarker>/);
  assert.match(calendar, /visibleMarkers[\s\S]*markers\.take\(3\)/);
  assert.match(calendar, /fun resolved\([\s\S]*selectedDate: LocalDate[\s\S]*copy\([\s\S]*isSelected = date == selectedDate/);
  assert.match(calendar, /fun CoolMonthCalendar\([\s\S]*selectedDate: LocalDate[\s\S]*displayedMonth: YearMonth[\s\S]*days: List<CoolCalendarDay>/);
  assert.match(calendar, /weekdays: List<String>/);
  assert.match(calendar, /onDaySelected: \(CoolCalendarDay\) -> Unit/);
  assert.match(calendar, /onMonthChange: \(CoolMonthDirection\) -> Unit/);
  assert.match(calendar, /header: \(@Composable \(YearMonth, \(CoolMonthDirection\) -> Unit\) -> Unit\)\?/);
  assert.match(calendar, /dayContent: \(@Composable \(CoolCalendarDay\) -> Unit\)\?/);
  assert.match(calendar, /markerContent: \(@Composable \(CoolCalendarMarker\) -> Unit\)\?/);
  assert.match(calendar, /\bCoolGlassSurface\b/);
  assert.match(calendar, /\bLazyVerticalGrid\b/);
  assert.match(calendar, /GridCells\.Fixed\(7\)/);
  assert.match(calendar, /DateTimeFormatter[\s\S]*Locale/);
  assert.match(calendar, /sizeIn\([\s\S]*minWidth\s*=\s*48\.dp[\s\S]*minHeight\s*=\s*48\.dp/);
  assert.match(calendar, /itemsIndexed\([\s\S]*key\s*=\s*\{\s*index,\s*day\s*->[\s\S]*day\.date[\s\S]*index/);
  assert.doesNotMatch(calendar, /RenderEffect|\.blur\s*\(/);
  assert.doesNotMatch(calendar, /remember\s*\{\s*mutableStateOf\s*\(\s*(?:selectedDate|displayedMonth)/);
});

test('Compose MonthCalendar accessibility is injectable and Catalog owns its calendar state', async () => {
  const calendar = await read('packages/android/src/main/kotlin/dev/coolui/compose/CoolMonthCalendar.kt');
  const catalog = await read('apps/catalog-android/src/main/kotlin/dev/coolui/catalog/MainActivity.kt');
  for (const label of ['previousMonth', 'nextMonth', 'today', 'markerToneLabel']) {
    assert.match(calendar, new RegExp(`\\b${label}\\b`), label);
  }
  assert.match(calendar, /resolvedAccessibilityLabel[\s\S]*secondaryText[\s\S]*badge[\s\S]*markers/);
  assert.match(calendar, /weekdays\.size == 7/);
  assert.match(catalog, /\bCoolMonthCalendar\b/);
  assert.match(catalog, /Array\(42\)|List\(42\)/);
  assert.match(catalog, /YearMonth/);
  assert.match(catalog, /displayedMonth[\s\S]*plusMonths|plusMonths[\s\S]*displayedMonth/);
  assert.match(catalog, /selectedDate/);
  assert.match(catalog, /markers\s*=\s*if[\s\S]*listOf\([\s\S]*CoolCalendarMarker/);
});

test('Compose MonthCalendar routes custom day and marker slots independently', async () => {
  const calendar = await read('packages/android/src/main/kotlin/dev/coolui/compose/CoolMonthCalendar.kt');
  const dayButton = calendar.match(/private fun CoolMonthCalendarDayButton\([\s\S]*?(?=\n@Composable\s*\nprivate fun DefaultCoolMonthCalendarDay)/)?.[0];
  assert.ok(dayButton, 'day button implementation');
  assert.match(
    dayButton,
    /\)\s*\{\s*Column\([\s\S]*?\)\s*\{\s*if \(dayContent == null\)\s*\{\s*DefaultCoolMonthCalendarDay\(day\)\s*\}\s*else\s*\{\s*dayContent\(day\)\s*\}\s*if \(day\.visibleMarkers\.isNotEmpty\(\)\)\s*\{\s*CoolMonthCalendarMarkerRow\(day\.visibleMarkers, markerContent\)/,
  );
  assert.match(calendar, /private fun DefaultCoolMonthCalendarDay\(\s*day: CoolCalendarDay,?\s*\)/);
  assert.match(calendar, /private fun CoolMonthCalendarMarkerRow\([\s\S]*markers: List<CoolCalendarMarker>[\s\S]*markerContent:/);
});

test('Compose MonthCalendar uses locale-natural month order and one day semantics node', async () => {
  const calendar = await read('packages/android/src/main/kotlin/dev/coolui/compose/CoolMonthCalendar.kt');
  assert.match(calendar, /DateTimePatternGenerator\.getInstance\(locale\)\.getBestPattern\("yMMMM"\)/);
  assert.match(calendar, /DateTimeFormatter\.ofPattern\(monthPattern, locale\)/);
  assert.doesNotMatch(calendar, /"LLLL yyyy"/);
  assert.match(calendar, /Modifier\.clearAndSetSemantics\s*\{[\s\S]*contentDescription = day\.resolvedAccessibilityLabel\(labels\)[\s\S]*selected = day\.isSelected[\s\S]*disabled\(\)/);
  const markerRow = calendar.match(/private fun CoolMonthCalendarMarkerRow\([\s\S]*?(?=\n@Composable|$)/)?.[0];
  assert.ok(markerRow, 'marker row implementation');
  assert.doesNotMatch(markerRow, /contentDescription|semantics/, 'marker visuals must not duplicate parent day semantics');
});

test('Android plugin versions are resolved by settings for standalone and Catalog builds', async () => {
  const librarySettings = await read('packages/android/settings.gradle.kts');
  const libraryBuild = await read('packages/android/build.gradle.kts');
  const catalogSettings = await read('apps/catalog-android/settings.gradle.kts');
  const catalogBuild = await read('apps/catalog-android/build.gradle.kts');
  for (const settings of [librarySettings, catalogSettings]) {
    assert.match(settings, /pluginManagement\s*\{[\s\S]*plugins\s*\{/);
    assert.match(settings, /id\("com\.android\.(?:library|application)"\) version "9\.2\.0"/);
    assert.match(settings, /id\("org\.jetbrains\.kotlin\.plugin\.compose"\) version "2\.3\.21"/);
  }
  for (const build of [libraryBuild, catalogBuild]) {
    assert.doesNotMatch(build, /id\("(?:com\.android\.(?:library|application)|org\.jetbrains\.kotlin\.plugin\.compose)"\) version/);
  }
});
