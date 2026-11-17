import { Chip } from '@heroui/react/chip';
import type { WorkspacePreset } from '@/shared/types';

interface PresetChipsProps {
  presets: WorkspacePreset[];
  selectedPreset: string | null;
  onSelect: (name: string | null) => void;
}

export function PresetChips({ presets, selectedPreset, onSelect }: Readonly<PresetChipsProps>) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => {
        const isSelected = selectedPreset === preset.name;
        return (
          <button key={preset.name} type="button" onClick={() => onSelect(preset.name)}>
            <Chip
              variant={isSelected ? 'primary' : 'tertiary'}
              className={
                isSelected
                  ? 'cursor-pointer'
                  : 'border border-border text-text-secondary cursor-pointer hover:border-primary hover:text-primary'
              }
            >
              {preset.name}
            </Chip>
          </button>
        );
      })}
    </div>
  );
}
