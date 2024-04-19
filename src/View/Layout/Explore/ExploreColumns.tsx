import React from 'react';
import type { SizeListItem } from '../../../Model/SingleBundle';
import { ByteFormat, colorFraction, PercentageFormat } from '../../CellFormats';
import { CellValue } from '../../CellValue';
import type { ColumnInfo } from '../../ColumnInfo';
import { nameColumn, compareSizeItem } from '../Common';

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
