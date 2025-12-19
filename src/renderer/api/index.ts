import {
  WorkspaceItem,
  LaunchResult,
  LaunchResultSchema,
  Workspace,
  WorkspaceResult,
  WorkspaceResultSchema,
} from '../../shared/types';

export const launcherApi = {
  launchItem: async (item: WorkspaceItem): Promise<LaunchResult> => {
    const result = await window.launcherApi.launchItem(item);
    return LaunchResultSchema.parse(result);
  },
};

export const workspaceApi = {
  load: async (): Promise<WorkspaceResult> => {
    const result = await window.workspaceApi.load();
    return WorkspaceResultSchema.parse(result);
  },
  get: async (id: string): Promise<WorkspaceResult> => {
    const result = await window.workspaceApi.get(id);
    return WorkspaceResultSchema.parse(result);
  },
  save: async (workspace: Workspace): Promise<WorkspaceResult> => {
    const result = await window.workspaceApi.save(workspace);
    return WorkspaceResultSchema.parse(result);
  },
  delete: async (id: string): Promise<WorkspaceResult> => {
    const result = await window.workspaceApi.delete(id);
    return WorkspaceResultSchema.parse(result);
  },
};
