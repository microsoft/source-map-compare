import type { FSOption } from 'glob';
import { notReached } from '../../../Helpers';

export const lstat = notReached;
export const readdir = notReached;
export const readlink = notReached;
export const realpath = notReached;

const promises: Required<FSOption['promises']> = {
  lstat,
  readdir,
  readlink,
  realpath
};

export default promises;
