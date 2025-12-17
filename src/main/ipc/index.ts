import { ipcMain } from 'electron';
import type { WorkspaceItem, Workspace, IPC_CHANNELS, LaunchResult } from '../../shared/types';
import type { ServiceContainer } from '../container';

interface WorkspaceResult {
  success: boolean;
  data?: Workspace | Workspace[] | null;
  error?: string;
}

export function setupIpcHandlers(container: ServiceContainer): void {
  const { launcher, project } = container;

  ipcMain.handle(
    'launcher:launchItem',
    async (_event, item: WorkspaceItem): Promise<LaunchResult> => {
      try {
        await launcher.launchItem(item);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Launch failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle('workspace:load', async (): Promise<WorkspaceResult> => {
    try {
      const workspaces = await project.loadWorkspaces();
      return { success: true, data: workspaces };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Load workspaces failed:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('workspace:get', async (_event, id: string): Promise<WorkspaceResult> => {
    try {
      const workspace = await project.getWorkspace(id);
      return { success: true, data: workspace };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get workspace failed:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle(
    'workspace:save',
    async (_event, workspace: Workspace): Promise<WorkspaceResult> => {
      try {
        await project.saveWorkspace(workspace);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Save workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle('workspace:delete', async (_event, id: string): Promise<WorkspaceResult> => {
    try {
      const deleted = await project.deleteWorkspace(id);
      return { success: true, data: deleted ? null : undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Delete workspace failed:', message);
      return { success: false, error: message };
    }
  });
}
