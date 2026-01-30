import { Workspace } from '../../shared/types';
import { workspaceApi } from '../api';
import { MOCK_WORKSPACES } from '../mocks/workspaces';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

let mockWorkspaces = [...MOCK_WORKSPACES];

export const workspaceDataSource = {
  load: async (): Promise<Workspace[]> => {
    if (useMock) return mockWorkspaces;
    const result = await workspaceApi.load();
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to load workspaces');
    }
    return Array.isArray(result.data) ? result.data : [];
  },

  get: async (id: string): Promise<Workspace | null> => {
    if (useMock) return mockWorkspaces.find((w) => w.id === id) ?? null;
    const result = await workspaceApi.get(id);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to get workspace');
    }
    if (
      result.data !== null &&
      result.data !== undefined &&
      typeof result.data === 'object' &&
      !Array.isArray(result.data) &&
      typeof result.data !== 'boolean'
    ) {
      return result.data;
    }
    return null;
  },

  save: async (workspace: Workspace): Promise<void> => {
    if (useMock) {
      const index = mockWorkspaces.findIndex((w) => w.id === workspace.id);
      if (index >= 0) {
        mockWorkspaces[index] = workspace;
      } else {
        mockWorkspaces.push(workspace);
      }
      return;
    }
    const result = await workspaceApi.save(workspace);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to save workspace');
    }
  },

  delete: async (id: string): Promise<void> => {
    if (useMock) {
      mockWorkspaces = mockWorkspaces.filter((w) => w.id !== id);
      return;
    }
    const result = await workspaceApi.delete(id);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to delete workspace');
    }
  },
};
