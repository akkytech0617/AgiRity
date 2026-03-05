import { Code, Folder, Globe, Monitor } from 'lucide-react';
import { type FC, type MouseEvent, useEffect, useState } from 'react';
import { WorkspaceItem } from '../../shared/types';
import { launcherApi } from '../api';

interface ToolCardProps {
  item: WorkspaceItem;
  onLaunch?: (item: WorkspaceItem) => void;
}

const FALLBACK_ICON_NAMES = ['app', 'browser', 'folder', 'code'];

const getFallbackIcon = (type: WorkspaceItem['type']) => {
  switch (type) {
    case 'app':
      return <Monitor className="w-10 h-10 text-primary" />;
    case 'browser':
      return <Globe className="w-10 h-10 text-success" />;
    case 'folder':
      return <Folder className="w-10 h-10 text-warning" />;
    default:
      return <Code className="w-10 h-10 text-text-secondary" />;
  }
};

function renderIcon(isLoading: boolean, iconSrc: string | null, item: WorkspaceItem) {
  if (isLoading) {
    return <div className="opacity-50">{getFallbackIcon(item.type)}</div>;
  }
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={item.name}
        className="w-10 h-10 object-contain"
        style={item.type === 'app' ? { transform: 'scale(1.3)' } : undefined}
      />
    );
  }
  return getFallbackIcon(item.type);
}

export const ToolCard: FC<ToolCardProps> = ({ item, onLaunch }) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Use ref to track if this effect is still active
    let isActive = true;

    if ((item.type === 'app' && item.path) || (item.type === 'browser' && item.urls?.length)) {
      // Clear previous icon state when item changes or becomes non-fetchable
      setIconSrc(null);
      setIsLoading(true);

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

          setIconSrc(null);
        })
        .finally(() => {
          // Guard against stale async completion
          if (!isActive) return;

          setIsLoading(false);
        });
    } else {
      setIconSrc(null);
      setIsLoading(false);
    }

    // Cleanup function - mark effect as inactive
    return () => {
      isActive = false;
    };
  }, [item]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onLaunch?.(item);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="w-[85px] h-[85px] bg-white rounded-card border border-border shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group flex flex-col items-center justify-center p-1.5 relative"
    >
      {/* Tooltip - shown on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
        {item.name}
      </div>

      {/* Icon - Top Center */}
      <div className="flex items-center justify-center">{renderIcon(isLoading, iconSrc, item)}</div>

      {/* App Name - Bottom */}
      <div className="w-full mt-1 flex items-center justify-center">
        <p className="text-xs font-medium text-text-primary text-center w-full truncate px-1">
          {item.name}
        </p>
      </div>
    </button>
  );
};
