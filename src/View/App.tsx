import React from 'react';
import type { AppArguments } from '../AppArguments';
import { useCompareModel, useExploreModel } from '../Layouts';
import { BundleView } from '../Components';

export interface AppProps {
  args: AppArguments;
}

export const App: React.FC<AppProps> = ({ args }) => {
  switch (args.mode) {
    case 'comparison': {
      const { columns, items } = useCompareModel(args.baseline, args.compare);
      return <BundleView columns={columns} items={items} />;
    }
    case 'single': {
      const { columns, items } = useExploreModel(args.bundles);
      return <BundleView columns={columns} items={items} />;
    }
  }
};
