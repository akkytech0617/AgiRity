import { Play, MoreHorizontal, Monitor, Globe, Folder, Code } from 'lucide-react';
import { Workspace } from '../../shared/types';

interface WorkspaceRowProps {
  workspace: Workspace;
  onLaunch: (id: string) => void;
  onEdit: (id: string) => void;
}

export function WorkspaceRow({ workspace, onLaunch, onEdit }: WorkspaceRowProps) {
  // Helper to get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'app': return <Monitor className="w-3 h-3" />;
      case 'browser': return <Globe className="w-3 h-3" />;
      case 'folder': return <Folder className="w-3 h-3" />;
      default: return <Code className="w-3 h-3" />;
    }
  };

  const visibleItems = workspace.items.slice(0, 4);
  const remainingCount = Math.max(0, workspace.items.length - 4);

  return (
    <div className="group flex items-center gap-4 p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">
      {/* Status Indicator */}
      <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" title="Stopped"></div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{workspace.name}</h3>
          {workspace.tags?.map((tag, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded border border-gray-200">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{workspace.description || 'No description'}</p>
      </div>

      {/* Items Preview */}
      <div className="hidden md:flex items-center gap-1.5 w-1/3">
        {visibleItems.map((item, idx) => (
          <div key={idx} className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-500" title={item.name}>
            {getItemIcon(item.type)}
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-400 font-medium">+{remainingCount}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onLaunch(workspace.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700 rounded-md text-xs font-medium shadow-sm transition-all"
        >
          <Play className="w-3 h-3 fill-current" />
          Launch
        </button>
        <button 
          onClick={() => onEdit(workspace.id)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
