import type { Stats } from 'fs';

export const enum FStatFlags {
  S_IFMT = 61440,
  S_IFREG = 32768,
  S_IFDIR = 16384,
  S_IFCHR = 8192,
  S_IFIFO = 4096,
  S_IFLNK = 40960,
  S_IRUSR = 256
}

export interface FSEntry extends Stats {
  readonly name: string;
  readonly path: string;
}

export interface FSDirectory extends FSEntry {
  readonly type: 'directory';
  readonly entries: Map<string, FSEntryType>;
}

export interface FSFile extends FSEntry {
  readonly type: 'file';
  read(): string;
}

export type FSEntryType = FSFile | FSDirectory;

export type VirtualFileSystemState = 'loading' | 'loaded' | 'disposed' | 'error';

export interface VirtualFileSystemStats {
  files: number;
  directories: number;
}

export interface VirtualFileSystemEventMap {
  statechange: VirtualFileSystemEvent;
  stats: VirtualFileSystemEvent;
}

export class VirtualFileSystemEvent extends Event {
  declare target: VirtualFileSystemEventTarget & EventTarget;
  constructor(eventName: string) {
    super(eventName);
  }
}

export interface VirtualFileSystemEvents {
  addListener<K extends keyof VirtualFileSystemEventMap>(
    type: K,
    listener: (this: this, ev: VirtualFileSystemEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): this;
  removeListener(
    type: keyof VirtualFileSystemEventMap,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): this;
  emit(eventName: keyof VirtualFileSystemEventMap): void;
}

export interface VirtualFileSystemEventTarget extends VirtualFileSystemEvents {
  readonly id: string;
  readonly name: string;
  readonly root: FSDirectory;
  readonly stats: VirtualFileSystemStats;
  readonly state: VirtualFileSystemState;

  read(): Promise<FSDirectory>;
}

interface VirtualFileSystemBase {
  new (): VirtualFileSystemEvents;
  prototype: VirtualFileSystemEvents;
}

function makeVirtualFileSystem(): VirtualFileSystemBase {
  class VirtualFileSystemBase extends EventTarget implements VirtualFileSystemEvents, VirtualFileSystemBase {
    addListener<K extends keyof VirtualFileSystemEventMap>(
      type: K,
      listener: (this: this, ev: VirtualFileSystemEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions | undefined
    ): this {
      this.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
      return this;
    }
    removeListener(
      type: keyof VirtualFileSystemEventMap,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions | undefined
    ): this {
      this.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
      return this;
    }
    emit(eventName: keyof VirtualFileSystemEventMap) {
      this.dispatchEvent(new VirtualFileSystemEvent(eventName));
    }
  }
  return VirtualFileSystemBase;
}

const VirtualFileSystemBase = makeVirtualFileSystem();

export abstract class VirtualFileSystem extends VirtualFileSystemBase implements VirtualFileSystemEventTarget {
  abstract get id(): string;
  abstract get name(): string;
  abstract get root(): FSDirectory;
  abstract get stats(): VirtualFileSystemStats;
  abstract get state(): VirtualFileSystemState;
  abstract read(): Promise<FSDirectory>;

  constructor() {
    super();
  }
}
