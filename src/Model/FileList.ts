import { notReached } from '../Helpers/FunctionalUtils';
import type { FileTree, FileTreeDirectory, FileTreeFile } from './FileTree';

export interface ListItemBase<TDescendentInfo = unknown> {
  name: string;
  nodeId: number;
  parentNodeId: number | undefined;
  level: number;
  /** Information about this node relative to its parent and root */
  descendantInfo: TDescendentInfo;
}

export interface GroupListItem<TAgg = unknown, TDescendentInfo = unknown> extends ListItemBase<TDescendentInfo> {
  isDirectory: true;
  meta: TAgg;
}

export interface LeafListItem<TMeta = unknown, TDescendentInfo = unknown> extends ListItemBase<TDescendentInfo> {
  isDirectory: false;
  filepath: string;
  meta: TMeta;
}

export type ListItem<TMeta = unknown, TAgg = unknown, TDescendentInfo = unknown> =
  | GroupListItem<TAgg, TDescendentInfo>
  | LeafListItem<TMeta, TDescendentInfo>;

export interface ItemState {
  expanded: boolean;
}

type SearchResult<TMeta, TAgg> = { depth: number; parent: FileTreeDirectory<TMeta, TAgg> | undefined } & (
  | { val: FileTreeDirectory<TMeta, TAgg>; isDirectory: true }
  | { val: FileTreeFile<TMeta>; isDirectory: false }
);

/**
 * Performs an iterative depth-first search over the FileTree
 *
 * @param fileTree
 */
const flattenFileTree = <TMeta, TAgg>(fileTree: FileTree<TMeta, TAgg>): SearchResult<TMeta, TAgg>[] => {
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
  makeDescendantInfo: DescendantInfoPredicate<TMeta, TAgg, TDescendentInfo>
): ListItem<TMeta, TAgg, TDescendentInfo>[] =>
  flattenFileTree(root).map<ListItem<TMeta, TAgg, TDescendentInfo>>(result => ({
    level: result.depth,
    name: result.val.name,

    nodeId: result.val.nodeId,
    parentNodeId: result.parent?.nodeId,
    descendantInfo: makeDescendantInfo(result.val, result.parent, root),
    ...(result.isDirectory
      ? {
          isDirectory: true,
          meta: result.val.meta
        }
      : {
          filepath: result.val.name,
          isDirectory: false,
          meta: result.val.meta
        })
  }));

export const filterFileTree = <TMeta, TAgg, TDescendentInfo>(
  items: ListItem<TMeta, TAgg, TDescendentInfo>[],
  state: Record<number, ItemState | undefined>
): ListItem<TMeta, TAgg, TDescendentInfo>[] => {
  const filteredItems: ListItem<TMeta, TAgg, TDescendentInfo>[] = [];
  const itemStack: ListItem[] = [];
  for (const item of items) {
    while (item.level + 1 < itemStack.length) {
      itemStack.pop();
    }
    if (item.level + 1 > itemStack.length) {
      itemStack.push(item);
    } else {
      itemStack[itemStack.length - 1] = item;
    }

    if (itemStack.slice(0, itemStack.length - 1).find(node => node.isDirectory && !state[node.nodeId]?.expanded)) {
      continue;
    }
    filteredItems.push(item);
  }
  return filteredItems;
};
