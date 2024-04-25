import type { FSOption } from 'glob';
import { FSEntryBase } from './FSEntryBase';
import type { FSDirectory, VirtualFileSystemEvent, VirtualFileSystemStats } from './VirtualFileSystem';
import { WebFileSystem } from './WebFS';
import { makeFS } from './MakeFS';

export interface FileSystemInfo {
  entryName: string;
  name: string;
  stats: VirtualFileSystemStats;
  status: 'pending' | 'mounted' | 'error';
  fs: WebFileSystem;
}

interface FileSystemCollectionEventMap {
  directorychange: FileSystemCollectionEvent;
}

export class FileSystemCollectionEvent extends Event {
  constructor(
    eventName: string,
    public readonly directoryName: string
  ) {
    super(eventName);
  }
}

export class FileSystemCollection extends FSEntryBase implements FSDirectory {
  public readonly id = 'root';
  public readonly type = 'directory';
  public readonly entries: Map<string, FSDirectory> = new Map();
  public readonly fileSystems: Record<string, FileSystemInfo> = {};
  public readonly name: string = 'FileSystem';
  public readonly path: string = '';
  public readonly fs: FSOption;

  private readonly eventTarget = new EventTarget();
  private listeners = new WeakMap<
    (this: FileSystemCollection, ev: FileSystemCollectionEventMap[keyof FileSystemCollectionEventMap]) => void,
    EventListenerOrEventListenerObject
  >();

  constructor() {
    super(0, 'directory');
    this.fs = makeFS(this);
  }

  async addFilesystem(entryName: string, fs: FileSystem) {
    const wfs = new WebFileSystem(entryName, fs);
    this.fileSystems[fs.name] = { entryName, name: fs.name, stats: wfs.stats, status: 'pending', fs: wfs };
    wfs.addListener('statechange', this.onFilesystemStateChanged);
    wfs.addListener('stats', this.onStatsChanged);
    this.entries.set(entryName, await wfs.read());
  }

  hasFilesystem(fs: FileSystem) {
    return !!this.fileSystems[fs.name];
  }

  public addListener<K extends keyof FileSystemCollectionEventMap>(
    type: K,
    listener: (this: FileSystemCollection, ev: FileSystemCollectionEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    const listenerFn = (e: Event) => listener.call(this, e as FileSystemCollectionEvent);
    this.listeners.set(listener, listenerFn);
    return this.eventTarget.addEventListener(type, listenerFn, options);
  }

  public removeListener<K extends keyof FileSystemCollectionEventMap>(
    type: K,
    listener: (this: FileSystemCollection, ev: FileSystemCollectionEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    const listenerFn = this.listeners.get(listener);
    return this.eventTarget.removeEventListener(type, listenerFn || null, options);
  }

  private emit(eventName: keyof FileSystemCollectionEventMap, entryName: string) {
    this.eventTarget.dispatchEvent(new FileSystemCollectionEvent(eventName, entryName));
  }

  private onStatsChanged = (e: VirtualFileSystemEvent) => {
    const fs = this.fileSystems[e.target.id];
    this.emit('directorychange', fs.entryName);
  };

  private onFilesystemStateChanged = (e: VirtualFileSystemEvent) => {
    const fs = this.fileSystems[e.target.id];
    switch (e.target.state) {
      case 'loaded': {
        fs.status = 'mounted';
        this.emit('directorychange', fs.entryName);
        break;
      }
      case 'error': {
        fs.status = 'error';
        this.emit('directorychange', fs.entryName);
        break;
      }
      case 'disposed': {
        delete this.fileSystems[e.target.id];
        this.entries.delete(fs.entryName);
        this.emit('directorychange', fs.entryName);
        break;
      }
    }
  };
}
