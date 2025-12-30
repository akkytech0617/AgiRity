import { ReactNode } from 'react';
import { Header } from './Header';
import { Workspace } from '../../shared/types';

interface LayoutProps {
  children: ReactNode;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenMCP: () => void;
  onOpenHome: () => void;
}

export function Layout({
  children,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onNewWorkspace,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
  onOpenHome,
}: Readonly<LayoutProps>) {
  return (
    <div className="flex flex-col h-screen bg-surface font-body text-text-primary overflow-hidden">
      <Header
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={onSelectWorkspace}
        onNewWorkspace={onNewWorkspace}
        onOpenSettings={onOpenSettings}
        onOpenTools={onOpenTools}
        onOpenMCP={onOpenMCP}
        onOpenHome={onOpenHome}
      />

      <main className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full" data-testid="app-root">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
