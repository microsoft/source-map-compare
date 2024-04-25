import { makeStyles, shorthands } from '@fluentui/react-components';

export const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  header: {
    height: '32px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...shorthands.padding('8px')
  },
  main: {
    flexGrow: 1
  }
});
