import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Workspace, WorkspaceItem } from '@/shared/types';

const { load, save, launchItem, getItemIcon } = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
  launchItem: vi.fn(),
  getItemIcon: vi.fn(),
}));

vi.mock('@/renderer/data/workspaceDataSource', () => ({
  workspaceDataSource: { load, save, get: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/renderer/api', () => ({
  launcherApi: { launchItem, getItemIcon },
  workspaceApi: {},
}));

vi.mock('electron-log/renderer', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/renderer/lib/logger', () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import App from '@/renderer/App';

const items: WorkspaceItem[] = [
  { type: 'folder', name: 'Alpha', folder: '/tmp/alpha' },
  { type: 'folder', name: 'Beta', folder: '/tmp/beta' },
  { type: 'folder', name: 'Gamma', folder: '/tmp/gamma' },
];

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'ws-1',
    name: 'Preset Workspace',
    items,
    presets: [
      { name: 'Alpha Only', itemNames: ['Alpha'] },
      { name: 'Nothing', itemNames: [] },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const launchedNames = () => launchItem.mock.calls.map(([item]) => (item as WorkspaceItem).name);

describe('App', () => {
  beforeEach(() => {
    load.mockResolvedValue([]);
    save.mockResolvedValue(undefined);
    launchItem.mockResolvedValue({ success: true });
    getItemIcon.mockResolvedValue({ success: true, data: 'folder' });
  });

  describe('without workspaces', () => {
    it('opens the workspace editor from the empty state', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(await screen.findByRole('button', { name: 'New Workspace' }));

      expect(
        await screen.findByRole('heading', { name: 'Create New Workspace' })
      ).toBeInTheDocument();
    });

    it('opens settings from the header menu', async () => {
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('heading', { name: 'No Workspaces' });

      await user.click(screen.getByLabelText('More options'));
      await user.click(await screen.findByRole('menuitem', { name: 'Settings' }));

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  describe('when loading workspaces fails', () => {
    it('shows the load error instead of the empty state and recovers on retry', async () => {
      load.mockRejectedValueOnce(new Error('workspaces.yaml is unreadable'));
      const user = userEvent.setup();
      render(<App />);

      expect(await screen.findByText('Failed to Load Workspaces')).toBeInTheDocument();
      expect(screen.getByText('workspaces.yaml is unreadable')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'No Workspaces' })).not.toBeInTheDocument();

      load.mockResolvedValue([makeWorkspace()]);
      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(await screen.findByRole('button', { name: 'Launch Alpha' })).toBeInTheDocument();
      expect(screen.queryByText('Failed to Load Workspaces')).not.toBeInTheDocument();
    });

    it('still allows navigating to settings', async () => {
      load.mockRejectedValueOnce(new Error('workspaces.yaml is unreadable'));
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText('Failed to Load Workspaces');

      await user.click(screen.getByLabelText('More options'));
      await user.click(await screen.findByRole('menuitem', { name: 'Settings' }));

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  describe('header launch with presets', () => {
    async function launchFromHeader(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /Launch →/ }));
      await screen.findByText('Done');
    }

    it('launches every item when no preset is selected', async () => {
      load.mockResolvedValue([makeWorkspace()]);
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('button', { name: 'Edit workspace' });

      await launchFromHeader(user);

      expect(launchedNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('launches only the items of the selected named preset', async () => {
      load.mockResolvedValue([makeWorkspace()]);
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('button', { name: 'Edit workspace' });

      await user.click(screen.getByRole('button', { name: 'Alpha Only' }));
      await launchFromHeader(user);

      expect(launchedNames()).toEqual(['Alpha']);
    });

    it('launches nothing when the selected preset is empty', async () => {
      load.mockResolvedValue([makeWorkspace()]);
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('button', { name: 'Edit workspace' });

      await user.click(screen.getByRole('button', { name: 'Nothing' }));
      // With nothing to launch the launching flag flips within one batch, so no "Done" state appears.
      await user.click(screen.getByRole('button', { name: /Launch →/ }));
      await act(async () => {});

      expect(launchItem).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /Launch →/ })).toBeEnabled();
    });

    it('launches every item with the default preset of a workspace without presets', async () => {
      load.mockResolvedValue([makeWorkspace({ presets: undefined })]);
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('button', { name: 'Edit workspace' });

      await user.click(screen.getByRole('button', { name: 'Launch All' }));
      await launchFromHeader(user);

      await waitFor(() => expect(launchedNames()).toEqual(['Alpha', 'Beta', 'Gamma']));
    });
  });

  it('opens the editor for the active workspace', async () => {
    load.mockResolvedValue([makeWorkspace()]);
    const user = userEvent.setup();
    render(<App />);
    // The home list renders before the first workspace is auto-selected.
    await screen.findByRole('button', { name: 'Launch Alpha' });

    await user.click(screen.getByRole('button', { name: 'Edit workspace' }));

    expect(await screen.findByRole('heading', { name: 'Edit Workspace' })).toBeInTheDocument();
  });
});
