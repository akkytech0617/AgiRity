import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceSwitcher } from '@/renderer/components/workspace/WorkspaceSwitcher';
import type { Workspace } from '@/shared/types';

describe('WorkspaceSwitcher', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Test Workspace 1',
      items: [{ type: 'app', name: 'VS Code', path: '/usr/bin/code' }],
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
    activeWorkspace: mockWorkspaces[0] as Workspace | null,
    onSelect: vi.fn(),
    onNew: vi.fn(),
  };

  it('renders the active workspace name', () => {
    render(<WorkspaceSwitcher {...defaultProps} />);
    expect(screen.getByText('Test Workspace 1')).toBeInTheDocument();
  });

  it('renders "Select workspace" when no workspace is active', () => {
    render(<WorkspaceSwitcher {...defaultProps} activeWorkspace={null} />);
    expect(screen.getByText('Select workspace')).toBeInTheDocument();
  });
});
