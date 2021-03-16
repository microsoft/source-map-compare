import { DetailsList } from '@fluentui/react';
import * as React from 'react';
import * as SME from 'source-map-explorer';
import * as SafeHooks from '../Helpers/SafeHooks';
import {
  ComparisonListItem,
  makeComparisonFileTree,
  makeDescendantInfoForComparisonFileTree
} from '../Model/BundleComparison';
import { ExpandState, ListItem, makeListFromFileTree } from '../Model/FileList';
import { makeDescendantInfoForSizeFileTree, makeFileTreeFromSingleBundle, SizeListItem } from '../Model/SingleBundle';
import { bundleComparisonColumns, singleBundleColumns } from './Columns';

// Expands / collapses list item
const makeOnItemInvokedHandler = (expandState: ExpandState, setExpandState: (newState: ExpandState) => void) => (
  item: SizeListItem
) => {
  if (item.isDirectory) {
    setExpandState({ ...expandState, [item.nodeId]: !expandState[item.nodeId] });
  }
};

const getListItemKey = (item: ListItem<unknown, unknown, unknown>): string => String(item.nodeId);

export interface SingleBundleAppProps {
  exploredBundle: SME.ExploreBundleResult;
}

export const SingleBundleApp: React.FC<SingleBundleAppProps> = props => {
  const [expandState, setExpandState] = React.useState<ExpandState>({});
  const fileTree = SafeHooks.useMemo(makeFileTreeFromSingleBundle, props.exploredBundle);
  const listItems = SafeHooks.useMemo(
    makeListFromFileTree,
    fileTree,
    expandState,
    makeDescendantInfoForSizeFileTree
  ) as SizeListItem[];
  const onItemInvoked = SafeHooks.useMemo(makeOnItemInvokedHandler, expandState, setExpandState);

  return (
    <DetailsList
      items={listItems}
      columns={singleBundleColumns}
      onItemInvoked={onItemInvoked}
      useReducedRowRenderer={true}
      getKey={getListItemKey}
    />
  );
};

export interface BundleComparisonAppProps {
  leftBundle: SME.ExploreBundleResult;
  rightBundle: SME.ExploreBundleResult;
}

export const BundleComparisonApp: React.FC<BundleComparisonAppProps> = props => {
  const [expandState, setExpandState] = React.useState<ExpandState>({});
  const fileTree = SafeHooks.useMemo(makeComparisonFileTree, props.leftBundle, props.rightBundle);
  const listItems = SafeHooks.useMemo(
    makeListFromFileTree,
    fileTree,
    expandState,
    makeDescendantInfoForComparisonFileTree
  ) as ComparisonListItem[];
  const onItemInvoked = SafeHooks.useMemo(makeOnItemInvokedHandler, expandState, setExpandState);

  return (
    <DetailsList
      items={listItems}
      columns={bundleComparisonColumns}
      onItemInvoked={onItemInvoked}
      useReducedRowRenderer={true}
      getKey={getListItemKey}
    />
  );
};
