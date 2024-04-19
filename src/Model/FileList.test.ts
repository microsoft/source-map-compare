import type { ListItem } from './FileList';
import { filterFileTree } from './FileList';
import { type BundlePathInfo, parseBundlePath } from './FileTree';

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

describe('filterFileTree', () => {
  const items: ListItem[] = [
    { nodeId: 1, name: 'root', isDirectory: true, meta: {}, descendantInfo: {}, level: 0, parentNodeId: undefined },
    { nodeId: 2, name: 'b', isDirectory: true, meta: {}, descendantInfo: {}, level: 1, parentNodeId: 1 },
    {
      nodeId: 3,
      name: 'b.c',
      isDirectory: false,
      meta: {},
      descendantInfo: {},
      level: 1,
      parentNodeId: 2,
      filepath: 'b.c'
    },
    {
      nodeId: 4,
      name: 'b.d',
      isDirectory: true,
      meta: {},
      descendantInfo: {},
      level: 1,
      parentNodeId: 2
    },
    {
      nodeId: 5,
      name: 'b.d.e',
      isDirectory: false,
      meta: {},
      descendantInfo: {},
      level: 2,
      parentNodeId: 4,
      filepath: 'b.d.e'
    }
  ];
  it('Always includes the root', () => {
    expect(filterFileTree(items, {})).toEqual([items[0]]);
  });
  it('Nested expansion remains hidden', () => {
    expect(filterFileTree(items, { 4: { expanded: true } })).toEqual([items[0]]);
  });
  it('Top expansion revealse one depth', () => {
    expect(filterFileTree(items, { 1: { expanded: true } })).toEqual([items[0], items[1]]);
  });
});
