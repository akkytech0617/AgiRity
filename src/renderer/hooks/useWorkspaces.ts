import { useCallback, useState } from 'react';
import { Workspace } from '../../shared/types';
import { launcherApi, workspaceApi } from '../api';
import { log } from '../lib/logger';

interface UseWorkspacesState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
}

interface LaunchWorkspaceResult {
  successCount: number;
  failureCount: number;
}

interface UseWorkspacesReturn extends UseWorkspacesState {
  loadWorkspaces: () => Promise<void>;
  launchWorkspace: (workspace: Workspace) => Promise<LaunchWorkspaceResult>;
  retry: () => void;
}

export function useWorkspaces(): UseWorkspacesReturn {
  const [state, setState] = useState<UseWorkspacesState>({
    workspaces: [],
    loading: true,
    error: null,
  });

  const loadWorkspaces = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await workspaceApi.load();
      if (result.success && Array.isArray(result.data)) {
        const workspacesData: Workspace[] = result.data;
        setState((prev) => ({ ...prev, workspaces: workspacesData, loading: false, error: null }));
        log.info(`Loaded ${workspacesData.length} workspaces`);
      } else {
        const errorMessage = result.error ?? 'Failed to load workspaces';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        log.error('Load workspaces failed:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      log.error('Load workspaces error:', errorMessage);
    }
  }, []);

  const launchWorkspace = useCallback(
    async (workspace: Workspace): Promise<LaunchWorkspaceResult> => {
      log.info(`Launching workspace: ${workspace.name}`);
      let successCount = 0;
      let failureCount = 0;

      for (const item of workspace.items) {
        try {
          const result = await launcherApi.launchItem(item);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            log.error(`Failed to launch item: ${item.name}`, result.error);
          }
        } catch (error) {
          failureCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          log.error(`Launch item error: ${item.name}`, errorMessage);
        }
      }
      log.info(`Finished launching workspace: ${workspace.name}`, { successCount, failureCount });
      return { successCount, failureCount };
    },
    []
  );

  const retry = useCallback(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  return {
    ...state,
    loadWorkspaces,
    launchWorkspace,
    retry,
  };
}
