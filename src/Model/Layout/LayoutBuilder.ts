import type { TreeDescendantContext } from '../FileList';
import type { FileTree } from '../FileTree';

export interface LayoutBuilder<TMeta, TAgg, TDescendentInfo> {
  makeFileTree(): FileTree<TMeta, TAgg>;
  computeDescendantInfo(context: TreeDescendantContext<TMeta, TAgg>): TDescendentInfo;
}
