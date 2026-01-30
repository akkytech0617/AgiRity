import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Workspace, WorkspaceItem } from '@/shared/types';

vi.mock('@/renderer/components/AddItemModal', () => ({
  AddItemModal: ({ onAdd, onClose, existingItemNames }: any) => (
    <div aria-label="AddItemModal" role="dialog">
      <div data-testid="existing-item-names">{(existingItemNames ?? []).join('|')}</div>
      <button
        type="button"
        onClick={() => {
          onAdd({
            type: 'app',
            name: 'New Item',
            path: '/Applications/New.app',
          } satisfies WorkspaceItem);
        }}
      >
        mock-add
      </button>
      <button
        type="button"
        onClick={() => {
          onClose();
        }}
      >
        mock-close
      </button>
    </div>
  ),
}));

vi.mock('@/renderer/components/ItemEditor', () => ({
  ItemEditor: ({ item, onUpdate, onDelete, onMoveUp, onMoveDown }: any) => (
    <div data-testid="item-editor">
      <span data-testid="item-name">{item.name}</span>
      <button
        type="button"
        onClick={() => {
          onUpdate({ ...item, name: `${item.name} updated` } satisfies WorkspaceItem);
        }}
      >
        update {item.name}
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete();
        }}
      >
        delete {item.name}
      </button>
      <button
        type="button"
        onClick={() => {
          onMoveUp();
        }}
      >
        move up {item.name}
      </button>
      <button
        type="button"
        onClick={() => {
          onMoveDown();
        }}
      >
        move down {item.name}
      </button>
    </div>
  ),
}));

import { WorkspaceEditor } from '@/renderer/components/WorkspaceEditor';

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'workspace-1',
    name: 'Existing Workspace',
    description: 'Existing description',
    items: [],
    presets: [],
    tags: ['dev'],
    createdAt: '2000-01-01T00:00:00.000Z',
    updatedAt: '2000-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('WorkspaceEditor', () => {
  it('renders correctly in create mode', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(<WorkspaceEditor onSave={onSave} onCancel={onCancel} />);

    expect(
      screen.getByRole('heading', {
        name: 'Create New Workspace',
      })
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/workspace name/i);
    expect(nameInput).toHaveValue('');

    const saveButton = screen.getByRole('button', { name: 'Create Workspace' });
    expect(saveButton).toBeDisabled();
  });

  it('renders correctly in edit mode with existing data', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const workspace = makeWorkspace({
      name: 'My Workspace',
      description: 'My description',
      tags: ['dev', 'frontend'],
      items: [{ type: 'app', name: 'VS Code', path: '/Applications/VSCode.app' }],
    });

    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace name/i)).toHaveValue('My Workspace');
    expect(screen.getByLabelText(/description/i)).toHaveValue('My description');
    expect(screen.getByLabelText(/tags/i)).toHaveValue('dev, frontend');

    const itemEditors = screen.getAllByTestId('item-editor');
    expect(itemEditors).toHaveLength(1);
    expect(within(itemEditors[0]).getByTestId('item-name')).toHaveTextContent('VS Code');
  });

  it('disables save when name is empty/whitespace, enables when name is provided', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<WorkspaceEditor onSave={onSave} onCancel={onCancel} />);

    const saveButton = screen.getByRole('button', { name: 'Create Workspace' });
    expect(saveButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/workspace name/i);
    await user.type(nameInput, '   ');
    expect(saveButton).toBeDisabled();

    await user.clear(nameInput);
    await user.type(nameInput, 'My Workspace');
    expect(saveButton).toBeEnabled();
  });

  it('allows editing name/description/tags and calls onSave with trimmed fields, filtered tags, and updated updatedAt', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const workspace = makeWorkspace({
      name: '  Needs Trim  ',
      description: '  Needs Trim Too  ',
      tags: ['dev', '', 'ops'],
      updatedAt: '2000-01-01T00:00:00.000Z',
    });

    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={onCancel} />);

    await user.clear(screen.getByLabelText(/workspace name/i));
    await user.type(screen.getByLabelText(/workspace name/i), '  New Name  ');

    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), '  New Description  ');

    // Tags input normalizes on each change; paste once to avoid intermediate normalization.
    const tagsInput = screen.getByLabelText(/tags/i);
    await user.clear(tagsInput);
    await user.click(tagsInput);
    await user.paste('dev, frontend, , ops');

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedWorkspace = onSave.mock.calls[0][0] as Workspace;

    expect(savedWorkspace.name).toBe('New Name');
    expect(savedWorkspace.description).toBe('New Description');
    expect(savedWorkspace.tags).toEqual(['dev', 'frontend', 'ops']);

    expect(Date.parse(savedWorkspace.updatedAt)).toBeGreaterThan(Date.parse(workspace.updatedAt));
  });

  it('omits description and tags when they are empty/whitespace on save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const workspace = makeWorkspace({
      name: '  Name  ',
      description: '   ',
      tags: [],
      updatedAt: '2000-01-01T00:00:00.000Z',
    });

    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    const savedWorkspace = onSave.mock.calls[0][0] as Workspace;
    expect(savedWorkspace.name).toBe('Name');
    expect(savedWorkspace.description).toBeUndefined();
    expect(savedWorkspace.tags).toBeUndefined();
  });

  it('opens and closes AddItemModal', async () => {
    const user = userEvent.setup();
    render(<WorkspaceEditor onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    expect(screen.getByRole('dialog', { name: 'AddItemModal' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'mock-close' }));
    expect(screen.queryByRole('dialog', { name: 'AddItemModal' })).not.toBeInTheDocument();
  });

  it('adds an item via AddItemModal and hides the modal', async () => {
    const user = userEvent.setup();
    render(<WorkspaceEditor onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('No items yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.click(screen.getByRole('button', { name: 'mock-add' }));

    expect(screen.queryByRole('dialog', { name: 'AddItemModal' })).not.toBeInTheDocument();
    const itemEditors = screen.getAllByTestId('item-editor');
    expect(itemEditors).toHaveLength(1);
    expect(within(itemEditors[0]).getByTestId('item-name')).toHaveTextContent('New Item');
    expect(screen.queryByText('No items yet')).not.toBeInTheDocument();
  });

  it('updates and deletes items using ItemEditor callbacks', async () => {
    const user = userEvent.setup();
    const workspace = makeWorkspace({
      items: [{ type: 'app', name: 'Item A', path: '/Applications/A.app' }],
    });

    render(<WorkspaceEditor workspace={workspace} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'update Item A' }));
    expect(screen.getByTestId('item-name')).toHaveTextContent('Item A updated');

    await user.click(screen.getByRole('button', { name: 'delete Item A updated' }));
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('moves items up/down and prevents out-of-bounds moves', async () => {
    const user = userEvent.setup();
    const workspace = makeWorkspace({
      items: [
        { type: 'app', name: 'First', path: '/Applications/First.app' },
        { type: 'app', name: 'Second', path: '/Applications/Second.app' },
      ],
    });

    render(<WorkspaceEditor workspace={workspace} onSave={vi.fn()} onCancel={vi.fn()} />);

    const getItemOrder = () =>
      screen
        .getAllByTestId('item-editor')
        .map((el) => within(el).getByTestId('item-name').textContent);

    expect(getItemOrder()).toEqual(['First', 'Second']);

    // Move the first item up (no-op)
    await user.click(screen.getByRole('button', { name: 'move up First' }));
    expect(getItemOrder()).toEqual(['First', 'Second']);

    // Move the second item up
    await user.click(screen.getByRole('button', { name: 'move up Second' }));
    expect(getItemOrder()).toEqual(['Second', 'First']);

    // Move the last item down (no-op)
    await user.click(screen.getByRole('button', { name: 'move down First' }));
    expect(getItemOrder()).toEqual(['Second', 'First']);

    // Move the first item down
    await user.click(screen.getByRole('button', { name: 'move down Second' }));
    expect(getItemOrder()).toEqual(['First', 'Second']);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<WorkspaceEditor onSave={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
