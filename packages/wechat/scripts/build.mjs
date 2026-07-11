import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
await cp(new URL('src/', root), new URL('dist/', root), { recursive: true, force: true });
const manifest = JSON.parse(await readFile(new URL('component-manifest.json', root), 'utf8'));
await writeFile(new URL('dist/index.js', root), `module.exports = ${JSON.stringify(manifest, null, 2)};\n`, 'utf8');
await writeFile(new URL('dist/index.json', root), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Built ${Object.keys(manifest).length} WeChat components.`);
