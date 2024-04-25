import './FileSystem.polyfills';
import { WebFSFile } from './WebFSFile';
import { WebFSDirectory } from './WebFSDirectory';
import { VirtualFileSystem, type VirtualFileSystemStats, type VirtualFileSystemState } from '../VirtualFileSystem';

export class WebFileSystem extends VirtualFileSystem {
  public readonly id: string;
  public readonly root: WebFSDirectory;
  public readonly stats: VirtualFileSystemStats = {
    directories: 0,
    files: 0
  };

  private readonly workers = new Set<string>();
  private readonly pendingDirs = new Set<WebFSDirectory>();

  private error?: unknown;
  private loadingDone?: () => void;
  private loadingError?: (err: unknown) => void;
  private loadingPromise: Promise<void>;
  private isDisposed = false;

  constructor(
    public readonly name: string,
    private readonly filesystem: FileSystem,
    parentPath: string = '/'
  ) {
    super();
    this.id = filesystem.name;
    this.root = new WebFSDirectory(parentPath, name, filesystem.root);
    this.loadingPromise = new Promise<void>((resolve, reject) => {
      const endLoading = () => {
        delete this.loadingDone;
        delete this.loadingError;
      };
      this.loadingDone = () => {
        endLoading();
        this.emit('statechange');
        resolve();
      };
      this.loadingError = e => {
        endLoading();
        this.emit('statechange');
        reject((this.error = e));
      };
    });
  }

  public get state(): VirtualFileSystemState {
    if (this.isDisposed) return 'disposed';
    if (this.error) return 'error';
    if (this.workers.size > 0 || this.pendingDirs.size > 0) return 'loading';
    return 'loaded';
  }

  public async read(): Promise<WebFSDirectory> {
    this.emit('statechange');
    this.readDirectory(this.root, this.filesystem.root);
    await this.loadingPromise;
    return this.root;
  }

  public dispose() {
    // suspend read operations
    this.isDisposed = true;
    this.loadingError?.(new Error('FileSystem was disposed before read completed.'));
    this.emit('statechange');
  }

  protected get rootEntry(): WebFSDirectory {
    if (this.isDisposed) throw new Error('FileSystem has been disposed');
    return this.root;
  }

  private endWorker(name: string) {
    this.workers.delete(name);
    this.checkCompleted();
  }

  private checkCompleted() {
    if (this.workers.size === 0 && this.pendingDirs.size === 0) {
      this.loadingDone?.();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- typed values are opaque to this method.
  private trackCallback<R, T extends (...args: any[]) => R>(name: string, callback: T): T {
    this.workers.add(name);
    return ((...args: Parameters<T>) => {
      const result = callback(...args);
      this.endWorker(name);
      return result;
    }) as T;
  }
  private trackPromise<T>(name: string, promise: Promise<T>) {
    this.workers.add(name);
    promise.finally(() => {
      this.endWorker(name);
    });
    return promise;
  }

  private async readEntry(parent: WebFSDirectory, entry: FileSystemEntryUnion) {
    if (this.isDisposed) return;
    if (entry.isFile) {
      const fileEntry = await this.trackPromise(
        `read entry: ${entry.fullPath}`,
        new Promise<File>((resolve, reject) => entry.file(resolve, reject))
      );
      const contents = await fileEntry.text();
      const file = new WebFSFile(parent.path, entry.name, entry, fileEntry, contents);
      parent.entries.set(entry.name, file);

      ++this.stats.files;
      this.emit('statechange');
    } else if (entry.isDirectory) {
      const dir = new WebFSDirectory(parent.path, entry.name, entry);
      parent.entries.set(entry.name, dir);

      ++this.stats.directories;
      this.emit('statechange');

      this.readDirectory(dir, entry);
    }
  }

  private readDirectory(dir: WebFSDirectory, entry: FileSystemDirectoryEntry) {
    this.pendingDirs.add(dir);
    const reader = entry.createReader();
    reader.readEntries(
      this.trackCallback(`read entries: ${entry.fullPath}`, this.successfulReadEntries.bind(this, dir, reader))
    );
  }

  private successfulReadEntries(
    parent: WebFSDirectory,
    reader: FileSystemDirectoryReader,
    entries: FileSystemEntry[]
  ): void {
    if (this.isDisposed) return;
    if (entries.length === 0) {
      this.pendingDirs.delete(parent);
      this.checkCompleted();
      return;
    }
    entries.forEach(entry => this.readEntry(parent, entry as FileSystemEntryUnion));
    reader.readEntries(this.successfulReadEntries.bind(this, parent, reader));
  }
}
