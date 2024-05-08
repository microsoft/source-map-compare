export const SignedFormat: Intl.NumberFormatOptions = { signDisplay: 'exceptZero' };

export const PercentageFormat: Intl.NumberFormatOptions = { style: 'percent', minimumFractionDigits: 2 };

export const ByteFormattingRules: [limit: number, format: Intl.NumberFormatOptions][] = [
  [10240, { style: 'unit', unit: 'byte', unitDisplay: 'narrow', useGrouping: true }],
  [10485760, { style: 'unit', unit: 'kilobyte', unitDisplay: 'narrow', useGrouping: true, minimumFractionDigits: 2 }],
  [10737418240, { style: 'unit', unit: 'megabyte', unitDisplay: 'narrow', useGrouping: true, minimumFractionDigits: 2 }]
];

export function ByteFormat(value: number): Intl.NumberFormatOptions {
  for (const [limit, format] of ByteFormattingRules) {
    if (value <= limit) {
      return format;
    }
  }
  return ByteFormattingRules[ByteFormattingRules.length - 1][1];
}

type RGB = `${number},${number},${number}`;

export type CssColor = `rgb(${RGB})` | `rgba(${RGB},${number})`;

export function colorFraction(val: number): CssColor | undefined {
  let rgb: RGB | undefined;
  let a: number | undefined;

  if (val >= 0) {
    // Red shade
    a = val * 0.5;
    rgb = '255,0,0';
  } else {
    // Green shade
    a = -val * 0.5;
    rgb = '0,255,0';
  }
  if (rgb === undefined || a === undefined) {
    return undefined;
  }
  return `rgba(${rgb},${Math.min(1, a).toFixed(2) as `${number}`})`;
}

export function colorDirection(value: number): CssColor | undefined {
  if (value > 0) {
    return 'rgb(255, 0, 0)';
  } else if (value < 0) {
    return 'rgb(0, 128, 0)';
  }
  return undefined;
}
