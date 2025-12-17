import type { IFileSystemAdapter, IOSAdapter, IShellAdapter } from './adapters/interfaces';
import type { IConfigService, IProjectService, ILauncherService } from './services/interfaces';
import { FileSystemAdapter } from './adapters/FileSystemAdapter';
import { OSAdapter } from './adapters/OSAdapter';
import { ShellAdapter } from './adapters/ShellAdapter';
import { ConfigService } from './services/ConfigService';
import { ProjectService } from './services/ProjectService';
import { LauncherService } from './services/LauncherService';

/**
 * Adapter container for external dependencies
 */
export interface AdapterContainer {
  fileSystem: IFileSystemAdapter;
  os: IOSAdapter;
  shell: IShellAdapter;
}

/**
 * Service container for application services
 */
export interface ServiceContainer {
  config: IConfigService;
  project: IProjectService;
  launcher: ILauncherService;
}

/**
 * Full application container
 */
export interface AppContainer extends AdapterContainer, ServiceContainer {}

/**
 * Create application container with optional overrides for testing
 */
export function createContainer(overrides?: Partial<AppContainer>): AppContainer {
  // Create adapters (or use overrides)
  const fileSystem = overrides?.fileSystem ?? new FileSystemAdapter();
  const os = overrides?.os ?? new OSAdapter();
  const shell = overrides?.shell ?? new ShellAdapter();

  // Create services with dependency injection (or use overrides)
  const config = overrides?.config ?? new ConfigService(os, fileSystem);
  const project = overrides?.project ?? new ProjectService(config, fileSystem);
  const launcher = overrides?.launcher ?? new LauncherService(os, shell);

  return {
    fileSystem,
    os,
    shell,
    config,
    project,
    launcher,
  };
}
