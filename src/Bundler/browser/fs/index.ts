import type { FSOption } from 'glob';
import { notReached } from '../../../Helpers';
import * as promises from './promises';

export const lstatSync = notReached;
export const readdir = notReached;
export const readdirSync = notReached;
export const readlinkSync = notReached;
export const realpathSync = notReached;
export { promises };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Object.assign(realpathSync as any, { native: notReached });

const fs: FSOption = {
  lstatSync,
  readdir,
  readdirSync,
  readlinkSync,
  realpathSync,
  promises
};

export default fs;
