import React from 'react';
import { makeComparisonFileTree, makeDescendantInfoForComparisonFileTree } from '../Model/BundleComparison';
import { makeListFromFileTree } from '../Model/FileList';
import { makeDescendantInfoForSizeFileTree, makeFileTreeFromSingleBundle } from '../Model/SingleBundle';
import { bundleComparisonColumns, singleBundleColumns } from './Columns';
import { BundleView } from './BundleView';
import type { AppArguments, BundleComparisonAppArgs, SingleBundleAppArgs } from '../AppArguments';

export const SingleBundleApp: React.FC<SingleBundleAppArgs> = ({ bundle }) => {
  const fileTree = React.useMemo(() => makeFileTreeFromSingleBundle(bundle), [bundle]);
  const listItems = React.useMemo(() => makeListFromFileTree(fileTree, makeDescendantInfoForSizeFileTree), [fileTree]);
  return <BundleView items={listItems} columns={singleBundleColumns} />;
};

export const BundleComparisonApp: React.FC<BundleComparisonAppArgs> = ({ baseline, compare }) => {
  const tree = React.useMemo(() => makeComparisonFileTree(baseline, compare), [baseline, compare]);
  const listItems = React.useMemo(() => makeListFromFileTree(tree, makeDescendantInfoForComparisonFileTree), [tree]);
  return <BundleView items={listItems} columns={bundleComparisonColumns} />;
};

export interface AppProps {
  args: AppArguments;
}

export const App: React.FC<AppProps> = ({ args }) => {
  switch (args.mode) {
    case 'comparison':
      return <BundleComparisonApp {...args} />;
    case 'single':
      return <SingleBundleApp {...args} />;
  }
};
