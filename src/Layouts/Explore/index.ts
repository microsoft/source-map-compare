import React from 'react';
import type { ExploreBundleResult, FileData } from 'source-map-explorer/lib/types';
import { type DescendantSizeInfo, ExploreLayoutBuilder } from './ExploreLayoutBuilder';
import { type ListItem, makeListFromFileTree } from '../../Model';
import { singleBundleColumns } from './ExploreColumns';
import type { BundleViewProps } from '../../View/BundleView';

function evaluateExploreModel(bundle: ExploreBundleResult) {
  const layout = new ExploreLayoutBuilder(bundle);
  const fileTree = layout.makeFileTree();
  const items = makeListFromFileTree(fileTree, context => layout.computeDescendantInfo(context));
  return { items, columns: singleBundleColumns };
}

export function useExploreModel(
  bundle: ExploreBundleResult
): BundleViewProps<ListItem<FileData, FileData, DescendantSizeInfo>> {
  return React.useMemo(() => evaluateExploreModel(bundle), [bundle]);
}
