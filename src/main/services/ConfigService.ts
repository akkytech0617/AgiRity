import { join } from 'node:path';
import type { IFileSystemAdapter, IOSAdapter } from '../adapters/interfaces';
import type { IConfigService } from './interfaces';

const CONFIG_DIR_NAME = '.agirity';
const WORKSPACES_FILE_NAME = 'workspaces.yaml';

export class ConfigService implements IConfigService {
  private readonly configDir: string;
  private readonly workspacesFilePath: string;

  constructor(
    private readonly osAdapter: IOSAdapter,
    private readonly fsAdapter: IFileSystemAdapter
  ) {
    this.configDir = join(this.osAdapter.homedir(), CONFIG_DIR_NAME);
    this.workspacesFilePath = join(this.configDir, WORKSPACES_FILE_NAME);
  }

  getConfigDir(): string {
    return this.configDir;
  }

  getWorkspacesFilePath(): string {
    return this.workspacesFilePath;
  }

  async ensureConfigDir(): Promise<void> {
    await this.fsAdapter.mkdir(this.configDir, { recursive: true });
  }

  expandTilde(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return filePath.replace('~', this.osAdapter.homedir());
    }
    return filePath;
  }
}
