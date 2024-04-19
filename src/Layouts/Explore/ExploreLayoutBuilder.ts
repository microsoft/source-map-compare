import type { ExploreBundleResult, FileData } from 'source-map-explorer/lib/types';
import { type TreeDescendantContext, makeFileTree, reduceFileTree } from '../../Model';
import type { LayoutBuilder } from '../LayoutBuilder';

export interface DescendantSizeInfo {
  ratioOfParent: number;
  ratioOfTotal: number;
}

export class ExploreLayoutBuilder implements LayoutBuilder<FileData, FileData, DescendantSizeInfo> {
  constructor(private readonly bundles: ExploreBundleResult[]) {}

  public makeFileTree() {
    return reduceFileTree<FileData, unknown, FileData>(
      makeFileTree(Object.assign({}, ...this.bundles.map(bundle => bundle.files))),
      // Reducer to add up cumulative size of sub-tree
      (files, subdirectories): FileData =>
        // eslint-disable-next-line no-restricted-syntax
        [...Object.values(files), ...Object.values(subdirectories)]
          .filter(Boolean)
          .reduce<FileData>((prev, next) => ({ size: prev.size + (next?.meta.size ?? 0) }), { size: 0 })
    );
  }

  public computeDescendantInfo({
    current: curr,
    parent,
    root
  }: TreeDescendantContext<FileData, FileData>): DescendantSizeInfo {
    return {
      ratioOfParent: curr.meta.size / (parent?.meta.size ?? curr.meta.size),
      ratioOfTotal: curr.meta.size / root.meta.size
    };
  }
}
