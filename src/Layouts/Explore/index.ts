import React from 'react';
import type { ExploreBundleResult, FileData } from 'source-map-explorer/lib/types';
import { type ListItem, makeListFromFileTree } from '../../Model';
import type { BundleViewProps } from '../../Components';
import { type DescendantSizeInfo, ExploreLayoutBuilder } from './ExploreLayoutBuilder';
import { singleBundleColumns } from './ExploreColumns';

function evaluateExploreModel(bundles: ExploreBundleResult[]) {
  const layout = new ExploreLayoutBuilder(bundles);
  const fileTree = layout.makeFileTree();
  const items = makeListFromFileTree(fileTree, context => layout.computeDescendantInfo(context));
  return { items, columns: singleBundleColumns };
}

export function useExploreModel(
  bundles: ExploreBundleResult[]
): BundleViewProps<ListItem<FileData, FileData, DescendantSizeInfo>> {
  return React.useMemo(() => evaluateExploreModel(bundles), [bundles]);
}
