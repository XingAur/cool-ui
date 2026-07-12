import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const artifacts = resolve(root, 'artifacts');
if (!artifacts.startsWith(`${root}\\`) && !artifacts.startsWith(`${root}/`)) throw new Error('Unsafe artifact path');
await rm(artifacts, { recursive: true, force: true });
await mkdir(artifacts, { recursive: true });

function runNode(script) {
  const result = spawnSync(process.execPath, [resolve(root, script)], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function available(command) {
  const probe = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { encoding: 'utf8' });
  return probe.status === 0;
}

runNode('scripts/pack-local.mjs');
await cp(resolve(root, 'LICENSE'), resolve(artifacts, 'LICENSE'));
await cp(resolve(root, 'NOTICE'), resolve(artifacts, 'NOTICE'));
runNode('scripts/generate-sbom.mjs');

const nativeValidation = {
  swift: { available: available('swift'), command: 'swift test --package-path packages/swift' },
  android: { available: available('gradle'), command: 'gradle -p packages/android publishReleasePublicationToLocalArtifactsRepository' },
  harmony: { available: available('hvigorw'), command: 'hvigorw assembleHar --mode module -p product=default' },
  note: 'Native commands run in their dedicated CI jobs; this report records local toolchain availability and does not substitute source bundles for AAR or HAR files.',
};
await writeFile(resolve(artifacts, 'native-validation.json'), `${JSON.stringify(nativeValidation, null, 2)}\n`, 'utf8');
// Host-specific native-validation.json remains diagnostic-only and is intentionally excluded from distributable SHA256 checksums.
runNode('scripts/write-checksums.mjs');
