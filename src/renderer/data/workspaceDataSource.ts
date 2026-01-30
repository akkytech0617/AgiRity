import { Workspace } from '../../shared/types';
import { workspaceApi } from '../api';
import { MOCK_WORKSPACES } from '../mocks/workspaces';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const workspaceDataSource = {
  load: async (): Promise<Workspace[]> => {
    if (useMock) return MOCK_WORKSPACES;
    const result = await workspaceApi.load();
    if (Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  },
  get: async (id: string): Promise<Workspace | null> => {
    if (useMock) return MOCK_WORKSPACES.find((w) => w.id === id) ?? null;
    const result = await workspaceApi.get(id);
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
    if (useMock) return;
    await workspaceApi.save(workspace);
  },
  delete: async (id: string): Promise<boolean> => {
    if (useMock) return true;
    const result = await workspaceApi.delete(id);
    return result.success;
  },
};
