import React from 'react';
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell
} from '@fluentui/react-components';
import { filterFileTree, type ItemState, type ListItem } from '../Model/FileList';
import { columnsFromColumnInfo, type ColumnInfo } from './ColumnInfo';
import { useStyles } from './BundleView.styles';
import { nameColumn } from './NameColumn';

const getListItemRowId = (item: ListItem): string => String(item.nodeId);

const resizableColumnsOptions = {
  autoFitColumns: false
} as const;

export interface BundleViewProps<TItem extends ListItem> {
  columns: readonly ColumnInfo<TItem>[];
  items: TItem[];
}

export function BundleView<TItem extends ListItem>(props: BundleViewProps<TItem>) {
  const styles = useStyles();
  const [columns, columnSizingOptions] = React.useMemo(
    () => columnsFromColumnInfo([nameColumn, ...props.columns]),
    [props.columns]
  );
  const [itemState, setItemState] = React.useState<Record<number, ItemState | undefined>>({});
  const items = React.useMemo(() => filterFileTree(props.items, itemState), [itemState, props.items]);
  const onRowKeyDown = React.useCallback((nodeId: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setItemState(state => ({ ...state, [nodeId]: { expanded: !state[nodeId]?.expanded } }));
    }
  }, []);

  return (
    <DataGrid
      size="extra-small"
      items={items}
      columns={columns}
      columnSizingOptions={columnSizingOptions}
      resizableColumnsOptions={resizableColumnsOptions}
      getRowId={getListItemRowId}>
      <DataGridHeader>
        <DataGridRow
          selectionCell={{
            checkboxIndicator: { 'aria-label': 'Select all rows' }
          }}>
          {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<ListItem>>
        {({ item, rowId }) => (
          <DataGridRow<ListItem>
            key={rowId}
            onKeyDown={onRowKeyDown.bind(undefined, item.nodeId)}
            selectionCell={{
              checkboxIndicator: { 'aria-label': 'Select row' }
            }}>
            {({ renderCell }) => (
              <DataGridCell className={itemState[item.nodeId]?.expanded ? styles.expanded : styles.collapsed}>
                {renderCell(item)}
              </DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
}
