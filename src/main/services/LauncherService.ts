import type { WorkspaceItem, IconResult } from '../../shared/types';
import type { IShellAdapter } from '../adapters/interfaces';
import type { ILauncherService, IConfigService } from './interfaces';

export class LauncherService implements ILauncherService {
  constructor(
    private readonly shellAdapter: IShellAdapter,
    private readonly configService: IConfigService
  ) {}

  async launchItem(item: WorkspaceItem): Promise<void> {
    switch (item.type) {
      case 'browser':
        await this.launchBrowser(item);
        break;
      case 'app':
        await this.launchApp(item);
        break;
      case 'folder':
        await this.launchFolder(item);
        break;
      default: {
        const unknownItem = item as { type: string };
        throw new Error(`Unknown item type: ${unknownItem.type}`);
      }
    }
  }

  getItemIcon(item: WorkspaceItem): Promise<IconResult> {
    let iconName: string;

    switch (item.type) {
      case 'app':
        iconName = 'app';
        break;
      case 'browser':
        iconName = 'browser';
        break;
      case 'folder':
        iconName = 'folder';
        break;
      default:
        iconName = 'code';
    }

    return Promise.resolve({
      success: true,
      data: iconName,
    });
  }

  private async launchBrowser(item: WorkspaceItem): Promise<void> {
    if (!item.urls || item.urls.length === 0) {
      throw new Error(`Browser item "${item.name}" has no URLs`);
    }

    for (const url of item.urls) {
      await this.shellAdapter.openExternal(url);
    }
  }

  private async launchApp(item: WorkspaceItem): Promise<void> {
    if (item.path == null || item.path === '') {
      throw new Error(`App item "${item.name}" has no path`);
    }

    const appPath = this.configService.expandTilde(item.path);
    const folder = item.folder;
    const hasFolder = folder != null && folder !== '';

    if (hasFolder) {
      const folderPath = this.configService.expandTilde(folder);
      // Launch the specified app with the folder as an argument
      await this.shellAdapter.launchApp(appPath, [folderPath]);
    } else {
      // Open the app itself
      const error = await this.shellAdapter.openPath(appPath);
      if (error) {
        throw new Error(`Failed to launch app: ${error}`);
      }
    }
  }

  private async launchFolder(item: WorkspaceItem): Promise<void> {
    if (item.path == null || item.path === '') {
      throw new Error(`Folder item "${item.name}" has no path`);
    }

    const folderPath = this.configService.expandTilde(item.path);
    const error = await this.shellAdapter.openPath(folderPath);
    if (error) {
      throw new Error(`Failed to open folder: ${error}`);
    }
  }
}
