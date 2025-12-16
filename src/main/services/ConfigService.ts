import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

const CONFIG_DIR_NAME = '.agirity';
const WORKSPACES_FILE_NAME = 'workspaces.yaml';

export class ConfigService {
  private configDir: string;
  private workspacesFilePath: string;

  constructor() {
    this.configDir = join(homedir(), CONFIG_DIR_NAME);
    this.workspacesFilePath = join(this.configDir, WORKSPACES_FILE_NAME);
  }

  getConfigDir(): string {
    return this.configDir;
  }

  getWorkspacesFilePath(): string {
    return this.workspacesFilePath;
  }

  async ensureConfigDir(): Promise<void> {
    await fs.mkdir(this.configDir, { recursive: true });
  }

  expandTilde(filePath: string): string {
    if (filePath.startsWith('~/')) {
      return filePath.replace('~', homedir());
    }
    return filePath;
  }
}

export const configService = new ConfigService();
