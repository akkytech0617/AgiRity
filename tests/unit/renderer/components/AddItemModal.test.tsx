import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddItemModal } from '@/renderer/components/AddItemModal';
import { findLightOnlyElements } from '../theme-helpers';

describe('AddItemModal', () => {
  const defaultProps = {
    onAdd: vi.fn(),
    onClose: vi.fn(),
    existingItemNames: [],
  };

  it('renders modal title', () => {
    render(<AddItemModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddItemModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds an app item with required fields', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    // Fill in required fields for app type
    const nameInput = screen.getByPlaceholderText(/VS Code, GitHub Repo/i);
    await user.type(nameInput, 'VS Code');

    const pathInput = screen.getByPlaceholderText('/Applications/App.app');
    await user.type(pathInput, '/Applications/Visual Studio Code.app');

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledWith({
      type: 'app',
      name: 'VS Code',
      path: '/Applications/Visual Studio Code.app',
    });
  });

  it('does not add item when name is empty', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    await user.click(addButton);

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('adds category when provided', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    const nameInput = screen.getByPlaceholderText(/VS Code, GitHub Repo/i);
    await user.type(nameInput, 'VS Code');

    const pathInput = screen.getByPlaceholderText('/Applications/App.app');
    await user.type(pathInput, '/Applications/Visual Studio Code.app');

    const categoryInput = screen.getByPlaceholderText(/development, reference, communication/i);
    await user.type(categoryInput, 'Development');

    const addButton = screen.getByRole('button', { name: 'Add Item' });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledWith({
      type: 'app',
      name: 'VS Code',
      path: '/Applications/Visual Studio Code.app',
      category: 'Development',
    });
  });

  it('is a labelled modal dialog that focuses the name field', () => {
    render(<AddItemModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog', { name: 'Add Item' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('adds the item when Enter is pressed in a field', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    await user.type(screen.getByLabelText('Name'), 'Docs');
    await user.click(screen.getByRole('button', { name: /Folder/ }));
    await user.type(screen.getByLabelText('Folder Path'), '/tmp/docs{Enter}');

    expect(onAdd).toHaveBeenCalledWith({ type: 'folder', name: 'Docs', path: '/tmp/docs' });
  });

  it('does not add an invalid item on Enter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    await user.type(screen.getByLabelText('Name'), 'Missing path{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('switches the item type without submitting', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /Browser URLs/ }));

    expect(screen.getByLabelText('URLs')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddItemModal {...defaultProps} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog within the viewport with a scrollable body', () => {
    render(<AddItemModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog', { name: 'Add Item' });
    expect(dialog.className).toMatch(/max-h-\[calc\(100dvh-2rem\)\]/);
    expect(screen.getByTestId('add-item-modal-body').className).toMatch(/overflow-y-auto/);
    expect(screen.getByTestId('add-item-modal-body').className).toMatch(/min-h-0/);
  });

  it('uses dark theme surfaces and text', () => {
    render(<AddItemModal {...defaultProps} />);
    expect(findLightOnlyElements(screen.getByRole('dialog', { name: 'Add Item' }))).toEqual([]);
  });
});
