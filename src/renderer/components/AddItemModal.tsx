import { Folder, Globe, Monitor, Plus, X } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useId, useState } from 'react';
import { WorkspaceItem } from '../../shared/types';

interface AddItemModalProps {
  onAdd: (item: WorkspaceItem) => void;
  onClose: () => void;
  existingItemNames: string[];
}

type ItemType = 'app' | 'browser' | 'folder';

const LABEL_CLASS = 'block text-sm font-medium text-gray-200 mb-1';
const SMALL_LABEL_CLASS = 'block text-xs font-medium text-gray-300 mb-1';
const HINT_CLASS = 'text-xs text-text-secondary mt-1';
const FIELD_CLASS =
  'w-full px-3 py-2 bg-gray-950 text-text-primary placeholder:text-gray-500 border border-border rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-hidden transition-all';

export function AddItemModal({ onAdd, onClose, existingItemNames }: Readonly<AddItemModalProps>) {
  const [itemType, setItemType] = useState<ItemType>('app');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [path, setPath] = useState('');
  const [urls, setUrls] = useState('');
  const [waitTime, setWaitTime] = useState<number | undefined>(undefined);
  const [dependsOn, setDependsOn] = useState('');

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const nameId = `${baseId}-name`;
  const categoryId = `${baseId}-category`;
  const pathId = `${baseId}-path`;
  const urlsId = `${baseId}-urls`;
  const waitTimeId = `${baseId}-wait-time`;
  const dependsOnId = `${baseId}-depends-on`;

  const parseUrls = (input: string): string[] => {
    return input
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
  };

  const isValidSubmission = (): boolean => {
    if (!name.trim()) return false;
    if ((itemType === 'app' || itemType === 'folder') && !path.trim()) return false;
    if (itemType === 'browser' && parseUrls(urls).length === 0) return false;
    return true;
  };

  const buildWorkspaceItem = (): WorkspaceItem => {
    const item: WorkspaceItem = {
      type: itemType,
      name: name.trim(),
    };

    if (category.trim()) item.category = category.trim();
    if (itemType === 'app' || itemType === 'folder') item.path = path.trim();
    if (itemType === 'browser') item.urls = parseUrls(urls);
    if (waitTime != null && waitTime > 0) item.waitTime = waitTime;
    if (dependsOn) item.dependsOn = dependsOn;

    return item;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // React propagates synthetic submit events to ancestor handlers; keep this form's
    // submission from also triggering a surrounding editor form.
    event.stopPropagation();
    if (!isValidSubmission()) return;
    onAdd(buildWorkspaceItem());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  };

  const typeOptions: {
    type: ItemType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      type: 'app',
      label: 'Application',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Launch a desktop app',
    },
    {
      type: 'browser',
      label: 'Browser URLs',
      icon: <Globe className="w-5 h-5" />,
      description: 'Open URLs in browser',
    },
    {
      type: 'folder',
      label: 'Folder',
      icon: <Folder className="w-5 h-5" />,
      description: 'Open a folder',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-card border border-border bg-gray-900 text-text-primary shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-5 py-3">
            <h3 id={titleId} className="text-lg font-display font-bold text-text-primary">
              Add Item
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 text-text-secondary hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div
            data-testid="add-item-modal-body"
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5"
          >
            {/* Item Type Selection */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-200 mb-2">Item Type</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {typeOptions.map((opt) => {
                  const isSelected = itemType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setItemType(opt.type);
                      }}
                      className={`p-3 rounded-button border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary-900/40'
                          : 'border-border bg-gray-950 hover:border-gray-500'
                      }`}
                    >
                      <div
                        className={`mb-1.5 ${isSelected ? 'text-primary-300' : 'text-text-secondary'}`}
                      >
                        {opt.icon}
                      </div>
                      <div
                        className={`text-sm font-medium ${isSelected ? 'text-primary-100' : 'text-text-primary'}`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Name */}
            <div>
              <label htmlFor={nameId} className={LABEL_CLASS}>
                Name
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="e.g., VS Code, GitHub Repo"
                className={FIELD_CLASS}
                autoFocus
              />
            </div>

            {/* Category (optional) */}
            <div>
              <label htmlFor={categoryId} className={LABEL_CLASS}>
                Category
              </label>
              <input
                id={categoryId}
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                placeholder="e.g., development, reference, communication"
                className={FIELD_CLASS}
              />
              <p className={HINT_CLASS}>Optional label for grouping and filtering</p>
            </div>

            {/* Path (for app/folder) */}
            {(itemType === 'app' || itemType === 'folder') && (
              <div>
                <label htmlFor={pathId} className={LABEL_CLASS}>
                  {itemType === 'app' ? 'Application Path' : 'Folder Path'}
                </label>
                <input
                  id={pathId}
                  type="text"
                  value={path}
                  onChange={(e) => {
                    setPath(e.target.value);
                  }}
                  placeholder={itemType === 'app' ? '/Applications/App.app' : '~/workspace/project'}
                  className={`${FIELD_CLASS} font-mono text-sm`}
                />
                <p className={HINT_CLASS}>
                  {itemType === 'app'
                    ? 'Full path to the application'
                    : 'Path to the folder to open'}
                </p>
              </div>
            )}

            {/* URLs (for browser) */}
            {itemType === 'browser' && (
              <div>
                <label htmlFor={urlsId} className={LABEL_CLASS}>
                  URLs
                </label>
                <textarea
                  id={urlsId}
                  value={urls}
                  onChange={(e) => {
                    setUrls(e.target.value);
                  }}
                  placeholder="https://github.com&#10;https://linear.app&#10;https://localhost:3000"
                  rows={4}
                  className={`${FIELD_CLASS} font-mono text-sm resize-none`}
                />
                <p className={HINT_CLASS}>One URL per line</p>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-gray-200 mb-3">Launch Settings</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Wait Time */}
                <div>
                  <label htmlFor={waitTimeId} className={SMALL_LABEL_CLASS}>
                    Wait Time (seconds)
                  </label>
                  <input
                    id={waitTimeId}
                    type="number"
                    min={0}
                    value={waitTime ?? ''}
                    onChange={(e) => {
                      setWaitTime(e.target.value ? Number(e.target.value) : undefined);
                    }}
                    placeholder="0"
                    className={`${FIELD_CLASS} text-sm`}
                  />
                </div>

                {/* Depends On */}
                <div>
                  <label htmlFor={dependsOnId} className={SMALL_LABEL_CLASS}>
                    Depends On
                  </label>
                  <select
                    id={dependsOnId}
                    value={dependsOn}
                    onChange={(e) => {
                      setDependsOn(e.target.value);
                    }}
                    className={`${FIELD_CLASS} text-sm`}
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
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-surface px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-primary font-medium hover:bg-gray-700 rounded-button transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidSubmission()}
              className="px-4 py-2 bg-primary text-white font-medium hover:bg-primary-600 rounded-button transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
