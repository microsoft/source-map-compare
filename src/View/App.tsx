import React from 'react';
import type { AppArguments, BundleComparisonAppArgs, SingleBundleAppArgs } from '../AppArguments';
import { useCompareModel, useExploreModel } from '../Layouts';
import { BundleView } from '../Components';

export interface AppProps {
  args: AppArguments;
}

function BrowseBundle(args: SingleBundleAppArgs) {
  const { columns, items } = useExploreModel(args.bundles);
  return <BundleView columns={columns} items={items} />;
}

function CompareBundles(args: BundleComparisonAppArgs) {
  const { columns, items } = useCompareModel(args.baseline, args.compare);
  return <BundleView columns={columns} items={items} />;
}

export const App: React.FC<AppProps> = ({ args }) => {
  switch (args.mode) {
    case 'comparison': {
      return <CompareBundles {...args} />;
    }
    case 'single': {
      return <BrowseBundle {...args} />;
    }
  }
};
