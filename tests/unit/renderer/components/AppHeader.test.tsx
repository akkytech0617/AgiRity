import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from '@/renderer/components/layout/AppHeader';
import type { Workspace } from '@/shared/types';

describe('AppHeader', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Test Workspace 1',
      items: [{ type: 'app', name: 'VS Code', path: '/usr/bin/code' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    workspaces: mockWorkspaces,
    activeWorkspace: mockWorkspaces[0],
    onSelectWorkspace: vi.fn(),
    onNewWorkspace: vi.fn(),
    onLaunch: vi.fn(),
    isLaunching: false,
    onOpenSettings: vi.fn(),
    onOpenTools: vi.fn(),
    onOpenMCP: vi.fn(),
  };

  it('renders logo "A"', () => {
    render(<AppHeader {...defaultProps} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders the active workspace name via WorkspaceSwitcher', () => {
    render(<AppHeader {...defaultProps} />);
    expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
  });

  it('renders the LaunchButton', () => {
    render(<AppHeader {...defaultProps} />);
    expect(screen.getByText('Launch →')).toBeInTheDocument();
  });

  it('renders the more options menu button', () => {
    render(<AppHeader {...defaultProps} />);
    expect(screen.getByLabelText('More options')).toBeInTheDocument();
  });

  it('renders only the workspace switcher, launch, and more options controls', () => {
    render(<AppHeader {...defaultProps} />);
    const names = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '')
      .filter((name) => name !== '');
    // The workspace switcher trigger nests a role="button" element inside the dropdown button.
    expect([...new Set(names)]).toEqual(['Test Workspace 1', 'Launch →', 'More options']);
  });

  it('calls onLaunch when LaunchButton is clicked', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<AppHeader {...defaultProps} onLaunch={onLaunch} />);

    await user.click(screen.getByText('Launch →'));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
