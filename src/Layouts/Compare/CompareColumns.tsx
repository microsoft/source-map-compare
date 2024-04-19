import React from 'react';
import { ByteFormat, colorDirection, SignedFormat, colorFraction, PercentageFormat, CellValue } from '../../View/Cells';
import type { ColumnInfo } from '../../View/ColumnInfo';
import type { BundleComparison, DescendantComparisonInfo } from './CompareLayoutBuilder';
import type { ListItem } from '../../Model';

export const bundleComparisonColumns: ColumnInfo<
  ListItem<BundleComparison, BundleComparison, DescendantComparisonInfo>
>[] = [
  {
    minWidth: 80,
    columnId: 'baseline.size',
    label: 'Baseline Size',
    compare: (a, b) => a.meta.baseline.size - b.meta.baseline.size,
    renderCell: item => <CellValue value={item.meta.baseline.size} format={ByteFormat} />
  },
  {
    minWidth: 80,
    columnId: 'compare.size',
    label: 'Compare Size',
    compare: (a, b) => a.meta.compare.size - b.meta.compare.size,
    renderCell: item => <CellValue value={item.meta.compare.size} format={ByteFormat} />
  },
  {
    minWidth: 80,
    columnId: 'changeSize',
    label: 'Change',
    compare: (a, b) => a.meta.compare.size - a.meta.baseline.size - (b.meta.compare.size - b.meta.baseline.size),
    renderCell: item => (
      <CellValue
        value={item.meta.compare.size - item.meta.baseline.size}
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
      (a.meta.compare.size - a.meta.baseline.size) / a.meta.baseline.size -
      (b.meta.compare.size - b.meta.compare.size) / b.meta.compare.size,
    renderCell: item => (
      <CellValue
        value={item.meta.compare.size - item.meta.baseline.size}
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
    renderCell: item => (
      <CellValue value={item.descendantInfo.ratioChangeOfTotal} background={colorFraction} format={PercentageFormat} />
    )
  }
];
