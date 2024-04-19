import type * as SME from 'source-map-explorer/lib/types';
import type { DescendantInfoPredicate, ListItem } from './FileList';
import { type FileTree, makeFileTree, reduceFileTree } from './FileTree';

export type ComparisonMetadata = { leftSize: number; rightSize: number };

export type ComparisonFileTree = FileTree<ComparisonMetadata, ComparisonMetadata>;

const normalizeFilepath = (filepath: string) => filepath.replace(/.+[/\\]node_modules[/\\]/, '//node_modules/');

export function makeComparisonFileTree(
  baselineInfo: SME.ExploreBundleResult,
  compareInfo: SME.ExploreBundleResult
): ComparisonFileTree {
  // merge contents
  const diffMap = new Map<string, ComparisonMetadata>();

  for (const [filepath, data] of Object.entries(baselineInfo.files)) {
    diffMap.set(normalizeFilepath(filepath), { leftSize: data.size, rightSize: 0 });
  }

  for (const [filepath, data] of Object.entries(compareInfo.files)) {
    const normalizedFilePath = normalizeFilepath(filepath);
    const leftValue = diffMap.get(normalizedFilePath);
    if (leftValue) {
      leftValue.rightSize = data.size;
    } else {
      diffMap.set(normalizedFilePath, { leftSize: 0, rightSize: data.size });
    }
  }

  return reduceFileTree<ComparisonMetadata, unknown, ComparisonMetadata>(
    makeFileTree(Object.fromEntries(diffMap.entries())),
    // Reducer to add up cumulative size of sub-tree
    (files, subdirectories): ComparisonMetadata =>
      // eslint-disable-next-line no-restricted-syntax
      [...Object.values(files), ...Object.values(subdirectories)].filter(Boolean).reduce<ComparisonMetadata>(
        (prev, next) => ({
          leftSize: prev.leftSize + (next?.meta.leftSize ?? 0),
          rightSize: prev.rightSize + (next?.meta.rightSize ?? 0)
        }),
        { leftSize: 0, rightSize: 0 }
      )
  );
}

export type DescendantComparisonInfo = { ratioChangeOfTotal: number };

export const makeDescendantInfoForComparisonFileTree: DescendantInfoPredicate<
  ComparisonMetadata,
  ComparisonMetadata,
  DescendantComparisonInfo
> = (curr, _parent, root) => ({
  ratioChangeOfTotal: (curr.meta.rightSize - curr.meta.leftSize) / (root.meta.rightSize - root.meta.leftSize)
});

export type ComparisonListItem = ListItem<ComparisonMetadata, ComparisonMetadata, DescendantComparisonInfo>;
