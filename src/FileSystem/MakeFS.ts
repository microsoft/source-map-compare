import type { Stats, Dirent } from 'fs';
import type { FSOption } from 'glob';
import type { FSDirectory, FSEntryType } from './VirtualFileSystem';

export function getEntry(entry: FSDirectory, path: string) {
  const parts = path.split('/');
  if (parts[0] === '') parts.shift();
  let currentEntry: FSEntryType = entry;
  do {
    if (currentEntry.type !== 'directory') {
      throw new Error('ENOTDIR');
    }
    const part = parts.shift();
    if (part === undefined || part === '') break;
    const nextEntry = currentEntry.entries.get(part);
    if (!nextEntry) {
      throw new Error('ENOENT');
    }
    currentEntry = nextEntry;
  } while (parts.length > 0);
  return currentEntry;
}

export function makeFS(root: FSDirectory) {
  return {
    get promises(): FSOption['promises'] {
      return this as FSOption['promises'];
    },
    existsSync(path: string): boolean {
      try {
        getEntry(root, path);
        return true;
      } catch (e) {
        return false;
      }
    },
    readdir(
      dirPath: string,
      options: { withFileTypes: true },
      cb?: (er: NodeJS.ErrnoException | null, entries?: Dirent[] | undefined) => unknown
    ): void | Promise<Dirent[]> {
      try {
        return Promise.resolve(this.readdirSync(dirPath, options));
      } catch (e) {
        if (cb) {
          cb(e as NodeJS.ErrnoException);
          return;
        }
        return Promise.reject(e);
      }
    },

    lstatSync(path: string): Stats {
      const entry = getEntry(root, path);
      return entry;
    },
    readdirSync(dirPath: string, options: { withFileTypes: true }): Dirent[] {
      if (!options.withFileTypes) {
        throw new Error('only withFileTypes is supported');
      }
      const entry = getEntry(root, dirPath);
      if (entry.type !== 'directory') {
        throw new Error('ENOTDIR');
      }
      return [...entry.entries.values()];
    },
    readlinkSync(path: string): string {
      return path;
    },
    realpathSync(path: string): string {
      return path;
    },
    readFileSync(path: string, _encoding: 'utf8'): string {
      const entry = getEntry(root, path);
      if (entry.type !== 'file') {
        throw new Error('EISDIR');
      }
      return entry.read();
    },
    lstat(path: string): Promise<Stats> {
      return Promise.resolve(this.lstatSync(path));
    },
    readlink(path: string): Promise<string> {
      return Promise.resolve(this.readlinkSync(path));
    },
    realpath(path: string): Promise<string> {
      return Promise.resolve(this.realpathSync(path));
    },
    readFile(path: string, encoding: 'utf8'): Promise<string> {
      return Promise.resolve(this.readFileSync(path, encoding));
    }
  };
}
