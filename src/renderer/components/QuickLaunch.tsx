import { Monitor, Globe, Folder, Code, Play } from 'lucide-react';
import { Workspace } from '../../shared/types';

interface QuickLaunchProps {
  workspaces: Workspace[];
  onSelectWorkspace: (id: string) => void;
  onLaunchItem: (workspaceId: string, itemName: string) => void;
  onLaunchWorkspace: (workspaceId: string) => void;
}

export function QuickLaunch({
  workspaces,
  onSelectWorkspace,
  onLaunchItem,
  onLaunchWorkspace,
}: QuickLaunchProps) {
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="bg-white rounded-card border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
              <div className="cursor-pointer" onClick={() => onSelectWorkspace(workspace.id)}>
                <h3 className="font-display font-bold text-lg text-text-primary hover:text-primary transition-colors mb-1">
                  {workspace.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {workspace.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => onLaunchWorkspace(workspace.id)}
                className="p-2 bg-primary hover:bg-primary-600 text-white rounded-button transition-colors shadow-sm"
                title="Launch Workspace"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Quick Start Items */}
            <div className="p-4 flex-1 bg-white">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Start Items
              </h4>
              <div className="space-y-2">
                {workspace.items.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                    onClick={() => onLaunchItem(workspace.id, item.name)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {getItemIcon(item.type)}
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate group-hover:text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <Play className="w-3 h-3 text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 fill-current" />
                  </div>
                ))}
                {workspace.items.length > 5 && (
                  <div className="text-center pt-1" onClick={() => onSelectWorkspace(workspace.id)}>
                    <span className="text-xs text-primary hover:underline cursor-pointer">
                      + {workspace.items.length - 5} more items
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
