import type { ReactNode } from 'react';
import type { Workspace } from '@/shared/types';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: ReactNode;
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

export function AppShell({
  children,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onNewWorkspace,
  onLaunch,
  isLaunching,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
}: Readonly<AppShellProps>) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <AppHeader
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={onSelectWorkspace}
        onNewWorkspace={onNewWorkspace}
        onLaunch={onLaunch}
        isLaunching={isLaunching}
        onOpenSettings={onOpenSettings}
        onOpenTools={onOpenTools}
        onOpenMCP={onOpenMCP}
      />
      <main className="flex-1 flex flex-col min-h-0 bg-surface">
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full" data-testid="app-root">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
