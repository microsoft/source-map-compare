import { notReached } from '../Helpers/FunctionalUtils';
import { FileTree, FileTreeDirectory, FileTreeFile } from './FileTree';

export type ListItem<TMeta, TAgg, TDescendentInfo> = {
  name: string;
  nodeId: number;
  level: number;
  /**
   * Tnformation about this node relative to its parent and root
   */
  descendantInfo: TDescendentInfo;
} & ({ isDirectory: true; expanded: boolean; meta: TAgg } | { isDirectory: false; filepath: string; meta: TMeta });

type SearchResult<TMeta, TAgg> = { depth: number; parent: FileTreeDirectory<TMeta, TAgg> | undefined } & (
  | { val: FileTreeDirectory<TMeta, TAgg>; isDirectory: true }
  | { val: FileTreeFile<TMeta>; isDirectory: false }
);

export type ExpandState = Record<number, boolean>;

/**
 * Performs an iterative depth-first search over the FileTree
 *
 * @param fileTree
 * @param expandState
 */
const flattenFileTree = <TMeta, TAgg>(
  fileTree: FileTree<TMeta, TAgg>,
  expandState: ExpandState
): SearchResult<TMeta, TAgg>[] => {
  const results: SearchResult<TMeta, TAgg>[] = [];

  type StackFrame = {
    val: FileTreeDirectory<TMeta, TAgg>;
    depth: number;
    parent: FileTreeDirectory<TMeta, TAgg> | undefined;
  };
  // Stack of directories to visit, along with each's depth
  const stack: StackFrame[] = [{ val: fileTree, depth: 0, parent: undefined }];
  let curr: StackFrame | undefined;
  while ((curr = stack.pop())) {
    results.push({ ...curr, isDirectory: true });

    const { depth, val } = curr;

    if (!expandState[val.nodeId]) {
      // If not expanded, skip children
      continue;
    }

    // iterate over directories in alphabetic order
    stack.push(
      ...Object.keys(curr.val.subdirectories)
        .sort()
        .reverse()
        .map<StackFrame>(name => ({ val: val.subdirectories[name] ?? notReached(), depth: depth + 1, parent: val }))
    );

    // iterate over files in alphabetic order
    for (const fileKey of Object.keys(curr.val.files).sort().reverse()) {
      results.push({ val: curr.val.files[fileKey] ?? notReached(), depth: depth + 1, isDirectory: false, parent: val });
    }
  }
  return results;
};

export type DescendantInfoPredicate<TMeta, TAgg, TDescendentInfo> = (
  curr: FileTreeDirectory<TMeta, TAgg> | FileTreeFile<TMeta>,
  parent: FileTreeDirectory<TMeta, TAgg> | undefined,
  root: FileTree<TMeta, TAgg>
) => TDescendentInfo;

export const makeListFromFileTree = <TMeta, TAgg, TDescendentInfo>(
  root: FileTree<TMeta, TAgg>,
  expandState: ExpandState,
  makeDescendantInfo: DescendantInfoPredicate<TMeta, TAgg, TDescendentInfo>
): ListItem<TMeta, TAgg, TDescendentInfo>[] =>
  flattenFileTree(root, expandState).map<ListItem<TMeta, TAgg, TDescendentInfo>>(result => ({
    level: result.depth,
    name: result.val.name,

    nodeId: result.val.nodeId,
    descendantInfo: makeDescendantInfo(result.val, result.parent, root),
    ...(result.isDirectory
      ? {
          isDirectory: true,
          expanded: expandState[result.val.nodeId],
          meta: result.val.meta
        }
      : {
          filepath: result.val.name,
          isDirectory: false,
          meta: result.val.meta
        })
  }));
