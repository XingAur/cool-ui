import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
export const release = JSON.parse(await readFile(new URL('contracts/release.json', root), 'utf8'));
export const releaseVersion = release.version;
