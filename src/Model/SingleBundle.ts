import type * as SME from 'source-map-explorer/lib/types';
import type { DescendantInfoPredicate, ListItem } from './FileList';
import { type FileTree, makeFileTree, reduceFileTree } from './FileTree';

export type SizeFileTree = FileTree<SME.FileData, SME.FileData>;

export function makeFileTreeFromSingleBundle(bundleInfo: SME.ExploreBundleResult): SizeFileTree {
  return reduceFileTree<SME.FileData, unknown, SME.FileData>(
    makeFileTree(bundleInfo.files),
    // Reducer to add up cumulative size of sub-tree
    (files, subdirectories): SME.FileData =>
      // eslint-disable-next-line no-restricted-syntax
      [...Object.values(files), ...Object.values(subdirectories)]
        .filter(Boolean)
        .reduce<SME.FileData>((prev, next) => ({ size: prev.size + (next?.meta.size ?? 0) }), { size: 0 })
  );
}

export type DescendantSizeInfo = { ratioOfParent: number; ratioOfTotal: number };

export const makeDescendantInfoForSizeFileTree: DescendantInfoPredicate<
  SME.FileData,
  SME.FileData,
  DescendantSizeInfo
> = (curr, parent, root) => ({
  ratioOfParent: curr.meta.size / (parent?.meta.size ?? curr.meta.size),
  ratioOfTotal: curr.meta.size / root.meta.size
});

export type SizeListItem = ListItem<SME.FileData, SME.FileData, DescendantSizeInfo>;
