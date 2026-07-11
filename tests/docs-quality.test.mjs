import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const mojibake = /鏄|灞|锛|鈥|寰俊|€|鈭/;

test('English and Chinese entry points contain no encoding corruption', async () => {
  for (const path of ['README.md', 'README.zh-CN.md']) assert.doesNotMatch(await read(path), mojibake, path);
  for (const file of await readdir(new URL('docs/zh/components/', root))) {
    assert.doesNotMatch(await read(`docs/zh/components/${file}`), mojibake, file);
  }
});

test('component docs report contract maturity instead of unconditional support', async () => {
  const contract = JSON.parse(await read('contracts/components.json'));
  for (const component of contract.components) {
    const file = component.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const english = await read(`docs/components/${file}.md`);
    const chinese = await read(`docs/zh/components/${file}.md`);
    for (const platform of ['swiftui', 'compose', 'arkui', 'wechat']) {
      assert.match(english, new RegExp(`\\b${component.maturity[platform]}\\b`, 'i'), `${component.name} ${platform}`);
      assert.match(chinese, new RegExp(`\\b${component.maturity[platform]}\\b`, 'i'), `${component.name} ${platform} zh`);
    }
  }
});
