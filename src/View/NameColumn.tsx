import React from 'react';
import type { ListItem } from '../Model';
import { NameCell } from './Cells';
import type { ColumnInfo } from './ColumnInfo';

export function compareListItem(a: ListItem, b: ListItem): number {
  return a.name.localeCompare(b.name);
}

export const nameColumn: ColumnInfo<ListItem> = {
  minWidth: 120,
  columnId: 'name',
  compare: compareListItem,
  label: 'Name',
  renderCell: (item: ListItem) => <NameCell item={item} />
};
