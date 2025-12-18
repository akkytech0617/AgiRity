import { WorkspaceItem, LaunchResult, LaunchResultSchema, IPC_CHANNELS } from '../../shared/types';

export const launcherApi = {
  launchItem: async (item: WorkspaceItem): Promise<LaunchResult> => {
    const result = await window.ipcRenderer.invoke(
      IPC_CHANNELS.LAUNCHER_LAUNCH_ITEM,
      item
    );
    return LaunchResultSchema.parse(result);
  },
};
