import { ipcMain } from 'electron';
import {
  WorkspaceItemSchema,
  WorkspaceSchema,
  LaunchResult,
  WorkspaceResult,
  IPC_CHANNELS,
} from '../../shared/types';
import type { ServiceContainer } from '../container';
import { z } from 'zod';

function getErrorMessage(error: unknown, zodErrorMessage: string): string {
  if (error instanceof z.ZodError) {
    return zodErrorMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export function setupIpcHandlers(container: ServiceContainer): void {
  const { launcher, project } = container;

  ipcMain.handle(
    IPC_CHANNELS.LAUNCHER_LAUNCH_ITEM,
    async (_event, item: unknown): Promise<LaunchResult> => {
      try {
        const validatedItem = WorkspaceItemSchema.parse(item);
        await launcher.launchItem(validatedItem);
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error, 'Invalid input data');
        console.error('Launch failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.WORKSPACE_LOAD, async (): Promise<WorkspaceResult> => {
    try {
      const workspaces = await project.loadWorkspaces();
      return { success: true, data: workspaces };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Load workspaces failed:', message);
      return { success: false, error: message };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_GET,
    async (_event, id: unknown): Promise<WorkspaceResult> => {
      try {
        const validatedId = z.string().uuid().parse(id);
        const workspace = await project.getWorkspace(validatedId);
        return { success: true, data: workspace };
      } catch (error) {
        const message = getErrorMessage(error, 'Invalid ID format');
        console.error('Get workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_SAVE,
    async (_event, workspace: unknown): Promise<WorkspaceResult> => {
      try {
        const validatedWorkspace = WorkspaceSchema.parse(workspace);
        await project.saveWorkspace(validatedWorkspace);
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error, 'Invalid workspace data');
        console.error('Save workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACE_DELETE,
    async (_event, id: unknown): Promise<WorkspaceResult> => {
      try {
        const validatedId = z.string().uuid().parse(id);
        const deleted = await project.deleteWorkspace(validatedId);
        return { success: true, data: deleted };
      } catch (error) {
        const message = getErrorMessage(error, 'Invalid ID format');
        console.error('Delete workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );
}
