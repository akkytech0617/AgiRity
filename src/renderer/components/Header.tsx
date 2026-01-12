import { Box, Database, Home, Menu, Plus, Settings, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Workspace } from '../../shared/types';

interface HeaderProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenMCP: () => void;
  onOpenHome: () => void;
}

export function Header({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onNewWorkspace,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
  onOpenHome,
}: Readonly<HeaderProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { icon: Settings, label: 'Settings', onClick: onOpenSettings },
    { icon: Box, label: 'Tools Registry', onClick: onOpenTools },
    { icon: Database, label: 'MCP Servers', onClick: onOpenMCP },
  ];

  return (
    <header className="h-10 bg-gray-900 flex items-center shrink-0 select-none">
      {/* Logo */}
      <div className="h-full flex items-center px-2 border-r border-gray-800">
        <div className="bg-primary w-7 h-7 rounded-lg flex items-center justify-center">
          <span className="text-white font-display font-bold text-lg">A</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex items-center h-full overflow-x-auto">
        <div className="flex h-full">
          {/* Home Tab */}
          <button
            onClick={onOpenHome}
            className={`h-full px-2 flex items-center gap-1 border-r border-gray-800 transition-colors ${
              activeWorkspaceId === null
                ? 'bg-white text-gray-800'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            type="button"
          >
            <Home className="w-3 h-3" />
            <span className="text-sm font-medium">Home</span>
          </button>

          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => {
                onSelectWorkspace(workspace.id);
              }}
              className={`h-full px-2 flex items-center gap-2 border-r border-gray-800 transition-colors min-w-0 max-w-50 group ${
                activeWorkspaceId === workspace.id
                  ? 'bg-white text-gray-800'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeWorkspaceId === workspace.id ? 'bg-primary' : 'bg-gray-600'
                }`}
              />
              <span className="truncate text-sm font-medium">{workspace.name}</span>
            </button>
          ))}

          {/* New Tab Button */}
          <button
            onClick={onNewWorkspace}
            className="h-full px-2 flex items-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            title="New Workspace"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Menu Button */}
      <div className="relative h-full" ref={menuRef}>
        <button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`h-full px-2 flex items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${
            isMenuOpen ? 'bg-gray-800 text-white' : ''
          }`}
          type="button"
        >
          {isMenuOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
                type="button"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
