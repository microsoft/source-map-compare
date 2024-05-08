import type { ExploreBundleResult } from 'source-map-explorer/lib/types';
import { type TreeDescendantContext, makeFileTree, reduceFileTree } from '../../Model';
import type { LayoutBuilder } from '../LayoutBuilder';
import { isTruthy, normalizeFilePath } from '../../Helpers';

export interface BundleMetadata {
  size: number;
  bundleNames: string[];
}

export interface BundleComparison {
  baseline: BundleMetadata;
  compare: BundleMetadata;
}

export interface DescendantComparisonInfo {
  ratioChangeOfTotal: number;
}

export class CompareLayoutBuilder
  implements LayoutBuilder<BundleComparison, BundleComparison, DescendantComparisonInfo>
{
  constructor(
    private readonly baseline: ExploreBundleResult[],
    private readonly compare: ExploreBundleResult[]
  ) {}

  public makeFileTree() {
    // merge contents
    const diffMap = new Map<string, BundleComparison>();

    for (const { bundleName, files } of this.baseline) {
      for (const [filepath, data] of Object.entries(files)) {
        diffMap.set(normalizeFilePath(filepath), {
          baseline: { size: data.size, bundleNames: [bundleName] },
          compare: { size: data.size, bundleNames: [] }
        });
      }
    }

    for (const { bundleName, files } of this.compare) {
      for (const [filepath, data] of Object.entries(files)) {
        const normalizedFilePath = normalizeFilePath(filepath);
        const leftValue = diffMap.get(normalizedFilePath);
        if (leftValue) {
          leftValue.compare = { size: data.size, bundleNames: [bundleName] };
        } else {
          diffMap.set(normalizedFilePath, {
            baseline: { size: 0, bundleNames: [] },
            compare: { size: data.size, bundleNames: [bundleName] }
          });
        }
      }
    }

    return reduceFileTree<BundleComparison, unknown, BundleComparison>(
      makeFileTree(Object.fromEntries(diffMap.entries())),
      // Reducer to add up cumulative size of sub-tree
      (files, subdirectories): BundleComparison =>
        // eslint-disable-next-line no-restricted-syntax
        [...Object.values(files), ...Object.values(subdirectories)].filter(isTruthy).reduce<BundleComparison>(
          (prev, next) => ({
            baseline: {
              size: prev.baseline.size + next.meta.baseline.size,
              bundleNames: [...new Set(prev.baseline.bundleNames.concat(next.meta.baseline.bundleNames))]
            },
            compare: {
              size: prev.compare.size + next.meta.compare.size,
              bundleNames: [...new Set(prev.compare.bundleNames.concat(next.meta.compare.bundleNames))]
            }
          }),
          { baseline: { size: 0, bundleNames: [] }, compare: { size: 0, bundleNames: [] } }
        )
    );
  }

  public computeDescendantInfo({
    current: curr,
    root
  }: TreeDescendantContext<BundleComparison, BundleComparison>): DescendantComparisonInfo {
    return {
      ratioChangeOfTotal:
        (curr.meta.compare.size - curr.meta.baseline.size) / (root.meta.compare.size - root.meta.baseline.size)
    };
  }
}
