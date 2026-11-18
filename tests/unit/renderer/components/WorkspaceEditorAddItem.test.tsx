import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceEditor } from '@/renderer/components/WorkspaceEditor';
import type { Workspace } from '@/shared/types';
import { findLightOnlyElements } from '../theme-helpers';

const workspace: Workspace = {
  id: 'ws-1',
  name: 'Editor Workspace',
  items: [{ type: 'folder', name: 'Existing', folder: '/tmp/existing', path: '/tmp/existing' }],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('WorkspaceEditor with AddItemModal', () => {
  it('moves focus into the modal and makes the editor behind it inert', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WorkspaceEditor workspace={workspace} onSave={vi.fn()} onCancel={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    const dialog = screen.getByRole('dialog', { name: 'Add Item' });
    expect(within(dialog).getByLabelText('Name')).toHaveFocus();
    expect(container.querySelector('[data-testid="workspace-editor-content"]')).toHaveAttribute(
      'inert'
    );
  });

  it('adds the item with Enter inside the modal without saving or closing the editor', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    const dialog = screen.getByRole('dialog', { name: 'Add Item' });
    await user.type(within(dialog).getByLabelText('Name'), 'New App');
    await user.type(
      within(dialog).getByLabelText('Application Path'),
      '/Applications/New.app{Enter}'
    );

    expect(screen.queryByRole('dialog', { name: 'Add Item' })).not.toBeInTheDocument();
    expect(screen.getByText('New App')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByTestId('workspace-editor-content').hasAttribute('inert')).toBe(false);
  });

  it('saves the workspace with Enter in the workspace name field', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/workspace name/i), ' Renamed{Enter}');

    expect(onSave).toHaveBeenCalledTimes(1);
    expect((onSave.mock.calls[0][0] as Workspace).name).toBe('Editor Workspace Renamed');
  });

  it('does not save with Enter while the workspace name is blank', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<WorkspaceEditor onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/workspace name/i), '   {Enter}');

    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not save the workspace when item editor controls are used', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={vi.fn()} />);

    await user.click(screen.getByTitle('Edit'));
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not save the workspace when Enter is pressed in an item field', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<WorkspaceEditor workspace={workspace} onSave={onSave} onCancel={vi.fn()} />);

    await user.click(screen.getByTitle('Edit'));
    const itemEditor = screen.getByTitle('Edit').closest('div.rounded-lg') as HTMLElement;
    await user.type(within(itemEditor).getByLabelText('Category'), 'docs{Enter}');

    expect(onSave).not.toHaveBeenCalled();
    expect(within(itemEditor).getByLabelText('Category')).toHaveValue('docs');
  });

  it('uses dark theme surfaces for expanded item editors and the open modal', async () => {
    const user = userEvent.setup();
    render(<WorkspaceEditor workspace={workspace} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByTitle('Edit'));
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(findLightOnlyElements(document.body)).toEqual([]);
  });
});
