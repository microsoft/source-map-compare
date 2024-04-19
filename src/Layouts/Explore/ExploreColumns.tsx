import React from 'react';
import type { FileData } from 'source-map-explorer/lib/types';
import { ByteFormat, colorFraction, PercentageFormat, CellValue } from '../../View/Cells';
import type { ColumnInfo } from '../../View/ColumnInfo';
import type { DescendantSizeInfo } from './ExploreLayoutBuilder';
import type { ListItem } from '../../Model';

const exploreColumnBase = {
  minWidth: 80,
  compare(
    a: ListItem<FileData, FileData, DescendantSizeInfo>,
    b: ListItem<FileData, FileData, DescendantSizeInfo>
  ): number {
    return a.meta.size - b.meta.size;
  }
} as const;

function makeColumn(
  columnId: string,
  label: string,
  renderCell: (item: ListItem<FileData, FileData, DescendantSizeInfo>) => React.ReactNode
): ColumnInfo<ListItem<FileData, FileData, DescendantSizeInfo>> {
  return {
    ...exploreColumnBase,
    columnId,
    label,
    renderCell
  };
}

export const singleBundleColumns: ColumnInfo<ListItem<FileData, FileData, DescendantSizeInfo>>[] = [
  makeColumn('size', 'Size', item => <CellValue value={item.meta.size} format={ByteFormat} />),
  makeColumn('pctSize', '% Size', item => (
    <CellValue value={item.descendantInfo.ratioOfTotal} background={colorFraction} format={PercentageFormat} />
  )),
  makeColumn('pctSizeParent', '% Size in Parent', item => (
    <CellValue value={item.descendantInfo.ratioOfParent} background={colorFraction} format={PercentageFormat} />
  ))
];
