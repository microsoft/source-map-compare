import React from 'react';
import {
  Body2,
  CompoundButton,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogActions,
  Button
} from '@fluentui/react-components';
import { ColumnDoubleCompareRegular, JavascriptRegular } from '@fluentui/react-icons';
import { useStyles } from './OpenDialog.styles';
import { FileInput } from './FileInput';
import type { FSOption } from 'glob';

export interface OpenDialogProps {
  open: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onExplore(fs: FSOption, glob: string): void;
}

export const OpenDialog: React.FC<OpenDialogProps> = ({ open, onOpenChange, onExplore }) => {
  const styles = useStyles();
  const [mode, setMode] = React.useState<'explore' | 'compare' | undefined>(undefined);
  const [fs, setFS] = React.useState<FSOption | undefined>(undefined);
  const [glob, setGlob] = React.useState<string>('**/*.js');
  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange?.(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Load bundles</DialogTitle>
          <DialogContent className={styles.dialogBody}>
            <Body2>You can load any JS bundles which contain sourcemap information.</Body2>
            <div className={styles.modeSelection}>
              <CompoundButton
                className={styles.modeButton}
                appearance={mode === 'explore' ? 'primary' : undefined}
                size="large"
                icon={<JavascriptRegular />}
                onClick={() => setMode('explore')}
                secondaryContent="Open bundle(s) and explore their contents">
                Explore
              </CompoundButton>
              <CompoundButton
                className={styles.modeButton}
                appearance={mode === 'compare' ? 'primary' : undefined}
                onClick={() => setMode('compare')}
                size="large"
                icon={<ColumnDoubleCompareRegular />}
                secondaryContent="Compare size differences between two bundles">
                Compare
              </CompoundButton>
            </div>
          </DialogContent>
          {mode === 'explore' && (
            <>
              <div>
                <FileInput title="Explore bundle(s)" globChanged={setGlob} fsChanged={setFS} />
              </div>
              <DialogActions position="end">
                <Button disabled={!fs} appearance="primary" onClick={() => fs && onExplore?.(fs, glob)}>
                  Explore
                </Button>
              </DialogActions>
            </>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
