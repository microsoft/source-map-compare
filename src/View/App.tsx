import { DataGrid } from '@fluentui/react-components';
import * as React from 'react';
import type * as SME from 'source-map-explorer/lib/types';
import * as SafeHooks from '../Helpers/SafeHooks';
import {
  type ComparisonListItem,
  makeComparisonFileTree,
  makeDescendantInfoForComparisonFileTree
} from '../Model/BundleComparison';
import { type ExpandState, type ListItem, makeListFromFileTree } from '../Model/FileList';
import {
  makeDescendantInfoForSizeFileTree,
  makeFileTreeFromSingleBundle,
  type SizeListItem
} from '../Model/SingleBundle';
import { bundleComparisonColumns, singleBundleColumns } from './Columns';

// Expands / collapses list item
// const makeOnItemInvokedHandler =
//   (expandState: ExpandState, setExpandState: (newState: ExpandState) => void) => (item: SizeListItem) => {
//     if (item.isDirectory) {
//       setExpandState({ ...expandState, [item.nodeId]: !expandState[item.nodeId] });
//     }
//   };

const getListItemRowId = (item: ListItem<unknown, unknown, unknown>): string => String(item.nodeId);

const resizableColumnsOptions = {
  autoFitColumns: false
} as const;

export interface SingleBundleAppProps {
  exploredBundle: SME.ExploreBundleResult;
}

export const SingleBundleApp: React.FC<SingleBundleAppProps> = props => {
  const [expandState, _setExpandState] = React.useState<ExpandState>({});
  const fileTree = SafeHooks.useMemo(makeFileTreeFromSingleBundle, props.exploredBundle);
  const listItems = SafeHooks.useMemo(
    makeListFromFileTree,
    fileTree,
    expandState,
    makeDescendantInfoForSizeFileTree
  ) as SizeListItem[];
  // const onItemInvoked = SafeHooks.useMemo(makeOnItemInvokedHandler, expandState, setExpandState);
  const { columns, columnSizingOptions } = React.useMemo(
    () => ({
      columns: singleBundleColumns.map(col => col.columnDef),
      columnSizingOptions: Object.fromEntries(
        bundleComparisonColumns.map(entry => [entry.columnDef.columnId, entry.sizeOptions])
      )
    }),
    []
  );

  return (
    <DataGrid
      items={listItems}
      columns={columns}
      columnSizingOptions={columnSizingOptions}
      resizableColumnsOptions={resizableColumnsOptions}
      getRowId={getListItemRowId}
    />
  );
};

export interface BundleComparisonAppProps {
  leftBundle: SME.ExploreBundleResult;
  rightBundle: SME.ExploreBundleResult;
}

export const BundleComparisonApp: React.FC<BundleComparisonAppProps> = props => {
  const [expandState, _setExpandState] = React.useState<ExpandState>({});
  const fileTree = SafeHooks.useMemo(makeComparisonFileTree, props.leftBundle, props.rightBundle);
  const listItems = SafeHooks.useMemo(
    makeListFromFileTree,
    fileTree,
    expandState,
    makeDescendantInfoForComparisonFileTree
  ) as ComparisonListItem[];
  // const onItemInvoked = SafeHooks.useMemo(makeOnItemInvokedHandler, expandState, setExpandState);
  const { columns, columnSizingOptions } = React.useMemo(
    () => ({
      columns: bundleComparisonColumns.map(col => col.columnDef),
      columnSizingOptions: Object.fromEntries(
        bundleComparisonColumns.map(entry => [entry.columnDef.columnId, entry.sizeOptions])
      )
    }),
    []
  );

  return (
    <DataGrid
      items={listItems}
      columns={columns}
      columnSizingOptions={columnSizingOptions}
      resizableColumnsOptions={resizableColumnsOptions}
      getRowId={getListItemRowId}
    />
  );
};
