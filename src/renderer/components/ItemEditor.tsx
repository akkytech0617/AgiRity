import { useState } from 'react';
import {
  Monitor,
  Globe,
  Folder,
  Clock,
  ArrowRight,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react';
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
}: ItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      {/* Collapsed View */}
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Order Number */}
        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>

        {/* Icon */}
        <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 flex-shrink-0">
          {getItemIcon()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{item.name}</span>
            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded">
              {getTypeLabel()}
            </span>
            {item.category != null && (
              <span
                className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded truncate"
                title={item.category}
              >
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {item.waitTime != null && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Clock className="w-3 h-3" />
                {item.waitTime}s
              </span>
            )}
            {item.dependsOn != null && (
              <span className="flex items-center gap-1 text-xs text-purple-600">
                <ArrowRight className="w-3 h-3" />
                after {item.dependsOn}
              </span>
            )}
            {item.path != null && (
              <span className="text-xs text-gray-400 truncate font-mono">{item.path}</span>
            )}
            {item.urls && <span className="text-xs text-gray-400">{item.urls.length} URL(s)</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-error hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Edit View */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => {
                handleFieldChange('name', e.target.value);
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              type="text"
              value={item.category ?? ''}
              onChange={(e) => {
                handleFieldChange('category', e.target.value || undefined);
              }}
              placeholder="e.g., development"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Path (for app/folder) */}
          {(item.type === 'app' || item.type === 'folder') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {item.type === 'app' ? 'Application Path' : 'Folder Path'}
              </label>
              <input
                type="text"
                value={item.path ?? ''}
                onChange={(e) => {
                  handleFieldChange('path', e.target.value);
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono"
              />
            </div>
          )}

          {/* URLs (for browser) */}
          {item.type === 'browser' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                URLs (one per line)
              </label>
              <textarea
                value={item.urls?.join('\n') ?? ''}
                onChange={(e) => {
                  handleFieldChange('urls', e.target.value.split('\n').filter(Boolean));
                }}
                rows={3}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono resize-none"
              />
            </div>
          )}

          {/* Launch Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Wait Time (seconds)
              </label>
              <input
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
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Depends On</label>
              <select
                value={item.dependsOn ?? ''}
                onChange={(e) => {
                  handleFieldChange('dependsOn', e.target.value || undefined);
                }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
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
              onClick={() => {
                setIsExpanded(false);
              }}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary-50 rounded-button transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
