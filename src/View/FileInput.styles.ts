import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useStyles = makeStyles({
  root: {},
  globInput: {
    '& input': { fontFamily: tokens.fontFamilyMonospace }
  },
  tree: {
    overflowY: 'auto',
    maxHeight: '250px'
  },
  treeLayout: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ...shorthands.overflow('hidden')
  }
});
