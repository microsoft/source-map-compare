import * as React from 'react';
import type { TableColumnSizingOptions, TableColumnDefinition } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular, JavascriptRegular } from '@fluentui/react-icons';
import type { ComparisonListItem } from '../Model/BundleComparison';
import type { ListItem } from '../Model/FileList';
import type { SizeListItem } from '../Model/SingleBundle';
import { CellValue } from './CellValue';
import { ByteFormat, PercentageFormat, SignedFormat, colorDirection, colorFraction } from './CellFormats';

export interface ColumnInfo<T> {
  columnDef: TableColumnDefinition<T>;
  sizeOptions: TableColumnSizingOptions[string];
}

const numericColumnSizeOptions: TableColumnSizingOptions[string] = {
  minWidth: 80
};

function compareListItem(a: ListItem<unknown, unknown, unknown>, b: ListItem<unknown, unknown, unknown>): number {
  return a.name.localeCompare(b.name);
}

function compareSizeItem(a: SizeListItem, b: SizeListItem): number {
  return a.meta.size - b.meta.size;
}

const nameColumn: ColumnInfo<ListItem<unknown, unknown, unknown>> = {
  sizeOptions: {
    minWidth: 120
  },
  columnDef: {
    columnId: 'name',
    compare: compareListItem,
    renderHeaderCell: () => 'Name',
    renderCell: (item: ListItem<unknown, unknown, unknown>) => (
      <span style={{ paddingLeft: item.level * 24 }}>
        {item.isDirectory ? item.expanded ? <ChevronDownRegular /> : <ChevronRightRegular /> : <JavascriptRegular />}
        <span style={{ marginLeft: 10 }}>{item.name}</span>
      </span>
    )
  }
};

export const singleBundleColumns: ColumnInfo<SizeListItem>[] = [
  nameColumn,
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'size',
      compare: compareSizeItem,
      renderHeaderCell: () => 'Size',
      renderCell: (item: SizeListItem) => <CellValue value={item.meta.size} format={ByteFormat} />
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'pctSize',
      compare: compareSizeItem,
      renderHeaderCell: () => '% Size',
      renderCell: (item: SizeListItem) => (
        <CellValue value={item.descendantInfo.ratioOfTotal} background={colorFraction} format={PercentageFormat} />
      )
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'pctSizeParent',
      compare: compareSizeItem,
      renderHeaderCell: () => '% Size in Parent',
      renderCell: (item: SizeListItem) => (
        <CellValue value={item.descendantInfo.ratioOfParent} background={colorFraction} format={PercentageFormat} />
      )
    }
  }
];

export const bundleComparisonColumns: ColumnInfo<ComparisonListItem>[] = [
  nameColumn,
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'leftSize',
      renderHeaderCell: () => 'Left Size',
      compare: (a, b) => a.meta.leftSize - b.meta.leftSize,
      renderCell: (item: ComparisonListItem) => <CellValue value={item.meta.leftSize} format={ByteFormat} />
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'rightSize',
      renderHeaderCell: () => 'Right Size',
      compare: (a, b) => a.meta.rightSize - b.meta.rightSize,
      renderCell: (item: ComparisonListItem) => <CellValue value={item.meta.rightSize} format={ByteFormat} />
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'changeSize',
      renderHeaderCell: () => 'Change',
      compare: (a, b) => a.meta.rightSize - a.meta.leftSize - (b.meta.rightSize - b.meta.leftSize),
      renderCell: (item: ComparisonListItem) => (
        <CellValue
          value={item.meta.rightSize - item.meta.leftSize}
          color={colorDirection}
          format={[ByteFormat, SignedFormat]}
        />
      )
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'pctSizeChange',
      renderHeaderCell: () => '% Size Change',
      compare: (a, b) =>
        (a.meta.rightSize - a.meta.leftSize) / a.meta.leftSize -
        (b.meta.rightSize - b.meta.rightSize) / b.meta.rightSize,
      renderCell: (item: ComparisonListItem) => (
        <CellValue
          value={item.meta.rightSize - item.meta.leftSize}
          color={colorDirection}
          format={[ByteFormat, SignedFormat]}
        />
      )
    }
  },
  {
    sizeOptions: numericColumnSizeOptions,
    columnDef: {
      columnId: 'pctTotalChange',
      renderHeaderCell: () => '% Total Change',
      compare: (a, b) => a.descendantInfo.ratioChangeOfTotal - b.descendantInfo.ratioChangeOfTotal,
      renderCell: (item: ComparisonListItem) => (
        <CellValue
          value={item.descendantInfo.ratioChangeOfTotal}
          background={colorFraction}
          format={PercentageFormat}
        />
      )
    }
  }
];
