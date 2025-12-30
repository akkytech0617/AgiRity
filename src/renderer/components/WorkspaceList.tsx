import { Monitor, Globe, Folder, Code, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '../utils';
import { Workspace, WorkspaceItem } from '../../shared/types';

interface WorkspaceListProps {
  workspaces: Workspace[];
  loading?: boolean;
  error?: string | null;
  onLaunchWorkspace: (workspace: Workspace) => void;
  onRetry?: () => void;
}

export function WorkspaceList({
  workspaces,
  loading = false,
  error = null,
  onLaunchWorkspace,
  onRetry,
}: Readonly<WorkspaceListProps>) {
  const getItemIcon = (type: WorkspaceItem['type']) => {
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

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error !== null && error !== '') {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-8">
          <div className="p-3 bg-error-10 rounded-full">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary mb-2">
              Failed to Load Workspaces
            </h2>
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-button text-sm font-medium transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty State
  if (workspaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="p-3 bg-gray-100 rounded-full">
            <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary mb-2">
              No Workspaces Found
            </h2>
            <p className="text-sm text-text-secondary">
              Create your first workspace to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Content - Workspace Cards Grid
  return (
    <div className="flex-1 overflow-y-auto bg-surface">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white rounded-card border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-text-primary mb-1 truncate">
                    {workspace.name}
                  </h3>
                  <p
                    className={cn(
                      'text-xs line-clamp-1',
                      workspace.description !== undefined ? 'text-gray-500' : 'text-gray-400 italic'
                    )}
                  >
                    {workspace.description ?? 'No description'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLaunchWorkspace(workspace);
                  }}
                  className="p-2 bg-primary hover:bg-primary-600 text-white rounded-button transition-colors shadow-sm shrink-0"
                  title="Launch Workspace"
                  aria-label={`Launch workspace ${workspace.name}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Workspace Items Preview */}
              <div className="p-4 flex-1 bg-white">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Items ({workspace.items.length})
                </h4>
                <div className="space-y-2">
                  {workspace.items.slice(0, 6).map((item) => (
                    <div
                      key={`${item.type}-${item.name}`}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 shrink-0">
                        {getItemIcon(item.type)}
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                  {workspace.items.length > 6 && (
                    <div className="text-center pt-1">
                      <span className="text-xs text-text-secondary">
                        + {workspace.items.length - 6} more items
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Tags */}
              {workspace.tags && workspace.tags.length > 0 && (
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {workspace.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-0.5 bg-primary-50 text-primary text-[10px] font-medium rounded-full border border-primary-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {workspace.tags.length > 3 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        +{workspace.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
