import { ArrowRight, Clock, Code, Edit2, Folder, Globe, Monitor, Play, Zap } from 'lucide-react';
import { Workspace, WorkspaceItem } from '../../shared/types';

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
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'app':
        return <Monitor className="w-4 h-4 text-primary" />;
      case 'browser':
        return <Globe className="w-4 h-4 text-success" />;
      case 'folder':
        return <Folder className="w-4 h-4 text-warning" />;
      default:
        return <Code className="w-4 h-4 text-text-secondary" />;
    }
  };

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
      <div className="px-6 py-4 border-b border-border bg-white">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-text-primary">{workspace.name}</h1>
            {workspace.description != null && workspace.description.length > 0 && (
              <p className="text-sm text-text-secondary mt-1">{workspace.description}</p>
            )}
          </div>
          {onEditWorkspace && (
            <button
              onClick={() => {
                onEditWorkspace(workspace.id);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-button text-sm font-medium transition-colors shrink-0"
              title="Edit workspace"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Categories/Tags */}
        {workspace.tags && workspace.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {workspace.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2.5 py-1 bg-primary-50 text-primary text-xs font-medium rounded-full border border-primary-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Presets */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-3 flex flex-col">
            <h2 className="text-lg font-display font-bold text-text-primary flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-accent-orange fill-current" />
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
          <div className="flex-1 overflow-y-auto p-6 space-y-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-text-primary">Workspace Tools</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {workspace.items.length} items
              </span>
            </div>
            {workspace.items.map((item) => (
              <div
                key={item.name}
                className="bg-white p-4 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p
                        className="text-[10px] text-gray-400 truncate"
                        title={item.path ?? item.folder ?? item.urls?.join(', ')}
                      >
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onLaunchItem?.(item)}
                    className="p-1 text-gray-300 hover:text-primary hover:bg-primary-50 rounded-sm transition-colors shrink-0 ml-2"
                    title="Launch this item"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Config Badges */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                  {item.waitTime !== undefined && item.waitTime > 0 ? (
                    <div
                      className="flex items-center gap-1 text-[10px] text-amber-600"
                      title={`Wait ${item.waitTime}s`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.waitTime}s</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 text-[10px] text-gray-300"
                      title="Instant start"
                    >
                      <Clock className="w-3 h-3" />
                    </div>
                  )}

                  {item.dependsOn !== undefined && item.dependsOn !== '' && (
                    <div
                      className="flex items-center gap-1 text-[10px] text-purple-600 ml-auto"
                      title={`After ${item.dependsOn}`}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
