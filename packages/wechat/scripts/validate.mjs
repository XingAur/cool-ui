import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('component-manifest.json', root), 'utf8'));
assert.equal(Object.keys(manifest).length, 42);
for (const tag of Object.keys(manifest)) {
  for (const extension of ['js', 'json', 'wxml', 'wxss']) await access(new URL(`src/components/${tag}/index.${extension}`, root));
}
console.log(`Validated ${Object.keys(manifest).length} WeChat components.`);
