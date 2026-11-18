import { Card } from '@heroui/react/card';
import { Code, Folder, Globe, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WorkspaceItem } from '@/shared/types';
import { launcherApi } from '../../api';

const FALLBACK_ICON_NAMES = ['app', 'browser', 'folder', 'code'];

interface LaunchItemCardProps {
  item: WorkspaceItem;
  index: number;
  onLaunch?: (item: WorkspaceItem) => void;
  isDisabled?: boolean;
}

function getFallbackIcon(type: WorkspaceItem['type']) {
  switch (type) {
    case 'app':
      return <Monitor className="w-4 h-4 text-primary" />;
    case 'browser':
      return <Globe className="w-4 h-4 text-success" />;
    case 'folder':
      return <Folder className="w-4 h-4 text-warning" />;
    default:
      return <Code className="w-4 h-4 text-text-secondary" />;
  }
}

function ItemIcon({ item }: { item: WorkspaceItem }) {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    if ((item.type === 'app' && item.path) || (item.type === 'browser' && item.urls?.length)) {
      setIconSrc(null);
      setIsLoading(true);
      launcherApi
        .getItemIcon(item)
        .then((result) => {
          if (!isActive) return;
          if (result.success && result.data && !FALLBACK_ICON_NAMES.includes(result.data)) {
            setIconSrc(`data:image/png;base64,${result.data}`);
          } else {
            setIconSrc(null);
          }
        })
        .catch(() => {
          if (!isActive) return;
          setIconSrc(null);
        })
        .finally(() => {
          if (!isActive) return;
          setIsLoading(false);
        });
    } else {
      setIconSrc(null);
      setIsLoading(false);
    }
    return () => {
      isActive = false;
    };
  }, [item]);

  if (isLoading) return <div className="opacity-50">{getFallbackIcon(item.type)}</div>;
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={item.name}
        className="w-4 h-4 object-contain"
        style={item.type === 'app' ? { transform: 'scale(1.3)' } : undefined}
      />
    );
  }
  return getFallbackIcon(item.type);
}

function getItemDetail(item: WorkspaceItem): string {
  if (item.path) return item.path;
  if (item.urls && item.urls.length > 0) return item.urls.join(' · ');
  if (item.folder) return item.folder;
  if (item.waitTime) return `Wait ${item.waitTime}s after launch`;
  return '';
}

export function LaunchItemCard({
  item,
  index,
  onLaunch,
  isDisabled = false,
}: Readonly<LaunchItemCardProps>) {
  const isInteractive = onLaunch !== undefined && !isDisabled;
  return (
    <Card
      className="p-0 hover:border-primary-300 hover:shadow-sm transition-all"
      variant="secondary"
    >
      <button
        type="button"
        aria-label={`Launch ${item.name}`}
        disabled={!isInteractive}
        onClick={() => onLaunch?.(item)}
        className="flex w-full items-center gap-3 py-2.5 px-3 text-left rounded-[inherit] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="text-xs text-text-secondary font-mono w-4 text-right shrink-0">
          {index + 1}
        </span>
        <div className="w-7 h-7 bg-surface rounded-lg flex items-center justify-center shrink-0">
          <ItemIcon item={item} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
          {getItemDetail(item) && (
            <p className="text-xs text-text-secondary truncate">{getItemDetail(item)}</p>
          )}
        </div>
        {item.waitTime != null && item.waitTime > 0 && (
          <span className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded shrink-0">
            {item.waitTime}s
          </span>
        )}
        <span className="w-2 h-2 rounded-full bg-success shrink-0" />
      </button>
    </Card>
  );
}
