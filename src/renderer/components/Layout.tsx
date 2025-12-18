import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Workspace } from '../../shared/types';

interface LayoutProps {
  children: ReactNode;
  workspaces: Workspace[];
  header: {
    title: string;
    subtitle?: string;
    tags?: string[];
    showEditButton?: boolean;
    onEdit?: () => void;
  };
  onSelectWorkspace: (id: string | null) => void;
  onNewWorkspace: () => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenMCP: () => void;
}

export function Layout({
  children,
  workspaces,
  header,
  onSelectWorkspace,
  onNewWorkspace,
  onOpenSettings,
  onOpenTools,
  onOpenMCP,
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-surface font-body text-text-primary overflow-hidden">
      <Sidebar
        workspaces={workspaces}
        onSelectWorkspace={onSelectWorkspace}
        onNewWorkspace={onNewWorkspace}
        onOpenSettings={onOpenSettings}
        onOpenTools={onOpenTools}
        onOpenMCP={onOpenMCP}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white h-full">
        <Header
          title={header.title}
          subtitle={header.subtitle}
          tags={header.tags}
          showEditButton={header.showEditButton}
          onEdit={header.onEdit}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
