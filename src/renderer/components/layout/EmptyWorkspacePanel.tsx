import { Button } from '@heroui/react/button';
import { Card, CardContent } from '@heroui/react/card';
import { Plus } from 'lucide-react';

interface EmptyWorkspacePanelProps {
  onNew: () => void;
}

export function EmptyWorkspacePanel({ onNew }: Readonly<EmptyWorkspacePanelProps>) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card variant="default" className="w-80 border border-border">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-text-secondary" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-display font-bold text-text-primary">No Workspaces</h2>
            <p className="text-sm text-text-secondary mt-1">
              Create your first workspace to get started
            </p>
          </div>
          <Button variant="primary" onPress={onNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
