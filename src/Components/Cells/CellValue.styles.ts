import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  numericCell: {
    textAlign: 'right'
  },
  nameCell: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  nameLabel: { marginLeft: '10px' }
});
