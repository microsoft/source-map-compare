import React from 'react';
import { ChevronDown24Regular, ChevronRight24Regular, Javascript24Regular } from '@fluentui/react-icons';
import type { ListItem } from '../../Model';
import type { ColumnInfo } from './ColumnInfo';
import { useStyles } from './NameColumn.styles';

export function compareListItem(a: ListItem, b: ListItem): number {
  return a.name.localeCompare(b.name);
}

export const NameCell: React.FC<{ item: ListItem }> = ({ item }) => {
  const styles = useStyles();
  return (
    <div className={styles.nameCell} style={{ paddingLeft: item.level * 24 }}>
      {item.isDirectory ? (
        <>
          <ChevronDown24Regular className="expanded" />
          <ChevronRight24Regular className="collapsed" />
        </>
      ) : (
        <Javascript24Regular />
      )}
      <span className={styles.nameLabel}>{item.name}</span>
    </div>
  );
};

export const nameColumn: ColumnInfo<ListItem> = {
  minWidth: 120,
  columnId: 'name',
  compare: compareListItem,
  label: 'Name',
  renderCell: (item: ListItem) => <NameCell item={item} />
};
