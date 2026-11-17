import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Folder,
  Globe,
  Monitor,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useId, useState } from 'react';
import { WorkspaceItem } from '../../shared/types';

interface ItemEditorProps {
  item: WorkspaceItem;
  index: number;
  totalItems: number;
  existingItemNames: string[];
  onUpdate: (item: WorkspaceItem) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ItemEditor({
  item,
  index,
  totalItems,
  existingItemNames,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<ItemEditorProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const baseId = useId();
  const nameId = `${baseId}-name`;
  const categoryId = `${baseId}-category`;
  const pathId = `${baseId}-path`;
  const urlsId = `${baseId}-urls`;
  const waitTimeId = `${baseId}-wait-time`;
  const dependsOnId = `${baseId}-depends-on`;

  const getItemIcon = () => {
    switch (item.type) {
      case 'app':
        return <Monitor className="w-4 h-4 text-primary" />;
      case 'browser':
        return <Globe className="w-4 h-4 text-success" />;
      case 'folder':
        return <Folder className="w-4 h-4 text-warning" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'app':
        return 'Application';
      case 'browser':
        return 'Browser';
      case 'folder':
        return 'Folder';
    }
  };

  const handleFieldChange = (
    field: keyof WorkspaceItem,
    value: string | number | string[] | undefined
  ) => {
    onUpdate({ ...item, [field]: value });
  };

  return (
    <div className="bg-gray-900 border border-border rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
      {/* Collapsed View */}
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 text-text-secondary hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
            className="p-0.5 text-text-secondary hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Order Number */}
        <div className="w-6 h-6 rounded-full bg-gray-800 text-text-secondary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        {/* Icon */}
        <div className="p-1.5 bg-gray-800 rounded-md border border-border shrink-0">
          {getItemIcon()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary truncate">{item.name}</span>
            <span className="text-xs text-text-secondary px-1.5 py-0.5 bg-gray-800 rounded-sm">
              {getTypeLabel()}
            </span>
            {item.category != null && (
              <span
                className="text-xs text-text-secondary px-1.5 py-0.5 bg-gray-800 rounded-sm truncate"
                title={item.category}
              >
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {item.waitTime != null && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Clock className="w-3 h-3" />
                {item.waitTime}s
              </span>
            )}
            {item.dependsOn != null && (
              <span className="flex items-center gap-1 text-xs text-purple-400">
                <ArrowRight className="w-3 h-3" />
                after {item.dependsOn}
              </span>
            )}
            {item.path != null && (
              <span className="text-xs text-text-secondary truncate font-mono">{item.path}</span>
            )}
            {item.urls && (
              <span className="text-xs text-text-secondary">{item.urls.length} URL(s)</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-900/40 rounded-sm transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-text-secondary hover:text-error hover:bg-red-950/40 rounded-sm transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Edit View */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 border-t border-border bg-gray-800 space-y-4"
          onKeyDown={(event) => {
            // Item fields live inside the workspace form; Enter here must not save the workspace.
            if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
              event.preventDefault();
            }
          }}
        >
          {/* Name */}
          <div>
            <label htmlFor={nameId} className="block text-xs font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              id={nameId}
              type="text"
              value={item.name}
              onChange={(e) => {
                handleFieldChange('name', e.target.value);
              }}
              className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor={categoryId} className="block text-xs font-medium text-gray-300 mb-1">
              Category
            </label>
            <input
              id={categoryId}
              type="text"
              value={item.category ?? ''}
              onChange={(e) => {
                handleFieldChange('category', e.target.value || undefined);
              }}
              placeholder="e.g., development"
              className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm"
            />
          </div>

          {/* Path (for app/folder) */}
          {(item.type === 'app' || item.type === 'folder') && (
            <div>
              <label htmlFor={pathId} className="block text-xs font-medium text-gray-300 mb-1">
                {item.type === 'app' ? 'Application Path' : 'Folder Path'}
              </label>
              <input
                id={pathId}
                type="text"
                value={item.path ?? ''}
                onChange={(e) => {
                  handleFieldChange('path', e.target.value);
                }}
                className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm font-mono"
              />
            </div>
          )}

          {/* URLs (for browser) */}
          {item.type === 'browser' && (
            <div>
              <label htmlFor={urlsId} className="block text-xs font-medium text-gray-300 mb-1">
                URLs (one per line)
              </label>
              <textarea
                id={urlsId}
                value={item.urls?.join('\n') ?? ''}
                onChange={(e) => {
                  handleFieldChange('urls', e.target.value.split('\n').filter(Boolean));
                }}
                rows={3}
                className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm font-mono resize-none"
              />
            </div>
          )}

          {/* Launch Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={waitTimeId} className="block text-xs font-medium text-gray-300 mb-1">
                Wait Time (seconds)
              </label>
              <input
                id={waitTimeId}
                type="number"
                min={0}
                value={item.waitTime ?? ''}
                onChange={(e) => {
                  handleFieldChange(
                    'waitTime',
                    e.target.value ? Number(e.target.value) : undefined
                  );
                }}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm"
              />
            </div>
            <div>
              <label htmlFor={dependsOnId} className="block text-xs font-medium text-gray-300 mb-1">
                Depends On
              </label>
              <select
                id={dependsOnId}
                value={item.dependsOn ?? ''}
                onChange={(e) => {
                  handleFieldChange('dependsOn', e.target.value || undefined);
                }}
                className="w-full px-3 py-1.5 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all text-sm"
              >
                <option value="">None</option>
                {existingItemNames
                  .filter((n) => n !== item.name)
                  .map((itemName) => (
                    <option key={itemName} value={itemName}>
                      {itemName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
              }}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary-900/40 rounded-button transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
