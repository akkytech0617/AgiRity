import { useState } from 'react';
import { Layout } from './components/Layout';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { CreateWorkspace } from './components/CreateWorkspace';
import { ToolsRegistry } from './components/ToolsRegistry';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { WorkspaceList } from './components/WorkspaceList';
import { Workspace, WorkspaceItem } from '../shared/types';
import { launcherApi } from './api';
import { log } from './lib/logger';

// Mock Data
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'AgiRity Development',
    description: 'Frontend & Electron setup environment',
    items: [
      { type: 'folder', name: 'Project Root', path: '~/workspace/AgiRity' },
      { type: 'app', name: 'VS Code', path: '/Applications/Visual Studio Code.app' },
      {
        type: 'app',
        name: 'Zed (Project)',
        path: '/Applications/Zed.app',
        folder: '~/workspace/tmp',
      },
      {
        type: 'app',
        name: 'Terminal',
        path: '/System/Applications/Utilities/Terminal.app',
        folder: '~/workspace/AgiRity',
      },
      { type: 'browser', name: 'Linear Board', urls: ['https://linear.app/'] },
      { type: 'app', name: 'Docker', path: '/Applications/Docker.app' },
      { type: 'browser', name: 'GitHub Repo', urls: ['https://github.com/agirity/agirity'] },
    ],
    presets: [
      {
        name: 'Full Development',
        description: 'Start everything for full stack dev',
        itemNames: ['Project Root', 'VS Code', 'Linear Board', 'Docker', 'GitHub Repo'],
      },
      {
        name: 'Code Only',
        description: 'Just the editor and terminal',
        itemNames: ['Project Root', 'VS Code'],
      },
      {
        name: 'Review Mode',
        description: 'Browser tools for PR review',
        itemNames: ['Linear Board', 'GitHub Repo'],
      },
    ],
    tags: ['Dev', 'Electron'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Morning Routine',
    description: 'Check emails and calendar',
    items: [
      { type: 'app', name: 'Slack', path: '/Applications/Slack.app' },
      { type: 'browser', name: 'Outlook', urls: ['https://outlook.office.com'] },
    ],
    tags: ['Daily', 'Communication'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Design Work',
    description: 'Figma and reference sites',
    items: [
      { type: 'browser', name: 'Figma', urls: ['https://figma.com'] },
      { type: 'browser', name: 'Pinterest', urls: ['https://pinterest.com'] },
    ],
    tags: ['Design'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// View Types
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

  const selectedWorkspace =
    activeView.type === 'workspace' || activeView.type === 'workspace-settings'
      ? MOCK_WORKSPACES.find((w) => w.id === activeView.id)
      : null;

  const handleLaunch = (id: string) => {
    const workspace = MOCK_WORKSPACES.find((w) => w.id === id);
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
    switch (activeView.type) {
      case 'home':
        return (
          <WorkspaceList
            workspaces={MOCK_WORKSPACES}
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
      workspaces={MOCK_WORKSPACES}
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
