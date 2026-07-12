import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const artifacts = resolve(root, 'artifacts');

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...await files(path));
    else if (entry.name !== 'SHA256SUMS' && entry.name !== 'native-validation.json') output.push(path);
  }
  return output;
}

const lines = [];
for (const path of (await files(artifacts)).sort()) {
  const digest = createHash('sha256').update(await readFile(path)).digest('hex');
  lines.push(`${digest}  ${relative(artifacts, path).replaceAll('\\', '/')}`);
}
await writeFile(resolve(artifacts, 'SHA256SUMS'), `${lines.join('\n')}\n`, 'utf8');
