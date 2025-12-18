import type { Workspace, WorkspaceItem } from '../../shared/types';

/**
 * Service interfaces for dependency injection
 */

/**
 * Configuration service interface
 * Manages application configuration paths and directories
 */
export interface IConfigService {
  getConfigDir(): string;
  getWorkspacesFilePath(): string;
  ensureConfigDir(): Promise<void>;
  expandTilde(filePath: string): string;
}

/**
 * Project/Workspace service interface
 * Manages workspace CRUD operations
 */
export interface IProjectService {
  loadWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace | null>;
  saveWorkspace(workspace: Workspace): Promise<void>;
  deleteWorkspace(id: string): Promise<boolean>;
}

/**
 * Launcher service interface
 * Handles launching applications, URLs, and folders
 */
export interface ILauncherService {
  launchItem(item: WorkspaceItem): Promise<void>;
}
