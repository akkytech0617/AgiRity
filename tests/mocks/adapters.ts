import { vi } from 'vitest';
import type {
  IFileSystemAdapter,
  IOSAdapter,
  IShellAdapter,
} from '@/main/adapters/interfaces';
import type {
  IConfigService,
  IProjectService,
  ILauncherService,
} from '@/main/services/interfaces';

/**
 * Create a mock FileSystemAdapter
 */
export function createMockFileSystemAdapter(): IFileSystemAdapter {
  return {
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Create a mock OSAdapter
 * @param homeDir - The home directory to return (default: '/mock/home')
 */
export function createMockOSAdapter(homeDir = '/mock/home'): IOSAdapter {
  return {
    homedir: vi.fn().mockReturnValue(homeDir),
  };
}

/**
 * Create a mock ShellAdapter
 */
export function createMockShellAdapter(): IShellAdapter {
  return {
    openExternal: vi.fn().mockResolvedValue(undefined),
    openPath: vi.fn().mockResolvedValue(''),
  };
}

/**
 * Create a mock ConfigService
 * @param homeDir - The home directory to use (default: '/mock/home')
 */
export function createMockConfigService(homeDir = '/mock/home'): IConfigService {
  return {
    getConfigDir: vi.fn().mockReturnValue(`${homeDir}/.agirity`),
    getWorkspacesFilePath: vi.fn().mockReturnValue(`${homeDir}/.agirity/workspaces.yaml`),
    ensureConfigDir: vi.fn().mockResolvedValue(undefined),
    expandTilde: vi.fn().mockImplementation((path: string) => {
      if (path.startsWith('~/')) {
        return path.replace('~', homeDir);
      }
      return path;
    }),
  };
}

/**
 * Create a mock ProjectService
 */
export function createMockProjectService(): IProjectService {
  return {
    loadWorkspaces: vi.fn().mockResolvedValue([]),
    getWorkspace: vi.fn().mockResolvedValue(null),
    saveWorkspace: vi.fn().mockResolvedValue(undefined),
    deleteWorkspace: vi.fn().mockResolvedValue(false),
  };
}

/**
 * Create a mock LauncherService
 */
export function createMockLauncherService(): ILauncherService {
  return {
    launchItem: vi.fn().mockResolvedValue(undefined),
  };
}
