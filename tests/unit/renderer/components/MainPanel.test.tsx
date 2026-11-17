import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Workspace } from '@/shared/types';

const { getItemIcon } = vi.hoisted(() => ({ getItemIcon: vi.fn() }));

vi.mock('@/renderer/api', () => ({
  launcherApi: { launchItem: vi.fn(), getItemIcon },
  workspaceApi: {},
}));

import { MainPanel } from '@/renderer/components/layout/MainPanel';

const workspace: Workspace = {
  id: 'ws-1',
  name: 'Panel Workspace',
  items: [{ type: 'folder', name: 'Docs', folder: '/tmp/docs' }],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('MainPanel', () => {
  beforeEach(() => {
    getItemIcon.mockResolvedValue({ success: true, data: 'folder' });
  });

  it('calls onEditWorkspace with the workspace id from the edit control', async () => {
    const user = userEvent.setup();
    const onEditWorkspace = vi.fn();
    render(
      <MainPanel
        workspace={workspace}
        selectedPreset={null}
        onSelectPreset={vi.fn()}
        onEditWorkspace={onEditWorkspace}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit workspace' }));

    expect(onEditWorkspace).toHaveBeenCalledWith('ws-1');
  });

  it('hides the edit control when editing is not available', () => {
    render(<MainPanel workspace={workspace} selectedPreset={null} onSelectPreset={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Edit workspace' })).not.toBeInTheDocument();
  });

  it('disables item launch while the workspace is launching', () => {
    render(
      <MainPanel
        workspace={workspace}
        selectedPreset={null}
        onSelectPreset={vi.fn()}
        onLaunchItem={vi.fn()}
        isLaunching
      />
    );

    expect(screen.getByRole('button', { name: 'Launch Docs' })).toBeDisabled();
  });
});
