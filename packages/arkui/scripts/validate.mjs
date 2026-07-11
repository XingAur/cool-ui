import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('../../contracts/components.json', root), 'utf8'));
const capabilities = JSON.parse(await readFile(new URL('../../contracts/component-capabilities.json', root), 'utf8'));
const generated = await readFile(new URL('src/main/ets/components/GeneratedComponents.ets', root), 'utf8');
for (const { name } of contract.components) {
  const api = `Cool${name.replace(/^Fluid/, '')}`;
  assert.match(generated, new RegExp(`"${name}"`), `${name} registry`);
  if (capabilities.generationModes?.[name]?.arkui === 'registryOnly') {
    assert.doesNotMatch(generated, new RegExp(`export struct ${api}\\b`), api);
  } else {
    assert.match(generated, new RegExp(`export struct ${api}\\b`), api);
  }
}
await access(new URL('src/main/module.json5', root));
await access(new URL('Index.ets', root));
console.log(`Validated ${contract.components.length} ArkUI component registrations.`);
