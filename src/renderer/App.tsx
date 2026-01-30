import { useEffect, useState } from 'react';
import { Workspace, WorkspaceItem } from '../shared/types';
import { launcherApi, workspaceApi } from './api';
import { Layout } from './components/Layout';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { ToolsRegistry } from './components/ToolsRegistry';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceEditor } from './components/WorkspaceEditor';
import { WorkspaceList } from './components/WorkspaceList';
import { log } from './lib/logger';

type View =
  | { type: 'home' }
  | { type: 'workspace'; id: string }
  | { type: 'workspace-editor'; id?: string }
  | { type: 'tools' }
  | { type: 'mcp' }
  | { type: 'settings' };

function App() {
  const [activeView, setActiveView] = useState<View>({ type: 'home' });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await workspaceApi.load();
      if (result.success && Array.isArray(result.data)) {
        setWorkspaces(result.data);
      } else {
        throw new Error(result.error ?? 'Failed to load workspaces');
      }
    } catch (err) {
      log.error('Failed to load workspaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const selectedWorkspace =
    activeView.type === 'workspace' ||
    (activeView.type === 'workspace-editor' && activeView.id != null)
      ? (workspaces.find((w) => w.id === activeView.id) ?? null)
      : null;

  const handleLaunch = async (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      log.info(`Launching workspace: ${workspace.name}`);
      for (const item of workspace.items) {
        await launchItem(item);
      }
    }
  };

  const handleSaveWorkspace = async (workspace: Workspace) => {
    try {
      const result = await workspaceApi.save(workspace);
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to save workspace');
      }

      log.info(`Workspace saved: ${workspace.name}`);

      // Reload workspaces and only navigate on success
      const reloadResult = await workspaceApi.load();
      if (reloadResult.success && Array.isArray(reloadResult.data)) {
        setWorkspaces(reloadResult.data);
        setActiveView({ type: 'workspace', id: workspace.id });
      } else {
        log.error('Failed to reload workspaces after save', reloadResult.error);
        alert('Workspace saved, but failed to refresh the list. Please reload the app.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      log.error('Failed to save workspace', errorMsg);
      alert(`Failed to save workspace: ${errorMsg}`);
    }
  };

  const launchItem = async (item: WorkspaceItem) => {
    log.info(`Launching: ${item.name}`);
    try {
      const result = await launcherApi.launchItem(item);
      if (!result.success) {
        log.error(`Launch failed: ${item.name}`, result.error);
      }
    } catch (error) {
      log.error(`IPC error: ${item.name}`, error);
    }
  };

  const handleNew = () => {
    setActiveView({ type: 'workspace-editor' });
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveView({ type: 'workspace', id });
  };

  const handleOpenHome = () => {
    setActiveView({ type: 'home' });
  };

  const renderMainContent = () => {
    if (loading) {
      return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    switch (activeView.type) {
      case 'home':
        return (
          <WorkspaceList
            workspaces={workspaces}
            error={error}
            onLaunchWorkspace={(workspace) => {
              void handleLaunch(workspace.id);
            }}
          />
        );
      case 'tools':
        return <ToolsRegistry />;
      case 'mcp':
        return <MCPServers />;
      case 'settings':
        return <SettingsView />;
      case 'workspace-editor':
        return (
          <WorkspaceEditor
            workspace={activeView.id != null ? (selectedWorkspace ?? undefined) : undefined}
            onSave={(workspace) => void handleSaveWorkspace(workspace)}
            onCancel={() => {
              if (activeView.id != null) {
                setActiveView({ type: 'workspace', id: activeView.id });
              } else {
                setActiveView({ type: 'home' });
              }
            }}
          />
        );
      case 'workspace':
      default:
        return selectedWorkspace ? (
          <WorkspaceDetail
            workspace={selectedWorkspace}
            onLaunch={(id) => void handleLaunch(id)}
            onLaunchItem={(item) => {
              void launchItem(item);
            }}
            onEditWorkspace={(id) => {
              setActiveView({ type: 'workspace-editor', id });
            }}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">Workspace not found</div>
        );
    }
  };

  return (
    <Layout
      workspaces={workspaces}
      activeWorkspaceId={activeView.type === 'workspace' ? activeView.id : null}
      onSelectWorkspace={handleSelectWorkspace}
      onNewWorkspace={handleNew}
      onOpenSettings={() => {
        setActiveView({ type: 'settings' });
      }}
      onOpenTools={() => {
        setActiveView({ type: 'tools' });
      }}
      onOpenMCP={() => {
        setActiveView({ type: 'mcp' });
      }}
      onOpenHome={handleOpenHome}
    >
      {renderMainContent()}
    </Layout>
  );
}

export default App;
