import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
if (release.publicRegistryPublishing === false) {
  console.error('Public publishing refused: contracts/release.json sets publicRegistryPublishing=false.');
  process.exit(1);
}
if (release.publicRegistryPublishing !== true) {
  console.error('Public publishing refused: publicRegistryPublishing must be explicitly true.');
  process.exit(1);
}
console.log(`Public publishing is explicitly enabled for ${release.version}.`);
