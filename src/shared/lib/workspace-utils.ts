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

/**
 * Resolves the item names to launch for the selected preset.
 * `undefined` means "launch everything"; an empty array means "launch nothing".
 */
export const getPresetItemNames = (
  workspace: Workspace,
  presetName: string | null
): string[] | undefined => {
  if (presetName === null) {
    return undefined;
  }
  return workspace.presets?.find((preset) => preset.name === presetName)?.itemNames;
};
