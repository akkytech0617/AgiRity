import { Folder, Globe, Monitor } from 'lucide-react';
import type { WorkspaceItem } from '../../shared/types';

interface PresetCardProps {
  preset: {
    name: string;
    description?: string;
    itemNames: string[];
  };
  items: WorkspaceItem[];
  onLaunch: () => void;
}

export function PresetCard({ preset, items, onLaunch }: Readonly<PresetCardProps>) {
  return (
    <div
      onClick={onLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLaunch();
        }
      }}
      className="bg-white rounded-card border border-border p-2 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group relative cursor-pointer"
    >
      {/* Tooltip - shown on hover */}
      {preset.description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {preset.description}
        </div>
      )}

      <h3 className="font-display font-bold text-text-primary">{preset.name}</h3>

      <div className="flex items-center gap-1 mt-1">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.name}
            className="p-1 bg-surface rounded-sm border border-border"
            title={item.name}
          >
            {item.type === 'app' && <Monitor className="w-3 h-3 text-primary" />}
            {item.type === 'browser' && <Globe className="w-3 h-3 text-success" />}
            {item.type === 'folder' && <Folder className="w-3 h-3 text-warning" />}
          </div>
        ))}
        {items.length > 5 && (
          <span className="text-[10px] text-gray-400 font-medium">+{items.length - 5}</span>
        )}
      </div>
    </div>
  );
}
