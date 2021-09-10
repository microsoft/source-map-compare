import { externalLibs } from './Externals';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageDependencies = require('../../package.json')['dependencies'] as Record<string, string>;

it.each(
  externalLibs.map((external): [string, string] => [external.packageName, external.packageSemver])
)('%s@%s matches root package.json semver range', (packageName, semVer) =>
  expect(semVer).toBe(packageDependencies[packageName])
);
