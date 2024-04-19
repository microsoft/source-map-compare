import React from 'react';
import type { ListItem } from '../../Model/FileList';
import type { SizeListItem } from '../../Model/SingleBundle';
import { NameCell } from '../CellValue';
import type { ColumnInfo } from '../ColumnInfo';

export function compareListItem(a: ListItem, b: ListItem): number {
  return a.name.localeCompare(b.name);
}

export function compareSizeItem(a: SizeListItem, b: SizeListItem): number {
  return a.meta.size - b.meta.size;
}

export const nameColumn: ColumnInfo<ListItem> = {
  minWidth: 120,
  columnId: 'name',
  compare: compareListItem,
  label: 'Name',
  renderCell: (item: ListItem) => <NameCell item={item} />
};
