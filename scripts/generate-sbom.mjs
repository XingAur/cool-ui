import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const release = JSON.parse(await readFile(resolve(root, 'contracts/release.json'), 'utf8'));
await mkdir(resolve(root, 'artifacts'), { recursive: true });
const manifests = ['packages/tokens/package.json', 'packages/wechat/package.json', 'packages/arkui/oh-package.json5'];

const URL_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function uuidV5(namespace, name) {
  const namespaceBytes = Buffer.from(namespace.replaceAll('-', ''), 'hex');
  if (namespaceBytes.length !== 16) throw new Error(`Invalid UUID namespace: ${namespace}`);
  const bytes = createHash('sha1').update(namespaceBytes).update(name, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const packages = new Map();
for (const relative of manifests) {
  const raw = await readFile(resolve(root, relative), 'utf8');
  const pkg = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, '').replace(/,\s*([}\]])/g, '$1'));
  if (pkg.version !== release.version) throw new Error(`${relative} version ${pkg.version} does not match release ${release.version}`);
  packages.set(relative, pkg);
}

const component = (name, purl, license = 'Apache-2.0') => ({
  type: 'library',
  name,
  version: release.version,
  licenses: [{ license: { id: license } }],
  purl,
});
const components = [
  component('@cool-ui/tokens', `pkg:npm/%40cool-ui/tokens@${release.version}`, packages.get('packages/tokens/package.json').license),
  component('@cool-ui/wechat', `pkg:npm/%40cool-ui/wechat@${release.version}`, packages.get('packages/wechat/package.json').license),
  component('Swift CoolUI', `pkg:swift/github.com/XingAur/cool-ui@${release.version}`),
  component('Maven dev.coolui:coolui-compose', `pkg:maven/dev.coolui/coolui-compose@${release.version}`),
  component('@cool-ui/arkui', `pkg:ohpm/%40cool-ui/arkui@${release.version}`, packages.get('packages/arkui/oh-package.json5').license),
];

const sbom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  serialNumber: `urn:uuid:${uuidV5(URL_NAMESPACE, `cool-ui@${release.version}`)}`,
  version: 1,
  metadata: { component: { type: 'application', name: 'cool-ui', version: release.version } },
  components,
};
await writeFile(resolve(root, 'artifacts/sbom.cdx.json'), `${JSON.stringify(sbom, null, 2)}\n`, 'utf8');
await writeFile(resolve(root, 'artifacts/licenses.json'), `${JSON.stringify({ project: 'Apache-2.0', packages: components.map(({ name, version, licenses }) => ({ name, version, license: licenses[0].license.id })) }, null, 2)}\n`, 'utf8');
