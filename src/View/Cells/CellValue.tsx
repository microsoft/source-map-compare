import React from 'react';
import { ChevronDown24Regular, ChevronRight24Regular, Javascript24Regular } from '@fluentui/react-icons';
import { useStyles } from './CellValue.styles';
import type { ListItem } from '../../Model';

export type ColorFunction = (val: number) => `rgb(${number},${number},${number})` | undefined;

export type NumberFormatProp =
  | Intl.NumberFormatOptions
  | ((value: number) => Intl.NumberFormatOptions)
  | (Intl.NumberFormatOptions | ((value: number) => Intl.NumberFormatOptions))[];

export interface CellValueProps {
  value: number;
  format?: NumberFormatProp;
  color?: ColorFunction;
  background?: ColorFunction;
}

export const NameCell: React.FC<{ item: ListItem }> = ({ item }) => {
  const styles = useStyles();
  return (
    <div className={styles.nameCell} style={{ paddingLeft: item.level * 24 }}>
      {item.isDirectory ? (
        <>
          <ChevronDown24Regular className="expanded" />
          <ChevronRight24Regular className="collapsed" />
        </>
      ) : (
        <Javascript24Regular />
      )}
      <span className={styles.nameLabel}>{item.name}</span>
    </div>
  );
};

export const CellValue: React.FC<CellValueProps> = ({ value, format, color, background }) => {
  const { numericCell } = useStyles();
  const style = React.useMemo(
    () => ({
      color: color?.(value),
      backgroundColor: background?.(value)
    }),
    [color, background, value]
  );
  const formatOptions = React.useMemo<Intl.NumberFormatOptions>(() => {
    if (!format) {
      return {};
    }
    function evaluateFormat(format: Intl.NumberFormatOptions | ((value: number) => Intl.NumberFormatOptions)) {
      if (typeof format === 'function') {
        return format(value);
      }
      return format;
    }

    if (format instanceof Array) {
      return Object.assign({}, ...format.map<Intl.NumberFormatOptions>(evaluateFormat));
    }
    return evaluateFormat(format);
  }, [format, value]);

  let adjustedValue = value;
  if (formatOptions.style === 'unit') {
    switch (formatOptions.unit) {
      case 'kilobyte':
        adjustedValue /= 1024;
        break;
      case 'megabyte':
        adjustedValue /= 1048576;
        break;
    }
  }

  return (
    <div className={numericCell} style={style}>
      {!!value && Number.isFinite(value) ? adjustedValue.toLocaleString(undefined, formatOptions) : '--'}
    </div>
  );
};
