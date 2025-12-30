import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/renderer/components/Header';
import type { Workspace } from '@/shared/types';

describe('Header', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Test Workspace 1',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Test Workspace 2',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    workspaces: mockWorkspaces,
    activeWorkspaceId: '1',
    onSelectWorkspace: vi.fn(),
    onNewWorkspace: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenTools: vi.fn(),
    onOpenMCP: vi.fn(),
    onOpenHome: vi.fn(),
  };

  it('renders logo', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders workspace tabs', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('Test Workspace 2')).toBeInTheDocument();
  });

  it('calls onSelectWorkspace when tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelectWorkspace = vi.fn();
    render(<Header {...defaultProps} onSelectWorkspace={onSelectWorkspace} />);

    await user.click(screen.getByText('Test Workspace 2'));
    expect(onSelectWorkspace).toHaveBeenCalledWith('2');
  });

  it('calls onNewWorkspace when new tab button is clicked', async () => {
    const user = userEvent.setup();
    const onNewWorkspace = vi.fn();
    render(<Header {...defaultProps} onNewWorkspace={onNewWorkspace} />);

    await user.click(screen.getByTitle('New Workspace'));
    expect(onNewWorkspace).toHaveBeenCalledTimes(1);
  });

  it('opens menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    // Menu items should not be visible initially
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Click menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons[menuButtons.length - 1]; // Last button is menu
    await user.click(menuButton);

    // Menu items should be visible
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Tools Registry')).toBeInTheDocument();
    expect(screen.getByText('MCP Servers')).toBeInTheDocument();
  });

  it('calls onOpenSettings when Settings menu item is clicked', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn();
    render(<Header {...defaultProps} onOpenSettings={onOpenSettings} />);

    // Open menu
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons[menuButtons.length - 1];
    await user.click(menuButton);

    // Click Settings
    await user.click(screen.getByText('Settings'));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
