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
});

test('Compose Catalog exercises public components instead of a string renderer', async () => {
  const catalog = await read('apps/catalog-android/src/main/kotlin/dev/coolui/catalog/MainActivity.kt');
  assert.doesNotMatch(catalog, /CoolGeneratedComponent|CoolComponentProps/);
  for (const component of ['CoolButton', 'CoolTextField', 'CoolToggle', 'CoolBottomNavigation', 'CoolCard', 'CoolAlertDialog']) {
    assert.match(catalog, new RegExp(`\\b${component}\\b`), component);
  }
});
