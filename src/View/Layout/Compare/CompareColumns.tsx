import React from 'react';
import type { ComparisonListItem } from '../../../Model/BundleComparison';
import { ByteFormat, colorDirection, SignedFormat, colorFraction, PercentageFormat } from '../../CellFormats';
import { CellValue } from '../../CellValue';
import type { ColumnInfo } from '../../ColumnInfo';
import { nameColumn } from '../Common';

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
