import { describe, it, expect, vi, beforeEach } from 'vitest';
import { homedir } from 'os';
import { promises as fs } from 'fs';
import { ConfigService } from './ConfigService';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfigDir', () => {
    it('should return the correct config directory path', () => {
      const service = new ConfigService();
      const expected = `${homedir()}/.agirity`;
      expect(service.getConfigDir()).toBe(expected);
    });
  });

  describe('getWorkspacesFilePath', () => {
    it('should return the correct workspaces file path', () => {
      const service = new ConfigService();
      const expected = `${homedir()}/.agirity/workspaces.yaml`;
      expect(service.getWorkspacesFilePath()).toBe(expected);
    });
  });

  describe('ensureConfigDir', () => {
    it('should create config directory with recursive option', async () => {
      const service = new ConfigService();
      await service.ensureConfigDir();
      expect(fs.mkdir).toHaveBeenCalledWith(service.getConfigDir(), { recursive: true });
    });
  });

  describe('expandTilde', () => {
    it('should expand tilde to home directory', () => {
      const service = new ConfigService();
      expect(service.expandTilde('~/workspace')).toBe(`${homedir()}/workspace`);
    });

    it('should not modify paths without tilde', () => {
      const service = new ConfigService();
      expect(service.expandTilde('/absolute/path')).toBe('/absolute/path');
    });

    it('should not expand tilde in the middle of path', () => {
      const service = new ConfigService();
      expect(service.expandTilde('/some/~/path')).toBe('/some/~/path');
    });
  });
});
