import type { ExploreBundleResult, FileData } from 'source-map-explorer/lib/types';
import type { ListItem, TreeDescendantContext } from '../FileList';
import { type FileTree, makeFileTree, reduceFileTree } from '../FileTree';
import type { LayoutBuilder } from './LayoutBuilder';

/** @deprecated */
export type SizeFileTree = FileTree<FileData, FileData>;

/** @deprecated */
export type SizeListItem = ListItem<FileData, FileData, DescendantSizeInfo>;

export function makeFileTreeFromSingleBundle(bundleInfo: ExploreBundleResult): SizeFileTree {
  return reduceFileTree<FileData, unknown, FileData>(
    makeFileTree(bundleInfo.files),
    // Reducer to add up cumulative size of sub-tree
    (files, subdirectories): FileData =>
      // eslint-disable-next-line no-restricted-syntax
      [...Object.values(files), ...Object.values(subdirectories)]
        .filter(Boolean)
        .reduce<FileData>((prev, next) => ({ size: prev.size + (next?.meta.size ?? 0) }), { size: 0 })
  );
}

export type DescendantSizeInfo = { ratioOfParent: number; ratioOfTotal: number };

export class ExploreLayoutBuilder implements LayoutBuilder<FileData, FileData, DescendantSizeInfo> {
  constructor(private readonly bundleInfo: ExploreBundleResult) {}

  public makeFileTree() {
    return reduceFileTree<FileData, unknown, FileData>(
      makeFileTree(this.bundleInfo.files),
      // Reducer to add up cumulative size of sub-tree
      (files, subdirectories): FileData =>
        // eslint-disable-next-line no-restricted-syntax
        [...Object.values(files), ...Object.values(subdirectories)]
          .filter(Boolean)
          .reduce<FileData>((prev, next) => ({ size: prev.size + (next?.meta.size ?? 0) }), { size: 0 })
    );
  }

  public computeDescendantInfo({ curr, parent, root }: TreeDescendantContext<FileData, FileData>): DescendantSizeInfo {
    return {
      ratioOfParent: curr.meta.size / (parent?.meta.size ?? curr.meta.size),
      ratioOfTotal: curr.meta.size / root.meta.size
    };
  }
}
