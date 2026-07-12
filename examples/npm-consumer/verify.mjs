import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const release = JSON.parse(await readFile(new URL('../../contracts/release.json', root), 'utf8'));
const tokens = JSON.parse(await readFile(new URL('node_modules/@cool-ui/tokens/package.json', root), 'utf8'));
const wechat = JSON.parse(await readFile(new URL('node_modules/@cool-ui/wechat/package.json', root), 'utf8'));
assert.equal(tokens.version, release.version);
assert.equal(wechat.version, release.version);

const generatedTokens = JSON.parse(await readFile(new URL('node_modules/@cool-ui/tokens/generated/tokens.json', root), 'utf8'));
assert.equal(generatedTokens.meta.version.$value, release.version);

const componentManifest = JSON.parse(await readFile(new URL('node_modules/@cool-ui/wechat/component-manifest.json', root), 'utf8'));
assert.equal(Object.keys(componentManifest).length, 43);
assert.equal(componentManifest['cool-month-calendar'], './dist/components/cool-month-calendar/index');

const calendarRoot = 'node_modules/@cool-ui/wechat/dist/components/cool-month-calendar/';
for (const relative of [
  'index.js', 'index.json', 'index.wxml', 'index.wxss',
  'default-day/index.js', 'default-day/index.json', 'default-day/index.wxml', 'default-day/index.wxss',
  'default-marker/index.js', 'default-marker/index.json', 'default-marker/index.wxml', 'default-marker/index.wxss',
]) {
  await access(new URL(`${calendarRoot}${relative}`, root));
}
const calendar = JSON.parse(await readFile(new URL(`${calendarRoot}index.json`, root), 'utf8'));
assert.deepEqual(calendar.componentGenerics, {
  day: { default: './default-day/index' },
  marker: { default: './default-marker/index' },
});

const componentsRoot = 'node_modules/@cool-ui/wechat/dist/components/';
const button = await readFile(new URL(`${componentsRoot}cool-button/index.wxml`, root), 'utf8');
assert.match(button, /<button\b/);
for (const component of ['cool-tab-bar', 'cool-segmented-control']) {
  const source = await readFile(new URL(`${componentsRoot}${component}/index.js`, root), 'utf8');
  assert.match(source, /triggerEvent\('change', \{ value: option\.value, index \}\)/);
  assert.doesNotMatch(source, /setData\(\{\s*value:/);
}
console.log('Verified npm tarballs in a clean local consumer.');
