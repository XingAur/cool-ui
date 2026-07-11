import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const tokens = JSON.parse(await readFile(new URL('node_modules/@cool-ui/tokens/package.json', root), 'utf8'));
const wechat = JSON.parse(await readFile(new URL('node_modules/@cool-ui/wechat/package.json', root), 'utf8'));
assert.equal(tokens.version, '0.1.0');
assert.equal(wechat.version, '0.1.0');
await access(new URL('node_modules/@cool-ui/wechat/dist/components/cool-button/index.js', root));
await access(new URL('node_modules/@cool-ui/tokens/generated/swift/CoolTokens.swift', root));
console.log('Verified npm tarballs in a clean local consumer.');
