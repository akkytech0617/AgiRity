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

export const ToolCard: FC<ToolCardProps> = ({ item, onLaunch }) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ((item.type === 'app' && item.path) || (item.type === 'browser' && item.urls?.length)) {
      setIsLoading(true);
      launcherApi
        .getItemIcon(item)
        .then((result) => {
          if (result.success && result.data && !FALLBACK_ICON_NAMES.includes(result.data)) {
            setIconSrc(`data:image/png;base64,${result.data}`);
          }
        })
        .catch(() => {
          setIconSrc(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
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
      <div className="flex items-center justify-center">
        {isLoading ? (
          <div className="opacity-50">{getFallbackIcon(item.type)}</div>
        ) : iconSrc ? (
          <img
            src={iconSrc}
            alt={item.name}
            className="w-10 h-10 object-contain"
            style={item.type === 'app' ? { transform: 'scale(1.3)' } : undefined}
          />
        ) : (
          getFallbackIcon(item.type)
        )}
      </div>

      {/* App Name - Bottom */}
      <div className="w-full mt-1 flex items-center justify-center">
        <p className="text-xs font-medium text-text-primary text-center w-full truncate px-1">
          {item.name}
        </p>
      </div>
    </button>
  );
};
