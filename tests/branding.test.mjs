import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('publishing units use the cooL UI brand', async () => {
  const contract = JSON.parse(await read('contracts/components.json'));
  assert.deepEqual(contract.packages, {
    tokens: '@cool-ui/tokens',
    wechat: '@cool-ui/wechat',
    swift: 'CoolUI',
    android: 'dev.coolui:coolui-compose',
    harmony: '@cool-ui/arkui',
  });
  assert.ok(contract.components.some(({ name }) => name === 'Backdrop'));
  assert.ok(!contract.components.some(({ name }) => name === 'FluidBackdrop'));
});

test('tracked product sources and paths contain no legacy brand identifiers', async () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: new URL('.', root), encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  const legacyProduct = ['Fluid', 'Pane'].join('');
  const legacyKebab = ['fluid', 'pane'].join('-');
  const legacyShort = ['F', 'P'].join('');
  const legacyTag = legacyShort.toLowerCase();
  const forbiddenContent = [
    new RegExp(legacyProduct, 'i'),
    new RegExp(legacyKebab, 'i'),
    new RegExp(`@${legacyProduct.toLowerCase()}`, 'i'),
    new RegExp(`\\b${legacyShort}(?:[A-Z]|\\b)`),
    new RegExp(`--${legacyTag}-`),
    new RegExp(`\\.${legacyTag}-`),
    new RegExp(`<${legacyTag}-`),
  ];
  const forbiddenPath = new RegExp(`(?:${legacyProduct}|${legacyKebab}|\\b${legacyTag}-)`, 'i');
  for (const path of files) {
    try { await access(new URL(path, root)); } catch { continue; }
    assert.doesNotMatch(path, forbiddenPath, path);
    const content = await read(path);
    for (const pattern of forbiddenContent) assert.doesNotMatch(content, pattern, `${path}: ${pattern}`);
  }
});
