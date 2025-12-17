import { WorkspaceItem, LaunchResult, IPC_CHANNELS } from '../../shared/types';

export const launcherApi = {
  launchItem: async (item: WorkspaceItem): Promise<LaunchResult> => {
    return window.ipcRenderer.invoke(
      IPC_CHANNELS.LAUNCHER_LAUNCH_ITEM,
      item
    ) as Promise<LaunchResult>;
  },
};
