import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolvePnpmCommand, spawnPnpm } from './helpers/portable-pnpm.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('portable pnpm ignores npm-cli.js and selects an existing PNPM_HOME pnpm.cjs', () => {
  const home = resolve(tmpdir(), 'portable-pnpm-home');
  const cjs = resolve(home, 'pnpm.cjs');
  const command = resolvePnpmCommand({
    env: { npm_execpath: resolve(tmpdir(), 'npm-cli.js'), PNPM_HOME: home },
    platform: 'win32',
    exists: (path) => path === cjs,
  });
  assert.deepEqual(command, {
    command: process.execPath,
    argsPrefix: [cjs],
    shell: false,
    source: 'pnpm-home-cjs',
  });
});

test('portable pnpm uses npm_execpath only when its basename identifies pnpm', () => {
  const entrypoint = resolve(tmpdir(), 'pnpm.cjs');
  const command = resolvePnpmCommand({ env: { npm_execpath: entrypoint }, platform: 'linux', exists: () => false });
  assert.deepEqual(command, {
    command: process.execPath,
    argsPrefix: [entrypoint],
    shell: false,
    source: 'npm-execpath-pnpm',
  });
});

test('portable pnpm resolves PNPM_HOME executables and platform fallbacks', () => {
  const home = resolve(tmpdir(), 'portable-pnpm-bin');
  const executable = resolve(home, 'pnpm.exe');
  assert.deepEqual(resolvePnpmCommand({
    env: { PNPM_HOME: home },
    platform: 'win32',
    exists: (path) => path === executable,
  }), {
    command: executable,
    argsPrefix: [],
    shell: false,
    source: 'pnpm-home-executable',
  });
  assert.deepEqual(resolvePnpmCommand({ env: {}, platform: 'win32', exists: () => false }), {
    command: 'pnpm',
    argsPrefix: [],
    shell: true,
    source: 'path',
  });
  assert.deepEqual(resolvePnpmCommand({ env: {}, platform: 'linux', exists: () => false }), {
    command: 'pnpm',
    argsPrefix: [],
    shell: false,
    source: 'path',
  });
});

test('portable pnpm still executes pnpm when npm_execpath points to npm-cli.js', () => {
  const result = spawnPnpm(['--version'], {
    cwd: root,
    env: { ...process.env, npm_execpath: resolve(tmpdir(), 'fake/npm-cli.js') },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+$/);
});
