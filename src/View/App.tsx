import React from 'react';
import { BundleView } from './BundleView';
import type { AppArguments } from '../AppArguments';
import { useCompareModel, useExploreModel } from '../Layouts';

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
      const { columns, items } = useExploreModel(args.bundle);
      return <BundleView columns={columns} items={items} />;
    }
  }
};
