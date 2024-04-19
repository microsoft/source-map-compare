import type { ExploreBundleResult } from 'source-map-explorer/lib/types';
import type { ListItem, TreeDescendantContext } from '../FileList';
import { type FileTree, makeFileTree, reduceFileTree } from '../FileTree';
import type { LayoutBuilder } from './LayoutBuilder';

export interface BundleMetadata {
  size: number;
  bundleNames: string[];
}

export interface BundleComparison {
  baseline: number;
  compare: number;
}

export interface DescendantComparisonInfo {
  ratioChangeOfTotal: number;
}

export type ComparisonFileTree = FileTree<BundleComparison, BundleComparison>;

const normalizeFilepath = (filepath: string) => filepath.replace(/.+[/\\]node_modules[/\\]/, '//node_modules/');

export type ComparisonListItem = ListItem<BundleComparison, BundleComparison, DescendantComparisonInfo>;

export class CompareLayoutBuilder
  implements LayoutBuilder<BundleComparison, BundleComparison, DescendantComparisonInfo>
{
  constructor(
    private readonly baseline: ExploreBundleResult,
    private readonly compare: ExploreBundleResult
  ) {}

  public makeFileTree() {
    // merge contents
    const diffMap = new Map<string, BundleComparison>();

    for (const [filepath, data] of Object.entries(this.baseline.files)) {
      diffMap.set(normalizeFilepath(filepath), { baseline: data.size, compare: 0 });
    }

    for (const [filepath, data] of Object.entries(this.compare.files)) {
      const normalizedFilePath = normalizeFilepath(filepath);
      const leftValue = diffMap.get(normalizedFilePath);
      if (leftValue) {
        leftValue.compare = data.size;
      } else {
        diffMap.set(normalizedFilePath, { baseline: 0, compare: data.size });
      }
    }

    return reduceFileTree<BundleComparison, unknown, BundleComparison>(
      makeFileTree(Object.fromEntries(diffMap.entries())),
      // Reducer to add up cumulative size of sub-tree
      (files, subdirectories): BundleComparison =>
        // eslint-disable-next-line no-restricted-syntax
        [...Object.values(files), ...Object.values(subdirectories)].filter(Boolean).reduce<BundleComparison>(
          (prev, next) => ({
            baseline: prev.baseline + (next?.meta.baseline ?? 0),
            compare: prev.compare + (next?.meta.compare ?? 0)
          }),
          { baseline: 0, compare: 0 }
        )
    );
  }

  public computeDescendantInfo({
    curr,
    root
  }: TreeDescendantContext<BundleComparison, BundleComparison>): DescendantComparisonInfo {
    return {
      ratioChangeOfTotal: (curr.meta.compare - curr.meta.baseline) / (root.meta.compare - root.meta.baseline)
    };
  }
}
