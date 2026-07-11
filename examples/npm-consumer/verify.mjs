import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const release = JSON.parse(await readFile(new URL('../../contracts/release.json', root), 'utf8'));
const tokens = JSON.parse(await readFile(new URL('node_modules/@cool-ui/tokens/package.json', root), 'utf8'));
const wechat = JSON.parse(await readFile(new URL('node_modules/@cool-ui/wechat/package.json', root), 'utf8'));
assert.equal(tokens.version, release.version);
assert.equal(wechat.version, release.version);
await access(new URL('node_modules/@cool-ui/wechat/dist/components/cool-button/index.js', root));
await access(new URL('node_modules/@cool-ui/tokens/generated/swift/CoolTokens.swift', root));
console.log('Verified npm tarballs in a clean local consumer.');
