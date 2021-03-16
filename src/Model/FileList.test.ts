import { BundlePathInfo, parseBundlePath } from './FileTree';

describe('parseBundlePath', () => {
  it('Parses absolute windows paths correctly', () =>
    expect(parseBundlePath('C:\\users\\klarson\\ntuser.ini')).toEqual({
      filename: 'ntuser.ini',
      isSpecial: false,
      path: ['C:', 'users', 'klarson']
    } as BundlePathInfo));

  it('Parses absolute windows paths with forward slash correctly', () =>
    expect(parseBundlePath('C:/users/klarson/ntuser.ini')).toEqual({
      filename: 'ntuser.ini',
      isSpecial: false,
      path: ['C:', 'users', 'klarson']
    } as BundlePathInfo));

  it('Parses absolute unix paths correctly', () =>
    expect(parseBundlePath('/usr/klarson/.bashrc')).toEqual({
      filename: '.bashrc',
      isSpecial: false,
      path: ['usr', 'klarson']
    } as BundlePathInfo));

  it('Strips webpack schema', () =>
    expect(parseBundlePath('webpack://usr/klarson/.bashrc')).toEqual({
      filename: '.bashrc',
      isSpecial: false,
      path: ['usr', 'klarson']
    } as BundlePathInfo));

  it('Strips webpack schema with extra slash', () =>
    expect(parseBundlePath('webpack:///usr/klarson/.bashrc')).toEqual({
      filename: '.bashrc',
      isSpecial: false,
      path: ['usr', 'klarson']
    } as BundlePathInfo));

  it('Reports special path', () =>
    expect(parseBundlePath('webpack://[unmapped]')).toEqual({
      filename: '[unmapped]',
      isSpecial: true,
      path: []
    } as BundlePathInfo));
});
