import { useEffect, useState } from 'react';
import { Workspace, WorkspaceItem } from '../shared/types';
import { launcherApi } from './api';
import { CreateWorkspace } from './components/CreateWorkspace';
import { Layout } from './components/Layout';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { ToolsRegistry } from './components/ToolsRegistry';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceList } from './components/WorkspaceList';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { workspaceDataSource } from './data/workspaceDataSource';
import { log } from './lib/logger';

type View =
  | { type: 'home' }
  | { type: 'workspace'; id: string }
  | { type: 'workspace-settings'; id: string }
  | { type: 'create-workspace' }
  | { type: 'tools' }
  | { type: 'mcp' }
  | { type: 'settings' };

function App() {
  const [activeView, setActiveView] = useState<View>({ type: 'home' });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workspaceDataSource
      .load()
      .then(setWorkspaces)
      .catch((error: unknown) => {
        log.error('Failed to load workspaces:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedWorkspace =
    activeView.type === 'workspace' || activeView.type === 'workspace-settings'
      ? workspaces.find((w) => w.id === activeView.id)
      : null;

  const handleLaunch = (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      log.info(`Launching workspace: ${workspace.name}`);
    }
  };

  const handleSaveWorkspace = (workspace: Workspace) => {
    setActiveView({ type: 'workspace', id: workspace.id });
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
    setActiveView({ type: 'create-workspace' });
  };

  const handleCreateWorkspace = () => {
    setActiveView({ type: 'workspace', id: '1' });
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
            onLaunchWorkspace={(workspace) => {
              setActiveView({ type: 'workspace', id: workspace.id });
            }}
          />
        );
      case 'tools':
        return <ToolsRegistry />;
      case 'mcp':
        return <MCPServers />;
      case 'settings':
        return <SettingsView />;
      case 'create-workspace':
        return (
          <CreateWorkspace
            onSave={handleCreateWorkspace}
            onCancel={() => {
              setActiveView({ type: 'workspace', id: '1' });
            }}
          />
        );
      case 'workspace-settings':
        return selectedWorkspace ? (
          <WorkspaceSettings
            workspace={selectedWorkspace}
            onSave={handleSaveWorkspace}
            onCancel={() => {
              setActiveView({ type: 'workspace', id: selectedWorkspace.id });
            }}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">Workspace not found</div>
        );
      case 'workspace':
      default:
        // Workspace view is the default
        return selectedWorkspace ? (
          <WorkspaceDetail
            workspace={selectedWorkspace}
            onLaunch={handleLaunch}
            onLaunchItem={(item) => {
              void launchItem(item);
            }}
            onEditWorkspace={(id) => {
              setActiveView({ type: 'workspace-settings', id });
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
