import { useState } from 'react';
import { X, Monitor, Globe, Folder, Plus } from 'lucide-react';
import { WorkspaceItem } from '../../shared/types';

interface AddItemModalProps {
  onAdd: (item: WorkspaceItem) => void;
  onClose: () => void;
  existingItemNames: string[];
}

type ItemType = 'app' | 'browser' | 'folder';

export function AddItemModal({ onAdd, onClose, existingItemNames }: AddItemModalProps) {
  const [itemType, setItemType] = useState<ItemType>('app');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [path, setPath] = useState('');
  const [urls, setUrls] = useState('');
  const [waitTime, setWaitTime] = useState<number | undefined>(undefined);
  const [dependsOn, setDependsOn] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const item: WorkspaceItem = {
      type: itemType,
      name: name.trim(),
    };

    if (category.trim()) {
      item.category = category.trim();
    }

    if (itemType === 'app' || itemType === 'folder') {
      if (!path.trim()) return;
      item.path = path.trim();
    }

    if (itemType === 'browser') {
      const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
      if (urlList.length === 0) return;
      item.urls = urlList;
    }

    if (waitTime && waitTime > 0) {
      item.waitTime = waitTime;
    }

    if (dependsOn) {
      item.dependsOn = dependsOn;
    }

    onAdd(item);
  };

  const typeOptions: { type: ItemType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'app', label: 'Application', icon: <Monitor className="w-5 h-5" />, description: 'Launch a desktop app' },
    { type: 'browser', label: 'Browser URLs', icon: <Globe className="w-5 h-5" />, description: 'Open URLs in browser' },
    { type: 'folder', label: 'Folder', icon: <Folder className="w-5 h-5" />, description: 'Open a folder' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <h3 className="text-lg font-display font-bold text-text-primary">Add Item</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Item Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Item Type</label>
            <div className="grid grid-cols-3 gap-3">
              {typeOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setItemType(opt.type)}
                  className={`p-4 rounded-button border-2 transition-all text-left ${
                    itemType === opt.type
                      ? 'border-primary bg-primary-50'
                      : 'border-border hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`mb-2 ${itemType === opt.type ? 'text-primary' : 'text-text-secondary'}`}>
                    {opt.icon}
                  </div>
                  <div className={`text-sm font-medium ${itemType === opt.type ? 'text-primary-900' : 'text-text-primary'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., VS Code, GitHub Repo"
              className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Category (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., development, reference, communication"
              className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Optional label for grouping and filtering</p>
          </div>

          {/* Path (for app/folder) */}
          {(itemType === 'app' || itemType === 'folder') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {itemType === 'app' ? 'Application Path' : 'Folder Path'}
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder={itemType === 'app' ? '/Applications/App.app' : '~/workspace/project'}
                className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {itemType === 'app' ? 'Full path to the application' : 'Path to the folder to open'}
              </p>
            </div>
          )}

          {/* URLs (for browser) */}
          {itemType === 'browser' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URLs</label>
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://github.com&#10;https://linear.app&#10;https://localhost:3000"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">One URL per line</p>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Launch Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Wait Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Wait Time (seconds)</label>
                <input
                  type="number"
                  min={0}
                  value={waitTime ?? ''}
                  onChange={(e) => setWaitTime(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              {/* Depends On */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Depends On</label>
                <select
                  value={dependsOn}
                  onChange={(e) => setDependsOn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm bg-white"
                >
                  <option value="">None</option>
                  {existingItemNames.map((itemName) => (
                    <option key={itemName} value={itemName}>
                      {itemName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-primary font-medium hover:bg-gray-200 rounded-button transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || (itemType !== 'browser' && !path.trim()) || (itemType === 'browser' && !urls.trim())}
            className="px-4 py-2 bg-primary text-white font-medium hover:bg-primary-600 rounded-button transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
