import { describe, expect, it } from 'vitest';
import { selectItemsToLaunch } from '@/shared/lib/workspace-utils';
import type { Workspace } from '@/shared/types';

const createWorkspace = (overrides?: Partial<Workspace>): Workspace => ({
  id: 'workspace-1',
  name: 'Test Workspace',
  description: 'Test workspace description',
  items: [
    { type: 'app', name: 'VS Code', path: '/Applications/Visual Studio Code.app' },
    { type: 'browser', name: 'GitHub', urls: ['https://github.com'] },
    { type: 'folder', name: 'Project Folder', folder: '/Users/test/project' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('selectItemsToLaunch', () => {
  it('returns all items when itemNames is undefined', () => {
    const workspace = createWorkspace();

    const result = selectItemsToLaunch(workspace);

    expect(result).toHaveLength(workspace.items.length);
    expect(result).toEqual(workspace.items);
  });

  it('returns only items matching provided itemNames', () => {
    const workspace = createWorkspace();

    const result = selectItemsToLaunch(workspace, ['GitHub']);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(workspace.items[1]);
  });

  it('returns an empty array when itemNames is empty', () => {
    const workspace = createWorkspace();

    const result = selectItemsToLaunch(workspace, []);

    expect(result).toHaveLength(0);
  });
});
