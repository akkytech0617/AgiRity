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
        const message =
          error instanceof z.ZodError
            ? 'Invalid input data'
            : error instanceof Error
              ? error.message
              : 'Unknown error';
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
        const message =
          error instanceof z.ZodError
            ? 'Invalid ID format'
            : error instanceof Error
              ? error.message
              : 'Unknown error';
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
        const message =
          error instanceof z.ZodError
            ? 'Invalid workspace data'
            : error instanceof Error
              ? error.message
              : 'Unknown error';
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
        const message =
          error instanceof z.ZodError
            ? 'Invalid ID format'
            : error instanceof Error
              ? error.message
              : 'Unknown error';
        console.error('Delete workspace failed:', message);
        return { success: false, error: message };
      }
    }
  );
}
