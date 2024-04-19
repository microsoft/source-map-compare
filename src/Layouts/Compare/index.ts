import React from 'react';
import type { ExploreBundleResult } from 'source-map-explorer/lib/types';
import type { BundleViewProps } from '../../Components';
import { type ListItem, makeListFromFileTree } from '../../Model';
import { type BundleComparison, CompareLayoutBuilder, type DescendantComparisonInfo } from './CompareLayoutBuilder';
import { bundleComparisonColumns } from './CompareColumns';

function evaluateCompareModel(baselines: ExploreBundleResult[], comparisons: ExploreBundleResult[]) {
  const layout = new CompareLayoutBuilder(baselines, comparisons);
  const fileTree = layout.makeFileTree();
  const items = makeListFromFileTree(fileTree, context => layout.computeDescendantInfo(context));
  return { items, columns: bundleComparisonColumns };
}

export function useCompareModel(
  baselines: ExploreBundleResult[],
  comparisons: ExploreBundleResult[]
): BundleViewProps<ListItem<BundleComparison, BundleComparison, DescendantComparisonInfo>> {
  return React.useMemo(() => evaluateCompareModel(baselines, comparisons), [baselines, comparisons]);
}
