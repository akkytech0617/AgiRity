import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkspaceDetail } from './components/WorkspaceDetail';
import { WorkspaceSettings } from './components/WorkspaceSettings';
import { QuickLaunch } from './components/QuickLaunch';
import { ToolsRegistry } from './components/ToolsRegistry';
import { MCPServers } from './components/MCPServers';
import { Settings as SettingsView } from './components/Settings';
import { Workspace } from '../shared/types';
import { Settings, Pencil, Trash2 } from 'lucide-react';

// Mock Data
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'AgiRity Development',
    description: 'Frontend & Electron setup environment',
    items: [
      { type: 'folder', name: 'Project Root', path: '~/workspace/AgiRity' },
      { type: 'app', name: 'VS Code', path: '/Applications/Visual Studio Code.app' },
      { type: 'browser', name: 'Linear Board', urls: ['https://linear.app/'] },
      { type: 'app', name: 'Docker', path: '/Applications/Docker.app' },
      { type: 'browser', name: 'GitHub Repo', urls: ['https://github.com/agirity/agirity'] },
    ],
    presets: [
      {
        name: 'Full Development',
        description: 'Start everything for full stack dev',
        itemNames: ['Project Root', 'VS Code', 'Linear Board', 'Docker', 'GitHub Repo']
      },
      {
        name: 'Code Only',
        description: 'Just the editor and terminal',
        itemNames: ['Project Root', 'VS Code']
      },
      {
        name: 'Review Mode',
        description: 'Browser tools for PR review',
        itemNames: ['Linear Board', 'GitHub Repo']
      }
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
  }
];

// View Types
type View = 
  | { type: 'quick-launch' }
  | { type: 'workspace', id: string }
  | { type: 'workspace-settings', id: string }
  | { type: 'tools' }
  | { type: 'mcp' }
  | { type: 'settings' };

function App() {
  const [activeView, setActiveView] = useState<View>({ type: 'quick-launch' });

  const selectedWorkspace = (activeView.type === 'workspace' || activeView.type === 'workspace-settings')
    ? MOCK_WORKSPACES.find(w => w.id === activeView.id)
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

  const handleDeleteWorkspace = (id: string) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      console.log('Deleting workspace:', id);
    }
  };

  const handleLaunchItem = (workspaceId: string, itemName: string) => {
    console.log(`Launching item ${itemName} from workspace ${workspaceId}`);
  };

  const handleNew = () => {
    console.log('Creating new workspace');
  };

  const handleSelectWorkspace = (id: string | null) => {
    if (id) {
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
      case 'workspace-settings':
        return selectedWorkspace ? (
          <WorkspaceSettings 
            workspace={selectedWorkspace} 
            onSave={handleSaveWorkspace}
            onCancel={() => setActiveView({ type: 'workspace', id: selectedWorkspace.id })}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">Workspace not found</div>
        );
      case 'workspace':
        return selectedWorkspace ? (
          <WorkspaceDetail 
            workspace={selectedWorkspace} 
            onLaunch={handleLaunch}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">Workspace not found</div>
        );
      case 'quick-launch':
      default:
        return (
          <QuickLaunch 
            workspaces={MOCK_WORKSPACES}
            onSelectWorkspace={(id) => handleSelectWorkspace(id)}
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
      case 'workspace-settings':
        return selectedWorkspace ? {
          title: 'Edit Workspace',
          subtitle: `Configure settings for ${selectedWorkspace.name}`,
        } : { title: 'Workspace Settings', subtitle: '' };
      case 'workspace':
        return selectedWorkspace ? {
          title: selectedWorkspace.name,
          subtitle: selectedWorkspace.description,
          tags: selectedWorkspace.tags
        } : { title: 'Workspace', subtitle: '' };
      case 'quick-launch':
      default:
        return { title: 'Quick Launch', subtitle: 'Start your work in seconds' };
    }
  };

  const header = getHeaderContent();

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar 
        workspaces={MOCK_WORKSPACES} 
        onSelectWorkspace={handleSelectWorkspace}
        onNewWorkspace={handleNew}
        onOpenSettings={() => setActiveView({ type: 'settings' })}
        onOpenTools={() => setActiveView({ type: 'tools' })}
        onOpenMCP={() => setActiveView({ type: 'mcp' })}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white h-full">
        {/* Header */}
        <header className="h-20 border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                {header.title}
              </h1>
              {header.tags?.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{header.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {activeView.type === 'workspace' && selectedWorkspace && (
              <>
                <button 
                  onClick={() => handleEditWorkspace(selectedWorkspace.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit Workspace"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteWorkspace(selectedWorkspace.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
              </>
            )}
            <button 
              onClick={() => setActiveView({ type: 'settings' })}
              className={`p-2 rounded-full transition-colors ${
                activeView.type === 'settings'
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Global Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {renderMainContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
