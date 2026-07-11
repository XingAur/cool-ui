import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('all component tags are generated', async () => {
  const manifest = JSON.parse(await readFile(new URL('component-manifest.json', root), 'utf8'));
  assert.equal(Object.keys(manifest).length, 42);
  assert.equal(manifest['cool-button'], './dist/components/cool-button/index');
});

test('shared behavior exposes controlled events and accessibility state inputs', async () => {
  const source = await readFile(new URL('src/behaviors/cool-ui.js', root), 'utf8');
  for (const property of ['themeMode', 'material', 'tone', 'size', 'contrastMode', 'motionMode', 'transparencyMode', 'accessibilityLabel']) {
    assert.match(source, new RegExp(`${property}:`));
  }
  assert.match(source, /triggerEvent\('change'/);
  assert.doesNotMatch(source, /setData\(\{\s*value:/);
});
