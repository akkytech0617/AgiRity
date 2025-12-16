import { describe, expect, it } from 'vitest';
import type { WorkspaceItem } from './types';

describe('WorkspaceItem', () => {
  it('supports optional category field', () => {
    const item: WorkspaceItem = {
      type: 'app',
      name: 'VS Code',
      path: '/Applications/Visual Studio Code.app',
      category: 'development',
    };

    expect(item.category).toBe('development');
  });
});
