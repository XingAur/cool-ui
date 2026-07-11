import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('../../contracts/components.json', root), 'utf8'));

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
