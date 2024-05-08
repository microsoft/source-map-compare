import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  expanded: {
    '& .collapsed': {
      display: 'none'
    }
  },
  collapsed: {
    '& .expanded': {
      display: 'none'
    }
  }
});
