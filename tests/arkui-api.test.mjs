import assert from 'node:assert/strict';
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
