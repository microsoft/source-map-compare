export const OUTPUT_FLAVORS = ['production', 'dev'] as const;

export interface CommonOptions {
  outputFile?: string;
  outputFlavor?: (typeof OUTPUT_FLAVORS)[number];
  noCdn?: boolean;
}
