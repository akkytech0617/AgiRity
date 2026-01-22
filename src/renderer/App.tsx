import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceEditor } from './components/WorkspaceEditor';
import { QuickLaunch } from './components/QuickLaunch';
import { ToolsRegistry } from './components/ToolsRegistry';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { Workspace, WorkspaceItem } from '../shared/types';
import { launcherApi, workspaceApi } from './api';
import { log } from './lib/logger';

// View Types
type View =
  | { type: 'quick-launch' }
  | { type: 'workspace'; id: string }
  | { type: 'workspace-editor'; id?: string }
  | { type: 'tools' }
  | { type: 'mcp' }
  | { type: 'settings' };

function App() {
  const [activeView, setActiveView] = useState<View>({ type: 'quick-launch' });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspaces on mount
  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await workspaceApi.load();
      if (result.success && Array.isArray(result.data)) {
        setWorkspaces(result.data);
      } else {
        throw new Error(result.error ?? 'Failed to load workspaces');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      log.error('Failed to load workspaces', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWorkspace =
    activeView.type === 'workspace' ||
    (activeView.type === 'workspace-editor' && activeView.id !== undefined)
      ? workspaces.find((w) => w.id === activeView.id)
      : null;

  const handleLaunch = (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      log.info(`Launching workspace: ${workspace.name}`);
    }
  };

  const handleEditWorkspace = (id: string) => {
    setActiveView({ type: 'workspace-editor', id });
  };

  const handleSaveWorkspace = async (workspace: Workspace) => {
    try {
      const result = await workspaceApi.save(workspace);
      if (result.success) {
        await loadWorkspaces();
        setActiveView({ type: 'workspace', id: workspace.id });
        log.info(`Workspace saved: ${workspace.name}`);
      } else {
        throw new Error(result.error ?? 'Failed to save workspace');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      log.error('Failed to save workspace', errorMsg);
      alert(`Failed to save workspace: ${errorMsg}`);
    }
  };

  const handleLaunchItem = (workspaceId: string, itemName: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    const item = workspace?.items.find((i) => i.name === itemName);
    if (item) {
      void launchItem(item);
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

  const handleSelectWorkspace = (id: string | null) => {
    if (id !== null && id.length > 0) {
      setActiveView({ type: 'workspace', id });
    } else {
      setActiveView({ type: 'quick-launch' });
    }
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading workspaces...</p>
          </div>
        </div>
      );
    }

    if (error !== null) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️ Error loading workspaces</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => void loadWorkspaces()}
              className="px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeView.type) {
      case 'tools':
        return <ToolsRegistry />;
      case 'mcp':
        return <MCPServers />;
      case 'settings':
        return <SettingsView />;
      case 'workspace-editor':
        return (
          <WorkspaceEditor
            workspace={activeView.id !== undefined ? (selectedWorkspace ?? undefined) : undefined}
            onSave={(workspace) => void handleSaveWorkspace(workspace)}
            onCancel={() => {
              if (activeView.id !== undefined) {
                setActiveView({ type: 'workspace', id: activeView.id });
              } else {
                setActiveView({ type: 'quick-launch' });
              }
            }}
          />
        );
      case 'workspace':
        return selectedWorkspace ? (
          <WorkspaceDetail
            workspace={selectedWorkspace}
            onLaunch={handleLaunch}
            onLaunchItem={(item) => void launchItem(item)}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">Workspace not found</div>
        );
      case 'quick-launch':
      default:
        return (
          <QuickLaunch
            workspaces={workspaces}
            onSelectWorkspace={(id) => {
              handleSelectWorkspace(id);
            }}
            onLaunchItem={handleLaunchItem}
            onLaunchWorkspace={handleLaunch}
          />
        );
    }
  };

  const getHeaderContent = () => {
    switch (activeView.type) {
      case 'tools':
        return { title: 'Tools Registry', subtitle: 'Manage installed tools' };
      case 'mcp':
        return { title: 'MCP Servers', subtitle: 'Model Context Protocol configuration' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Application preferences' };
      case 'workspace-editor':
        return activeView.id !== undefined && selectedWorkspace !== null
          ? {
              title: 'Edit Workspace',
              subtitle: `Configure settings for ${selectedWorkspace.name}`,
            }
          : { title: 'Create Workspace', subtitle: 'Set up a new workspace' };
      case 'workspace':
        return selectedWorkspace
          ? {
              title: selectedWorkspace.name,
              subtitle: selectedWorkspace.description,
              tags: selectedWorkspace.tags,
              showEditButton: true,
              onEdit: () => {
                handleEditWorkspace(selectedWorkspace.id);
              },
            }
          : { title: 'Workspace', subtitle: '' };
      case 'quick-launch':
      default:
        return {
          title: 'Quick Launch',
          subtitle: 'Start your work in seconds',
          showEditButton: true,
          onEdit: () => {
            // Edit Quick Launch settings
          },
        };
    }
  };

  return (
    <Layout
      workspaces={workspaces}
      header={getHeaderContent()}
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
    >
      {renderMainContent()}
    </Layout>
  );
}

export default App;
