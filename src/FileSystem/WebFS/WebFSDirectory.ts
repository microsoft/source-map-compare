import type { Stats, Dirent } from 'fs';
import path from 'path';
import { FSEntryBase } from '../FSEntryBase';
import type { WebFSFile } from './WebFSFile';

export type FSEntryType = WebFSFile | WebFSDirectory;

export class WebFSDirectory extends FSEntryBase implements Stats, Dirent {
  public readonly type = 'directory';
  public readonly name: string;
  public readonly directory: FileSystemDirectoryEntry;
  public readonly entries: Map<string, FSEntryType>;
  public readonly path: string;
  public pending?: true;
  constructor(parentPath: string, name: string, directory: FileSystemDirectoryEntry) {
    super(0, 'directory');
    this.path = path.join(parentPath, name);
    this.name = name;
    this.directory = directory;
    this.entries = new Map();
  }
}
