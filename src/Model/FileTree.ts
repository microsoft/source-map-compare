/**
 * Representation of a file in the file tree
 *
 * @param TMeta Stores metadata about the file
 */
export type FileTreeFile<TMeta> = { nodeId: number; name: string; meta: TMeta };

/**
 * Representation of a directory (node) in the file tree
 *
 * @param TMeta Stores metadata about the file
 * @param TAgg Stores some aggregate data about all descendent files in the directory. This is a top-down reduction
 */
export type FileTreeDirectory<TMeta, TAgg> = {
  nodeId: number;
  name: string;
  meta: TAgg;
  files: Record<string, FileTreeFile<TMeta> | undefined>;
  subdirectories: Record<string, FileTreeDirectory<TMeta, TAgg> | undefined>;
};
export type FileTree<TMeta, TAgg> = FileTreeDirectory<TMeta, TAgg>;

export type BundlePathInfo = {
  /**
   * All ancestors of a path, in top-down order
   */
  path: string[];
  /**
   * The name of the leaf node
   */
  filename: string;
  /**
   * Whether this node is metadata as opposed to a regular file
   */
  isSpecial: boolean;
};

export function parseBundlePath(path: string): BundlePathInfo {
  const normalizedPath = path.replace('webpack://', '');
  const parts = normalizedPath.split(/[/\\]+/g).filter(s => !!s);

  const filename = parts.pop();
  if (!filename) throw new Error(`path empty: ${path}`);

  // Source Map Explorer's special file names take format like "[unmapped]"
  const isSpecial = /\[\w+\]/.test(path);

  return {
    path: parts,
    filename,
    isSpecial
  };
}

/**
 * Helper used to create a FileTree
 */
function getOrCreateDirectoryStack<TMeta>(
  root: FileTree<TMeta, undefined>,
  path: string[],
  nextId: { val: number }
): FileTreeDirectory<TMeta, undefined>[] {
  const stack = [root];
  let curr: FileTreeDirectory<TMeta, undefined> = root;
  for (const nextName of path) {
    let next = curr.subdirectories[nextName];

    if (!next) {
      const newDirectory: FileTreeDirectory<TMeta, undefined> = {
        name: nextName,
        meta: undefined,
        subdirectories: {},
        files: {},
        nodeId: nextId.val++
      };
      next = curr.subdirectories[nextName] = newDirectory;
    }

    stack.push(next);
    curr = next;
  }

  return stack;
}

export function makeFileTree<TMeta>(files: Record<string, TMeta>): FileTree<TMeta, undefined> {
  const nextId: { val: number } = { val: 0 };
  const tree: FileTree<TMeta, undefined> = {
    name: '<root>',
    files: {},
    subdirectories: {},
    nodeId: nextId.val++,
    meta: undefined
  };

  for (const [filename, meta] of Object.entries(files)) {
    const fileInfo = parseBundlePath(filename);
    const stack = getOrCreateDirectoryStack(tree, fileInfo.path, nextId);

    // Add file node
    stack[stack.length - 1].files[fileInfo.filename] = {
      name: fileInfo.filename,
      meta,
      nodeId: nextId.val++
    };
  }
  return tree;
}

/**
 * Copies the passed tree, replacing the directory metadata (bottom-up) using a new reduction function
 * @param tree
 * @param reducer
 */
export function reduceFileTree<TMeta, TAggOld, TAgg>(
  tree: FileTree<TMeta, TAggOld>,
  reducer: (
    files: Record<string, FileTreeFile<TMeta> | undefined>,
    subdirectories: Record<string, FileTreeDirectory<TMeta, TAgg> | undefined>
  ) => TAgg
): FileTree<TMeta, TAgg> {
  const subdirectories = Object.fromEntries(
    Object.entries(tree.subdirectories)
      .filter<[string, FileTreeDirectory<TMeta, TAggOld>]>(
        (tuple): tuple is [string, FileTreeDirectory<TMeta, TAggOld>] => !!tuple[1]
      )
      .map(([name, subdir]): [string, FileTree<TMeta, TAgg>] => [name, reduceFileTree(subdir, reducer)])
  );

  return { ...tree, subdirectories, meta: reducer(tree.files, subdirectories) };
}
