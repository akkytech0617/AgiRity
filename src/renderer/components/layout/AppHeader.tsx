import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from '@heroui/react/dropdown';
import { Separator } from '@heroui/react/separator';
import { Box, Database, MoreHorizontal, Settings } from 'lucide-react';
import type { Workspace } from '@/shared/types';
import { LaunchButton } from '../workspace/LaunchButton';
import { WorkspaceSwitcher } from '../workspace/WorkspaceSwitcher';

interface AppHeaderProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onLaunch: () => void;
  isLaunching: boolean;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenMCP: () => void;
}

export function AppHeader({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onNewWorkspace,
  onLaunch,
  isLaunching,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
}: Readonly<AppHeaderProps>) {
  return (
    <header className="h-11 flex items-center px-3 gap-2 border-b border-border bg-background shrink-0 select-none">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {/* Logo mark */}
        <div className="w-[22px] h-[22px] bg-primary rounded-md flex items-center justify-center shrink-0">
          <span className="text-white font-display font-bold text-xs">A</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSelect={onSelectWorkspace}
          onNew={onNewWorkspace}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* Launch button */}
        <LaunchButton onLaunch={onLaunch} isLaunching={isLaunching} />

        {/* More menu */}
        <Dropdown>
          <DropdownTrigger>
            <div
              role="button"
              tabIndex={0}
              className="p-1.5 rounded-md hover:bg-surface transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu
              items={[
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'tools', label: 'Tools Registry', icon: Box },
                { id: 'mcp', label: 'MCP Servers', icon: Database },
              ]}
              onAction={(key) => {
                const action = String(key);
                if (action === 'settings') onOpenSettings();
                else if (action === 'tools') onOpenTools();
                else if (action === 'mcp') onOpenMCP();
              }}
            >
              {(item) => (
                <DropdownItem id={item.id}>
                  <span className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </DropdownItem>
              )}
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>
    </header>
  );
}
