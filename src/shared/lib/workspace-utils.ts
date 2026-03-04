import type { Workspace, WorkspaceItem } from '@/shared/types';

export const selectItemsToLaunch = (
  workspace: Workspace,
  itemNames?: string[]
): WorkspaceItem[] => {
  if (itemNames === undefined) {
    return workspace.items;
  }

  if (itemNames.length === 0) {
    return [];
  }

  return workspace.items.filter((item) => itemNames.includes(item.name));
};
