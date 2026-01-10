import { Code, Folder, Globe, Monitor } from 'lucide-react';
import type { FC, MouseEvent } from 'react';
import { WorkspaceItem } from '../../shared/types';

interface ToolCardProps {
  item: WorkspaceItem;
  onLaunch?: (item: WorkspaceItem) => void;
}

const getItemIcon = (type: WorkspaceItem['type']) => {
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
};

export const ToolCard: FC<ToolCardProps> = ({ item, onLaunch }) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onLaunch?.(item);
  };

  return (
    <div
      onClick={handleClick}
      className="w-[85px] h-[85px] bg-white rounded-card border border-border shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group flex flex-col items-center justify-center p-1.5 overflow-hidden"
      title={item.name}
    >
      {/* Icon - Top Center */}
      <div className="flex items-center justify-center">
        <div className="p-1 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
          {getItemIcon(item.type)}
        </div>
      </div>

      {/* App Name - Bottom */}
      <div className="w-full mt-1 flex items-center justify-center">
        <p className="text-xs font-medium text-text-primary text-center w-full truncate px-1">
          {item.name}
        </p>
      </div>
    </div>
  );
};
