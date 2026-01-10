import { Edit2, Folder, Globe, Monitor, Play } from 'lucide-react';
import { Workspace, WorkspaceItem } from '../../shared/types';
import { ToolCard } from './ToolCard';

interface WorkspaceDetailProps {
  workspace: Workspace;
  onLaunch: (id: string) => void;
  onLaunchItem?: (item: WorkspaceItem) => void;
  onEditWorkspace?: (id: string) => void;
}

export function WorkspaceDetail({
  workspace,
  onLaunch,
  onLaunchItem,
  onEditWorkspace,
}: Readonly<WorkspaceDetailProps>) {
  // Fallback if no presets defined
  const presets = workspace.presets ?? [
    {
      name: 'Launch All',
      description: 'Start all items in this workspace',
      itemNames: workspace.items.map((i) => i.name),
    },
  ];

  const getItemsForPreset = (itemNames: string[]): WorkspaceItem[] => {
    return workspace.items.filter((item) => itemNames.includes(item.name));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Workspace Header */}
      <div className="px-6 py-2 border-b border-border bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-text-primary">{workspace.name}</h1>
            {workspace.description != null && workspace.description.length > 0 && (
              <p className="text-sm text-text-secondary">{workspace.description}</p>
            )}
          </div>
          {onEditWorkspace && (
            <button
              onClick={() => {
                onEditWorkspace(workspace.id);
              }}
              className="flex items-center gap-2 px-2 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-button text-sm font-medium transition-colors shrink-0"
              title="Edit workspace"
            >
              <Edit2 className="w-2 h-2" />
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Presets */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
            <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2 mb-3">
              Launch Presets
            </h2>
            {presets.map((preset) => {
              const presetItems = getItemsForPreset(preset.itemNames);
              const appCount = presetItems.filter((i) => i.type === 'app').length;
              const browserCount = presetItems.filter((i) => i.type === 'browser').length;

              return (
                <div
                  key={preset.name}
                  className="bg-white rounded-card border border-border p-4 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group relative"
                >
                  <h3 className="font-display font-bold text-text-primary mb-1">{preset.name}</h3>
                  <p className="text-xs text-text-secondary mb-3">{preset.description}</p>

                  <div className="flex items-center gap-1 mb-3">
                    {presetItems.slice(0, 5).map((item) => (
                      <div
                        key={item.name}
                        className="p-1 bg-surface rounded-sm border border-border"
                        title={item.name}
                      >
                        {item.type === 'app' && <Monitor className="w-3 h-3 text-primary" />}
                        {item.type === 'browser' && <Globe className="w-3 h-3 text-success" />}
                        {item.type === 'folder' && <Folder className="w-3 h-3 text-warning" />}
                      </div>
                    ))}
                    {presetItems.length > 5 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        +{presetItems.length - 5}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {appCount > 0 && <span>{appCount} apps</span>}
                      {appCount > 0 && browserCount > 0 && <span className="mx-1">•</span>}
                      {browserCount > 0 && <span>{browserCount} tabs</span>}
                    </div>
                    <button
                      onClick={() => {
                        onLaunch(workspace.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-600 text-white rounded-button text-xs font-bold shadow-sm transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Launch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tools */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-text-primary">Workspace Tools</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {workspace.items.length} items
              </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {workspace.items.map((item) => (
                <ToolCard key={item.name} item={item} onLaunch={onLaunchItem} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
