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

export function colorFraction(val: number): `rgb(${number},${number},${number})` {
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
  return `rgb(${rgb.join(',')})` as `rgb(${number},${number},${number})`;
}

export function colorDirection(value: number): `rgb(${number},${number},${number})` | undefined {
  if (value > 0) {
    return 'rgb(255, 0, 0)';
  } else if (value < 0) {
    return 'rgb(0, 128, 0)';
  }
  return undefined;
}
