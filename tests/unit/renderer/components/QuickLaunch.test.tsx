import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickLaunch } from '@/renderer/components/QuickLaunch';
import type { Workspace } from '@/shared/types';

describe('QuickLaunch', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Development',
      description: 'Dev workspace',
      items: [
        {
          name: 'VS Code',
          type: 'app',
          path: '/Applications/Visual Studio Code.app',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    workspaces: mockWorkspaces,
    onSelectWorkspace: vi.fn(),
    onLaunchItem: vi.fn(),
    onLaunchWorkspace: vi.fn(),
  };

  it('renders workspace name', () => {
    render(<QuickLaunch {...defaultProps} />);
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('renders workspace description', () => {
    render(<QuickLaunch {...defaultProps} />);
    expect(screen.getByText('Dev workspace')).toBeInTheDocument();
  });

  it('renders "No description" when description is missing', () => {
    const workspacesWithoutDesc: Workspace[] = [
      {
        id: '1',
        name: 'Development',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    render(<QuickLaunch {...defaultProps} workspaces={workspacesWithoutDesc} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('calls onSelectWorkspace when workspace name is clicked', async () => {
    const user = userEvent.setup();
    const onSelectWorkspace = vi.fn();
    render(<QuickLaunch {...defaultProps} onSelectWorkspace={onSelectWorkspace} />);

    const workspaceName = screen.getByText('Development');
    await user.click(workspaceName);

    expect(onSelectWorkspace).toHaveBeenCalledWith('1');
  });

  it('calls onLaunchWorkspace when launch button is clicked', async () => {
    const user = userEvent.setup();
    const onLaunchWorkspace = vi.fn();
    render(<QuickLaunch {...defaultProps} onLaunchWorkspace={onLaunchWorkspace} />);

    const launchButton = screen.getByTitle('Launch Workspace');
    await user.click(launchButton);

    expect(onLaunchWorkspace).toHaveBeenCalledWith('1');
  });
});
