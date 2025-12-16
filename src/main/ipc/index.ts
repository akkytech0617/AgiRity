import { ipcMain } from 'electron';
import { launcherService } from '../services/LauncherService';
import { projectService } from '../services/ProjectService';
import { WorkspaceItem, Workspace, IPC_CHANNELS, LaunchResult } from '../../shared/types';

interface WorkspaceResult {
  success: boolean;
  data?: Workspace | Workspace[] | null;
  error?: string;
}

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

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_LOAD,
    async (): Promise<WorkspaceResult> => {
      try {
        const workspaces = await projectService.loadWorkspaces();
        return { success: true, data: workspaces };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Load workspaces failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_GET,
    async (_event, id: string): Promise<WorkspaceResult> => {
      try {
        const workspace = await projectService.getWorkspace(id);
        return { success: true, data: workspace };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Get workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_SAVE,
    async (_event, workspace: Workspace): Promise<WorkspaceResult> => {
      try {
        await projectService.saveWorkspace(workspace);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Save workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_DELETE,
    async (_event, id: string): Promise<WorkspaceResult> => {
      try {
        const deleted = await projectService.deleteWorkspace(id);
        return { success: true, data: deleted ? null : undefined };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Delete workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );
}
