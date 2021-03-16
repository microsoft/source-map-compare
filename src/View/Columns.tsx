import { IColumn, Icon, mergeStyleSets } from '@fluentui/react';
import * as React from 'react';
import { ComparisonListItem } from '../Model/BundleComparison';
import { ListItem } from '../Model/FileList';
import { SizeListItem } from '../Model/SingleBundle';

const stringifyNumWithCommaSeparators = (num: number): string =>
  String(num)
    .split('')
    .map((digit, idx, arr) => ((arr.length - idx) % 3 === 0 && idx > 0 ? `,${digit}` : digit))
    .join('');

const classNames = mergeStyleSets({
  numericColumn: {
    textAlign: 'right'
  }
});

const renderFraction = (val: number): JSX.Element => {
  let rgb: [number, number, number];

  if (val >= 0) {
    // Red shade
    const colorVal = Math.min(Math.round((1 - val) * 155) + 100, 255);
    rgb = [255, colorVal, colorVal];
  } else {
    // Green shade
    const colorVal = Math.min(Math.round((val + 1) * 155) + 100, 255);
    rgb = [colorVal, 255, colorVal];
  }

  return <div style={{ backgroundColor: `rgb(${rgb.join(',')})` }}>{`${(val * 100).toFixed(2)}%`}</div>;
};

const numericColumnBase: Omit<IColumn, 'key' | 'name'> = {
  minWidth: 80,
  isResizable: true,
  className: classNames.numericColumn
};

const nameColumn: IColumn = {
  key: 'name',
  name: 'Name',
  fieldName: 'name',
  minWidth: 120,
  isResizable: true,
  onRender: (item: ListItem<unknown, unknown, unknown>) => (
    <span style={{ paddingLeft: item.level * 24 }}>
      <Icon iconName={item.isDirectory ? (item.expanded ? 'ChevronDownMed' : 'ChevronRightMed') : 'FileCode'} />
      <span style={{ marginLeft: 10 }}>{item.name}</span>
    </span>
  )
};

export const singleBundleColumns: IColumn[] = [
  nameColumn,
  {
    key: 'size',
    name: 'Size',
    ...numericColumnBase,
    onRender: (item: SizeListItem) => stringifyNumWithCommaSeparators(item.meta.size)
  },
  {
    key: 'pctSize',
    name: '% Size',
    ...numericColumnBase,
    onRender: (item: SizeListItem) => renderFraction(item.descendantInfo.ratioOfTotal)
  },
  {
    key: 'pctSizeParent',
    name: '% Size in Parent',
    ...numericColumnBase,
    onRender: (item: SizeListItem) => renderFraction(item.descendantInfo.ratioOfParent)
  }
];

export const bundleComparisonColumns: IColumn[] = [
  nameColumn,
  {
    key: 'leftSize',
    name: 'Left Size',
    ...numericColumnBase,
    onRender: (item: ComparisonListItem) =>
      item.meta.leftSize === 0 ? '--' : stringifyNumWithCommaSeparators(item.meta.leftSize)
  },
  {
    key: 'rightSize',
    name: 'Right Size',
    ...numericColumnBase,
    onRender: (item: ComparisonListItem) =>
      item.meta.rightSize === 0 ? '--' : stringifyNumWithCommaSeparators(item.meta.rightSize)
  },
  {
    key: 'pctSizeChange',
    name: '% Size Change',
    ...numericColumnBase,
    onRender: (item: ComparisonListItem) =>
      item.meta.leftSize > 0 ? renderFraction((item.meta.rightSize - item.meta.leftSize) / item.meta.leftSize) : '--'
  },
  {
    key: 'pctTotalChange',
    name: '% Total Change',
    ...numericColumnBase,
    onRender: (item: ComparisonListItem) =>
      Number.isFinite(item.descendantInfo.ratioChangeOfTotal) && item.descendantInfo.ratioChangeOfTotal !== 0
        ? renderFraction(item.descendantInfo.ratioChangeOfTotal)
        : '--'
  }
];
