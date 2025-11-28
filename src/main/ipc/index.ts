import { ipcMain } from 'electron';
import { launcherService } from '../services/LauncherService';
import { WorkspaceItem, IPC_CHANNELS, LaunchResult } from '../../shared/types';

export function setupIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.LAUNCHER_LAUNCH_ITEM,
    async (_event, item: WorkspaceItem): Promise<LaunchResult> => {
      try {
        await launcherService.launchItem(item);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Launch failed:', message);
        return { success: false, error: message };
      }
    }
  );
}
