import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('component-manifest.json', root), 'utf8'));
const contract = JSON.parse(await readFile(new URL('../../contracts/components.json', root), 'utf8'));
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

assert.equal(Object.keys(manifest).length, contract.components.length);
for (const component of contract.components) {
  const tag = `cool-${kebab(component.name)}`;
  assert.equal(manifest[tag], `./dist/components/${tag}/index`, component.name);
  for (const extension of ['js', 'json', 'wxml', 'wxss']) await access(new URL(`src/components/${tag}/index.${extension}`, root));
}
for (const generic of ['default-day', 'default-marker']) {
  for (const extension of ['js', 'json', 'wxml', 'wxss']) {
    await access(new URL(`src/components/cool-month-calendar/${generic}/index.${extension}`, root));
  }
}
console.log(`Validated ${Object.keys(manifest).length} WeChat components.`);
