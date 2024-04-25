export {};

/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  interface FileSystemEntry {}
  type FileSystemEntryUnion = FileSystemFileEntry | FileSystemDirectoryEntry;
  interface FileSystemFileEntry {
    isDirectory: false;
    isFile: true;
    // file(): Promise<File>;
  }
  interface FileSystemDirectoryEntry {
    isDirectory: true;
    isFile: false;
  }
}

// const fsfFile: (successCallback: (file: File) => void, errorCallback?: (err: any) => void) => void =
//   FileSystemFileEntry.prototype.file;
// FileSystemFileEntry.prototype.file = function (cb?: (file: File) => void, eb?: (err?: any) => void) {
//   const result = new Promise<File>((resolve, reject) => fsfFile.apply(this, [resolve, reject]));
//   if (cb) result.then(cb, eb);
//   return result;
// };
