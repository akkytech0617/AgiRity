/* eslint-disable security/detect-object-injection */
import { useState } from 'react';
import { Workspace, WorkspaceItem } from '../../shared/types';
import { Save, X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { ItemEditor } from './ItemEditor';
import { AddItemModal } from './AddItemModal';

interface WorkspaceEditorProps {
  workspace?: Workspace;
  onSave: (workspace: Workspace) => void;
  onCancel: () => void;
}

/**
 * Unified Workspace Editor component for creating new workspaces or editing existing ones.
 * Handles form validation, item management, and workspace CRUD operations.
 */
export function WorkspaceEditor({ workspace, onSave, onCancel }: Readonly<WorkspaceEditorProps>) {
  const isEditMode = workspace !== undefined;

  const [editedWorkspace, setEditedWorkspace] = useState<Workspace>(
    workspace ?? {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      items: [],
      presets: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [showAddModal, setShowAddModal] = useState(false);

  const handleFieldChange = (field: keyof Workspace, value: string | string[]) => {
    setEditedWorkspace((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (item: WorkspaceItem) => {
    setEditedWorkspace((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
    setShowAddModal(false);
  };

  const handleUpdateItem = (index: number, item: WorkspaceItem) => {
    setEditedWorkspace((prev) => {
      const newItems = [...prev.items];
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const handleDeleteItem = (index: number) => {
    setEditedWorkspace((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    setEditedWorkspace((prev) => {
      const newItems = [...prev.items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      return { ...prev, items: newItems };
    });
  };

  const handleSave = () => {
    if (!editedWorkspace.name.trim()) return;

    onSave({
      ...editedWorkspace,
      name: editedWorkspace.name.trim(),
      description:
        editedWorkspace.description?.trim() !== ''
          ? editedWorkspace.description?.trim()
          : undefined,
      tags:
        editedWorkspace.tags && editedWorkspace.tags.length > 0
          ? editedWorkspace.tags.filter(Boolean)
          : undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const existingItemNames = editedWorkspace.items.map((item) => item.name);
  const isFormValid = editedWorkspace.name.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 ${isEditMode ? 'bg-blue-100' : 'bg-primary-100'} rounded-xl`}>
            {isEditMode ? (
              <Save className="w-6 h-6 text-blue-600" />
            ) : (
              <Sparkles className="w-6 h-6 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary">
            {isEditMode ? 'Edit Workspace' : 'Create New Workspace'}
          </h2>
        </div>
        <p className="text-text-secondary">
          {isEditMode
            ? 'Configure workspace details, items, and launch behavior.'
            : 'Set up a new workspace to launch your apps, URLs, and folders together.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface">
            <h3 className="font-semibold text-text-primary">Basic Information</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editedWorkspace.name}
                onChange={(e) => {
                  handleFieldChange('name', e.target.value);
                }}
                placeholder="e.g., Morning Routine, Client Project"
                className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                autoFocus={!isEditMode}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editedWorkspace.description ?? ''}
                onChange={(e) => {
                  handleFieldChange('description', e.target.value);
                }}
                rows={2}
                placeholder="What is this workspace for?"
                className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={editedWorkspace.tags?.join(', ') ?? ''}
                onChange={(e) => {
                  handleFieldChange(
                    'tags',
                    e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                  );
                }}
                placeholder="dev, frontend, daily..."
                className="w-full px-3 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma separated values for organizing workspaces
              </p>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Workspace Items</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Apps, URLs, and folders to launch
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-button hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="p-4">
            {editedWorkspace.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-gray-900 font-medium mb-1">No items yet</h4>
                <p className="text-gray-500 text-sm mb-4">
                  Add apps, URLs, or folders to launch with this workspace
                </p>
                <button
                  onClick={() => {
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {editedWorkspace.items.map((item, index) => (
                  <ItemEditor
                    key={`${item.name}-${index}`}
                    item={item}
                    index={index}
                    totalItems={editedWorkspace.items.length}
                    existingItemNames={existingItemNames}
                    onUpdate={(updatedItem) => {
                      handleUpdateItem(index, updatedItem);
                    }}
                    onDelete={() => {
                      handleDeleteItem(index);
                    }}
                    onMoveUp={() => {
                      handleMoveItem(index, 'up');
                    }}
                    onMoveDown={() => {
                      handleMoveItem(index, 'down');
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {editedWorkspace.items.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Tip:</strong> Use the arrows to reorder items. Items launch in order from
                top to bottom. Set "Depends On" to wait for a specific item before launching.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-button transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className="px-4 py-2 bg-primary text-white font-medium hover:bg-primary-600 rounded-button transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isFormValid ? 'Please fill in the workspace name' : ''}
          >
            <Save className="w-4 h-4" />
            {isEditMode ? 'Save Changes' : 'Create Workspace'}
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onAdd={handleAddItem}
          onClose={() => {
            setShowAddModal(false);
          }}
          existingItemNames={existingItemNames}
        />
      )}
    </div>
  );
}
