import { useState } from 'react';
import { Layout } from './components/Layout';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { CreateWorkspace } from './components/CreateWorkspace';
import { QuickLaunch } from './components/QuickLaunch';
import { ToolsRegistry } from './components/ToolsRegistry';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { Workspace, WorkspaceItem } from '../shared/types';
import { launcherApi } from './api';

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
  | { type: 'quick-launch' }
  | { type: 'workspace'; id: string }
  | { type: 'workspace-settings'; id: string }
  | { type: 'create-workspace' }
  | { type: 'tools' }
  | { type: 'mcp' }
  | { type: 'settings' };

function App() {
  const [activeView, setActiveView] = useState<View>({ type: 'quick-launch' });

  const selectedWorkspace =
    activeView.type === 'workspace' || activeView.type === 'workspace-settings'
      ? MOCK_WORKSPACES.find((w) => w.id === activeView.id)
      : null;

  const handleLaunch = (id: string) => {
    console.log('Launching workspace:', id);
  };

  const handleEditWorkspace = (id: string) => {
    setActiveView({ type: 'workspace-settings', id });
  };

  const handleSaveWorkspace = (workspace: Workspace) => {
    console.log('Saving workspace:', workspace);
    // Here we would update the state, but for now we just go back to detail view
    setActiveView({ type: 'workspace', id: workspace.id });
  };

  const handleLaunchItem = (workspaceId: string, itemName: string) => {
    const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId);
    const item = workspace?.items.find((i) => i.name === itemName);
    if (item) {
      void launchItem(item);
    }
  };

  const launchItem = async (item: WorkspaceItem) => {
    console.log('Launching item:', item.name);
    try {
      const result = await launcherApi.launchItem(item);
      if (!result.success) {
        console.error('Launch failed:', result.error);
      }
    } catch (error) {
      console.error('IPC error:', error);
    }
  };

  const handleNew = () => {
    setActiveView({ type: 'create-workspace' });
  };

  const handleCreateWorkspace = (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating workspace:', workspace);
    // In real app, would create workspace and navigate to it
    setActiveView({ type: 'quick-launch' });
  };

  const handleSelectWorkspace = (id: string | null) => {
    if (id != null) {
      setActiveView({ type: 'workspace', id });
    } else {
      setActiveView({ type: 'quick-launch' });
    }
  };

  const renderMainContent = () => {
    switch (activeView.type) {
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
              setActiveView({ type: 'quick-launch' });
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
            workspaces={MOCK_WORKSPACES}
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
      case 'create-workspace':
        return { title: 'Create Workspace', subtitle: 'Set up a new workspace' };
      case 'workspace-settings':
        return selectedWorkspace
          ? {
              title: 'Edit Workspace',
              subtitle: `Configure settings for ${selectedWorkspace.name}`,
            }
          : { title: 'Workspace Settings', subtitle: '' };
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
            console.log('Edit Quick Launch settings');
          },
        };
    }
  };

  return (
    <Layout
      workspaces={MOCK_WORKSPACES}
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
