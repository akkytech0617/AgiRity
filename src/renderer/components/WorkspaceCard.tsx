import { Play, MoreHorizontal, Code, Globe, Folder, Monitor } from 'lucide-react';
import { Workspace } from '../../shared/types';

interface WorkspaceCardProps {
  workspace: Workspace;
  onLaunch: (id: string) => void;
  onEdit: (id: string) => void;
}

export function WorkspaceCard({ workspace, onLaunch, onEdit }: WorkspaceCardProps) {
  // Helper to get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'app': return <Monitor className="w-3 h-3" />;
      case 'browser': return <Globe className="w-3 h-3" />;
      case 'folder': return <Folder className="w-3 h-3" />;
      default: return <Code className="w-3 h-3" />;
    }
  };

  const visibleItems = workspace.items.slice(0, 3);
  const remainingCount = Math.max(0, workspace.items.length - 3);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative flex flex-col h-full">
      {/* Header: Name & Launch Action */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={workspace.name}>
            {workspace.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1" title={workspace.description}>
            {workspace.description || 'No description'}
          </p>
        </div>
        {/* Big Launch Button - visible on hover or always visible but emphasized on hover */}
        <button 
          onClick={() => onLaunch(workspace.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95 flex-shrink-0 ml-2"
          title="Launch Workspace"
        >
          <Play className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Items Preview (Icons) */}
      <div className="flex gap-2 mb-auto">
        {visibleItems.map((item, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 flex items-center gap-1.5 border border-gray-100 max-w-[100px]">
            {getItemIcon(item.type)}
            <span className="truncate">{item.name}</span>
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-400 self-center px-1">
            +{remainingCount}
          </span>
        )}
      </div>

      {/* Footer: Tags & Menu */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-50">
        <div className="flex gap-1 flex-wrap">
          {workspace.tags?.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full border border-blue-100">
              {tag}
            </span>
          ))}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={() => onEdit(workspace.id)}
             className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
           >
             <MoreHorizontal className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
