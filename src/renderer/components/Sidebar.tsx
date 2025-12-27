import { useState } from 'react';
import { LayoutGrid, Plus, Settings, Box, Database, Library, Search } from 'lucide-react';
import { Workspace } from '../../shared/types';

interface SidebarProps {
  workspaces: Workspace[];
  onSelectWorkspace?: (id: string | null) => void;
  onNewWorkspace?: () => void;
  onOpenSettings?: () => void;
  onOpenTools?: () => void;
  onOpenMCP?: () => void;
}

export function Sidebar({
  workspaces,
  onSelectWorkspace,
  onNewWorkspace,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
}: Readonly<SidebarProps>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ws.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
  );

  return (
    <aside className="w-16 lg:w-64 h-screen bg-gray-900 text-gray-400 flex flex-col shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <button
        onClick={() => onSelectWorkspace?.(null)}
        className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800 hover:bg-gray-800 transition-colors w-full"
      >
        <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-lg">A</span>
        </div>
        <span className="hidden lg:block ml-3 text-white font-display font-bold text-lg tracking-tight">
          AgiRity
        </span>
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col px-2 overflow-y-auto">
        <div className="px-3 py-2 flex items-center gap-3 text-gray-400 mb-2">
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden lg:block text-sm font-bold uppercase tracking-wider">
            Workspaces
          </span>
        </div>

        {/* Search Box */}
        <div className="px-2 mb-3 hidden lg:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-600"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          {filteredWorkspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onSelectWorkspace?.(ws.id)}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:text-white hover:bg-gray-800 rounded-md transition-colors text-left truncate w-full group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary transition-colors shrink-0"></span>
              <span className="truncate hidden lg:block">{ws.name}</span>
            </button>
          ))}
          {filteredWorkspaces.length === 0 && searchQuery && (
            <div className="px-3 py-2 text-xs text-gray-600 text-center hidden lg:block">
              No matches found
            </div>
          )}
        </div>

        <div className="mt-4 px-2">
          <button
            onClick={onNewWorkspace}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm text-primary-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:block">Add Workspace</span>
          </button>
        </div>

        {/* Library Section */}
        <div className="mt-8 px-3 py-2 flex items-center gap-3 text-gray-400 mb-1">
          <Library className="w-4 h-4" />
          <span className="hidden lg:block text-sm font-bold uppercase tracking-wider">
            Library
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={onOpenTools}
            className="flex items-center gap-3 px-3 py-2 text-sm hover:text-white hover:bg-gray-800 rounded-md transition-colors text-left truncate w-full group"
          >
            <Box className="w-4 h-4 text-gray-500 group-hover:text-primary-400 transition-colors" />
            <span className="truncate hidden lg:block">Tools Registry</span>
          </button>
          <button
            onClick={onOpenMCP}
            className="flex items-center gap-3 px-3 py-2 text-sm hover:text-white hover:bg-gray-800 rounded-md transition-colors text-left truncate w-full group"
          >
            <Database className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            <span className="truncate hidden lg:block">MCP Servers</span>
          </button>
        </div>
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full p-2 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group"
        >
          <Settings className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
          <span className="hidden lg:block font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
