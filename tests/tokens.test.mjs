import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const sourceUrl = new URL('packages/tokens/src/tokens.json', root);

function walk(node, path = [], values = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const next = [...path, key];
    if (value && typeof value === 'object' && '$value' in value) values.set(next.join('.'), value.$value);
    else if (value && typeof value === 'object') walk(value, next, values);
  }
  return values;
}

test('DTCG source covers every visual token family and accessibility mode', async () => {
  const tokens = JSON.parse(await readFile(sourceUrl, 'utf8'));
  for (const family of ['color', 'typography', 'space', 'radius', 'size', 'border', 'blur', 'saturation', 'lighting', 'shadow', 'motion']) {
    assert.ok(tokens[family], `missing ${family}`);
  }
  for (const mode of ['light', 'dark', 'highContrast', 'reducedMotion', 'reducedTransparency']) {
    assert.ok(tokens.modes[mode], `missing ${mode}`);
  }
});

test('all DTCG aliases resolve to a declared token', async () => {
  const tokens = JSON.parse(await readFile(sourceUrl, 'utf8'));
  const values = walk(tokens);
  for (const [name, value] of values) {
    if (typeof value !== 'string') continue;
    for (const match of value.matchAll(/\{([^}]+)\}/g)) {
      assert.ok(values.has(match[1]), `${name} references missing ${match[1]}`);
    }
  }
});

test('generator emits stable artifacts for all four platforms and CSS', async () => {
  for (const file of [
    'packages/tokens/generated/swift/CoolTokens.swift',
    'packages/tokens/generated/kotlin/CoolTokens.kt',
    'packages/tokens/generated/arkts/CoolTokens.ets',
    'packages/tokens/generated/wechat/cool-ui-tokens.wxss',
    'packages/tokens/generated/css/cool-ui-tokens.css',
  ]) await access(new URL(file, root));

  const manifest = JSON.parse(await readFile(new URL('packages/tokens/generated/manifest.json', root), 'utf8'));
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.source, 'src/tokens.json');
  assert.equal(Object.keys(manifest.outputs).length, 5);
});
