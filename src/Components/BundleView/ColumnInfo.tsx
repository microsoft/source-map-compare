import type * as React from 'react';
import type { TableColumnDefinition, TableColumnSizingOptions } from '@fluentui/react-components';
import type { ListItem } from '../../Model';

export interface ColumnInfo<TItem extends ListItem> {
  columnId: string;
  label: string;
  minWidth?: number;
  compare: (a: TItem, b: TItem) => number;
  renderCell: (item: TItem) => React.ReactNode;
}

export type ColumnsAndSizeInfo<TItem extends ListItem> = [
  columns: TableColumnDefinition<TItem>[],
  columnSizingOptions: TableColumnSizingOptions
];

export function columnsFromColumnInfo<TItem extends ListItem>(
  columnInfo: readonly ColumnInfo<TItem>[]
): ColumnsAndSizeInfo<TItem> {
  return columnInfo.reduce<ColumnsAndSizeInfo<TItem>>(
    ([columns, sizeInfo], { columnId, label, compare, renderCell, minWidth }) => [
      [
        ...columns,
        {
          columnId,
          compare,
          renderCell,
          renderHeaderCell: () => label
        }
      ],
      {
        ...sizeInfo,
        [columnId]: {
          minWidth: minWidth
        }
      }
    ],
    [[], {}]
  );
}
