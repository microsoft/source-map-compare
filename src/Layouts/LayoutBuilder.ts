import type { TreeDescendantContext, FileTree } from '../Model';

export interface LayoutBuilder<TMeta, TAgg, TDescendentInfo> {
  makeFileTree(): FileTree<TMeta, TAgg>;
  computeDescendantInfo(context: TreeDescendantContext<TMeta, TAgg>): TDescendentInfo;
}
