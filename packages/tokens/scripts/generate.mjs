import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(packageRoot, 'src/tokens.json');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const release = JSON.parse(await readFile(resolve(packageRoot, '../../contracts/release.json'), 'utf8'));
source.meta = {
  ...source.meta,
  version: { $type: 'string', $value: release.version },
};

function flatten(node, path = [], output = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const next = [...path, key];
    if (value && typeof value === 'object' && '$value' in value) output.set(next.join('.'), value);
    else if (value && typeof value === 'object') flatten(value, next, output);
  }
  return output;
}

const tokens = flatten(source);

function resolveValue(name, stack = []) {
  if (stack.includes(name)) throw new Error(`Circular token reference: ${[...stack, name].join(' -> ')}`);
  const token = tokens.get(name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  if (typeof token.$value !== 'string') return token.$value;
  return token.$value.replace(/\{([^}]+)\}/g, (_, ref) => resolveValue(ref, [...stack, name]));
}

function identifier(name) {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return parts[0].toLowerCase() + parts.slice(1).map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}

function numberValue(value) {
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function arkColorValue(token, value) {
  const text = String(value);
  if (token.$type !== 'color' || !/^#[0-9a-fA-F]{8}$/.test(text)) return value;
  return `#${text.slice(7, 9)}${text.slice(1, 7)}`.toUpperCase();
}

const entries = [...tokens.keys()].sort().map((name) => ({ name, id: identifier(name), token: tokens.get(name), value: resolveValue(name) }));
const outputs = {
  'tokens.json': `${JSON.stringify(source, null, 2)}\n`,
  'swift/CoolTokens.swift': [
    '// Generated from DTCG tokens. Do not edit.',
    'import Foundation',
    '',
    'public enum CoolTokens {',
    ...entries.map(({ id, token, value }) => token.$type === 'number'
      ? `  public static let ${id}: Double = ${numberValue(value)}`
      : `  public static let ${id} = ${JSON.stringify(String(value))}`),
    '}',
    '',
  ].join('\n'),
  'kotlin/CoolTokens.kt': [
    '// Generated from DTCG tokens. Do not edit.',
    'package dev.coolui.tokens',
    '',
    'object CoolTokens {',
    ...entries.map(({ id, token, value }) => token.$type === 'number'
      ? `  const val ${id}: Double = ${numberValue(value)}`
      : `  const val ${id}: String = ${JSON.stringify(String(value))}`),
    '}',
    '',
  ].join('\n'),
  'arkts/CoolTokens.ets': [
    '// Generated from DTCG tokens. Do not edit.',
    'export const CoolTokens = {',
    ...entries.map(({ id, token, value }) => `  ${id}: ${JSON.stringify(arkColorValue(token, value))},`),
    '} as const;',
    '',
  ].join('\n'),
  'wechat/cool-ui-tokens.wxss': [
    '/* Generated from DTCG tokens. Do not edit. */',
    'page, .cool-theme {',
    ...entries.map(({ name, value }) => `  --cool-${name.replaceAll('.', '-')}: ${value};`),
    '}',
    '',
  ].join('\n'),
  'css/cool-ui-tokens.css': [
    '/* Generated from DTCG tokens. Do not edit. */',
    ':root {',
    ...entries.map(({ name, value }) => `  --cool-${name.replaceAll('.', '-')}: ${value};`),
    '}',
    '',
  ].join('\n'),
};

const hashes = {};
for (const [relativePath, contents] of Object.entries(outputs)) {
  const target = resolve(packageRoot, 'generated', relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, 'utf8');
  hashes[relativePath] = createHash('sha256').update(contents).digest('hex');
}

await writeFile(resolve(packageRoot, 'generated/manifest.json'), `${JSON.stringify({ version: release.version, source: 'src/tokens.json', outputs: hashes }, null, 2)}\n`, 'utf8');
