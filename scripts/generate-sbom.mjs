import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
await mkdir(resolve(root, 'artifacts'), { recursive: true });
const manifests = ['package.json', 'packages/tokens/package.json', 'packages/wechat/package.json', 'packages/arkui/oh-package.json5'];
const components = [];

for (const relative of manifests) {
  const raw = await readFile(resolve(root, relative), 'utf8');
  const pkg = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1'));
  if (pkg.version !== release.version) throw new Error(`${relative} version ${pkg.version} does not match release ${release.version}`);
  components.push({
    type: relative === 'package.json' ? 'application' : 'library',
    name: pkg.name,
    version: release.version,
    licenses: [{ license: { id: pkg.license ?? 'Apache-2.0' } }],
    purl: `pkg:generic/${encodeURIComponent(pkg.name)}@${release.version}`,
  });
}

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  serialNumber: `urn:uuid:cool-ui-${release.version}`,
  version: 1,
  metadata: { component: { type: 'application', name: 'cool-ui', version: release.version } },
  components,
};
await writeFile(resolve(root, 'artifacts/sbom.cdx.json'), `${JSON.stringify(sbom, null, 2)}\n`, 'utf8');
await writeFile(resolve(root, 'artifacts/licenses.json'), `${JSON.stringify({ project: 'Apache-2.0', packages: components.map(({ name, version, licenses }) => ({ name, version, license: licenses[0].license.id })) }, null, 2)}\n`, 'utf8');
