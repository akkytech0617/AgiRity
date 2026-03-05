import { Folder, Globe, Monitor } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { WorkspaceItem } from '../../shared/types';
import { launcherApi } from '../api';

const FALLBACK_ICON_NAMES = ['app', 'browser', 'folder', 'code'];

interface PresetCardProps {
  preset: {
    name: string;
    description?: string;
    itemNames: string[];
  };
  items: WorkspaceItem[];
  onLaunch: () => void;
}

const PresetItemIcon: FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);

  useEffect(() => {
    // Use ref to track if this effect is still active
    let isActive = true;

    if ((item.type === 'app' && item.path) || (item.type === 'browser' && item.urls?.length)) {
      // Clear previous icon state when item changes or becomes non-fetchable
      setIconSrc(null);

      launcherApi
        .getItemIcon(item)
        .then((result) => {
          // Guard against stale async completion
          if (!isActive) return;

          if (result.success && result.data && !FALLBACK_ICON_NAMES.includes(result.data)) {
            setIconSrc(`data:image/png;base64,${result.data}`);
          } else {
            setIconSrc(null);
          }
        })
        .catch(() => {
          // Guard against stale async completion
          if (!isActive) return;

          // Silently fail - fallback to lucide-react icons
          setIconSrc(null);
        });
    } else {
      setIconSrc(null);
    }

    // Cleanup function - mark effect as inactive
    return () => {
      isActive = false;
    };
  }, [item]);

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={item.name}
        className="w-3 h-3 object-contain"
        style={item.type === 'app' ? { transform: 'scale(1.3)' } : undefined}
      />
    );
  }

  // Fallback lucide-react icons
  if (item.type === 'app') return <Monitor className="w-3 h-3 text-primary" />;
  if (item.type === 'browser') return <Globe className="w-3 h-3 text-success" />;
  if (item.type === 'folder') return <Folder className="w-3 h-3 text-warning" />;
  return null;
};

export function PresetCard({ preset, items, onLaunch }: Readonly<PresetCardProps>) {
  return (
    <button
      onClick={onLaunch}
      type="button"
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
        {items.slice(0, 5).map((item, index) => (
          <div
            key={`${index}-${item.name}`}
            className="p-1 bg-surface rounded-sm border border-border overflow-hidden"
            title={item.name}
          >
            <PresetItemIcon item={item} />
          </div>
        ))}
        {items.length > 5 && (
          <span className="text-[10px] text-gray-400 font-medium">+{items.length - 5}</span>
        )}
      </div>
    </button>
  );
}
