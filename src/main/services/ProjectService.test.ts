import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yaml from 'js-yaml';
import { promises as fs } from 'fs';
import type { Workspace } from '../../shared/types';

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./ConfigService', () => ({
  configService: {
    ensureConfigDir: vi.fn().mockResolvedValue(undefined),
    getWorkspacesFilePath: vi.fn(() => '/mock/home/.agirity/workspaces.yaml'),
  },
}));

import { ProjectService } from './ProjectService';

describe('ProjectService', () => {
  const mockWorkspace: Workspace = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Workspace',
    description: 'A test workspace',
    items: [
      {
        type: 'app',
        name: 'VS Code',
        path: '/Applications/Visual Studio Code.app',
      },
    ],
    tags: ['test'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockWorkspacesFile = {
    schemaVersion: 1,
    workspaces: [mockWorkspace],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadWorkspaces', () => {
    it('should load and parse workspaces from YAML file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const workspaces = await service.loadWorkspaces();
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].name).toBe('Test Workspace');
    });

    it('should return empty array when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);
      const service = new ProjectService();
      const workspaces = await service.loadWorkspaces();
      expect(workspaces).toEqual([]);
    });

    it('should throw error for invalid YAML format', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('invalid: [yaml: structure');
      const service = new ProjectService();
      await expect(service.loadWorkspaces()).rejects.toThrow();
    });

    it('should throw error for invalid schema', async () => {
      const invalidData = { schemaVersion: 1, workspaces: [{ invalid: 'data' }] };
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(invalidData));
      const service = new ProjectService();
      await expect(service.loadWorkspaces()).rejects.toThrow('Invalid workspace file format');
    });
  });

  describe('getWorkspace', () => {
    it('should return workspace by id', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const workspace = await service.getWorkspace('550e8400-e29b-41d4-a716-446655440000');
      expect(workspace?.name).toBe('Test Workspace');
    });

    it('should return null for non-existent workspace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const workspace = await service.getWorkspace('non-existent-id');
      expect(workspace).toBeNull();
    });
  });

  describe('saveWorkspace', () => {
    it('should add new workspace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump({ schemaVersion: 1, workspaces: [] }));
      const service = new ProjectService();
      await service.saveWorkspace(mockWorkspace);
      expect(fs.writeFile).toHaveBeenCalled();
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(1);
    });

    it('should update existing workspace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const updatedWorkspace = { ...mockWorkspace, name: 'Updated Workspace' };
      await service.saveWorkspace(updatedWorkspace);
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(1);
      expect(parsed.workspaces[0].name).toBe('Updated Workspace');
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete existing workspace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const result = await service.deleteWorkspace('550e8400-e29b-41d4-a716-446655440000');
      expect(result).toBe(true);
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(0);
    });

    it('should return false for non-existent workspace', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const service = new ProjectService();
      const result = await service.deleteWorkspace('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
