import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yaml from 'js-yaml';
import type { Workspace } from '@/shared/types';
import { ProjectService } from '@/main/services/ProjectService';
import { createMockFileSystemAdapter, createMockConfigService } from '../../../mocks/adapters';

describe('ProjectService', () => {
  const TEST_HOME_DIR = '/mock/home';
  const WORKSPACES_FILE_PATH = `${TEST_HOME_DIR}/.agirity/workspaces.yaml`;

  let mockConfigService: ReturnType<typeof createMockConfigService>;
  let mockFsAdapter: ReturnType<typeof createMockFileSystemAdapter>;
  let service: ProjectService;

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
    mockConfigService = createMockConfigService(TEST_HOME_DIR);
    mockFsAdapter = createMockFileSystemAdapter();
    vi.mocked(mockConfigService.getWorkspacesFilePath).mockReturnValue(WORKSPACES_FILE_PATH);
    service = new ProjectService(mockConfigService, mockFsAdapter);
  });

  describe('loadWorkspaces', () => {
    it('should load and parse workspaces from YAML file', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const workspaces = await service.loadWorkspaces();
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].name).toBe('Test Workspace');
    });

    it('should return empty array when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      vi.mocked(mockFsAdapter.readFile).mockRejectedValue(error);
      const workspaces = await service.loadWorkspaces();
      expect(workspaces).toEqual([]);
    });

    it('should throw error for invalid YAML format', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue('invalid: [yaml: structure');
      await expect(service.loadWorkspaces()).rejects.toThrow();
    });

    it('should throw error for invalid schema', async () => {
      const invalidData = { schemaVersion: 1, workspaces: [{ invalid: 'data' }] };
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(invalidData));
      await expect(service.loadWorkspaces()).rejects.toThrow('Invalid workspace file format');
    });

    it('should throw error for empty YAML file', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue('');
      await expect(service.loadWorkspaces()).rejects.toThrow();
    });

    it('should handle multiple workspaces correctly', async () => {
      const secondWorkspace: Workspace = {
        ...mockWorkspace,
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Second Workspace',
      };
      const multipleWorkspaces = {
        schemaVersion: 1,
        workspaces: [mockWorkspace, secondWorkspace],
      };
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(multipleWorkspaces));
      const workspaces = await service.loadWorkspaces();
      expect(workspaces).toHaveLength(2);
      expect(workspaces[0].name).toBe('Test Workspace');
      expect(workspaces[1].name).toBe('Second Workspace');
    });
  });

  describe('getWorkspace', () => {
    it('should return workspace by id', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const workspace = await service.getWorkspace('550e8400-e29b-41d4-a716-446655440000');
      expect(workspace?.name).toBe('Test Workspace');
    });

    it('should return null for non-existent workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const workspace = await service.getWorkspace('non-existent-id');
      expect(workspace).toBeNull();
    });
  });

  describe('saveWorkspace', () => {
    it('should add new workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(
        yaml.dump({ schemaVersion: 1, workspaces: [] })
      );
      await service.saveWorkspace(mockWorkspace);
      expect(mockFsAdapter.writeFile).toHaveBeenCalled();
      const writtenContent = vi.mocked(mockFsAdapter.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(1);
    });

    it('should update existing workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const updatedWorkspace = { ...mockWorkspace, name: 'Updated Workspace' };
      await service.saveWorkspace(updatedWorkspace);
      const writtenContent = vi.mocked(mockFsAdapter.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(1);
      expect(parsed.workspaces[0].name).toBe('Updated Workspace');
    });

    it('should update updatedAt when saving existing workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      await service.saveWorkspace(mockWorkspace);
      const writtenContent = vi.mocked(mockFsAdapter.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces[0].updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw error when writeFile fails', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(
        yaml.dump({ schemaVersion: 1, workspaces: [] })
      );
      vi.mocked(mockFsAdapter.writeFile).mockRejectedValue(new Error('Permission denied'));
      await expect(service.saveWorkspace(mockWorkspace)).rejects.toThrow('Permission denied');
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete existing workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const result = await service.deleteWorkspace('550e8400-e29b-41d4-a716-446655440000');
      expect(result).toBe(true);
      const writtenContent = vi.mocked(mockFsAdapter.writeFile).mock.calls[0][1] as string;
      const parsed = yaml.load(writtenContent) as typeof mockWorkspacesFile;
      expect(parsed.workspaces).toHaveLength(0);
    });

    it('should return false for non-existent workspace', async () => {
      vi.mocked(mockFsAdapter.readFile).mockResolvedValue(yaml.dump(mockWorkspacesFile));
      const result = await service.deleteWorkspace('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
