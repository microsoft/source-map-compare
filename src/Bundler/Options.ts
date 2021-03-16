import { TupleToUnion } from '../Helpers/TypeUtils';

export const OUTPUT_FLAVORS = ['production', 'dev'] as const;

export interface CommonOptions {
  outputFile?: string;
  outputFlavor?: TupleToUnion<typeof OUTPUT_FLAVORS>;
  noCdn?: boolean;
}
