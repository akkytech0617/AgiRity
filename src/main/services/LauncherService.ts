import type { WorkspaceItem } from '../../shared/types';
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

    // If folder is specified, open the folder with the app
    // Otherwise, just open the app
    const folder = item.folder;
    const hasFolder = folder != null && folder !== '';
    const targetPath = hasFolder ? this.configService.expandTilde(folder) : item.path;

    // For apps, we use openExternal with file:// protocol for the app bundle
    // or openPath for opening a folder with the default app
    if (hasFolder) {
      // Open folder - this will use the OS default or the app associated with folders
      const error = await this.shellAdapter.openPath(targetPath);
      if (error) {
        throw new Error(`Failed to open folder with app: ${error}`);
      }
    } else {
      // Open the app itself
      const error = await this.shellAdapter.openPath(item.path);
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
