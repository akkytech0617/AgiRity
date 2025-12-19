import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@/main/services/ConfigService';
import { createMockFileSystemAdapter, createMockOSAdapter } from '../../../mocks/adapters';

describe('ConfigService', () => {
  const TEST_HOME_DIR = '/test/home';
  let mockOsAdapter: ReturnType<typeof createMockOSAdapter>;
  let mockFsAdapter: ReturnType<typeof createMockFileSystemAdapter>;
  let service: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOsAdapter = createMockOSAdapter(TEST_HOME_DIR);
    mockFsAdapter = createMockFileSystemAdapter();
    service = new ConfigService(mockOsAdapter, mockFsAdapter);
  });

  describe('getConfigDir', () => {
    it('should return the correct config directory path', () => {
      const expected = `${TEST_HOME_DIR}/.agirity`;
      expect(service.getConfigDir()).toBe(expected);
    });
  });

  describe('getWorkspacesFilePath', () => {
    it('should return the correct workspaces file path', () => {
      const expected = `${TEST_HOME_DIR}/.agirity/workspaces.yaml`;
      expect(service.getWorkspacesFilePath()).toBe(expected);
    });
  });

  describe('ensureConfigDir', () => {
    it('should create config directory with recursive option', async () => {
      await service.ensureConfigDir();
      expect(mockFsAdapter.mkdir).toHaveBeenCalledWith(`${TEST_HOME_DIR}/.agirity`, {
        recursive: true,
      });
    });

    it('should throw error when mkdir fails', async () => {
      vi.mocked(mockFsAdapter.mkdir).mockRejectedValue(new Error('Permission denied'));
      await expect(service.ensureConfigDir()).rejects.toThrow('Permission denied');
    });
  });

  describe('expandTilde', () => {
    it('should expand tilde to home directory', () => {
      expect(service.expandTilde('~/workspace')).toBe(`${TEST_HOME_DIR}/workspace`);
    });

    it('should not modify paths without tilde', () => {
      expect(service.expandTilde('/absolute/path')).toBe('/absolute/path');
    });

    it('should not expand tilde in the middle of path', () => {
      expect(service.expandTilde('/some/~/path')).toBe('/some/~/path');
    });
  });
});
