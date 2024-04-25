import React from 'react';
import type { AppArguments } from '../AppArguments';
import { useCompareModel, useExploreModel } from '../Layouts';
import { BundleView } from '../Components';
import { useStyles } from './App.styles';
import { Text, Toolbar, ToolbarButton, ToolbarDivider } from '@fluentui/react-components';
import { FolderOpenRegular } from '@fluentui/react-icons';
import { OpenDialog } from './OpenDialog';
import type { FSOption } from 'glob';
import { getStats } from '../Bundler/getStats';

export interface AppProps {
  initialArgs?: AppArguments;
}

function renderBundle(args: AppArguments) {
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
}

export const App: React.FC<AppProps> = ({ initialArgs }) => {
  const styles = useStyles();
  const [args, setArgs] = React.useState<AppArguments | undefined>(initialArgs);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const onExplore = React.useCallback(async (fs: FSOption, glob: string) => {
    setDialogOpen(false);
    const exploreResult = await getStats(undefined, glob, undefined, { fs });
    setArgs({
      mode: 'single',
      bundles: exploreResult.bundles
    });
  }, []);
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Toolbar>
          <ToolbarButton
            aria-label="Load bundle"
            icon={<FolderOpenRegular />}
            onClick={() => setDialogOpen(value => !value)}
          />
          <ToolbarDivider />
        </Toolbar>
        <Text as="h1">Bundle Size Viewer</Text>
      </div>
      <div className={styles.main}>{args && renderBundle(args)}</div>
      <OpenDialog open={dialogOpen} onOpenChange={setDialogOpen} onExplore={onExplore} />
    </div>
  );
};
