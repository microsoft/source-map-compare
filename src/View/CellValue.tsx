import * as React from 'react';
import { useStyles } from './CellValue.styles';

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

export const CellValue: React.FC<CellValueProps> = ({ value, format, color, background }) => {
  const { numericColumn } = useStyles();
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
    <div className={numericColumn} style={style}>
      {!!value && Number.isFinite(value) ? adjustedValue.toLocaleString(undefined, formatOptions) : '--'}
    </div>
  );
};
