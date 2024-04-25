import React from 'react';
import {
  FileSystemCollection,
  type FileSystemCollectionEvent,
  type FileSystemInfo
} from '../FileSystem/FileSystemCollection';
import { useStyles } from './FileInput.styles';
import type { TreeItemValue, TreeOpenChangeData, TreeOpenChangeEvent } from '@fluentui/react-components';
import { Card, CardHeader, Field, Input, Tree, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import { useDebouncedCallback } from 'use-debounce';
import { type FSOption, glob } from 'glob';
import {
  AddSquare16Regular,
  AppsListDetail24Regular,
  Folder16Regular,
  Javascript16Regular,
  SubtractSquare16Regular
} from '@fluentui/react-icons';

export interface FileInputProps {
  title: string;
  fsChanged: (fs: FSOption) => void;
  globChanged: (glob: string) => void;
}

function getValidationProps(
  filesystems: FileSystemInfo[],
  filteredFiles: string[] | undefined,
  globPattern: string
): { state: 'none' | 'warning' | 'success'; message: string | undefined } {
  if (filesystems.length === 0) {
    return { state: 'none', message: undefined };
  }
  // no glob
  if (!filteredFiles?.length) {
    if (globPattern === '') {
      return { state: 'none', message: undefined };
    } else {
      return { state: 'warning', message: 'No files found' };
    }
  }
  return { state: 'success', message: `${filteredFiles.length} files matched` };
}

export const FileInput: React.FC<FileInputProps> = ({ title, fsChanged, globChanged }) => {
  const styles = useStyles();
  const fsRoot = React.useRef(new FileSystemCollection());
  const [filesystems, setFileSystems] = React.useState<FileSystemInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = React.useState<string[] | undefined>();
  const [globPattern, setGlobPattern] = React.useState<string>('**/*.js');

  const refreshGlob = useDebouncedCallback(
    () => {
      if (globPattern === '') {
        setFilteredFiles(undefined);
      } else if (filesystems.length > 0) {
        setFilteredFiles(glob.globSync(globPattern, { fs: fsRoot.current.fs }));
      }
    },
    1000,
    { trailing: true }
  );

  React.useEffect(refreshGlob, [globPattern, filesystems]);

  const onGlobPatternChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobPattern(e.target.value);
    globChanged(e.target.value);
  }, []);

  React.useEffect(() => {
    const listener = (_e: FileSystemCollectionEvent) => {
      setFileSystems(Object.values(fsRoot.current.fileSystems));
      fsChanged(fsRoot.current.fs);
    };
    fsRoot.current.addListener('directorychange', listener);
    return () => {
      fsRoot.current.removeListener('directorychange', listener);
    };
  }, []);
  const onDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();

    // TODO: handle loose files
    const { filesystems } = getFiles(e);
    for (const fs of filesystems) {
      if (fsRoot.current.fileSystems[fs.name]) {
        continue;
      }
      fsRoot.current.addFilesystem(`Directory ${Object.values(fsRoot.current.fileSystems).length}`, fs);
    }
    e.preventDefault();
  }, []);
  const onDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const { state, message } = getValidationProps(filesystems, filteredFiles, globPattern);

  const fileTree = React.useMemo(() => {
    const tree: Record<string, string[]> = {};
    for (const file of filteredFiles ?? []) {
      const parts = file.split('/');
      let dir = parts.shift()!;
      if (dir === '') dir = parts.shift()!;
      const fileName = parts.join('/');
      if (!tree[dir]) {
        tree[dir] = [];
      }
      tree[dir].push(fileName);
    }
    return tree;
  }, [filteredFiles]);
  const [treeOpenItems, setTreeOpenItems] = React.useState<TreeItemValue[]>([]);
  const handleOpenChange = (_event: TreeOpenChangeEvent, data: TreeOpenChangeData) => {
    setTreeOpenItems(curr => (data.open ? [...curr, data.value] : curr.filter(value => value !== data.value)));
  };
  const tree = React.useMemo(() => {
    return (
      <Tree size="small" onOpenChange={handleOpenChange} openItems={treeOpenItems}>
        {Object.entries(fileTree).map(([dir, files]) => (
          <TreeItem itemType={files.length > 0 ? 'branch' : 'leaf'} value={dir}>
            <TreeItemLayout
              className={styles.treeLayout}
              iconBefore={<Folder16Regular />}
              expandIcon={treeOpenItems.includes(dir) ? <SubtractSquare16Regular /> : <AddSquare16Regular />}>
              {dir}
            </TreeItemLayout>
            <Tree>
              {files.map(file => (
                <TreeItem itemType="leaf" value={file}>
                  <TreeItemLayout main={{ className: styles.treeLayout }} iconBefore={<Javascript16Regular />}>
                    {file}
                  </TreeItemLayout>
                </TreeItem>
              ))}
            </Tree>
          </TreeItem>
        ))}
      </Tree>
    );
  }, [fileTree, treeOpenItems, handleOpenChange]);

  return (
    <Card className={styles.root} onDrop={onDrop} onDragOver={onDragOver}>
      <CardHeader image={<AppsListDetail24Regular />} header={title} />
      <div>Drag one or more files to view</div>
      <Field className={styles.globInput} label="Glob pattern" validationState={state} validationMessage={message}>
        <Input
          size="small"
          value={globPattern}
          onChange={onGlobPatternChange}
          autoComplete="off"
          aria-autocomplete="none"
        />
      </Field>
      <div className={styles.tree}>{tree}</div>
    </Card>
  );
};

function getFiles(e: React.DragEvent<HTMLDivElement>) {
  const files: File[] = [];
  const filesystems = new Set<FileSystem>();
  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (const item of e.dataTransfer.items as unknown as DataTransferItem[]) {
      // If dropped items aren't files, reject them
      if (item.kind !== 'file') continue;

      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        filesystems.add(entry.filesystem);
        continue;
      }

      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    files.push(...(e.dataTransfer.files as unknown as File[]));
  }
  return { files, filesystems: [...filesystems] };
}
