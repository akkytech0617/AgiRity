import { Button } from '@heroui/react/button';
import { ScrollShadow } from '@heroui/react/scroll-shadow';
import { Pencil } from 'lucide-react';
import type { Workspace, WorkspaceItem } from '@/shared/types';
import { LaunchItemCard } from '../workspace/LaunchItemCard';
import { PresetChips } from '../workspace/PresetChips';

interface MainPanelProps {
  workspace: Workspace;
  selectedPreset: string | null;
  onSelectPreset: (name: string | null) => void;
  onLaunchItem?: (item: WorkspaceItem) => void;
  onEditWorkspace?: (id: string) => void;
  isLaunching?: boolean;
}

export function MainPanel({
  workspace,
  selectedPreset,
  onSelectPreset,
  onLaunchItem,
  onEditWorkspace,
  isLaunching = false,
}: Readonly<MainPanelProps>) {
  const presets = workspace.presets ?? [
    {
      name: 'Launch All',
      description: 'Start all items in this workspace',
      itemNames: workspace.items.map((i) => i.name),
    },
  ];

  const filteredItems = selectedPreset
    ? workspace.items.filter((item) => {
        const preset = presets.find((p) => p.name === selectedPreset);
        return preset ? preset.itemNames.includes(item.name) : true;
      })
    : workspace.items;

  return (
    <div className="flex flex-col h-full">
      {/* Workspace header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-text-primary">{workspace.name}</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {workspace.items.length} items
            {workspace.description ? ` · ${workspace.description}` : ''}
          </p>
        </div>
        {onEditWorkspace && (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Edit workspace"
            onPress={() => onEditWorkspace(workspace.id)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Preset chips */}
      <div className="px-4 pb-3">
        <PresetChips presets={presets} selectedPreset={selectedPreset} onSelect={onSelectPreset} />
      </div>

      {/* Item list */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <ScrollShadow className="h-full">
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item, index) => (
              <LaunchItemCard
                key={`${item.name}-${index}`}
                item={item}
                index={index}
                onLaunch={onLaunchItem}
                isDisabled={isLaunching}
              />
            ))}
          </div>
        </ScrollShadow>
      </div>
    </div>
  );
}
