import React from 'react';
import type { FileData } from 'source-map-explorer/lib/types';
import type { ListItem } from '../../Model';
import { ByteFormat, colorFraction, PercentageFormat, CellValue, type ColumnInfo } from '../../Components';
import type { DescendantSizeInfo } from './ExploreLayoutBuilder';

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
