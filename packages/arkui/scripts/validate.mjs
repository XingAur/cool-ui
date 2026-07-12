import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(await readFile(new URL('../../contracts/components.json', root), 'utf8'));
const capabilities = JSON.parse(await readFile(new URL('../../contracts/component-capabilities.json', root), 'utf8'));
const generated = await readFile(new URL('src/main/ets/components/GeneratedComponents.ets', root), 'utf8');
const core = await readFile(new URL('src/main/ets/components/CoolCore.ets', root), 'utf8');
const index = await readFile(new URL('Index.ets', root), 'utf8');
assert.doesNotMatch(core, /\btokenNumber\(/, 'undefined legacy tokenNumber helper');
for (const { name } of contract.components) {
  const api = `Cool${name.replace(/^Fluid/, '')}`;
  assert.match(generated, new RegExp(`"${name}"`), `${name} registry`);
  const mode = capabilities.generationModes?.[name]?.arkui ?? 'generated';
  if (mode === 'native') {
    const fileName = `${api}.ets`;
    const native = await readFile(new URL(`src/main/ets/components/${fileName}`, root), 'utf8');
    assert.match(native, new RegExp(`export struct ${api}\\b`), `${api} native source`);
    assert.match(index, new RegExp(`components/${api}['"]`), `${api} export`);
    assert.doesNotMatch(generated, new RegExp(`export struct ${api}\\b`), `${api} duplicate`);
  } else if (mode === 'registryOnly') {
    assert.doesNotMatch(generated, new RegExp(`export struct ${api}\\b`), api);
  } else {
    assert.match(generated, new RegExp(`export struct ${api}\\b`), api);
  }
}
await access(new URL('src/main/module.json5', root));
console.log(`Validated ${contract.components.length} ArkUI component registrations.`);
