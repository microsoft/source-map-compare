import type { Stats, Dirent } from 'fs';
import path from 'path';
import { FSEntryBase as WebFSEntry } from '../FSEntryBase';

export class WebFSFile extends WebFSEntry implements Stats, Dirent {
  public readonly type = 'file';
  public readonly name: string;
  public readonly file: FileSystemFileEntry;
  public readonly path: string;
  private readonly contents: string;
  constructor(parentPath: string, name: string, entry: FileSystemFileEntry, file: File, contents: string) {
    super(file.size, 'file');
    this.path = path.join(parentPath, name);
    this.name = name;
    this.file = entry;
    this.contents = contents;
  }
  read(): string {
    return this.contents;
  }
}
