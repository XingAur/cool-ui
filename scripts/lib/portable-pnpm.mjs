import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';

export function resolvePnpmCommand({ env = process.env, platform = process.platform, exists = existsSync } = {}) {
  const npmEntrypoint = env.npm_execpath;
  if (npmEntrypoint && basename(npmEntrypoint).toLowerCase().includes('pnpm')) {
    return { command: process.execPath, argsPrefix: [npmEntrypoint], shell: false, source: 'npm-execpath-pnpm' };
  }

  if (env.PNPM_HOME) {
    const cjs = resolve(env.PNPM_HOME, 'pnpm.cjs');
    if (exists(cjs)) return { command: process.execPath, argsPrefix: [cjs], shell: false, source: 'pnpm-home-cjs' };

    const executableNames = platform === 'win32' ? ['pnpm.exe', 'pnpm.cmd', 'pnpm'] : ['pnpm'];
    for (const name of executableNames) {
      const executable = resolve(env.PNPM_HOME, name);
      if (!exists(executable)) continue;
      return {
        command: executable,
        argsPrefix: [],
        shell: platform === 'win32' && !name.endsWith('.exe'),
        source: 'pnpm-home-executable',
      };
    }
  }

  return { command: 'pnpm', argsPrefix: [], shell: platform === 'win32', source: 'path' };
}

export function spawnPnpm(args, { cwd, env = process.env, encoding = 'utf8' } = {}) {
  const resolved = resolvePnpmCommand({ env });
  return spawnSync(resolved.command, [...resolved.argsPrefix, ...args], {
    cwd,
    env,
    encoding,
    shell: resolved.shell,
    windowsHide: true,
  });
}
