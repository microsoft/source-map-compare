import React from 'react';
import { ChevronDownRegular, ChevronRightRegular, JavascriptRegular } from '@fluentui/react-icons';
import type { ComparisonListItem } from '../Model/BundleComparison';
import type { ListItem } from '../Model/FileList';
import type { SizeListItem } from '../Model/SingleBundle';
import { CellValue } from './CellValue';
import { ByteFormat, PercentageFormat, SignedFormat, colorDirection, colorFraction } from './CellFormats';
import type { ColumnInfo } from './ColumnInfo';

function compareListItem(a: ListItem, b: ListItem): number {
  return a.name.localeCompare(b.name);
}

function compareSizeItem(a: SizeListItem, b: SizeListItem): number {
  return a.meta.size - b.meta.size;
}

const nameColumn: ColumnInfo<ListItem> = {
  minWidth: 120,
  columnId: 'name',
  compare: compareListItem,
  label: 'Name',
  renderCell: (item: ListItem) => (
    <span style={{ paddingLeft: item.level * 24 }}>
      {item.isDirectory ? (
        <>
          <ChevronDownRegular className="expanded" />
          <ChevronRightRegular className="collapsed" />
        </>
      ) : (
        <JavascriptRegular />
      )}
      <span style={{ marginLeft: 10 }}>{item.name}</span>
    </span>
  )
};

export const singleBundleColumns: ColumnInfo<SizeListItem>[] = [
  nameColumn,
  {
    minWidth: 80,
    columnId: 'size',
    compare: compareSizeItem,
    label: 'Size',
    renderCell: (item: SizeListItem) => <CellValue value={item.meta.size} format={ByteFormat} />
  },
  {
    minWidth: 80,
    columnId: 'pctSize',
    compare: compareSizeItem,
    label: '% Size',
    renderCell: (item: SizeListItem) => (
      <CellValue value={item.descendantInfo.ratioOfTotal} background={colorFraction} format={PercentageFormat} />
    )
  },
  {
    minWidth: 80,
    columnId: 'pctSizeParent',
    compare: compareSizeItem,
    label: '% Size in Parent',
    renderCell: (item: SizeListItem) => (
      <CellValue value={item.descendantInfo.ratioOfParent} background={colorFraction} format={PercentageFormat} />
    )
  }
];

export const bundleComparisonColumns: ColumnInfo<ComparisonListItem>[] = [
  nameColumn,
  {
    minWidth: 80,
    columnId: 'leftSize',
    label: 'Left Size',
    compare: (a, b) => a.meta.leftSize - b.meta.leftSize,
    renderCell: (item: ComparisonListItem) => <CellValue value={item.meta.leftSize} format={ByteFormat} />
  },
  {
    minWidth: 80,
    columnId: 'rightSize',
    label: 'Right Size',
    compare: (a, b) => a.meta.rightSize - b.meta.rightSize,
    renderCell: (item: ComparisonListItem) => <CellValue value={item.meta.rightSize} format={ByteFormat} />
  },
  {
    minWidth: 80,
    columnId: 'changeSize',
    label: 'Change',
    compare: (a, b) => a.meta.rightSize - a.meta.leftSize - (b.meta.rightSize - b.meta.leftSize),
    renderCell: (item: ComparisonListItem) => (
      <CellValue
        value={item.meta.rightSize - item.meta.leftSize}
        color={colorDirection}
        format={[ByteFormat, SignedFormat]}
      />
    )
  },
  {
    minWidth: 80,
    columnId: 'pctSizeChange',
    label: '% Size Change',
    compare: (a, b) =>
      (a.meta.rightSize - a.meta.leftSize) / a.meta.leftSize - (b.meta.rightSize - b.meta.rightSize) / b.meta.rightSize,
    renderCell: (item: ComparisonListItem) => (
      <CellValue
        value={item.meta.rightSize - item.meta.leftSize}
        color={colorDirection}
        format={[ByteFormat, SignedFormat]}
      />
    )
  },
  {
    minWidth: 80,
    columnId: 'pctTotalChange',
    label: '% Total Change',
    compare: (a, b) => a.descendantInfo.ratioChangeOfTotal - b.descendantInfo.ratioChangeOfTotal,
    renderCell: (item: ComparisonListItem) => (
      <CellValue value={item.descendantInfo.ratioChangeOfTotal} background={colorFraction} format={PercentageFormat} />
    )
  }
];
