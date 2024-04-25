import type { Stats } from 'fs';
import { FStatFlags } from './VirtualFileSystem';

export abstract class FSEntryBase implements Stats {
  public readonly dev = 0;
  public readonly ino = 0;
  public readonly nlink = 1;
  public readonly uid = 0;
  public readonly gid = 0;
  public readonly rdev = 0;
  public readonly blksize = 4096;
  private readonly modifiedTime = new Date(0);

  constructor(
    public readonly size: number,
    private readonly _type: 'file' | 'directory'
  ) {}

  public isFile(): boolean {
    return this._type === 'file';
  }
  public isDirectory(): boolean {
    return this._type === 'directory';
  }
  public get mode() {
    return (this.isFile() ? FStatFlags.S_IFREG : FStatFlags.S_IFDIR) | FStatFlags.S_IRUSR;
  }
  public get blocks(): number {
    return Math.ceil(this.size / this.blksize) + 1;
  }
  public get atimeMs(): number {
    return this.atime.getTime();
  }
  public get mtimeMs(): number {
    return this.mtime.getTime();
  }
  public get ctimeMs(): number {
    return this.ctime.getTime();
  }
  public get birthtimeMs(): number {
    return this.birthtime.getTime();
  }
  public get atime(): Date {
    return this.modifiedTime;
  }
  public get mtime(): Date {
    return this.modifiedTime;
  }
  public get ctime(): Date {
    return this.modifiedTime;
  }
  public get birthtime(): Date {
    return this.modifiedTime;
  }
  isBlockDevice(): boolean {
    return false;
  }
  isCharacterDevice(): boolean {
    return false;
  }
  isSymbolicLink(): boolean {
    return false;
  }
  isFIFO(): boolean {
    return false;
  }
  isSocket(): boolean {
    return false;
  }
}
