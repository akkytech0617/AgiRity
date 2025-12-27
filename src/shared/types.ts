import { z } from 'zod';

// --- Zod Schemas ---

export const WorkspaceItemSchema = z.object({
  type: z.enum(['app', 'browser', 'folder']),
  name: z.string().min(1),
  category: z.string().optional(),
  path: z.string().optional(),
  urls: z.array(z.url()).optional(),
  folder: z.string().optional(),
  waitTime: z.number().min(0).optional(),
  dependsOn: z.string().optional(),
});

export const WorkspacePresetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  itemNames: z.array(z.string()),
});

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(WorkspaceItemSchema),
  presets: z.array(WorkspacePresetSchema).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// --- TypeScript Types ---

export type WorkspaceItem = z.infer<typeof WorkspaceItemSchema>;
export type WorkspacePreset = z.infer<typeof WorkspacePresetSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;

// IPC Types
export interface LaunchResult {
  success: boolean;
  error?: string;
}

export interface WorkspaceResult {
  success: boolean;
  data?: Workspace | Workspace[] | null | boolean;
  error?: string;
}

export const LaunchResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const WorkspaceResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(), // Flexible for different data payloads
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

// --- API Interfaces for Renderer ---

export interface ILauncherApi {
  launchItem: (item: WorkspaceItem) => Promise<LaunchResult>;
}

export interface IWorkspaceApi {
  load: () => Promise<WorkspaceResult>;
  get: (id: string) => Promise<WorkspaceResult>;
  save: (workspace: Workspace) => Promise<WorkspaceResult>;
  delete: (id: string) => Promise<WorkspaceResult>;
}

declare global {
  interface Window {
    launcherApi: ILauncherApi;
    workspaceApi: IWorkspaceApi;
  }

  var launcherApi: ILauncherApi;
  var workspaceApi: IWorkspaceApi;
}
