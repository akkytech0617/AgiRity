import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WorkspaceItem } from '@/shared/types';
import { LauncherService } from '@/main/services/LauncherService';
import { createMockOSAdapter, createMockShellAdapter } from '../../../mocks/adapters';

describe('LauncherService', () => {
  const TEST_HOME_DIR = '/test/home';
  let mockOsAdapter: ReturnType<typeof createMockOSAdapter>;
  let mockShellAdapter: ReturnType<typeof createMockShellAdapter>;
  let service: LauncherService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOsAdapter = createMockOSAdapter(TEST_HOME_DIR);
    mockShellAdapter = createMockShellAdapter();
    service = new LauncherService(mockOsAdapter, mockShellAdapter);
  });

  describe('launchItem - browser type', () => {
    it('should open all URLs for browser item', async () => {
      const item: WorkspaceItem = {
        type: 'browser',
        name: 'Google',
        urls: ['https://google.com', 'https://github.com'],
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openExternal).toHaveBeenCalledTimes(2);
      expect(mockShellAdapter.openExternal).toHaveBeenCalledWith('https://google.com');
      expect(mockShellAdapter.openExternal).toHaveBeenCalledWith('https://github.com');
    });

    it('should throw error for browser item without URLs', async () => {
      const item: WorkspaceItem = {
        type: 'browser',
        name: 'Empty Browser',
        urls: [],
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'Browser item "Empty Browser" has no URLs'
      );
    });

    it('should throw error for browser item with undefined URLs', async () => {
      const item: WorkspaceItem = {
        type: 'browser',
        name: 'No URLs',
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'Browser item "No URLs" has no URLs'
      );
    });
  });

  describe('launchItem - app type', () => {
    it('should open app path', async () => {
      const item: WorkspaceItem = {
        type: 'app',
        name: 'VS Code',
        path: '/Applications/Visual Studio Code.app',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith(
        '/Applications/Visual Studio Code.app'
      );
    });

    it('should open folder with app when folder is specified', async () => {
      const item: WorkspaceItem = {
        type: 'app',
        name: 'VS Code',
        path: '/Applications/Visual Studio Code.app',
        folder: '~/workspace/project',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith(
        `${TEST_HOME_DIR}/workspace/project`
      );
    });

    it('should throw error for app item without path', async () => {
      const item: WorkspaceItem = {
        type: 'app',
        name: 'No Path App',
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'App item "No Path App" has no path'
      );
    });

    it('should throw error when openPath fails for app', async () => {
      vi.mocked(mockShellAdapter.openPath).mockResolvedValue('Failed to open');
      const item: WorkspaceItem = {
        type: 'app',
        name: 'VS Code',
        path: '/Applications/Visual Studio Code.app',
      };

      await expect(service.launchItem(item)).rejects.toThrow('Failed to launch app: Failed to open');
    });

    it('should throw error when openPath fails for folder with app', async () => {
      vi.mocked(mockShellAdapter.openPath).mockResolvedValue('Permission denied');
      const item: WorkspaceItem = {
        type: 'app',
        name: 'VS Code',
        path: '/Applications/Visual Studio Code.app',
        folder: '~/workspace/project',
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'Failed to open folder with app: Permission denied'
      );
    });
  });

  describe('launchItem - folder type', () => {
    it('should open folder path', async () => {
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'Project',
        path: '/Users/test/project',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith('/Users/test/project');
    });

    it('should expand tilde in folder path', async () => {
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'Home Project',
        path: '~/projects/myapp',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith(
        `${TEST_HOME_DIR}/projects/myapp`
      );
    });

    it('should throw error for folder item without path', async () => {
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'No Path Folder',
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'Folder item "No Path Folder" has no path'
      );
    });

    it('should throw error when openPath fails for folder', async () => {
      vi.mocked(mockShellAdapter.openPath).mockResolvedValue('Folder not found');
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'Missing Folder',
        path: '/nonexistent/path',
      };

      await expect(service.launchItem(item)).rejects.toThrow(
        'Failed to open folder: Folder not found'
      );
    });
  });

  describe('launchItem - unknown type', () => {
    it('should throw error for unknown item type', async () => {
      const item = {
        type: 'unknown',
        name: 'Unknown Item',
      } as unknown as WorkspaceItem;

      await expect(service.launchItem(item)).rejects.toThrow('Unknown item type: unknown');
    });
  });

  describe('tilde expansion', () => {
    it('should not expand tilde in the middle of path', async () => {
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'Special Path',
        path: '/some/~/path',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith('/some/~/path');
    });

    it('should not modify absolute paths', async () => {
      const item: WorkspaceItem = {
        type: 'folder',
        name: 'Absolute Path',
        path: '/absolute/path',
      };

      await service.launchItem(item);

      expect(mockShellAdapter.openPath).toHaveBeenCalledWith('/absolute/path');
    });
  });
});
