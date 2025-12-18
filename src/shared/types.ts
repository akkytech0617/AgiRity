import { z } from 'zod';

export interface WorkspaceItem {
  type: 'app' | 'browser' | 'folder';
  name: string;
  category?: string; // classification/grouping label
  path?: string; // required for app, folder
  urls?: string[]; // required for browser
  folder?: string; // VS Code project folder
  waitTime?: number; // startup delay in seconds
  dependsOn?: string; // preceding item name
}

export interface WorkspacePreset {
  name: string;
  description?: string;
  itemNames: string[]; // references item.name
}

export interface Workspace {
  id: string; // UUID (v4)
  name: string;
  description?: string;
  items: WorkspaceItem[];
  presets?: WorkspacePreset[];
  tags?: string[];
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// IPC Types
export interface LaunchResult {
  success: boolean;
  error?: string;
}

export const LaunchResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const IPC_CHANNELS = {
  LAUNCHER_LAUNCH_ITEM: 'launcher:launchItem',
  WORKSPACE_LOAD: 'workspace:load',
  WORKSPACE_GET: 'workspace:get',
  WORKSPACE_SAVE: 'workspace:save',
  WORKSPACE_DELETE: 'workspace:delete',
} as const;

export type IpcChannels = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
