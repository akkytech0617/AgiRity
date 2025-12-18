import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/renderer/components/Sidebar';
import type { Workspace } from '@/shared/types';

describe('Sidebar', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Development',
      items: [],
      tags: ['dev', 'coding'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Design',
      items: [],
      tags: ['design', 'ui'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders app name', () => {
    render(<Sidebar workspaces={mockWorkspaces} />);
    expect(screen.getByText('AgiRity')).toBeInTheDocument();
  });

  it('renders all workspaces', () => {
    render(<Sidebar workspaces={mockWorkspaces} />);
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('filters workspaces by name', async () => {
    const user = userEvent.setup();
    render(<Sidebar workspaces={mockWorkspaces} />);

    const searchInput = screen.getByPlaceholderText('Filter...');
    await user.type(searchInput, 'dev');

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.queryByText('Design')).not.toBeInTheDocument();
  });

  it('filters workspaces by tag', async () => {
    const user = userEvent.setup();
    render(<Sidebar workspaces={mockWorkspaces} />);

    const searchInput = screen.getByPlaceholderText('Filter...');
    await user.type(searchInput, 'ui');

    expect(screen.queryByText('Development')).not.toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('calls onSelectWorkspace when workspace is clicked', async () => {
    const user = userEvent.setup();
    const onSelectWorkspace = vi.fn();
    render(<Sidebar workspaces={mockWorkspaces} onSelectWorkspace={onSelectWorkspace} />);

    const workspaceButton = screen.getByText('Development');
    await user.click(workspaceButton);

    expect(onSelectWorkspace).toHaveBeenCalledWith('1');
  });

  it('calls onNewWorkspace when new button is clicked', async () => {
    const user = userEvent.setup();
    const onNewWorkspace = vi.fn();
    render(<Sidebar workspaces={mockWorkspaces} onNewWorkspace={onNewWorkspace} />);

    const newButton = screen.getByRole('button', { name: /add workspace/i });
    await user.click(newButton);

    expect(onNewWorkspace).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when settings button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn();
    render(<Sidebar workspaces={mockWorkspaces} onOpenSettings={onOpenSettings} />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
