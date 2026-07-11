import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const manifests = ['package.json', 'packages/tokens/package.json', 'packages/wechat/package.json', 'packages/arkui/oh-package.json5'];
const components = [];

for (const relative of manifests) {
  const raw = await readFile(resolve(root, relative), 'utf8');
  const pkg = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1'));
  components.push({
    type: relative === 'package.json' ? 'application' : 'library',
    name: pkg.name,
    version: pkg.version,
    licenses: [{ license: { id: pkg.license ?? 'Apache-2.0' } }],
    purl: `pkg:generic/${encodeURIComponent(pkg.name)}@${pkg.version}`,
  });
}

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  serialNumber: `urn:uuid:cool-ui-0.1.0`,
  version: 1,
  metadata: { component: { type: 'application', name: 'cool-ui', version: '0.1.0' } },
  components,
};
await writeFile(resolve(root, 'artifacts/sbom.cdx.json'), `${JSON.stringify(sbom, null, 2)}\n`, 'utf8');
await writeFile(resolve(root, 'artifacts/licenses.json'), `${JSON.stringify({ project: 'Apache-2.0', packages: components.map(({ name, version, licenses }) => ({ name, version, license: licenses[0].license.id })) }, null, 2)}\n`, 'utf8');
