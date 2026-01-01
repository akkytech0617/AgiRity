import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddItemModal } from '@/renderer/components/AddItemModal';

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

    // Find the X button in the header
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons[0]; // First button is the close button
    await user.click(closeButton);

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
});
